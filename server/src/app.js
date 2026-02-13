import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import locationRoutes from './routes/locationRoutes.js';
import { connectDB, disconnectDB } from './config/db.js';
import syncService from './sync/syncService.js';

const app = express();

app.use(cors({
  origin: [
    'https://sanna-weather-dash.vercel.app/',
    'https://sanna-weather-dash-1.onrender.com/',
    'https://sanna-weather-api.onrender.com',
    'https://sanna-weather-dash.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    syncService: syncService.getStats(),
  });
});

app.use('/api/locations', locationRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

const startServer = async () => {
  try {
    await connectDB();
    
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      
      const syncInterval = parseInt(process.env.SYNC_INTERVAL_MINUTES) || 15;
      syncService.start(syncInterval);
    });

    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      syncService.stop();
      
      server.close(async () => {
        console.log('HTTP server closed');
        await disconnectDB();
        process.exit(0);
      });

      setTimeout(() => {
        console.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    return server;
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

export { app, startServer };
