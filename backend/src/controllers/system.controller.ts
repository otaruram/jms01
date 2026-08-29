import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { parsePagination, paginatedResponse } from '../utils/pagination';

export class SystemController {
  // Users
  getUsers = async (req: Request, res: Response) => {
    try {
      const { page, limit, skip } = parsePagination(req.query);
      
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: { id: true, email: true, name: true, role: true, createdAt: true },
        }),
        prisma.user.count(),
      ]);

      res.json(paginatedResponse(users, total, page, limit));
    } catch (error) {
      res.status(500).json({ success: false, message: 'Gagal memuat pengguna' });
    }
  };

  updateUserRole = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { role } = req.body;

      if (!['SUPER_ADMIN', 'ADMIN', 'USER'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Role tidak valid' });
      }

      const user = await prisma.user.update({
        where: { id },
        data: { role },
        select: { id: true, email: true, name: true, role: true },
      });

      res.json({ success: true, data: user, message: 'Role berhasil diperbarui' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Gagal memperbarui role' });
    }
  };

  // Activity Logs
  getLogs = async (req: Request, res: Response) => {
    try {
      const { page, limit, skip } = parsePagination(req.query);

      const [logs, total] = await Promise.all([
        prisma.activityLog.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          // Note: prisma doesn't support joins natively to get user email easily without relations
          // Since ActivityLog userId relates to User id, we can fetch users and map them,
          // but let's just return userId for now or add relation to schema
        }),
        prisma.activityLog.count(),
      ]);

      // We should ideally fetch the user details for these logs
      const userIds = [...new Set(logs.map(log => log.userId))];
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, email: true, name: true }
      });
      const userMap = users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as any);

      const enrichedLogs = logs.map(log => ({
        ...log,
        user: userMap[log.userId] || { name: 'Unknown', email: 'unknown' }
      }));

      res.json(paginatedResponse(enrichedLogs, total, page, limit));
    } catch (error) {
      res.status(500).json({ success: false, message: 'Gagal memuat log aktivitas' });
    }
  };
}

export const systemController = new SystemController();
