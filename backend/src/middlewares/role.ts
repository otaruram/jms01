import { Request, Response, NextFunction } from 'express';

export function roleMiddleware(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req as any).user?.role;

    if (!userRole) {
      res.status(401).json({
        success: false,
        message: 'Akses ditolak. Role tidak teridentifikasi.',
      });
      return;
    }

    if (!allowedRoles.includes(userRole) && userRole !== 'SUPER_ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda tidak memiliki izin (Forbidden).',
      });
      return;
    }

    next();
  };
}
