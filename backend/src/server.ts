import { app } from './app';
import { prisma } from './config/database';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Validate required environment variables for production
    if (!process.env.SUPABASE_JWKS_URL) {
      console.error('❌ FATAL ERROR: SUPABASE_JWKS_URL is not defined in .env');
      if (process.env.NODE_ENV === 'production') process.exit(1);
    }

    if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
      console.warn('⚠️ WARNING: FRONTEND_URL is not defined in production. CORS might block requests.');
    }

    // Connect to database
    await prisma.$connect();
    console.log('✅ Connected to database successfully');

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });

    // Graceful shutdown logic
    const gracefulShutdown = async () => {
      console.log('Received kill signal, shutting down gracefully');
      server.close(() => {
        console.log('Closed out remaining connections');
        prisma.$disconnect().then(() => {
          console.log('Database connections closed');
          process.exit(0);
        });
      });

      // Force close after 10s
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
