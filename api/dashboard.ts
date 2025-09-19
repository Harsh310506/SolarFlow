import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }
  try {
    const userId = req.headers['user-id'] as string;
    const userRole = req.headers['user-role'] as string;
    if (!userId || !userRole) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const metrics = await storage.getDashboardMetrics(userId, userRole);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard metrics' });
  }
}
