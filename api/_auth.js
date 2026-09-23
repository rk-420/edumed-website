import jwt from 'jsonwebtoken';

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.full_name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );
}

export function verifyToken(req) {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function requireAuth(req, res) {
  const user = verifyToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return user;
}

export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
