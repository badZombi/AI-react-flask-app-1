# React Flask Authentication Demo

A full-stack authentication system built with React, Flask, and PostgreSQL, running in Docker containers.

## Features

- React frontend with protected routes
- Flask backend with JWT authentication
- PostgreSQL database with migrations support
- User registration and login
- Account lockout after failed login attempts
- Configurable password requirements:
  - Minimum length
  - Mixed case requirement
  - Special character requirement
  - Password history tracking
- Comprehensive test suite for both frontend and backend
- Docker Compose setup for easy deployment

## Prerequisites

- Docker and Docker Compose installed on your system
- Git (optional, for cloning the repository)

## Getting Started

1. Clone the repository (or download the source code):
   ```bash
   git clone <repository-url>
   cd react-flask-auth-1
   ```

2. Start the application using Docker Compose:
   ```bash
   docker compose up --build
   ```

   This will:
   - Build and start the React frontend (available at http://localhost:3001)
   - Build and start the Flask backend (available at http://localhost:5002)
   - Start the PostgreSQL database

3. In a separate terminal, run the database migrations:
   ```bash
   # Initialize migrations (first time only)
   docker compose exec backend flask db init

   # Generate a new migration
   docker compose exec backend flask db migrate -m "Initial migration"

   # Apply migrations
   docker compose exec backend flask db upgrade
   ```

   Note: Migrations must be run manually to ensure database schema changes are applied intentionally.

## Database Migrations

The application uses Flask-Migrate to handle database schema changes. Here are the common migration commands:

### First-Time Setup
```bash
# Initialize migrations repository
docker compose exec backend flask db init
```

### Creating New Migrations

When you make changes to your models:
```bash
docker compose exec backend flask db migrate -m "Description of changes"
```

Always review the generated migration file in `backend/migrations/versions/` before applying.

### Applying Migrations
```bash
docker compose exec backend flask db upgrade
```

### Rolling Back Migrations
```bash
docker compose exec backend flask db downgrade
```

### Viewing Migration Status
```bash
# View current revision
docker compose exec backend flask db current

# View migration history
docker compose exec backend flask db history
```

## Configuration

The following environment variables can be configured in the docker-compose.yml file:

### Authentication Configuration
- `MAX_LOGIN_ATTEMPTS`: Number of allowed login attempts before lockout (default: 5)
- `LOCKOUT_TIME_MINUTES`: Duration of account lockout in minutes (default: 15)

### Password Requirements Configuration
- `PASSWORD_MIN_LENGTH`: Minimum password length (default: 12)
- `PASSWORD_REQUIRE_MIXED_CASE`: Require both upper and lower case letters (default: true)
- `PASSWORD_REQUIRE_SPECIAL`: Require at least one special character (default: true)
- `PASSWORD_HISTORY_LIMIT`: Number of previous passwords to remember (default: 5)

### Other Configuration
- `FLASK_ENV`: Development/production environment
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET_KEY`: Secret key for JWT token generation

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/register`: Register a new user
  - Body: `{ "username": "string", "password": "string", "confirmPassword": "string" }`

- `POST /api/auth/login`: Login a user
  - Body: `{ "username": "string", "password": "string" }`
  - Returns: JWT token and user information

- `POST /api/auth/change-password`: Change user password (requires authentication)
  - Body: `{ "currentPassword": "string", "newPassword": "string", "confirmPassword": "string" }`

- `GET /api/auth/password-requirements`: Get current password requirements configuration

- `GET /api/auth/protected`: Protected route example
  - Requires: JWT token in Authorization header

- `GET /api/auth/check-auth`: Check authentication status
  - Requires: JWT token in Authorization header

## Password Requirements

The application enforces configurable password requirements:

1. Minimum Length: Passwords must be at least the configured length (default: 12 characters)
2. Mixed Case: Can require both upper and lower case letters
3. Special Characters: Can require at least one special character (!@#$%^&*(),.?":{}|<>)
4. Password History: Prevents reuse of recent passwords (configurable number of previous passwords)

These requirements are enforced on both registration and password changes.

## Testing

### Backend Tests
To run the backend tests:
```bash
docker compose exec backend pytest
```

### Frontend Tests
To run the frontend tests:
```bash
docker compose exec frontend npm test
```

## Project Structure

```
.
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Auth context
│   │   ├── pages/         # Page components
│   │   └── __tests__/     # Frontend tests
│   └── public/            # Static files
├── backend/               # Flask backend
│   ├── app/
│   │   ├── auth/         # Auth blueprint
│   │   ├── models.py     # Database models
│   │   └── __init__.py   # App initialization
│   ├── migrations/       # Database migrations
│   ├── tests/            # Backend tests
│   └── run.py            # App entry point
└── docker-compose.yml    # Docker configuration
```

## Security Considerations

- JWT tokens are used for authentication
- Passwords are hashed using secure methods
- Account lockout prevents brute force attacks
- Password requirements enforce strong passwords
- Password history prevents password reuse
- CORS is configured for security
- Environment variables are used for sensitive data
- Database migrations ensure schema consistency

## Development

To make changes to the application:

1. Frontend changes:
   - Edit files in the `frontend/src` directory
   - Changes will automatically reload in development

2. Backend changes:
   - Edit files in the `backend/app` directory
   - Flask development server will automatically reload
   - Create and apply migrations for model changes

3. Database changes:
   - Models are defined in `backend/app/models.py`
   - Create migrations after model changes
   - Review and apply migrations manually

## Troubleshooting

1. If the frontend can't connect to the backend:
   - Check that all containers are running: `docker compose ps`
   - Verify the backend URL in the frontend environment variables

2. If the database connection fails:
   - Ensure PostgreSQL container is running
   - Check database credentials in docker-compose.yml
   - Verify migrations are up to date

3. For migration issues:
   - Check migration history: `docker compose exec backend flask db history`
   - Review migration files in backend/migrations/versions/
   - Try rolling back problematic migrations

4. For other issues:
   - Check container logs: `docker compose logs`
   - Rebuild containers: `docker compose up --build`
