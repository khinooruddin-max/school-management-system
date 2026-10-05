// Grading scale — easy to edit in one place.
export const GRADE_SCALE = [
  { min: 90, grade: 'A+' },
  { min: 80, grade: 'A' },
  { min: 70, grade: 'B' },
  { min: 60, grade: 'C' },
  { min: 50, grade: 'D' },
  { min: 0, grade: 'F' },
];

export function gradeFor(percentage) {
  const pct = Number(percentage);
  if (Number.isNaN(pct)) return '—';
  const found = GRADE_SCALE.find((g) => pct >= g.min);
  return found ? found.grade : 'F';
}

export function resultStatus(percentage) {
  return Number(percentage) >= 50 ? 'Pass' : 'Fail';
}
