# Environment Variables Setup Guide

## Backend Environment Variables

Location: `backend/.env`

Copy `backend/.env.example` to `backend/.env` and update with your values:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/foodie

# JWT Secrets (generate strong random strings)
JWT_SECRET=your-secret-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-in-production

# Server Configuration
PORT=3001
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

## Frontend Environment Variables

Location: `.env` or `.env.local` (in project root)

Copy `.env.example` to `.env` or `.env.local`:

```env
# API Base URL
VITE_API_URL=http://localhost:3001/api
```

**Note:** Vite requires the `VITE_` prefix for environment variables to be exposed to the client.

## Quick Setup

1. **Backend:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Frontend:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local if needed (defaults should work for local dev)
   ```

## Generating Secure JWT Secrets

Run this command to generate secure random secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run it twice to get two different secrets for JWT_SECRET and JWT_REFRESH_SECRET.

