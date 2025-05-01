// config/index.js
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET,
  port: process.env.PORT || 3000,
  embedderModel: 'Xenova/all-MiniLM-L6-v2',
  embedderMaxRetries: 3,
  embedderRetryDelay: 5000, // 5 seconds
  // TODO: Add allowed origins based on NODE_ENV for stricter CORS
  // Define allowed origins based on environment
  allowedOrigins: process.env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_PROD_URL ? [process.env.FRONTEND_PROD_URL] : []) // Use production URL if set
    : (process.env.FRONTEND_DEV_URL ? [process.env.FRONTEND_DEV_URL, 'http://127.0.0.1:5173'] : ['http://localhost:5173', 'http://127.0.0.1:5173']), // Use dev URL if set, fallback to defaults
  nodeEnv: process.env.NODE_ENV || 'development', // Determine the environment
};

// Add validation for production frontend URL if in production mode
if (!config.supabaseUrl || !config.supabaseAnonKey || !config.supabaseJwtSecret || (config.nodeEnv === 'production' && !process.env.FRONTEND_PROD_URL)) {
  console.error(
    'FATAL ERROR: Missing required environment variables. Ensure VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and SUPABASE_JWT_SECRET are set.'
  );

  if (config.nodeEnv === 'production' && !process.env.FRONTEND_PROD_URL) {
    console.error('FATAL ERROR: FRONTEND_PROD_URL must be set in production environment.');
  }

  process.exit(1); // Exit if critical config is missing
}