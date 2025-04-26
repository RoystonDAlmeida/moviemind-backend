// server.js (Main Application Entry Point)

import express from 'express';
import cors from 'cors';
import { config } from './config/index.js'; // --- Configuration ---
import { getUserAndToken } from './middleware/auth.js'; // --- Middleware ---
import apiRoutes from './routes/index.js';  // --- API Routes ---
import './services/embeddingService.js';   // --- Services ---
// TODO: Import and configure helmet, rate-limiter, stricter CORS middleware
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';

const app = express();

// 1. CORS: Allow requests from your frontend. 
// TODO: Replace with stricter CORS configuration using config.allowedOrigins
app.use(cors());

// 2. Security Headers (Recommended)
// app.use(helmet());

// 3. JSON Body Parser: Parse incoming JSON requests
app.use(express.json());

// 4. Authentication Middleware: Process Authorization header for all requests
// It verifies JWT and attaches req.auth and req.token if valid.
app.use(getUserAndToken);

// 5. Rate Limiting (Recommended for public APIs)
// const apiLimiter = rateLimit({ ... });
// app.use('/api/', apiLimiter);

// --- Mount API Routes ---
// All routes defined in the 'routes' directory will be available under /api
app.use('/api', apiRoutes);

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  // Avoid sending stack trace in production
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

// --- Start Server ---
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});