import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

// jose is ESM-only, so we use dynamic import
let joseModule: any = null;

async function loadJose() {
  if (!joseModule) {
    joseModule = await import('jose');
  }
  return joseModule;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email?: string;
    role?: string;
    [key: string]: unknown;
  };
}

/**
 * JWT Authentication Middleware.
 * Verifies the Bearer token from `Authorization` header against SUPABASE_JWT_SECRET.
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token tidak ditemukan.'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const jose = await loadJose();
    
    const jwtSecret = process.env.SUPABASE_JWT_SECRET || process.env.SUPABASE_SECRET_KEY;
    if (!jwtSecret) {
      throw new Error('SUPABASE_JWT_SECRET is not configured');
    }
    
    const secret = new TextEncoder().encode(jwtSecret);

    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });

    // Sync user to local database and fetch role
    const userEmail = payload.email as string;
    
    let dbUser = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!dbUser) {
      // Auto-assign SUPER_ADMIN if email matches .env
      const isSuperAdmin = userEmail === process.env.SUPER_ADMIN_EMAIL;
      dbUser = await prisma.user.create({
        data: {
          id: payload.sub as string,
          email: userEmail,
          name: (payload.user_metadata as any)?.full_name || userEmail.split('@')[0],
          role: isSuperAdmin ? 'SUPER_ADMIN' : 'USER',
        },
      });
    }

    req.user = {
      sub: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
    };

    next();
  } catch (error: any) {
    cachedJWKS = null;

    if (error?.code === 'ERR_JWT_EXPIRED') {
      res.status(401).json({
        success: false,
        message: 'Token telah kedaluwarsa. Silakan login ulang.'
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Token tidak valid.'
    });
  }
}
