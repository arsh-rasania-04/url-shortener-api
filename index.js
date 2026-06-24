const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// We have to use dynamic import for nanoid because it is an ESM package
let nanoid;
import('nanoid').then(module => {
    nanoid = module.nanoid;
});

const Url = require('./models/Url');
const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error(err));


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
    // Generate a 6-character code
    const urlCode = nanoid(6);

    // Save to database
    let url = new Url({
      originalUrl,
      urlCode,
      date: new Date()
    });

    await url.save();
    
    // Return the new code to the frontend
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
      // 302 Temporary Redirect to the original URL
      return res.redirect(url.originalUrl);
    } else {
      return res.status(404).json('No url found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));