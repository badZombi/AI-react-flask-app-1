import pytest
from app import create_app, db
from app.models import User

@pytest.fixture(scope='function')
def app():
    """Create and configure a new app instance for each test."""
    app = create_app()
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'JWT_SECRET_KEY': 'test-secret-key',
        'MAX_LOGIN_ATTEMPTS': 5,
        'LOCKOUT_TIME_MINUTES': 15
    })

    # Create the database and the database tables
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture(scope='function')
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture(scope='function')
def runner(app):
    """A test CLI runner for the app."""
    return app.test_cli_runner()

@pytest.fixture(scope='function')
def test_user(app):
    """Create a test user for the tests."""
    with app.app_context():
        user = User()
        user.username = 'testuser'
        user.set_password('testpass')
        db.session.add(user)
        db.session.commit()
        return user

@pytest.fixture(scope='function')
def auth_headers(client, test_user):
    """Get auth headers for the test user."""
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpass'
    })
    token = response.json['access_token']
    return {'Authorization': f'Bearer {token}'}

@pytest.fixture(autouse=True)
def _clean_db(app):
    """Clean up the database after each test."""
    yield
    with app.app_context():
        db.session.remove()
        for table in reversed(db.metadata.sorted_tables):
            db.session.execute(table.delete())
        db.session.commit()
