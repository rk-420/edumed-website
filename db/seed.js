import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

const PATIENTS = [
  { name: 'Mary Smith', age: 28, sex: 'Female', height: 165, weight: 60, blood: 'AB-', allergies: null, history: 'None', meds: 'None', phone: '+1 555-123-4567', email: 'mary.smith@email.com' },
  { name: 'Robert Johnson', age: 45, sex: 'Male', height: 176, weight: 63, blood: 'O-', allergies: 'Sulfa Drugs', history: 'Seasonal Allergies', meds: 'Omeprazole 20mg daily', phone: '+1 555-639-3246', email: 'robert.johnson@email.com' },
  { name: 'Anna Lee', age: 34, sex: 'Female', height: 160, weight: 55, blood: 'A-', allergies: null, history: 'None', meds: 'None', phone: '+1 555-234-5678', email: 'anna.lee@email.com' },
  { name: 'David Kim', age: 52, sex: 'Male', height: 172, weight: 80, blood: 'A+', allergies: 'Aspirin', history: 'Hypertension', meds: 'Lisinopril 10mg daily', phone: '+1 555-345-6789', email: 'david.kim@email.com' },
  { name: 'Sophie Lane', age: 30, sex: 'Female', height: 168, weight: 58, blood: 'AB-', allergies: null, history: 'None', meds: 'None', phone: '+1 555-456-7890', email: 'sophie.lane@email.com' },
  { name: 'Laura Hill', age: 40, sex: 'Female', height: 170, weight: 65, blood: 'AB-', allergies: 'Latex', history: 'Mild Asthma', meds: 'Albuterol inhaler PRN', phone: '+1 555-567-8901', email: 'laura.hill@email.com' },
  { name: 'Ronald Thompson', age: 41, sex: 'Female', height: 164, weight: 62, blood: 'A-', allergies: 'Latex', history: 'None', meds: 'None', phone: '+1 555-678-9012', email: 'ronald.thompson@email.com' },
  { name: 'John Rodriguez', age: 73, sex: 'Other', height: 175, weight: 78, blood: 'O-', allergies: null, history: 'Type 2 Diabetes', meds: 'Metformin 500mg twice daily', phone: '+1 555-789-0123', email: 'john.rodriguez@email.com' },
  { name: 'Ashley Rodriguez', age: 26, sex: 'Other', height: 169, weight: 59, blood: 'AB+', allergies: null, history: 'None', meds: 'None', phone: '+1 555-890-1234', email: 'ashley.rodriguez@email.com' },
  { name: 'Emily Chen', age: 35, sex: 'Female', height: 163, weight: 57, blood: 'B+', allergies: 'Penicillin', history: 'None', meds: 'None', phone: '+1 555-901-2345', email: 'emily.chen@email.com' }
];

const ANNOTATIONS = [
  { region: 'Chest Region', system: 'Circulatory System', type: 'Pain', title: 'Acute Chest Pain', view: 'front', x: 50, y: 32, severity: 'High' },
  { region: 'Shoulder Region', system: 'Muscular System', type: 'Pain', title: 'Acute Shoulder Pain', view: 'front', x: 38, y: 24, severity: 'High' },
  { region: 'Wrist Region', system: 'Nervous System', type: 'Observation', title: 'Chronic Wrist Observation', view: 'front', x: 25, y: 48, severity: 'Low' },
  { region: 'Ankle Region', system: 'Skeletal System', type: 'Observation', title: 'Chronic Ankle Observation', view: 'front', x: 45, y: 92, severity: 'Low' },
  { region: 'Knee Region', system: 'Skeletal System', type: 'Inflammation', title: 'Knee Inflammation', view: 'front', x: 48, y: 75, severity: 'Medium' }
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding doctor user...');
    const email = (process.env.SEED_DOCTOR_EMAIL || 'doctor@edumed.dev').toLowerCase();
    const password = process.env.SEED_DOCTOR_PASSWORD || 'changeme123';
    const name = process.env.SEED_DOCTOR_NAME || 'Dr. Nahm';
    const hash = await bcrypt.hash(password, 10);

    const { rows: userRows } = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'General Practitioner')
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING id`,
      [name, email, hash]
    );
    const doctorId = userRows[0].id;
    console.log(`Doctor ready: ${email} / ${password}`);

    console.log('Seeding patients...');
    const patientIds = [];
    for (let i = 0; i < PATIENTS.length; i++) {
      const p = PATIENTS[i];
      const code = `P${String(123 + i).padStart(5, '0')}`;
      const { rows } = await client.query(
        `INSERT INTO patients
          (patient_code, full_name, age, sex, height_cm, weight_kg, blood_group,
           allergies, medical_history, current_medication, notes, phone, email, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (patient_code) DO UPDATE SET full_name = EXCLUDED.full_name
         RETURNING id`,
        [
          code, p.name, p.age, p.sex, p.height, p.weight, p.blood,
          p.allergies, p.history, p.meds, 'General patient note: Monitor vitals regularly.',
          p.phone, p.email, doctorId
        ]
      );
      patientIds.push(rows[0].id);
    }

    console.log('Seeding annotations...');
    for (let i = 0; i < ANNOTATIONS.length; i++) {
      const a = ANNOTATIONS[i];
      const patientId = patientIds[i % patientIds.length];
      await client.query(
        `INSERT INTO annotations
          (patient_id, doctor_id, title, anatomical_region, body_system,
           observation_type, body_view, pos_x, pos_y, severity)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [patientId, doctorId, a.title, a.region, a.system, a.type, a.view, a.x, a.y, a.severity]
      );
    }

    console.log('Seeding visits...');
    await client.query(
      `INSERT INTO visits (patient_id, doctor_id, visit_date, reason, notes)
       VALUES
        ($1, $2, CURRENT_DATE - INTERVAL '90 days', 'Initial Consultation', 'First visit, baseline vitals recorded.'),
        ($1, $2, CURRENT_DATE - INTERVAL '30 days', 'X-Ray Review', 'Reviewed imaging, no fractures found.')`,
      [patientIds[1], doctorId]
    );

    console.log('Seeding appointments...');
    const today = new Date().toISOString().slice(0, 10);
    const times = ['09:00', '09:30', '10:15', '11:00', '13:30'];
    for (let i = 0; i < 5; i++) {
      await client.query(
        `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status)
         VALUES ($1,$2,$3,$4,$5,'Scheduled')`,
        [patientIds[i], doctorId, today, times[i], 'Routine check-up']
      );
    }

    console.log('Seed complete.');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
