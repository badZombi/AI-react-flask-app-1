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
export FLASK_ENV=development
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auth_db
export JWT_SECRET_KEY=your-secret-key-change-in-production
export MAX_LOGIN_ATTEMPTS=5
export LOCKOUT_TIME_MINUTES=15
export FLASK_RUN_PORT=5002
```

4. Run the Flask application:
```bash
python run.py
```

The backend will be available at http://localhost:5002

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

2. The tables will be automatically created when you run the Flask application for the first time.

## Note About Development

- The frontend is configured to proxy API requests to http://localhost:5002
- Make sure both the frontend and backend servers are running simultaneously
- Keep the PostgreSQL database running and accessible
