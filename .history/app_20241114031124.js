const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
require('dotenv').config();
console.log(process.env.MONGO_URI);

const app = express();
const PORT = process.env.PORT || 5000;


const User = require('./models/User');

const apiRoutes = require('./routes/api');


// Middleware
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.send('Flood Alert Backend is running');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, )
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});




