# 🎬 MovieMind - Backend

[![Node.js](https://img.shields.io/badge/Node.js-18.x+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-blue.svg)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend%20&%20Auth-brightgreen.svg)](https://supabase.com/)
[![Transformers.js](https://img.shields.io/badge/%F0%9F%A4%97%20Transformers.js-ML%20Magic-orange.svg)](https://huggingface.co/docs/transformers.js/index)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) 

Welcome to the server-side engine powering **MovieMind**! This backend, built with Node.js and Express, serves as the central hub for managing movie data, and most importantly, generating personalized movie recommendations using the magic of AI.

---

## 📚 Table of Contents

- [🎬 MovieMind - Backend](#-moviemind---backend)
  - [📚 Table of Contents](#-table-of-contents)
  - [✨ Core Features](#-core-features)
  - [🛠️ Tech Stack](#️-tech-stack)
  - [⚙️ Setup \& Installation](#️-setup--installation)
  - [🚀 Running the Server](#-running-the-server)
  - [🗺️ API Endpoints (Illustrative Examples)](#️-api-endpoints-illustrative-examples)
  - [🤔 How Recommendations Work](#-how-recommendations-work)
  - [🙌 Contributing](#-contributing)
  - [📄 License](#-license)

---

## ✨ Core Features

*   **🚀 RESTful API:** A well-defined API for seamless communication with the MovieMind frontend.
*   **🎬 Movie Data Management:** Interfaces with a Supabase database to store, retrieve, and manage a comprehensive movie library.
*   **🤖 AI-Powered Recommendations:** Leverages the [`@xenova/transformers`](https://huggingface.co/docs/transformers.js/index) library (running locally!) to understand movie content (like descriptions or genres) and potentially user preferences, delivering tailored suggestions.
*   **🛡️ Security First:** Implements essential security measures using `helmet` for HTTP header protection and `express-rate-limit` to prevent abuse.
*   **✅ Input Validation:** Ensures data integrity and prevents common vulnerabilities by validating and sanitizing incoming requests with `express-validator`.
*   **☁️ Supabase Integration:** Uses Supabase not just for Auth, but also as a powerful PostgreSQL database backend for managing authenticated users movies.

---

## 🛠️ Tech Stack

*   **Runtime:** Node.js (>= v18 recommended)
*   **Framework:** Express.js v5 - Fast, unopinionated, minimalist web framework.
*   **Database & Auth:** Supabase (`@supabase/supabase-js`) - The open-source Firebase alternative for database, auth, and more.
*   **Machine Learning:** 🤗 Transformers.js (`@xenova/transformers`) - Run Hugging Face Transformers directly in Node.js.
*   **Authentication Tokens:** JSON Web Tokens (`jsonwebtoken`) - Securely transmitting information between parties.
*   **Security Middleware:**
    *   Helmet (`helmet`) - Secure Express apps by setting various HTTP headers.
    *   Express Rate Limit (`express-rate-limit`) - Basic rate-limiting middleware.
*   **API Essentials:**
    *   CORS (`cors`) - Enabling Cross-Origin Resource Sharing.
    *   Body Parser (Built into Express v5+) - Parsing incoming request bodies.
*   **Validation:** Express Validator (`express-validator`) - Middleware for request data validation and sanitization.
*   **Environment Variables:** Dotenv (`dotenv`) - Loading environment variables from a `.env` file.
*   **Development:** Nodemon (`nodemon`) - Automatic server restarts during development.

---

## ⚙️ Setup & Installation

**Prerequisites:**

1.  **Node.js:** Make sure you have Node.js installed (v18 or later is recommended). Download from nodejs.org.
2.  **npm or yarn:** Package managers for Node.js.
3.  **Supabase Account:** Create a free account and project at supabase.com.

**Steps:**

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/RoystonDAlmeida/moviemind-backend.git
    cd moviemind-backend/
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    # OR if you prefer yarn
    # yarn install
    ```

3.  **Configure Environment Variables:**
    *   Create a file named `.env` in the root of the project (`movie_recommendation_system_server/.env`).

    *   Populate `.env` with your Supabase credentials and a secure JWT secret:

    ```env
    # Supabase Configuration
    VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

    # JWT Configuration
    JWT_SECRET=generate-a-very-strong-random-secret-key # Use a strong, unique secret

    # Frontend Development URL
    FRONTEND_DEV_URL = http://localhost:<port_number>
    ```
    *   Find your `SUPABASE_URL` and `SUPABASE_ANON_KEY` in your Supabase project settings (API section).

---

## 🚀 Running the Server

*   **Development Mode (with Auto-Reload):**
    ```bash
    npm run dev:server
    # OR
    # yarn dev:server
    ```
    This uses `nodemon` to watch for file changes and automatically restart the server, perfect for development!

*   **Production Mode:**
    ```bash
    npm run server
    # OR
    # yarn server
    ```
    This runs the server using `node`. Make sure your environment is properly configured for production deployment.

The server will typically start on `http://localhost:3000`.

---

## 🗺️ API Endpoints (Illustrative Examples)

*(Note: These are examples based on the provided code structure. Check `routes/` files for specifics.)*

**Authentication (`/api/auth`)** *(Assuming separate auth routes, adjust if handled differently)*


**Recommendations (`/api/recommendations`)**

*   **`POST /`**
    *   **Description:** Fetches movie recommendations based on a text query. It generates an embedding for the query and calls the `match_movies` Supabase RPC function to find similar movies in the database.
    *   **Request Body:**
        ```json
        {
          "query": "Sci-fi movie about space exploration"
        }
        ```
    *   **Response (Success 200):**
        ```json
        {
          "recommendations": [
            { "id": 101, "title": "Galaxy Quest", ... },
            { "id": 205, "title": "Interstellar", ... }
          ]
        }
        ```
    *   **Validation:** Uses `express-validator` to ensure the `query` is a non-empty string.

**User Library (`/api/library`) - Requires Auth**

*   **`GET /`**
    *   **Description:** Retrieves the list of movies saved by the authenticated user.
    *   **Requires:** Valid JWT in `Authorization: Bearer <token>` header (verified by middleware).
    *   **Response (Success 200):**
        ```json
        {
          "library": [
            { "movie_id": 1, "title": "Movie One", ... },
            { "movie_id": 5, "title": "Another Movie", ... }
          ]
        }
        ```

*   **`POST /add`**
    *   **Description:** Adds a movie to the authenticated user's library.
    *   **Requires:** Valid JWT.
    *   **Request Body:**
        ```json
        {
          "movie": {
            "id": 123,
            "title": "Specific Movie Title",
            "poster": "url/to/poster.jpg",
            "year": 2023,
            "genres": ["Action", "Adventure"]
          }
        }
        ```
    *   **Response (Success 201):**
        ```json
        { "message": "Movie added successfully" }
        ```
    *   **Validation:** Uses `express-validator` to check the structure and types of the `movie` object and its fields.

*   **`DELETE /:movieId`**
    *   **Description:** Removes a movie from the authenticated user's library.
    *   **Requires:** Valid JWT.
    *   **URL Parameter:** `movieId` (e.g., `/api/library/123`)
    *   **Response (Success 200):**
        ```json
        { "message": "Movie successfully removed from library" }
        ```
    *   **Validation:** Uses `express-validator` to check the `movieId` parameter.

---

## 🤔 How Recommendations Work

MovieMind uses a **content-based filtering** approach powered by vector embeddings and a Supabase Function:

1.  **User Query:** The user provides a text query describing the kind of movie they're looking for (e.g., "funny animated movie for kids").
2.  **Embedding Generation (Node.js Backend):** The backend server receives this query. It uses the `Transformers.js` library (specifically a model like `Xenova/all-MiniLM-L6-v2`) to convert the text query into a numerical vector **embedding**. This embedding captures the semantic meaning of the query.
    ```
    "funny animated movie for kids" ---> [-0.2, 0.75, 0.11, ...]
    ```
3.  **RPC Call (Backend to Supabase):** The backend sends this query embedding to a Supabase Edge Function called `match_movies` using a Remote Procedure Call (RPC).
4.  **Similarity Search (Supabase Function):** The `match_movies` function executes *within Supabase*. It takes the query embedding and compares it against pre-calculated embeddings stored alongside each movie in your database table (using the `pgvector` extension for PostgreSQL). It efficiently finds movies whose embeddings are mathematically closest (most similar, using cosine similarity) to the query embedding.
5.  **Results:** The `match_movies` function returns a list of the top matching movies (e.g., the 10 most similar ones) back to the Node.js backend.
6.  **Response:** The backend sends this list of recommended movies to the frontend.

This approach keeps the computationally intensive similarity search close to the data within Supabase, making it efficient.

---

## 🙌 Contributing

Contributions make the open-source community amazing! If you'd like to contribute:

1.  **Fork** the repository.
2.  Create a new **branch** (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  **Commit** your changes (`git commit -m 'Add some amazing feature'`).
5.  **Push** to the branch (`git push origin feature/your-feature-name`).
6.  Open a **Pull Request**.

Please ensure your code follows existing style conventions and includes tests where appropriate.

---

## 📄 License

This project is licensed under the MIT License.