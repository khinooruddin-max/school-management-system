import { useEffect, useRef } from 'react';
import { X, Search, AlertTriangle, Loader2, Inbox } from 'lucide-react';

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap';
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' };
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-slate-600 hover:bg-slate-100',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Field({ label, error, children, required }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600" role="alert">{error}</span>}
    </label>
  );
}

const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200';

export function Input({ label, error, required, ...props }) {
  if (label !== undefined) {
    return (
      <Field label={label} error={error} required={required}>
        <input className={inputCls} {...props} />
      </Field>
    );
  }
  return <input className={inputCls} {...props} />;
}

export function Select({ label, error, required, children, ...props }) {
  if (label !== undefined) {
    return (
      <Field label={label} error={error} required={required}>
        <select className={inputCls} {...props}>{children}</select>
      </Field>
    );
  }
  return <select className={inputCls} {...props}>{children}</select>;
}

export function Textarea({ label, error, required, ...props }) {
  return (
    <Field label={label} error={error} required={required}>
      <textarea rows={4} className={inputCls} {...props} />
    </Field>
  );
}

export function Badge({ children, color = 'slate' }) {
  const colors = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-800',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[color] || colors.slate}`}>{children}</span>;
}

export function statusColor(status) {
  switch (status) {
    case 'Active': case 'Published': case 'Paid': case 'present': case 'Pass': return 'green';
    case 'Inactive': case 'Draft': case 'absent': case 'Fail': return 'red';
    case 'Graduated': case 'Urgent': return 'purple';
    case 'Important': case 'Overdue': return 'amber';
    case 'Partially Paid': case 'late': case 'Pending': return 'amber';
    default: return 'slate';
  }
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
      />
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div ref={ref} tabIndex={-1} className={`max-h-[90vh] w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} overflow-y-auto rounded-xl bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} aria-label="Close dialog" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', message, confirmLabel = 'Delete' }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex gap-3">
        <AlertTriangle className="h-6 w-6 flex-shrink-0 text-amber-500" />
        <p className="text-sm text-slate-600">{message}</p>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

export function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox className="mb-3 h-10 w-10 text-slate-300" />
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
      <Loader2 className="h-5 w-5 animate-spin" /> {label}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.' }) {
  return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>;
}

export function Card({ title, action, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Table({ children }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className = '' }) {
  return <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${className}`}>{children}</th>;
}

export function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 text-slate-700 ${className}`}>{children}</td>;
}

export function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
      <span>Page {page} of {pageCount}</span>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => onChange(page - 1)}>Previous</Button>
        <Button size="sm" variant="secondary" disabled={page === pageCount} onClick={() => onChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
}
