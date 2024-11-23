# React Flask Authentication Demo

A full-stack authentication system built with React, Flask, and PostgreSQL, running in Docker containers.

## Features

- React frontend with protected routes
- Flask backend with JWT authentication
- PostgreSQL database
- User registration and login
- Account lockout after failed login attempts
- Configurable lockout settings
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

3. The application should now be running at:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:5002

## Configuration

The following environment variables can be configured in the docker-compose.yml file:

### Backend Configuration
- `FLASK_ENV`: Development/production environment
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET_KEY`: Secret key for JWT token generation
- `MAX_LOGIN_ATTEMPTS`: Number of allowed login attempts before lockout
- `LOCKOUT_TIME_MINUTES`: Duration of account lockout in minutes

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

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/register`: Register a new user
  - Body: `{ "username": "string", "password": "string" }`

- `POST /api/auth/login`: Login a user
  - Body: `{ "username": "string", "password": "string" }`
  - Returns: JWT token and user information

- `GET /api/auth/protected`: Protected route example
  - Requires: JWT token in Authorization header

- `GET /api/auth/check-auth`: Check authentication status
  - Requires: JWT token in Authorization header

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
│   ├── tests/            # Backend tests
│   └── run.py            # App entry point
└── docker-compose.yml    # Docker configuration
```

## Security Considerations

- JWT tokens are used for authentication
- Passwords are hashed using secure methods
- Account lockout prevents brute force attacks
- CORS is configured for security
- Environment variables are used for sensitive data

## Development

To make changes to the application:

1. Frontend changes:
   - Edit files in the `frontend/src` directory
   - Changes will automatically reload in development

2. Backend changes:
   - Edit files in the `backend/app` directory
   - Flask development server will automatically reload

3. Database changes:
   - Models are defined in `backend/app/models.py`
   - Database migrations are handled automatically

## Troubleshooting

1. If the frontend can't connect to the backend:
   - Check that all containers are running: `docker compose ps`
   - Verify the backend URL in the frontend environment variables

2. If the database connection fails:
   - Ensure PostgreSQL container is running
   - Check database credentials in docker-compose.yml

3. For other issues:
   - Check container logs: `docker compose logs`
   - Rebuild containers: `docker compose up --build`
