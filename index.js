const connectoMongo = require('./db');
const express = require('express');
const cors = require('cors');

connectoMongo();
const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:3000", // Local React dev
  "https://ahmed121a485.github.io", // GitHub Pages main domain
  "https://ahmed121a485.github.io/inotebook-frontend" // Your frontend app URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow server-to-server or curl
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error("CORS policy: Not allowed by CORS"), false);
    }
    return callback(null, true);
  },
  credentials: true,
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
