
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
    const { role } = body;
    if (role === 'admin') {
      res.json({ redirect: '/dashboard', user: { role: 'admin', name: 'Admin User' } });
    } else if (role === 'agent') {
      res.json({ redirect: '/agents', user: { role: 'agent', name: 'Agent User' } });
    } else {
      res.status(400).json({ message: 'Invalid role' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data', error: (error as any)?.message || String(error) });
  }
}
