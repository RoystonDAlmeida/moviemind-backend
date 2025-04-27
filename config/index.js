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
  // allowedOrigins: process.env.NODE_ENV === 'production'
  //   ? ['https://your-frontend-domain.com']
  //   : ['http://localhost:5173', 'http://127.0.0.1:5173'],
};

// Validate critical configuration
if (!config.supabaseUrl || !config.supabaseAnonKey || !config.supabaseJwtSecret) {
  console.error(
    'FATAL ERROR: Missing required environment variables. Ensure VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and SUPABASE_JWT_SECRET are set.'
  );
  process.exit(1); // Exit if critical config is missing
}