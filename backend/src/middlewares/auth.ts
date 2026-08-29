import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import jwt from 'jsonwebtoken';

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
 * Verifies the Bearer token using jsonwebtoken and SUPABASE_JWT_SECRET.
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
    return;
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const secret = process.env.SUPABASE_JWT_SECRET;
    if (!secret) {
      console.error("Missing SUPABASE_JWT_SECRET in backend!");
      res.status(500).json({ success: false, message: 'Server configuration error' });
      return;
    }

    // WAJIB gunakan secret dari Supabase, bukan secret custom
    const decoded: any = jwt.verify(token, secret);
    
    // Sync user to local database and fetch role
    const userEmail = decoded.email as string;
    
    let dbUser = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!dbUser) {
      // Auto-assign SUPER_ADMIN if email matches .env
      const isSuperAdmin = userEmail === process.env.SUPER_ADMIN_EMAIL;
      dbUser = await prisma.user.create({
        data: {
          id: decoded.sub as string,
          email: userEmail,
          name: (decoded.user_metadata as any)?.full_name || userEmail.split('@')[0],
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
    res.status(401).json({ success: false, message: 'Token invalid atau kedaluwarsa', error: error.message });
  }
};
