import { query } from '../_db.js';
import { requireAuth, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;

  const { id } = req.query;

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const fields = [
      'title', 'anatomical_region', 'body_system', 'observation_type',
      'body_view', 'pos_x', 'pos_y', 'severity'
    ];
    const body = req.body ?? {};
    const updates = [];
    const values = [];
    let i = 1;

    for (const field of fields) {
      if (field in body) {
        updates.push(`${field} = $${i}`);
        values.push(body[field]);
        i += 1;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = now()`);
    values.push(id);

    try {
      const { rows } = await query(
        `UPDATE annotations SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
        values
      );
      if (!rows[0]) return res.status(404).json({ error: 'Annotation not found' });
      return res.status(200).json({ annotation: rows[0] });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { rows } = await query('DELETE FROM annotations WHERE id = $1 RETURNING id', [id]);
      if (!rows[0]) return res.status(404).json({ error: 'Annotation not found' });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
