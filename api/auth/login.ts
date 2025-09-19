import { storage } from '../../lib/storage';
import { loginSchema } from '../../shared/schema';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }
  try {
    let body = req.body;
    if (!body || typeof body === 'string') {
      body = JSON.parse(req.body || '{}');
    }
    const { email, password } = body;
    loginSchema.parse({ email, password });
    const user = await storage.getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data', error: (error as any)?.message || String(error) });
  }
}
