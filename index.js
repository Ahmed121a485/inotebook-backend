const connectoMongo = require('./db');
const express = require('express');
const cors = require('cors');

connectoMongo();
const app = express();
const port = process.env.PORT || 5000;

// ✅ CORS setup
const allowedOrigins = [
  "http://localhost:3000",            // local React dev
  "https://github.com/Ahmed121a485/inotebook-frontend.git", // GitHub Pages frontend (replace with your real URL)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error("CORS policy: Not allowed by CORS"), false);
    }
    return callback(null, true);
  },
  credentials: true, // if you need cookies or Authorization headers
}));

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

// Start server
app.listen(port, () => {
  console.log(`✅ iNotebook backend running on port ${port}`);
});
