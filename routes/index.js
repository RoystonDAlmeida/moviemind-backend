// routes/index.js

import express from 'express';
import recommendationsRouter from './recommendations.js';
import libraryRouter from './library.js';

const router = express.Router();

// Mount the recommendations router under /api/recommendations
router.use('/recommendations', recommendationsRouter);

// Mount the library router under /api/library
router.use('/library', libraryRouter);

export default router;