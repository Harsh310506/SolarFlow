import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userRole = req.headers['user-role'] as string;
  const userId = req.headers['user-id'] as string;

  if (req.method === 'GET') {
    try {
      const agentId = userRole === 'agent' ? userId : undefined;
      const requests = await storage.getStockRequests(agentId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch stock requests' });
    }
  } else if (req.method === 'POST') {
    try {
      const requestData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const request = await storage.createStockRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      res.status(400).json({ message: 'Invalid stock request data' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
