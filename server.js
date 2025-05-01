// server.js (Main Application Entry Point)

import express from 'express';
import cors from 'cors';
import { config } from './config/index.js'; // --- Configuration ---
import { getUserAndToken } from './middleware/auth.js'; // --- Middleware ---
import apiRoutes from './routes/index.js';  // --- API Routes ---
import './services/embeddingService.js';   // --- Services ---
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

// 1. CORS: Allow requests from your frontend. 
// TODO: Replace with stricter CORS configuration using config.allowedOrigins
app.use(cors());

// 2. Security Headers (Recommended)
app.use(helmet());

// 3. JSON Body Parser: Parse incoming JSON requests
app.use(express.json());

// 4. Authentication Middleware: Process Authorization header for all requests
// It verifies JWT and attaches req.auth and req.token if valid.
app.use(getUserAndToken);

// 5. Rate Limiting: Apply to all API routes
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `windowMs`
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	message: 'Too many requests from this IP, please try again after 15 minutes', // Message sent when limit is exceeded
});

app.use('/api', apiLimiter); // Apply the limiter to all routes starting with /api

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