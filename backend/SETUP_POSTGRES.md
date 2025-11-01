# PostgreSQL Setup Guide

## Quick Start with SQLite (Default)

By default, the application uses SQLite which requires no setup. Just run:

```bash
npm run dev
```

The database will be automatically created in `./data/ai_studio.db`.

## Setting Up PostgreSQL Locally

### Option 1: Using Homebrew (macOS)

1. **Install PostgreSQL:**
   ```bash
   brew install postgresql@15
   ```

2. **Start PostgreSQL service:**
   ```bash
   brew services start postgresql@15
   ```

3. **Create database and user:**
   ```bash
   # Connect to PostgreSQL
   psql postgres

   # In PostgreSQL prompt, create database and user:
   CREATE DATABASE ai_studio;
   CREATE USER ai_studio_user WITH PASSWORD 'ai_studio_password';
   GRANT ALL PRIVILEGES ON DATABASE ai_studio TO ai_studio_user;
   \q
   ```

4. **Update .env file:**
   ```env
   DATABASE_URL=postgresql://ai_studio_user:ai_studio_password@localhost:5432/ai_studio
   ```

### Option 2: Using Docker

1. **Run PostgreSQL container:**
   ```bash
   docker run --name ai-studio-postgres \
     -e POSTGRES_USER=ai_studio_user \
     -e POSTGRES_PASSWORD=ai_studio_password \
     -e POSTGRES_DB=ai_studio \
     -p 5432:5432 \
     -d postgres:15-alpine
   ```

2. **Update .env file:**
   ```env
   DATABASE_URL=postgresql://ai_studio_user:ai_studio_password@localhost:5432/ai_studio
   ```

### Option 3: Using PostgreSQL.app (macOS)

1. **Download and install:**
   - Visit: https://postgresapp.com/
   - Download and install PostgreSQL.app

2. **Start the app** from Applications

3. **Initialize database:**
   - Open Terminal from PostgreSQL.app
   - Create database:
     ```bash
     createdb ai_studio
     psql ai_studio
     ```

4. **Update .env file:**
   ```env
   DATABASE_URL=postgresql://your-username@localhost:5432/ai_studio
   ```

## Verifying PostgreSQL Connection

```bash
# Test connection
psql $DATABASE_URL

# If successful, you should see:
# psql (15.x)
# Type "help" for help.
# ai_studio=>
```

## Troubleshooting

### PostgreSQL not running

**macOS (Homebrew):**
```bash
brew services start postgresql@15
```

**Linux:**
```bash
sudo systemctl start postgresql
# or
sudo service postgresql start
```

### Port 5432 already in use

Check what's using the port:
```bash
lsof -i :5432
# or
sudo lsof -i :5432
```

### Connection refused

1. Check if PostgreSQL is running
2. Verify the connection string in `.env`
3. Check PostgreSQL configuration (pg_hba.conf)

## Using with Docker Compose

If you prefer using Docker Compose, the `docker-compose.yml` file includes PostgreSQL:

```bash
# Start PostgreSQL only
docker-compose up postgres

# Start everything (PostgreSQL + Backend + Frontend)
docker-compose up
```

This will automatically set up PostgreSQL with the correct database and user.

