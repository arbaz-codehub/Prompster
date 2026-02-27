const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const session = require('express-session');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'prompster_super_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Files (Serve files from current directory for now to keep existing structure working)
app.use(express.static(path.join(__dirname, '/'), {
  maxAge: '1d', // Cache static assets in the browser for 1 day
  setHeaders: (res, path) => {
    // Ensuring caching for static assets
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

// Routes
app.use('/api', require('./routes/api'));
app.use('/admin', require('./routes/admin'));

// Basic Route for testing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'prompster.html'));
});

// Database Connection and Server Start
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prompster', {
  serverSelectionTimeoutMS: 5000 // Timeout early if can't connect
})
  .then(() => {
    console.log('MongoDB Connected Successfully');
    // Start Server only AFTER db connects
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('CRITICAL: Failed to connect to MongoDB. Server is resting.');
    console.error(err);
    process.exit(1); // Force exit so Render marks the deployment as failed
  });
