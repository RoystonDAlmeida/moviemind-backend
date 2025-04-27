// middleware/auth.js
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

// Middleware to verify JWT and attach user info and token to the request object.
export const getUserAndToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If no Authorization header or doesn't start with 'Bearer ', proceed without auth info
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using the Supabase JWT secret
    const decoded = jwt.verify(token, config.supabaseJwtSecret);

    // Attach decoded user information
    req.auth = {
      userId: decoded.sub,
    };
    // Also attach the raw token, as it's needed to create the user-scoped Supabase client
    req.token = token;

    next(); // Proceed with authenticated user info attached

  } catch (error) {
    // Handle specific JWT errors if needed (e.g., TokenExpiredError)
    console.warn(`JWT validation failed: ${error.message}`);

    // Don't attach potentially invalid auth info
    req.auth = undefined;
    req.token = undefined;

    // Even if validation fails, proceed to the next middleware/route.
    // Route handlers are responsible for checking req.auth if authentication is required.
    next();
  }
};