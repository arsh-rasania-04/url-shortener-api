const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Url = require('./models/Url');
const app = express();

app.use(cors());
app.use(express.json());


let nanoid;


app.get('/', (req, res) => {
  res.send('URL Shortener API is actively running!');
});


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


const startServer = async () => {
  try {

    const nanoidModule = await import('nanoid');
    nanoid = nanoidModule.nanoid;


    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected successfully.');


    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running securely on port ${PORT}`));
  } catch (err) {
    console.error('CRITICAL ERROR: Failed to start server.', err);
    process.exit(1); 
  }
};

startServer();