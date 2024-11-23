from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from datetime import timedelta
import os

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    # Basic Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-key-change-in-production')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'
    
    # Authentication Configuration
    app.config['MAX_LOGIN_ATTEMPTS'] = int(os.getenv('MAX_LOGIN_ATTEMPTS', 5))
    app.config['LOCKOUT_TIME_MINUTES'] = int(os.getenv('LOCKOUT_TIME_MINUTES', 15))
    
    # Password Requirements Configuration
    app.config['PASSWORD_MIN_LENGTH'] = int(os.getenv('PASSWORD_MIN_LENGTH', 12))
    app.config['PASSWORD_REQUIRE_MIXED_CASE'] = os.getenv('PASSWORD_REQUIRE_MIXED_CASE', 'true').lower() == 'true'
    app.config['PASSWORD_REQUIRE_SPECIAL'] = os.getenv('PASSWORD_REQUIRE_SPECIAL', 'true').lower() == 'true'
    app.config['PASSWORD_HISTORY_LIMIT'] = int(os.getenv('PASSWORD_HISTORY_LIMIT', 5))
    
    # Set default config values
    app.config.setdefault('SQLALCHEMY_DATABASE_URI', 'sqlite:///app.db')

    # Initialize extensions with app context
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3001"]}})
    db.init_app(app)
    jwt.init_app(app)

    # Register blueprints
    from .auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    # Ensure all tables exist
    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            app.logger.error(f"Error creating database tables: {e}")
            raise

    @app.after_request
    def after_request(response):
        """Add password requirement headers to responses"""
        response.headers['X-Password-Min-Length'] = str(app.config['PASSWORD_MIN_LENGTH'])
        response.headers['X-Password-Require-Mixed-Case'] = str(app.config['PASSWORD_REQUIRE_MIXED_CASE']).lower()
        response.headers['X-Password-Require-Special'] = str(app.config['PASSWORD_REQUIRE_SPECIAL']).lower()
        return response

    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'Token has expired',
            'code': 'token_expired'
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'error': 'Invalid token',
            'code': 'invalid_token'
        }), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'error': 'Authorization token is missing',
            'code': 'authorization_required'
        }), 401

    @jwt.needs_fresh_token_loader
    def token_not_fresh_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'Fresh token required',
            'code': 'fresh_token_required'
        }), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'Token has been revoked',
            'code': 'token_revoked'
        }), 401

    return app
