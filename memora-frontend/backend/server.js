/*The purpose of server.js is to contains your API endpoints that are used for 
  communicating with  to our PostgreSQL datbase (db.js), aswell and handleing  user
  authentication and validation logic 
*/
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// // Import routes (we'll create these next)
// const authRoutes = require('./routes/auth');
// const setsRoutes = require('./routes/sets');

// app.use('/api/auth', authRoutes);
// app.use('/api/sets', setsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});