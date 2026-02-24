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
app.use(express.static(path.join(__dirname, '/')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prompster')
  .then(() => console.log('MongoDB Connected Locally'))
  .catch(err => console.log(err));

// Routes
app.use('/api', require('./routes/api'));
app.use('/admin', require('./routes/admin'));

// Basic Route for testing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'prompster.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
