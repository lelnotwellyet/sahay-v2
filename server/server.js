const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

// --- START: Gemini Client Initialization ---
const geminiApiKey = process.env.GEMINI_API_KEY;

let ai = null; 

if (geminiApiKey && geminiApiKey.startsWith("AIzaSy")) {
    ai = new GoogleGenAI({ apiKey: geminiApiKey });
    console.log("✅ Gemini AI Client initialized.");
} else {
    console.warn("⚠️ WARNING: GEMINI_API_KEY is missing or invalid. AI features will be disabled.");
}
// --- END: Gemini Client Initialization ---

const app = express();

// Middleware - Updated CORS for Vercel
app.use(cors({
  origin: process.env.CLIENT_URL || [
    'http://localhost:3000',
    'https://your-app.vercel.app' // Replace with your actual Vercel URL
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Auth middleware (your existing code)
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Routes (your existing routes)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/counsellors', require('./routes/counsellors'));
app.use('/api/sessions', authMiddleware, require('./routes/sessions'));
app.use('/api/admin', authMiddleware, require('./routes/admin'));
app.use('/api/availability', require('./routes/availability'));
app.use('/api/gemini', authMiddleware, (req, res, next) => {
    req.ai = ai;
    if (!req.ai) {
        return res.status(503).json({ success: false, message: 'AI service is disabled due to missing API key.' });
    }
    next();
}, require('./routes/gemini'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Sahay Server is running!',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Atlas connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

const PORT = process.env.PORT || 5000;

// For Vercel deployment - always listen
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;