# AI Studio - Fashion Image Generation Application

A full-stack web application for simulating AI-powered fashion image generation. Built with React, TypeScript, Node.js, Express, and PostgreSQL/SQLite.

## Features

- **User Authentication**: JWT-based signup and login
- **Image Upload**: Upload images (JPEG/PNG, max 10MB) with live preview
- **AI Generation Simulation**: Simulate image generation with configurable delays
- **Error Handling**: Graceful handling of simulated overload errors with retry logic
- **Generation History**: View and restore the last 5 generations
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: Keyboard navigation, ARIA labels, and focus states
- **Testing**: Comprehensive unit, integration, and E2E tests

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- React Testing Library
- Vitest

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL (with SQLite fallback)
- JWT authentication
- Bcrypt for password hashing
- Multer for file uploads
- Zod for validation
- Jest + Supertest

### Testing
- Jest + Supertest (Backend)
- React Testing Library + Vitest (Frontend)
- Playwright (E2E)

## Prerequisites

- Node.js 20+
- npm or yarn
- PostgreSQL (optional, SQLite can be used for local dev)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd modelia-assessment
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file (optional - SQLite works by default)
# Copy from env.example.txt if you want to configure PostgreSQL
# For SQLite (default): No .env file needed - works out of the box!
# For PostgreSQL: Create .env and set DATABASE_URL (see PostgreSQL setup below)

npm run dev
```

The backend will run on `http://localhost:3000`

**Note:** The application uses SQLite by default (no setup required). The database will be automatically created in `./data/ai_studio.db`. If you want to use PostgreSQL instead, see the PostgreSQL Setup section below.

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create .env file (optional)
echo "VITE_API_URL=http://localhost:3000" > .env

npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Database Setup

The database is automatically initialized on first run. The application will:
- Create necessary tables (users, generations)
- Use SQLite by default if DATABASE_URL is not set (works out of the box!)
- Use PostgreSQL if DATABASE_URL is provided in `.env`

#### PostgreSQL Setup (Optional)

If you want to use PostgreSQL instead of SQLite:

**Using Homebrew (macOS):**
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database (in a new terminal)
psql postgres
CREATE DATABASE ai_studio;
CREATE USER ai_studio_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ai_studio TO ai_studio_user;
\q

# Create .env file in backend directory
cd backend
cat > .env << EOF
DATABASE_URL=postgresql://ai_studio_user:your_password@localhost:5432/ai_studio
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3000
NODE_ENV=development
EOF
```

**Using Docker:**
```bash
docker run --name ai-studio-postgres \
  -e POSTGRES_USER=ai_studio_user \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=ai_studio \
  -p 5432:5432 \
  -d postgres:15-alpine

# Create .env file in backend directory
cd backend
cat > .env << EOF
DATABASE_URL=postgresql://ai_studio_user:your_password@localhost:5432/ai_studio
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3000
NODE_ENV=development
EOF
```

For more detailed PostgreSQL setup instructions, see `backend/SETUP_POSTGRES.md`

## Running Tests

### Backend Tests

```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm test
npm run test:coverage
```

### E2E Tests

```bash
cd tests
npm install
npm test
```

**Note**: E2E tests require both backend and frontend servers to be running.

## Docker Setup

### Using Docker Compose

```bash
# Start all services (PostgreSQL, Backend, Frontend)
docker-compose up

# Build and start
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down
```

### Individual Docker Commands

```bash
# Build backend
cd backend
docker build -t ai-studio-backend .

# Build frontend
cd frontend
docker build -t ai-studio-frontend .
```

## API Documentation

See `OPENAPI.yaml` for complete API documentation.

### Key Endpoints

- `POST /auth/signup` - Create new user account
- `POST /auth/login` - Login and get JWT token
- `POST /generations` - Create new image generation (requires auth)
- `GET /generations?limit=5` - Get user's recent generations (requires auth)

### Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Project Structure

```
modelia-assessment/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── controllers/ # Business logic
│   │   ├── services/     # Services (auth, generation)
│   │   ├── middleware/   # Auth, error handling
│   │   ├── db/           # Database setup
│   │   └── types/        # TypeScript types
│   ├── tests/            # Backend tests
│   └── package.json
├── frontend/             # React + TypeScript frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API client, services
│   │   ├── contexts/     # React contexts
│   │   └── types/        # TypeScript types
│   ├── tests/            # Frontend tests
│   └── package.json
├── tests/                # E2E tests (Playwright)
│   └── e2e/
├── docker-compose.yml    # Docker setup
├── .github/workflows/    # CI/CD
├── README.md
├── OPENAPI.yaml          # API specification
├── EVAL.md              # Evaluation checklist
└── AI_USAGE.md          # AI tool usage documentation
```

## Development Notes

### TypeScript Strict Mode

The project uses TypeScript strict mode. All files must type-check correctly.

### Code Quality

- ESLint + Prettier configured
- Run `npm run lint` to check for issues
- Run `npm run format` to format code

### Environment Variables

#### Backend (.env)
- `PORT` - Server port (default: 3000)
- `DATABASE_URL` - PostgreSQL connection string (optional)
- `SQLITE_DB_PATH` - SQLite database path (default: ./data/ai_studio.db)
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_EXPIRES_IN` - Token expiration (default: 7d)
- `UPLOAD_DIR` - Directory for uploaded files
- `MAX_FILE_SIZE` - Maximum file size in bytes (default: 10485760)

#### Frontend (.env)
- `VITE_API_URL` - Backend API URL (default: http://localhost:3000)

## Known Limitations / TODOs

1. **Image Storage**: Currently using local filesystem. In production, consider using S3 or similar.
2. **Generated Images**: Currently returning mock URLs. In production, integrate with actual image generation service.
3. **Image Resizing**: Bonus feature (image resizing before upload) not yet implemented.
4. **Dark Mode**: Bonus feature (dark mode toggle) not yet implemented.
5. **Caching**: Static asset caching not yet optimized for production.

## Troubleshooting

### Database Connection Issues

- **SQLite**: Ensure the `data` directory exists and is writable
- **PostgreSQL**: Verify DATABASE_URL is correct and PostgreSQL is running

### Port Conflicts

- Backend default port: 3000
- Frontend default port: 5173
- Change in respective `.env` files if needed

### File Upload Issues

- Ensure `uploads` directory exists in backend folder
- Check file size limits (max 10MB)
- Verify file type (JPEG/PNG only)

## License

This project is part of a coding assessment for Modelia.

## Contact

For questions about this implementation, please refer to the submission email or reach out through the provided contact information.

