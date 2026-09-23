import { query } from '../_db.js';
import { requireAuth, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const [{ rows: patientRows }, { rows: annotationRows }, { rows: visitRows }] = await Promise.all([
        query('SELECT * FROM patients WHERE id = $1', [id]),
        query(
          `SELECT * FROM annotations WHERE patient_id = $1 ORDER BY created_at DESC`,
          [id]
        ),
        query(
          `SELECT v.*, u.full_name AS doctor_name FROM visits v
           LEFT JOIN users u ON u.id = v.doctor_id
           WHERE v.patient_id = $1 ORDER BY v.visit_date DESC`,
          [id]
        )
      ]);

      if (!patientRows[0]) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      return res.status(200).json({
        patient: patientRows[0],
        annotations: annotationRows,
        visits: visitRows
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const fields = [
      'full_name', 'age', 'sex', 'height_cm', 'weight_kg', 'blood_group',
      'allergies', 'medical_history', 'current_medication', 'notes', 'phone', 'email'
    ];
    const body = req.body ?? {};
    const updates = [];
    const values = [];
    let i = 1;

    for (const field of fields) {
      if (field in body) {
        updates.push(`${field} = $${i}`);
        values.push(body[field] === '' ? null : body[field]);
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
        `UPDATE patients SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
        values
      );
      if (!rows[0]) return res.status(404).json({ error: 'Patient not found' });
      return res.status(200).json({ patient: rows[0] });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
