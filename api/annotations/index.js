import { query } from '../_db.js';
import { requireAuth, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const { limit = 10 } = req.query;
    try {
      const { rows } = await query(
        `SELECT a.*, p.full_name AS patient_name, p.patient_code
         FROM annotations a
         JOIN patients p ON p.id = a.patient_id
         ORDER BY a.created_at DESC
         LIMIT $1`,
        [limit]
      );
      return res.status(200).json({ annotations: rows });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    const {
      patient_id, title, anatomical_region, body_system,
      observation_type, body_view, pos_x, pos_y, severity
    } = req.body ?? {};

    if (!patient_id || !title || !anatomical_region || !body_system || !observation_type) {
      return res.status(400).json({ error: 'Missing required annotation fields' });
    }

    try {
      const { rows } = await query(
        `INSERT INTO annotations
          (patient_id, doctor_id, title, anatomical_region, body_system,
           observation_type, body_view, pos_x, pos_y, severity)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING *`,
        [
          patient_id, user.sub, title, anatomical_region, body_system,
          observation_type, body_view || 'front', pos_x ?? null, pos_y ?? null, severity || null
        ]
      );
      await query('UPDATE patients SET updated_at = now() WHERE id = $1', [patient_id]);
      return res.status(201).json({ annotation: rows[0] });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
