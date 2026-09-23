-- EduMed database schema (PostgreSQL / Neon)

-- ============================================================
-- users (doctors who log in)
-- ============================================================
CREATE TABLE users (
    id             SERIAL PRIMARY KEY,
    full_name      TEXT NOT NULL,              -- e.g. "Dr. Nahm"
    email          TEXT NOT NULL UNIQUE,
    password_hash  TEXT NOT NULL,
    role           TEXT NOT NULL DEFAULT 'General Practitioner',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- patients
-- ============================================================
CREATE TABLE patients (
    id                 SERIAL PRIMARY KEY,
    patient_code       TEXT NOT NULL UNIQUE,     -- e.g. "P00124"
    full_name          TEXT NOT NULL,
    age                INTEGER NOT NULL,
    sex                TEXT NOT NULL CHECK (sex IN ('Male', 'Female', 'Other')),
    height_cm          NUMERIC(5,1),
    weight_kg          NUMERIC(5,1),
    blood_group        TEXT,                     -- e.g. "O-"
    allergies           TEXT,                     -- free text, e.g. "Sulfa Drugs"
    medical_history    TEXT,
    current_medication TEXT,
    notes              TEXT,                      -- general patient note
    phone              TEXT,
    email              TEXT,
    created_by         INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_patients_full_name ON patients (full_name);

-- ============================================================
-- annotations (medical pins on the 2D body model)
-- ============================================================
CREATE TABLE annotations (
    id                 SERIAL PRIMARY KEY,
    patient_id         INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id          INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title              TEXT NOT NULL,             -- e.g. "Acute Shoulder Pain"
    anatomical_region  TEXT NOT NULL,             -- e.g. "Shoulder Region"
    body_system        TEXT NOT NULL,             -- e.g. "Muscular System"
    observation_type   TEXT NOT NULL CHECK (observation_type IN ('Pain', 'Inflammation', 'Observation')),
    body_view          TEXT NOT NULL DEFAULT 'front' CHECK (body_view IN ('front', 'back')),
    pos_x              NUMERIC(5,2),              -- pin position as % of body model width
    pos_y              NUMERIC(5,2),              -- pin position as % of body model height
    severity           TEXT CHECK (severity IN ('Low', 'Medium', 'High')),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_annotations_patient_id ON annotations (patient_id);
CREATE INDEX idx_annotations_created_at ON annotations (created_at DESC);

-- ============================================================
-- visits (visit history per patient)
-- ============================================================
CREATE TABLE visits (
    id           SERIAL PRIMARY KEY,
    patient_id   INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
    visit_date   DATE NOT NULL,
    reason       TEXT NOT NULL,                   -- e.g. "X-Ray Review", "Initial Consultation"
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_visits_patient_id ON visits (patient_id);

-- ============================================================
-- appointments (schedule tab / today's appointments widget)
-- ============================================================
CREATE TABLE appointments (
    id               SERIAL PRIMARY KEY,
    patient_id       INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason           TEXT,                        -- visit reason / chief complaint
    status           TEXT NOT NULL DEFAULT 'Scheduled'
                        CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'No-show')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_appointments_date ON appointments (appointment_date);
CREATE INDEX idx_appointments_patient_id ON appointments (patient_id);
