const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const coworkingRoutes = require('./routes/coworkings');
const workspaceRoutes = require('./routes/workspaces');
const reservationRoutes = require('./routes/reservations');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Адреса вашого React-додатку
  credentials: true // Дозволити передачу куків та заголовків авторизації
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/coworking-reservation')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/coworkings', coworkingRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/reservations', reservationRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Coworking Reservation API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});