import json
import pytest
from datetime import datetime, timedelta
from app.models import User
from app import db

def test_register(client):
    response = client.post('/api/auth/register', json={
        'username': 'newuser',
        'password': 'newpass'
    })
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'message' in data
    assert data['message'] == 'User registered successfully'

def test_register_existing_username(client, test_user):
    response = client.post('/api/auth/register', json={
        'username': 'testuser',
        'password': 'newpass'
    })
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data
    assert data['error'] == 'Username already exists'

def test_register_missing_fields(client):
    response = client.post('/api/auth/register', json={})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data
    assert data['error'] == 'Username and password are required'

def test_login_success(client, test_user):
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpass'
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'access_token' in data
    assert 'user' in data
    assert data['user']['username'] == 'testuser'

def test_login_wrong_password(client, test_user, app):
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'wrongpass'
    })
    assert response.status_code == 401
    data = json.loads(response.data)
    assert 'error' in data
    assert 'remaining_attempts' in data
    assert data['remaining_attempts'] == app.config['MAX_LOGIN_ATTEMPTS'] - 1

def test_login_account_lockout(client, test_user, app):
    # Attempt login with wrong password multiple times
    for i in range(app.config['MAX_LOGIN_ATTEMPTS']):
        response = client.post('/api/auth/login', json={
            'username': 'testuser',
            'password': 'wrongpass'
        })
        
        if i < app.config['MAX_LOGIN_ATTEMPTS'] - 1:
            assert response.status_code == 401
            data = json.loads(response.data)
            assert 'remaining_attempts' in data
            assert data['remaining_attempts'] == app.config['MAX_LOGIN_ATTEMPTS'] - (i + 1)
        else:
            assert response.status_code == 403
            data = json.loads(response.data)
            assert 'error' in data
            assert 'locked_until' in data

def test_protected_route(client, test_user):
    # First login to get token
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpass'
    })
    token = json.loads(response.data)['access_token']
    
    # Access protected route with token
    response = client.get('/api/auth/protected', headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'user' in data
    assert data['user']['username'] == 'testuser'

def test_protected_route_no_token(client):
    response = client.get('/api/auth/protected')
    assert response.status_code == 401

def test_protected_route_invalid_token(client):
    response = client.get('/api/auth/protected', headers={
        'Authorization': 'Bearer invalid-token'
    })
    assert response.status_code == 422

def test_check_auth(client, test_user):
    # First login to get token
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpass'
    })
    token = json.loads(response.data)['access_token']
    
    # Check auth status
    response = client.get('/api/auth/check-auth', headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['authenticated'] is True
    assert data['user']['username'] == 'testuser'

def test_login_after_lockout_expires(client, test_user, app):
    # Lock the account
    for _ in range(app.config['MAX_LOGIN_ATTEMPTS']):
        client.post('/api/auth/login', json={
            'username': 'testuser',
            'password': 'wrongpass'
        })
    
    # Update locked_until to a past time
    with app.app_context():
        user = User.query.filter_by(username='testuser').first()
        user.locked_until = datetime.utcnow() - timedelta(minutes=1)
        db.session.commit()
    
    # Try logging in with correct password
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpass'
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'access_token' in data

def test_user_model_methods(app):
    with app.app_context():
        user = User()
        user.username = 'testuser'
        user.set_password('testpass')
        
        assert user.check_password('testpass') is True
        assert user.check_password('wrongpass') is False
        assert user.is_locked() is False
        
        user.increment_failed_attempts(3, 15)
        assert user.failed_login_attempts == 1
        
        user.reset_failed_attempts()
        assert user.failed_login_attempts == 0
        assert user.locked_until is None
