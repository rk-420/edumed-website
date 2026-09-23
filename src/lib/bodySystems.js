export const BODY_SYSTEMS = [
  { name: 'Skeletal System', structures: 42, icon: 'Bone', color: '#3b82f6', bg: '#eff6ff' },
  { name: 'Muscular System', structures: 35, icon: 'Zap', color: '#22c55e', bg: '#f0fdf4' },
  { name: 'Nervous System', structures: 28, icon: 'Brain', color: '#a855f7', bg: '#faf5ff' },
  { name: 'Circulatory System', structures: 19, icon: 'Heart', color: '#ef4444', bg: '#fef2f2' },
  { name: 'Respiratory System', structures: 14, icon: 'Wind', color: '#eab308', bg: '#fefce8' },
  { name: 'Digestive System', structures: 22, icon: 'Sun', color: '#f97316', bg: '#fff7ed' }
];

export const ANATOMICAL_REGIONS = [
  'Head Region', 'Neck Region', 'Shoulder Region', 'Chest Region', 'Arm Region',
  'Elbow Region', 'Wrist Region', 'Hand Region', 'Abdomen Region', 'Hip Region',
  'Thigh Region', 'Knee Region', 'Ankle Region', 'Foot Region', 'Back Region'
];

export const OBSERVATION_TYPES = [
  { value: 'Pain', color: '#ef4444', label: 'Pain (Red)' },
  { value: 'Inflammation', color: '#f97316', label: 'Inflammation (Orange)' },
  { value: 'Observation', color: '#3b82f6', label: 'Observation (Blue)' }
];

export function observationColor(type) {
  return OBSERVATION_TYPES.find((o) => o.value === type)?.color || '#64748b';
}
