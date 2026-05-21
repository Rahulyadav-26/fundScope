const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/portfolio', require('./routes/portfolioRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/funds', require('./routes/fundRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// Background tasks
const cron = require('node-cron');
const { updateFundNavs } = require('./services/navService');

// Run everyday at 9:00 PM IST (15:30 UTC)
cron.schedule('30 15 * * *', () => {
    console.log('Running daily NAV update cron job');
    updateFundNavs();
});

// Start listening immediately so Render detects the open port
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('CRITICAL: Failed to connect to MongoDB:', err);
    // Gracefully shut down the server and exit so Render knows it failed
    server.close(() => {
      process.exit(1);
    });
  });
