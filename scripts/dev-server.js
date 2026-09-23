import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';

const PORT = process.env.PORT || 3000;

async function loadHandler(relPath) {
  const mod = await import(`../api/${relPath}?t=${Date.now()}`);
  return mod.default;
}

async function run(relPath, req, res) {
  // Express 5's req.query is a recomputing getter; redefine it as a plain
  // merged object so route params (e.g. :id) are visible on req.query,
  // matching Vercel's serverless function request shape.
  const mergedQuery = { ...req.query, ...req.params };
  Object.defineProperty(req, 'query', { value: mergedQuery, writable: true, configurable: true });

  const handler = await loadHandler(relPath);
  return handler(req, res);
}

async function main() {
  const app = express();
  app.use(express.json());

  app.all('/api/auth/login', (req, res) => run('auth/login.js', req, res));
  app.all('/api/auth/me', (req, res) => run('auth/me.js', req, res));

  app.all('/api/patients', (req, res) => run('patients/index.js', req, res));
  app.all('/api/patients/:id', (req, res) => run('patients/[id].js', req, res));

  app.all('/api/annotations', (req, res) => run('annotations/index.js', req, res));
  app.all('/api/annotations/:id', (req, res) => run('annotations/[id].js', req, res));

  app.all('/api/visits', (req, res) => run('visits/index.js', req, res));
  app.all('/api/appointments', (req, res) => run('appointments/index.js', req, res));
  app.all('/api/dashboard/stats', (req, res) => run('dashboard/stats.js', req, res));

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);

  app.listen(PORT, () => {
    console.log(`\n  EduMed dev server running at http://localhost:${PORT}\n`);
  });
}

main();
