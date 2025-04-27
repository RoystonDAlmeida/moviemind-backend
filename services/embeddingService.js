// services/embeddingService.js
import { pipeline } from '@xenova/transformers';
import { config } from '../config/index.js';

let embedder = null;
let isEmbedderInitialized = false;
let initializationPromise = null; 

// Internal function to perform initialization with retries
async function initializeEmbedderInternal() {
  for (let attempt = 1; attempt <= config.embedderMaxRetries; attempt++) {
    try {
      console.log(`Initializing embedding pipeline '${config.embedderModel}' (Attempt ${attempt}/${config.embedderMaxRetries})...`);

      embedder = await pipeline('feature-extraction', config.embedderModel);
      console.log('Embedding pipeline initialized successfully.');
      isEmbedderInitialized = true;

      return; // Exit the loop and function on success
    } catch (error) {
      console.error(`Failed to initialize embedding pipeline on attempt ${attempt}:`, error);
      if (attempt < config.embedderMaxRetries) {
        console.log(`Retrying in ${config.embedderRetryDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, config.embedderRetryDelay));
      } else {
        console.error(`FATAL: Embedding pipeline failed to initialize after ${config.embedderMaxRetries} attempts. Exiting.`);
        process.exit(1);
      }
    }
  }
}

// Start initialization immediately when the module is loaded
// Store the promise in case other parts of the app need to wait for completion.
initializationPromise = initializeEmbedderInternal();

// Function to get the embedder instance (may be null if not initialized)
export function getEmbedderInstance() {
  return embedder;
}

// Function to check if initialization completed successfully
export function isEmbedderReady() {
  return isEmbedderInitialized;
}

export { initializationPromise };