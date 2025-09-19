import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userRole = req.headers['user-role'] as string;
  const userId = req.headers['user-id'] as string;
  const clientId = req.query.clientId as string;

  if (req.method === 'GET') {
    try {
      const agentId = userRole === 'agent' ? userId : undefined;
      const tasks = await storage.getTasks(agentId, clientId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  } else if (req.method === 'POST') {
    try {
      const taskData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: 'Invalid task data' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
