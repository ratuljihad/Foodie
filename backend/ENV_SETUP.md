# Environment Variables Setup

This document explains all the environment variables used in the backend.

## Required Variables

### MongoDB Connection
- **MONGODB_URI**: MongoDB connection string
  - Local: `mongodb://localhost:27017/foodie`
  - MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/foodie`

### JWT Authentication
- **JWT_SECRET**: Secret key for signing access tokens
  - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **JWT_REFRESH_SECRET**: Secret key for signing refresh tokens
  - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Optional Variables

### Server Configuration
- **PORT**: Server port (default: 3001)
- **CORS_ORIGIN**: Frontend URL for CORS (default: http://localhost:5173)
- **NODE_ENV**: Environment mode (development/production)

## Setup Instructions

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` with your actual configuration

3. For production, make sure to:
   - Use strong, random JWT secrets
   - Use a secure MongoDB connection string
   - Set NODE_ENV=production
   - Update CORS_ORIGIN to your production frontend URL

## Security Notes

- Never commit `.env` file to version control
- Use different secrets for development and production
- Keep your MongoDB credentials secure
- Rotate JWT secrets periodically in production

