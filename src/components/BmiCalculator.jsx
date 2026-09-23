import { useEffect, useState } from 'react';

function classify(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500', bg: 'bg-blue-50' };
  if (bmi < 25) return { label: 'Normal weight', color: 'text-emerald-500', bg: 'bg-emerald-50' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-amber-500', bg: 'bg-amber-50' };
  return { label: 'Obese', color: 'text-red-500', bg: 'bg-red-50' };
}

export default function BmiCalculator({ patient }) {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);

  useEffect(() => {
    setWeight(patient.weight_kg ? Number(patient.weight_kg) : 70);
    setHeight(patient.height_cm ? Number(patient.height_cm) : 170);
  }, [patient.id, patient.weight_kg, patient.height_cm]);

  const bmi = weight / Math.pow(height / 100, 2);
  const info = classify(bmi);

  return (
    <div className="card p-4 space-y-4">
      <h2 className="font-medium text-sm text-slate-700">BMI Calculator</h2>

      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Weight</span>
          <span className="font-medium text-slate-700">{weight.toFixed(1)} kg</span>
        </div>
        <input
          type="range"
          min="30"
          max="180"
          step="0.5"
          value={weight}
          onChange={(e) => setWeight(parseFloat(e.target.value))}
          className="w-full accent-brand-500"
        />
      </div>

      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Height</span>
          <span className="font-medium text-slate-700">{height.toFixed(0)} cm</span>
        </div>
        <input
          type="range"
          min="120"
          max="220"
          step="1"
          value={height}
          onChange={(e) => setHeight(parseFloat(e.target.value))}
          className="w-full accent-brand-500"
        />
      </div>

      <div className={`rounded-lg p-3 flex items-center justify-between ${info.bg}`}>
        <div>
          <p className="text-xs text-slate-500">BMI</p>
          <p className={`text-lg font-semibold ${info.color}`}>{bmi.toFixed(1)}</p>
        </div>
        <span className={`text-sm font-medium ${info.color}`}>{info.label}</span>
      </div>
    </div>
  );
}
