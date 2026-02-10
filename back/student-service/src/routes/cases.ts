import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/cases', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Invalid user token' });
    }

    const cases = await prisma.legalCase.findMany({
      where: {
        assignedStudentId: user.userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(cases);
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;