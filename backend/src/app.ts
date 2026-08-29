import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { globalLimiter } from './middlewares/rateLimiter';
import { authMiddleware } from './middlewares/auth';
import inventoryRoutes from './routes/inventory.routes';
import projectRoutes from './routes/project.routes';
import documentRoutes from './routes/document.routes';
import orderRoutes from './routes/order.routes';
import dashboardRoutes from './routes/dashboard.routes';
import sphBastRoutes from './routes/sph-bast.routes';
import systemRoutes from './routes/system.routes';
import authRoutes from './routes/auth.routes';
import reportsRoutes from './routes/reports.routes';

const app = express();

// Security Middlewares
app.use(helmet()); // Secure HTTP headers

const corsOptions = {
  origin: ['http://localhost:5173', 'https://jms-admin-wine.vercel.app', 'https://jms-admin.my.id', 'https://jms-admin.vercel.app'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Wajib untuk Production Preflight
app.use(globalLimiter); // Apply global rate limiting

// Body Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (public — no auth required)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// All API routes below require JWT authentication
app.use('/api', authMiddleware);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', sphBastRoutes); // /api/sph and /api/bast
app.use('/api/system', systemRoutes);
app.use('/api/reports', reportsRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'API Endpoint not found' });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export { app };
