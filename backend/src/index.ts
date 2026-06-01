import app from './app.js';
import env from './utils/config.js';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`✓ Shortify backend running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${env.NODE_ENV}`);
  console.log(`✓ Base URL: ${env.BASE_URL}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
