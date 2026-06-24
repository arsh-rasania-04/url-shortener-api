const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Url = require('./models/Url');
const app = express();

app.use(cors());
app.use(express.json());

// We will initialize nanoid safely inside the startup sequence below
let nanoid;

// --- ROUTE 0: Health Check ---
app.get('/', (req, res) => {
  res.send('URL Shortener API is actively running!');
});

// --- ROUTE 1: Generate Short Link ---
app.post('/api/shorten', async (req, res) => {
  const { originalUrl } = req.body;

  // Basic URL validation
  const urlPattern = new RegExp('^(https?:\\/\\/)?'+
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+
    '((\\d{1,3}\\.){3}\\d{1,3}))'+
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+
    '(\\?[;&a-z\\d%_.~+=-]*)?'+
    '(\\#[-a-z\\d_]*)?$','i');

  if (!urlPattern.test(originalUrl)) {
    return res.status(401).json('Invalid Base URL');
  }

  try {
    const urlCode = nanoid(6);

    let url = new Url({
      originalUrl,
      urlCode,
      date: new Date()
    });

    await url.save();
    
    res.json(url);
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});

// --- ROUTE 2: The Redirect ---
app.get('/:code', async (req, res) => {
  try {
    const url = await Url.findOne({ urlCode: req.params.code });

    if (url) {
      return res.redirect(url.originalUrl);
    } else {
      return res.status(404).json('No url found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});

// --- THE FIX: Strict Boot Sequence ---
const startServer = async () => {
  try {
    // 1. Force the server to wait for nanoid to load
    const nanoidModule = await import('nanoid');
    nanoid = nanoidModule.nanoid;

    // 2. Force the server to wait for the database connection
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected successfully.');

    // 3. ONLY start listening for requests once both dependencies are locked in
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running securely on port ${PORT}`));
  } catch (err) {
    console.error('CRITICAL ERROR: Failed to start server.', err);
    // If the database fails to connect, kill the server process immediately
    process.exit(1); 
  }
};

startServer();