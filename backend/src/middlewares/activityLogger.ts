import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

export function activityLogger(moduleName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Intercept response finish
    res.on('finish', async () => {
      // Log only successful mutation requests
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const method = req.method;
        const userId = (req as any).user?.sub; // Assuming authMiddleware sets sub

        if (!userId) return; // Cannot log without user id

        let actionDescription = '';
        switch (method) {
          case 'POST':
            actionDescription = `Membuat data baru (POST) di modul ${moduleName}`;
            break;
          case 'PUT':
          case 'PATCH':
            actionDescription = `Memperbarui data (PATCH/PUT) di modul ${moduleName}`;
            break;
          case 'DELETE':
            actionDescription = `Menghapus data (DELETE) di modul ${moduleName}`;
            break;
          default:
            return; // Don't log GET requests
        }

        try {
          await prisma.activityLog.create({
            data: {
              userId,
              module: moduleName,
              action: actionDescription,
            },
          });
        } catch (error) {
          console.error('Failed to save activity log:', error);
        }
      }
    });

    next();
  };
}
