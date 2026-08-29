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
 * Verifies the Bearer token using jsonwebtoken (HS256) or jose (ES256/RS256 with JWKS).
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
    let decodedPayload: any;
    if (alg === 'HS256') {
      decodedPayload = jwt.verify(token, secretOrKey, { algorithms: ['HS256'] });
    } else if (alg === 'ES256' || alg === 'RS256') {
      // Dynamic import for jose because it is an ESM module
      const { createRemoteJWKSet, jwtVerify } = await import('jose');
      
      // Gunakan JOSE untuk mengambil JWKS secara otomatis langsung dari Supabase
      const supabaseUrl = process.env.SUPABASE_URL;
      if (!supabaseUrl) {
         throw new Error("SUPABASE_URL environment variable is missing, required for fetching JWKS.");
      }
      const jwksUrl = new URL(process.env.SUPABASE_JWKS_URL || `${supabaseUrl}/auth/v1/.well-known/jwks.json`);
      const JWKS = createRemoteJWKSet(jwksUrl);
      
      const { payload } = await jwtVerify(token, JWKS, {
        algorithms: [alg]
      });
      decodedPayload = payload;
    } else {
      throw new Error(`Algoritma ${alg} tidak didukung backend.`);
    }
    
    // Fetch role from DB
    const dbUser = await prisma.user.findUnique({
      where: { id: decodedPayload.sub as string },
      select: { role: true }
    });

    req.user = {
      sub: decodedPayload.sub as string,
      email: decodedPayload.email as string,
      name: (decodedPayload.user_metadata as any)?.full_name,
      role: dbUser?.role || (decodedPayload.email === process.env.SUPER_ADMIN_EMAIL ? 'SUPER_ADMIN' : 'USER'),
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
