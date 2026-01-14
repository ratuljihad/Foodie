# Backend Environment Variables

## Your `.env` file should contain:

```env
# MongoDB Connection
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/foodie

# For MongoDB Atlas (cloud), use:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodie

# JWT Secret Keys
# Generate secure secrets with:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-secret-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-in-production

# Server Configuration
PORT=3001

# CORS Configuration (Frontend URL)
CORS_ORIGIN=http://localhost:5173

# Node Environment
NODE_ENV=development
```

## Variables Used in Code:

1. **MONGODB_URI** - Used in `config/database.js`
2. **JWT_SECRET** - Used in `routes/auth.js` and `middleware/auth.js`
3. **JWT_REFRESH_SECRET** - Used in `routes/auth.js`
4. **PORT** - Used in `index.js`
5. **CORS_ORIGIN** - Used in `index.js` for CORS configuration
6. **NODE_ENV** - Can be used for conditional logic (optional)

## Frontend Environment Variables

Create `.env.local` in the project root:

```env
VITE_API_URL=http://localhost:3001/api
```

**Note:** Vite requires `VITE_` prefix for client-side environment variables.

