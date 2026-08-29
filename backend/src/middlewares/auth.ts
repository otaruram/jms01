import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

// jose is ESM-only, so we use dynamic import
let joseModule: any = null;
let cachedJWKS: any = null;

async function loadJose() {
  if (!joseModule) {
    joseModule = await import('jose');
  }
  return joseModule;
}

async function getJWKS() {
  if (cachedJWKS) return cachedJWKS;

  const jwksUrl = process.env.SUPABASE_JWKS_URL;
  if (!jwksUrl) {
    throw new Error('SUPABASE_JWKS_URL is not configured');
  }

  const jose = await loadJose();
  cachedJWKS = jose.createRemoteJWKSet(new URL(jwksUrl));
  return cachedJWKS;
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
 * Verifies the Bearer token from `Authorization` header against Supabase JWKS.
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
    const jwks = await getJWKS();

    const { payload } = await jose.jwtVerify(token, jwks, {
      issuer: process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL}/auth/v1` : undefined,
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
