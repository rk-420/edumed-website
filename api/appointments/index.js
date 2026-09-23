import { query } from '../_db.js';
import { requireAuth, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().slice(0, 10);

    try {
      const { rows } = await query(
        `SELECT ap.*, p.full_name AS patient_name, p.patient_code, p.age, p.sex
         FROM appointments ap
         JOIN patients p ON p.id = ap.patient_id
         WHERE ap.appointment_date = $1
         ORDER BY ap.appointment_time ASC`,
        [targetDate]
      );
      return res.status(200).json({ appointments: rows, date: targetDate });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    const { patient_id, appointment_date, appointment_time, reason, status } = req.body ?? {};
    if (!patient_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: 'patient_id, appointment_date and appointment_time are required' });
    }

    try {
      const { rows } = await query(
        `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [patient_id, user.sub, appointment_date, appointment_time, reason || null, status || 'Scheduled']
      );
      return res.status(201).json({ appointment: rows[0] });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
