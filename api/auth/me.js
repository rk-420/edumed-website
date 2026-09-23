import { requireAuth, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;

  return res.status(200).json({ user: { id: user.sub, name: user.name, email: user.email, role: user.role } });
}
