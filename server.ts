import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createServer as createViteServer } from 'vite';
import tourRoutes from './src/routes/tourRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import userRoutes from './src/routes/userRoutes.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  // API Routes
  app.use('/api/tours', tourRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/users', userRoutes);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vite middleware for development (serving frontend)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  // Global Error Handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      error: {
        message: err.message || 'Internal Server Error',
        status: err.status || 500,
      },
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
