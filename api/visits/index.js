import { query } from '../_db.js';
import { requireAuth, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;

  if (req.method === 'POST') {
    const { patient_id, visit_date, reason, notes } = req.body ?? {};
    if (!patient_id || !visit_date || !reason) {
      return res.status(400).json({ error: 'patient_id, visit_date and reason are required' });
    }

    try {
      const { rows } = await query(
        `INSERT INTO visits (patient_id, doctor_id, visit_date, reason, notes)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [patient_id, user.sub, visit_date, reason, notes || null]
      );
      await query('UPDATE patients SET updated_at = now() WHERE id = $1', [patient_id]);
      return res.status(201).json({ visit: { ...rows[0], doctor_name: user.name } });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
