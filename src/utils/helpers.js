export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function currency(n) {
  const num = Number(n) || 0;
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function classLabel(cls) {
  return cls ? `${cls.name} - ${cls.section}` : '—';
}

export function feeStatus(fee) {
  const remaining = Number(fee.total) - Number(fee.paid);
  if (remaining <= 0) return 'Paid';
  if (Number(fee.paid) > 0) {
    return fee.dueDate && fee.dueDate < todayStr() ? 'Overdue' : 'Partially Paid';
  }
  return fee.dueDate && fee.dueDate < todayStr() ? 'Overdue' : 'Pending';
}

export function feeRemaining(fee) {
  return Math.max(0, Number(fee.total) - Number(fee.paid));
}

// ---------- validation ----------
export function required(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

export function isPhone(value) {
  return /^[+]?[\d\s()-]{7,17}$/.test(String(value).trim());
}

export function isNonNegativeNumber(value) {
  return value !== '' && !Number.isNaN(Number(value)) && Number(value) >= 0;
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const k = keyFn(item);
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {});
}
