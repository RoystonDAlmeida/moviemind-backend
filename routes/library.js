// routes/library.js
import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { createSupabaseUserClient } from '../config/supabaseClient.js';

const router = express.Router();

// Middleware specific to library routes to enforce authentication
router.use((req, res, next) => {
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  // Also ensure the token needed for the user client is present
  if (!req.token) {
    console.error('Library route error: Token missing from request despite req.auth being set.');
    return res.status(401).json({ error: 'Authentication token is missing.' });
  }
  next();
});

// --- GET /api/library ---
router.get('/', async (req, res) => {
  const clerkUserId = req.auth.userId; // Get verified user ID from middleware

  try {
    // Create a Supabase client scoped to this user
    const supabaseUserClient = createSupabaseUserClient(req.token);

    // Fetch library items for the authenticated user
    const { data, error } = await supabaseUserClient
      .from('user_library')
      .select('movie_id, title, poster, year, genres, added_at') 
      .eq('user_id', clerkUserId) 
      .order('added_at', { ascending: false }); 

    if (error) {
      console.error(`Supabase fetch library error for user ${clerkUserId}:`, error);

      if (error.code === '42501') {
           return res.status(403).json({ error: 'Forbidden: Cannot access library data.' });
      }
      return res.status(500).json({ error: 'Failed to fetch library data.' });
    }

    res.status(200).json({ library: data || [] }); 

  } catch (error) {
    console.error(`Unexpected error in GET /api/library for user ${clerkUserId}:`, error);
    res.status(500).json({ error: 'Internal server error while fetching library.' });
  }
});

// --- POST /api/library/add ---
router.post('/add', [

  // Validate the movie object itself exists
  body('movie').isObject().withMessage('Movie data must be an object.'),

  // Validate and sanitize individual fields within the movie object
  body('movie.id').notEmpty().withMessage('Movie ID is required.'),
  body('movie.title').trim().notEmpty().withMessage('Movie title is required.'),
  body('movie.poster').optional({ checkFalsy: true }).trim().isURL().withMessage('Invalid poster URL format.'),
  body('movie.year').optional({ checkFalsy: true }).isInt({ min: 1888, max: new Date().getFullYear() + 5 }).withMessage('Invalid year.'),

  // Assuming genres is an array of strings. If it's just a string, adjust validation.
  body('movie.genres').optional({ checkFalsy: true }).isArray().withMessage('Genres must be an array.'),
  body('movie.genres.*').optional({ checkFalsy: true }).trim().escape(), // Sanitize each string in the array

  ], async (req, res) => {

  const clerkUserId = req.auth.userId; // Get verified user ID

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { movie } = req.body;

    // Create a user-scoped Supabase client
    const supabaseUserClient = createSupabaseUserClient(req.token);

    // Prepare data for upsert
    const movieData = {
        user_id: clerkUserId,
        movie_id: movie.id,
        title: movie.title,
        poster: movie.poster,
        year: movie.year,
        genres: movie.genres,
        added_at: new Date().toISOString()
    };

    // Perform the upsert operation
    const { error } = await supabaseUserClient
      .from('user_library')
      .upsert(movieData);

    if (error) {
      console.error(`Supabase upsert error for user ${clerkUserId}, movie ${movie.id}:`, error);
      if (error.code === '42501') { // RLS violation
        return res.status(403).json({ error: 'Forbidden: Operation violates security policy.' });
      }
      // Handle other potential DB errors (e.g., constraint violations)
      return res.status(500).json({ error: `Database error: ${error.message}` });
    }

    // Return a simpler success response
    res.status(201).json({
        message: 'Movie added successfully'
    });

  } catch (error) {
    console.error(`Unexpected error in POST /api/library/add for user ${clerkUserId}:`, error);
    res.status(500).json({ error: 'Internal server error while adding movie.' });
  }
});

// --- DELETE /api/library/:movieId ---
router.delete('/:movieId', [
    // Adjust validation based on your actual movieId format (e.g., isInt(), isUUID())
    param('movieId').notEmpty().withMessage('Movie ID parameter is required.') //.isInt().withMessage('Movie ID must be an integer.'),
  ], async (req, res) => {
    
  const clerkUserId = req.auth.userId;

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const validatedMovieId = req.params.movieId; // Use validated param

    // Create a user-scoped Supabase client
    const supabaseUserClient = createSupabaseUserClient(req.token);

    // Perform the delete operation
    const { error } = await supabaseUserClient
      .from('user_library')
      .delete()
      .eq('user_id', clerkUserId)
      .eq('movie_id', validatedMovieId);

    if (error) {
      console.error(`Supabase delete error for user ${clerkUserId}, movie ${movieId}:`, error);
      if (error.code === '42501') {
        return res.status(403).json({ error: 'Forbidden: Operation violates security policy.' });
      }
      return res.status(500).json({ error: `Database error: ${error.message}` });
    }

    res.status(200).json({ message: 'Movie successfully removed from library' });

  } catch (error) {
    console.error(`Unexpected error in DELETE /api/library/${req.params.movieId} for user ${clerkUserId}:`, error);
    res.status(500).json({ error: 'Internal server error while removing movie.' });
  }
});

export default router;