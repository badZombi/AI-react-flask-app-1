# Running the Application Without Docker

If you don't have Docker installed, you can run the application directly using Node.js and Python. Here's how:

## Prerequisites

1. Node.js and npm (for frontend)
2. Python 3.9+ (for backend)
3. PostgreSQL database

## Setting Up the Backend

1. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
# Authentication settings
export FLASK_ENV=development
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auth_db
export JWT_SECRET_KEY=your-secret-key-change-in-production
export MAX_LOGIN_ATTEMPTS=5
export LOCKOUT_TIME_MINUTES=15
export FLASK_RUN_PORT=5002

# Password requirement settings
export PASSWORD_MIN_LENGTH=12
export PASSWORD_REQUIRE_MIXED_CASE=true
export PASSWORD_REQUIRE_SPECIAL=true
export PASSWORD_HISTORY_LIMIT=5
```

4. Initialize and apply database migrations:
```bash
# Initialize migrations (first time only)
flask db init

# Generate initial migration
flask db migrate -m "Initial migration"

# Apply migrations
flask db upgrade
```

5. Run the Flask application:
```bash
python run.py
```

The backend will be available at http://localhost:5002

## Database Migrations

The application uses Flask-Migrate to handle database schema changes. Common migration commands:

### Creating New Migrations

When you make changes to your models:
```bash
cd backend
flask db migrate -m "Description of changes"
```

### Applying Migrations
```bash
flask db upgrade
```

### Rolling Back Migrations
```bash
flask db downgrade
```

### Viewing Migration Status
```bash
flask db current
flask db history
```

## Setting Up the Frontend

1. Install Node.js dependencies:
```bash
cd frontend
npm install
```

2. Set the port and start the development server:
```bash
export PORT=3001  # On Windows: set PORT=3001
npm start
```

The frontend will be available at http://localhost:3001

## Password Requirements

The application enforces the following password requirements (all configurable via environment variables):

1. Minimum Length (PASSWORD_MIN_LENGTH):
   - Default: 12 characters
   - Configure with export PASSWORD_MIN_LENGTH=<number>

2. Mixed Case (PASSWORD_REQUIRE_MIXED_CASE):
   - Default: true (requires both upper and lower case)
   - Configure with export PASSWORD_REQUIRE_MIXED_CASE=true|false

3. Special Characters (PASSWORD_REQUIRE_SPECIAL):
   - Default: true (requires at least one special character)
   - Configure with export PASSWORD_REQUIRE_SPECIAL=true|false

4. Password History (PASSWORD_HISTORY_LIMIT):
   - Default: 5 (remembers last 5 passwords)
   - Configure with export PASSWORD_HISTORY_LIMIT=<number>

## Running Tests

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE auth_db;
```

2. Run migrations to create the necessary tables:
```bash
cd backend
flask db upgrade
```

This will create:
- users table for user accounts
- password_history table for tracking previous passwords
- alembic_version table for migration tracking

## Troubleshooting Migrations

1. If migrations folder already exists:
   ```bash
   rm -rf migrations/
   flask db init
   ```

2. If migrations fail:
   ```bash
   # Check current status
   flask db current
   
   # View migration history
   flask db history
   
   # Roll back last migration
   flask db downgrade
   ```

3. If you need to reset the database:
   ```bash
   # Drop all tables
   flask db downgrade base
   
   # Remove migration files
   rm -rf migrations/
   
   # Start over
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/register`: Register a new user
  - Body: `{ "username": "string", "password": "string", "confirmPassword": "string" }`

- `POST /api/auth/login`: Login a user
  - Body: `{ "username": "string", "password": "string" }`

- `POST /api/auth/change-password`: Change password (requires authentication)
  - Body: `{ "currentPassword": "string", "newPassword": "string", "confirmPassword": "string" }`

- `GET /api/auth/password-requirements`: Get current password requirements

- `GET /api/auth/protected`: Protected route example

- `GET /api/auth/check-auth`: Check authentication status

## Note About Development

- The frontend is configured to proxy API requests to http://localhost:5002
- Make sure both the frontend and backend servers are running simultaneously
- Keep the PostgreSQL database running and accessible
- Environment variables must be set before starting each service
- Always apply migrations after pulling new changes
