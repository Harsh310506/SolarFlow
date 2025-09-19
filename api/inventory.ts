import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const inventory = await storage.getInventory();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch inventory' });
    }
  } else if (req.method === 'POST') {
    try {
      const itemData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const item = await storage.createInventoryItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: 'Invalid inventory data' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
