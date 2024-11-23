from . import db
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.sql import func
import re

class PasswordHistory(db.Model):
    __tablename__ = 'password_history'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    failed_login_attempts = db.Column(db.Integer, default=0)
    last_failed_login = db.Column(db.DateTime(timezone=True), default=None)
    locked_until = db.Column(db.DateTime(timezone=True), default=None)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())
    
    # Relationship with password history
    password_history = db.relationship('PasswordHistory', 
                                     backref='user',
                                     lazy='dynamic',
                                     cascade='all, delete-orphan')

    @staticmethod
    def validate_password(password, confirm_password, app):
        """
        Validate password against configured requirements
        """
        if password != confirm_password:
            return False, "Passwords do not match"

        if not isinstance(password, str):
            return False, "Password must be a string"

        # Check minimum length
        min_length = app.config.get('PASSWORD_MIN_LENGTH', 12)
        if len(password) < min_length:
            return False, f"Password must be at least {min_length} characters long"

        # Check for upper and lower case if required
        if app.config.get('PASSWORD_REQUIRE_MIXED_CASE', True):
            if not (any(c.isupper() for c in password) and any(c.islower() for c in password)):
                return False, "Password must contain both upper and lower case letters"

        # Check for special character if required
        if app.config.get('PASSWORD_REQUIRE_SPECIAL', True):
            if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
                return False, "Password must contain at least one special character"

        return True, None

    def set_password(self, password, app=None):
        """
        Set password with history tracking
        """
        if not password or not isinstance(password, str):
            raise ValueError('Password must be a non-empty string')

        # If app context is provided, check against password history
        if app and hasattr(self, 'id'):
            history_limit = app.config.get('PASSWORD_HISTORY_LIMIT', 5)
            recent_passwords = self.password_history.order_by(
                PasswordHistory.created_at.desc()
            ).limit(history_limit).all()

            # Check if password matches any recent passwords
            for old_password in recent_passwords:
                if check_password_hash(old_password.password_hash, password):
                    raise ValueError(f'Password cannot be the same as your last {history_limit} passwords')

        # Generate new password hash
        new_hash = generate_password_hash(password)
        
        # Store the new password
        self.password_hash = new_hash
        
        # Add to password history if in app context
        if app and hasattr(self, 'id'):
            history_entry = PasswordHistory(
                user_id=self.id,
                password_hash=new_hash
            )
            db.session.add(history_entry)
            
            # Maintain history limit
            history_limit = app.config.get('PASSWORD_HISTORY_LIMIT', 5)
            old_passwords = self.password_history.order_by(
                PasswordHistory.created_at.desc()
            ).offset(history_limit).all()
            
            for old_password in old_passwords:
                db.session.delete(old_password)

    def check_password(self, password):
        if not password or not isinstance(password, str):
            return False
        return check_password_hash(self.password_hash, password)

    def is_locked(self):
        if self.locked_until and self.locked_until > datetime.utcnow():
            return True
        return False

    def increment_failed_attempts(self, max_attempts, lockout_minutes):
        self.failed_login_attempts += 1
        self.last_failed_login = datetime.utcnow()
        
        if self.failed_login_attempts >= max_attempts:
            self.locked_until = datetime.utcnow() + timedelta(minutes=lockout_minutes)
        
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise

    def reset_failed_attempts(self):
        self.failed_login_attempts = 0
        self.last_failed_login = None
        self.locked_until = None
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<User {self.username}>'
