import { query } from '../_db.js';
import { requireAuth, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const today = new Date().toISOString().slice(0, 10);

    const [
      { rows: patientCountRows },
      { rows: annotationCountRows },
      { rows: appointmentCountRows },
      { rows: recentPatients },
      { rows: recentAnnotations },
      { rows: activity }
    ] = await Promise.all([
      query('SELECT COUNT(*)::int AS count FROM patients'),
      query('SELECT COUNT(*)::int AS count FROM annotations'),
      query('SELECT COUNT(*)::int AS count FROM appointments WHERE appointment_date = $1', [today]),
      query(`SELECT id, patient_code, full_name, age, sex, updated_at
             FROM patients ORDER BY updated_at DESC LIMIT 5`),
      query(`SELECT a.id, a.title, a.observation_type, a.anatomical_region, a.body_system,
                    a.created_at, p.full_name AS patient_name, p.id AS patient_id
             FROM annotations a JOIN patients p ON p.id = a.patient_id
             ORDER BY a.created_at DESC LIMIT 5`),
      query(`SELECT to_char(day, 'Dy') AS label, COALESCE(cnt, 0)::int AS count
             FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS day
             LEFT JOIN (
               SELECT created_at::date AS d, COUNT(*) AS cnt
               FROM annotations
               WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
               GROUP BY d
             ) sub ON sub.d = day
             ORDER BY day ASC`)
    ]);

    return res.status(200).json({
      totalPatients: patientCountRows[0].count,
      totalAnnotations: annotationCountRows[0].count,
      todaysAppointments: appointmentCountRows[0].count,
      recentPatients,
      recentAnnotations,
      activity
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
