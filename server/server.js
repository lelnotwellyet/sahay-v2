const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
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

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/counsellors', require('./routes/counsellors'));
app.use('/api/sessions', authMiddleware, require('./routes/sessions')); // Protected routes

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Sahay Server is running!' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB Atlas connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});