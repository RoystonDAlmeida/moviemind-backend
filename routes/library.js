// routes/library.js
import express from 'express';
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
router.post('/add', async (req, res) => {
  const clerkUserId = req.auth.userId; // Get verified user ID

  try {
    const { movie } = req.body;

    // Basic validation of the movie object
    if (!movie || typeof movie !== 'object' || !movie.id || !movie.title) {
      return res.status(400).json({ error: 'Invalid or missing movie data in request body.' });
    }

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
router.delete('/:movieId', async (req, res) => {
  const clerkUserId = req.auth.userId;
  const { movieId } = req.params;

  // Validate movieId parameter
  if (!movieId) {
    return res.status(400).json({ error: 'Movie ID is required in the URL path.' });
  }

  try {
    // Create a user-scoped Supabase client
    const supabaseUserClient = createSupabaseUserClient(req.token);

    // Perform the delete operation
    const { error } = await supabaseUserClient
      .from('user_library')
      .delete()
      .eq('user_id', clerkUserId)
      .eq('movie_id', movieId);

    if (error) {
      console.error(`Supabase delete error for user ${clerkUserId}, movie ${movieId}:`, error);
      if (error.code === '42501') {
        return res.status(403).json({ error: 'Forbidden: Operation violates security policy.' });
      }
      return res.status(500).json({ error: `Database error: ${error.message}` });
    }

    res.status(200).json({ message: 'Movie successfully removed from library' });

  } catch (error) {
    console.error(`Unexpected error in DELETE /api/library/${movieId} for user ${clerkUserId}:`, error);
    res.status(500).json({ error: 'Internal server error while removing movie.' });
  }
});


export default router;