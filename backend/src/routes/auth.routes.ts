import { Request, Response, Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middlewares/auth';
import { prisma } from '../config/database';

const router = Router();

router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    const email = req.user?.email;

    if (!userId || !email) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const isSuperAdmin = email === process.env.SUPER_ADMIN_EMAIL;
    const name = (req.user as any)?.name || email.split('@')[0];

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        id: userId,
        email: email,
        name: name,
        role: isSuperAdmin ? 'SUPER_ADMIN' : 'USER',
      },
      select: { id: true, email: true, name: true, role: true },
    });

    res.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Error auto-creating user:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

export default router;
