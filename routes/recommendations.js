// routes/recommendations.js
import express from 'express';
import { supabase } from '../config/supabaseClient.js'; // Use public client for RPC
import { getEmbedderInstance, isEmbedderReady } from '../services/embeddingService.js';

const router = express.Router();

router.post('/', async (req, res) => {

  // 1. Check if the embedding service is ready
  if (!isEmbedderReady()) {
    console.error('Recommendation request failed: Embedder service is not ready.');
    return res.status(503).json({ error: 'Recommendation service is temporarily unavailable. Please try again later.' });
  }

  // 2. Get the embedder instance
  const embedder = getEmbedderInstance();
  if (!embedder) {
      console.error('Recommendation request failed: Embedder instance is null despite being marked as ready.');
      return res.status(503).json({ error: 'Recommendation service encountered an internal issue.' });
  }

  try {
    const { query } = req.body;

    // 3. Validate input query
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({ error: 'Invalid or missing query parameter.' });
    }

    // 4. Generate embeddings for the query
    const output = await embedder(query.trim(), { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);

    // 5. Call Supabase RPC function to find matching movies
    const rpcParams = {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 10,
    };

    const { data: movies, error: rpcError } = await supabase.rpc('match_movies', rpcParams);

    if (rpcError) {
      console.error('Supabase RPC error (match_movies):', rpcError);
      return res.status(500).json({ error: 'Failed to retrieve movie matches.' });
    }

    // 6. Send the recommendations
    res.json({ recommendations: movies || [] }); 

  } catch (error) {
    // Catch errors during embedding generation or other unexpected issues
    console.error('Error processing recommendation request:', error);
    res.status(500).json({ error: 'Failed to process recommendations due to an internal error.' });
  }
});

export default router;