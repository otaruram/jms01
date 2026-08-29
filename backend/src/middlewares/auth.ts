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
    const secretOrKey = process.env.SUPABASE_JWT_SECRET;
    if (!secretOrKey) {
      console.error("Missing SUPABASE_JWT_SECRET in backend!");
      res.status(500).json({ success: false, message: 'Server configuration error' });
      return;
    }

    // 1. BONGKAR HEADER TOKEN (Tanpa Verifikasi Dulu) UNTUK CEK ALGORITMA
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader) {
      res.status(401).json({ success: false, message: 'Format token hancur / tidak valid' });
      return;
    }
    
    const alg = decodedHeader.header.alg;
    console.log("🔍 [AUTH DETECT] Algoritma Token:", alg);

    // 2. VERIFIKASI BERDASARKAN ALGORITMA
    let decoded: any;
    if (alg === 'HS256') {
      decoded = jwt.verify(token, secretOrKey, { algorithms: ['HS256'] });
    } else if (alg === 'ES256' || alg === 'RS256') {
      const pubKey = secretOrKey.replace(/\\n/g, '\n');
      decoded = jwt.verify(token, pubKey, { algorithms: [alg] });
    } else {
      throw new Error(`Algoritma ${alg} tidak didukung backend.`);
    }
    
    req.user = {
      sub: decoded.sub,
      email: decoded.email,
      name: (decoded.user_metadata as any)?.full_name,
    };
    next();
  } catch (error: any) {
    console.error("❌ [AUTH ERROR]:", error.name, error.message);
    res.status(401).json({ 
      success: false, 
      message: 'Token invalid atau kedaluwarsa', 
      detail: error.message,
      secretExists: !!process.env.SUPABASE_JWT_SECRET
    });
  }
};
