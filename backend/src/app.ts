import express, { Request, Response, NextFunction } from 'express';
import shortenRoutes from './routes/shorten.js';
import linksRoutes from './routes/links.js';
import redirectRoutes from './routes/redirect.js';
import { ownerTokenMiddleware } from './middleware/ownerToken.js';
import env from './utils/config.js';

const app = express();

// Middleware
app.use(express.json());

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Owner-Token');
  res.setHeader('Access-Control-Expose-Headers', 'X-Owner-Token');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Owner token middleware
app.use(ownerTokenMiddleware);

// Routes
app.use('/api', shortenRoutes);
app.use('/api', linksRoutes);
app.use('/', redirectRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: 'Endpoint not found',
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
});

export default app;
