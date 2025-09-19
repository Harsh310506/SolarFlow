import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }
  try {
    const userRole = req.headers['user-role'] as string;
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const users = [
      await storage.getUserByEmail('priya@solarflow.com'),
      await storage.getUserByEmail('rohit@solarflow.com'),
    ].filter(Boolean);
    res.json(users.map(user => ({
      id: user!.id,
      name: user!.name,
      email: user!.email,
      role: user!.role,
    })));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
}
