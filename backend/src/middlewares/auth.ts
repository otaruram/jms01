import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

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
 * Verifies the Bearer token by calling Supabase API directly to ensure 100% compatibility.
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
    
    const apikey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!process.env.SUPABASE_URL || !apikey) {
      console.error("Missing Supabase env vars in backend!");
      res.status(500).json({ success: false, message: 'Server configuration error' });
      return;
    }

    // Call Supabase API to verify the token
    const verifyResponse = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: apikey
      }
    });

    if (!verifyResponse.ok) {
      throw new Error('Invalid token from Supabase');
    }

    const payload = await verifyResponse.json();

    // Sync user to local database and fetch role
    const userEmail = payload.email as string;
    
    let dbUser = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!dbUser) {
      // Auto-assign SUPER_ADMIN if email matches .env
      const isSuperAdmin = userEmail === process.env.SUPER_ADMIN_EMAIL;
      dbUser = await prisma.user.create({
        data: {
          id: payload.id as string,
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
    res.status(401).json({
      success: false,
      message: 'Token tidak valid.'
    });
  }
}
