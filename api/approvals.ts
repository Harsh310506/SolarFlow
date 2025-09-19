import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const clientId = req.query.clientId as string;
      const approvals = await storage.getApprovals(clientId);
      res.json(approvals);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch approvals' });
    }
  } else if (req.method === 'POST') {
    try {
      const approvalData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const approval = await storage.createApproval(approvalData);
      res.status(201).json(approval);
    } catch (error) {
      res.status(400).json({ message: 'Invalid approval data' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
