const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nailart_studio')
.then(() => console.log('MongoDB подключена'))
.catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Middleware
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"]
    }
  }
}));
app.use(cors());
app.use(express.json());

// Импорт маршрутов
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const galleryRoutes = require('./routes/gallery');
const analyticsRoutes = require('./routes/analytics');

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/analytics', analyticsRoutes);

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Nail Master API is running' });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// SEO-friendly routes
app.get('/ru', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

app.get('/de', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// Это позволит React Router обрабатывать все маршруты, включая /admin
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Access the app at: http://localhost:5000');
  console.log('Access admin panel at: http://localhost:5000/admin');
}); 