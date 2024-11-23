from flask import jsonify, request, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from . import auth_bp
from ..models import User
from .. import db
from datetime import datetime

@auth_bp.route('/password-requirements', methods=['GET'])
def get_password_requirements():
    """Get current password requirements configuration"""
    return jsonify({
        'min_length': current_app.config['PASSWORD_MIN_LENGTH'],
        'require_mixed_case': current_app.config['PASSWORD_REQUIRE_MIXED_CASE'],
        'require_special': current_app.config['PASSWORD_REQUIRE_SPECIAL'],
        'history_limit': current_app.config['PASSWORD_HISTORY_LIMIT']
    })

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password') or not data.get('confirmPassword'):
            return jsonify({
                'error': 'Username, password, and password confirmation are required'
            }), 400

        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400

        # Validate password
        is_valid, error_message = User.validate_password(
            data['password'],
            data['confirmPassword'],
            current_app
        )
        
        if not is_valid:
            return jsonify({'error': error_message}), 400

        user = User()
        user.username = data['username']
        
        try:
            # Set password will handle history tracking
            user.set_password(data['password'], current_app)
            db.session.add(user)
            db.session.commit()
        except ValueError as e:
            return jsonify({'error': str(e)}), 400

        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        if not data or not data.get('currentPassword') or not data.get('newPassword') or not data.get('confirmPassword'):
            return jsonify({
                'error': 'Current password, new password, and password confirmation are required'
            }), 400

        # Verify current password
        if not user.check_password(data['currentPassword']):
            return jsonify({'error': 'Current password is incorrect'}), 401

        # Validate new password
        is_valid, error_message = User.validate_password(
            data['newPassword'],
            data['confirmPassword'],
            current_app
        )
        
        if not is_valid:
            return jsonify({'error': error_message}), 400

        try:
            # Set password will handle history tracking
            user.set_password(data['newPassword'], current_app)
            db.session.commit()
            return jsonify({'message': 'Password changed successfully'}), 200
        except ValueError as e:
            return jsonify({'error': str(e)}), 400

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Password change error: {str(e)}")
        return jsonify({'error': 'Password change failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password are required'}), 400

        user = User.query.filter_by(username=data['username']).first()
        
        if not user:
            return jsonify({'error': 'Invalid username or password'}), 401

        if user.is_locked():
            return jsonify({
                'error': 'Account is locked',
                'locked_until': user.locked_until.isoformat()
            }), 403

        if not user.check_password(data['password']):
            max_attempts = current_app.config['MAX_LOGIN_ATTEMPTS']
            lockout_minutes = current_app.config['LOCKOUT_TIME_MINUTES']
            
            user.increment_failed_attempts(max_attempts, lockout_minutes)
            
            remaining_attempts = max_attempts - user.failed_login_attempts
            if remaining_attempts <= 0:
                return jsonify({
                    'error': 'Account is now locked',
                    'locked_until': user.locked_until.isoformat()
                }), 403
            
            return jsonify({
                'error': 'Invalid username or password',
                'remaining_attempts': remaining_attempts
            }), 401

        # Reset failed attempts on successful login
        user.reset_failed_attempts()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed'}), 500

@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'message': 'Protected endpoint',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        current_app.logger.error(f"Protected route error: {str(e)}")
        return jsonify({'error': 'Access failed'}), 500

@auth_bp.route('/check-auth', methods=['GET'])
@jwt_required()
def check_auth():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'authenticated': True,
            'user': user.to_dict()
        }), 200
    except Exception as e:
        current_app.logger.error(f"Auth check error: {str(e)}")
        return jsonify({'error': 'Authentication check failed'}), 500

@auth_bp.errorhandler(Exception)
def handle_error(error):
    current_app.logger.error(f"Unhandled error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500
