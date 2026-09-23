import { query } from '../_db.js';
import { requireAuth, setCors } from '../_auth.js';

async function nextPatientCode() {
  const { rows } = await query(
    `SELECT patient_code FROM patients ORDER BY id DESC LIMIT 1`
  );
  const last = rows[0]?.patient_code;
  const lastNum = last ? parseInt(last.replace(/\D/g, ''), 10) : 100;
  const next = (isNaN(lastNum) ? 100 : lastNum) + 1;
  return `P${String(next).padStart(5, '0')}`;
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const { search = '', sort = 'last_activity', dir = 'desc' } = req.query;

    const sortColumns = {
      name: 'full_name',
      age: 'age',
      last_activity: 'updated_at',
      created: 'created_at'
    };
    const sortCol = sortColumns[sort] || 'updated_at';
    const sortDir = dir === 'asc' ? 'ASC' : 'DESC';

    try {
      const { rows } = await query(
        `SELECT p.*,
                (SELECT COUNT(*) FROM annotations a WHERE a.patient_id = p.id) AS annotation_count
         FROM patients p
         WHERE p.full_name ILIKE $1
            OR p.patient_code ILIKE $1
            OR COALESCE(p.allergies, '') ILIKE $1
         ORDER BY ${sortCol} ${sortDir}`,
        [`%${search}%`]
      );
      return res.status(200).json({ patients: rows, total: rows.length });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    const {
      full_name,
      age,
      sex,
      height_cm,
      weight_kg,
      blood_group,
      allergies,
      medical_history,
      current_medication,
      notes,
      phone,
      email
    } = req.body ?? {};

    if (!full_name || !age || !sex) {
      return res.status(400).json({ error: 'full_name, age and sex are required' });
    }

    try {
      const patientCode = await nextPatientCode();
      const { rows } = await query(
        `INSERT INTO patients
          (patient_code, full_name, age, sex, height_cm, weight_kg, blood_group,
           allergies, medical_history, current_medication, notes, phone, email, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         RETURNING *`,
        [
          patientCode, full_name, age, sex, height_cm || null, weight_kg || null,
          blood_group || null, allergies || null, medical_history || null,
          current_medication || null, notes || null, phone || null, email || null,
          user.sub
        ]
      );
      return res.status(201).json({ patient: rows[0] });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
