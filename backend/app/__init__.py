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
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['MAX_LOGIN_ATTEMPTS'] = int(os.getenv('MAX_LOGIN_ATTEMPTS', 5))
    app.config['LOCKOUT_TIME_MINUTES'] = int(os.getenv('LOCKOUT_TIME_MINUTES', 15))
    
    # Set default config values
    app.config.setdefault('SQLALCHEMY_DATABASE_URI', 'sqlite:///app.db')
    app.config.setdefault('JWT_SECRET_KEY', 'dev-key-change-in-production')

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

    return app
