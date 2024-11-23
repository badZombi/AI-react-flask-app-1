FROM python:3.9

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the rest of the application
COPY . .

# Set environment variables
ENV FLASK_APP=migrations.py

# Create directory for migrations
RUN mkdir -p migrations

EXPOSE 5002

# The actual command will be provided by docker-compose.yml
CMD ["python", "run.py"]
