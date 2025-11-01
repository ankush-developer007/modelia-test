# Quick Start Guide

## Default Setup (SQLite - No Configuration Needed!)

The application works out of the box with SQLite - no database setup required!

```bash
cd backend
npm install
npm run dev
```

That's it! The database will be automatically created and initialized.

## Optional: Using PostgreSQL

### Step 1: Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**macOS (PostgreSQL.app):**
Download from https://postgresapp.com/

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
# or
sudo yum install postgresql-server postgresql-contrib
```

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database and user (inside psql)
CREATE DATABASE ai_studio;
CREATE USER ai_studio_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ai_studio TO ai_studio_user;
\q
```

### Step 3: Create .env File

Create a `.env` file in the `backend` directory:

```bash
cd backend
cat > .env << 'EOF'
DATABASE_URL=postgresql://ai_studio_user:your_password@localhost:5432/ai_studio
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3000
NODE_ENV=development
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
EOF
```

Replace `your_password` with the password you set in Step 2.

### Step 4: Start Backend

```bash
npm run dev
```

## Quick PostgreSQL Setup with Docker

```bash
# Start PostgreSQL container
docker run --name ai-studio-postgres \
  -e POSTGRES_USER=ai_studio_user \
  -e POSTGRES_PASSWORD=ai_studio_password \
  -e POSTGRES_DB=ai_studio \
  -p 5432:5432 \
  -d postgres:15-alpine

# Create .env file
cd backend
cat > .env << 'EOF'
DATABASE_URL=postgresql://ai_studio_user:ai_studio_password@localhost:5432/ai_studio
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3000
NODE_ENV=development
EOF

# Start backend
npm run dev
```

## Troubleshooting

### SQLite Works by Default
If you don't need PostgreSQL, just skip all the setup above and run:
```bash
npm install
npm run dev
```

### Check PostgreSQL is Running

**macOS (Homebrew):**
```bash
brew services list | grep postgresql
```

**Linux:**
```bash
sudo systemctl status postgresql
```

### Test Connection
```bash
psql postgresql://ai_studio_user:your_password@localhost:5432/ai_studio
```

If you can connect, PostgreSQL is working!

### Reset Database (SQLite)
```bash
rm -rf data/ai_studio.db
npm run dev
```

The database will be recreated automatically.

