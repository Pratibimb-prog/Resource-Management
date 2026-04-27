const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const resourceRoutes = require('./routes/resourceRoutes');

const app = express();

// Middleware setup
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Serve frontend static files (public/)
app.use(express.static(path.join(__dirname, '..', 'public')));

// API health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Smart Resource API is running' });
});

// Route setup
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resources', resourceRoutes);

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
