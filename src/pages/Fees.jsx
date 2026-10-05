import { useMemo, useState } from 'react';
import { Plus, Trash2, Wallet } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Button, Badge, Modal, ConfirmDialog, SearchBar, Select, Input, EmptyState, Table, Th, Td, statusColor } from '../components/ui';
import { required, isNonNegativeNumber, formatDate, currency, feeStatus, feeRemaining, todayStr } from '../utils/helpers';

export default function Fees() {
  const store = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [payFor, setPayFor] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [historyFor, setHistoryFor] = useState(null);

  const [feeForm, setFeeForm] = useState({ studentId: '', title: '', total: '', dueDate: '' });
  const [payForm, setPayForm] = useState({ amount: '', date: todayStr() });
  const [errors, setErrors] = useState({});

  const rows = useMemo(() => {
    const term = search.toLowerCase();
    return store.fees
      .filter((f) => {
        const s = store.students.find((x) => x.id === f.studentId);
        return (
          ((s?.name ?? '').toLowerCase().includes(term) || f.title.toLowerCase().includes(term)) &&
          (!statusFilter || feeStatus(f) === statusFilter)
        );
      })
      .map((f) => ({ ...f, student: store.students.find((x) => x.id === f.studentId), status: feeStatus(f), remaining: feeRemaining(f) }));
  }, [store.fees, store.students, search, statusFilter]);

  const totals = useMemo(() => ({
    billed: store.fees.reduce((s, f) => s + Number(f.total), 0),
    collected: store.fees.reduce((s, f) => s + Number(f.paid), 0),
    pending: store.fees.reduce((s, f) => s + feeRemaining(f), 0),
  }), [store.fees]);

  const saveFee = (e) => {
    e.preventDefault();
    const errs = {};
    if (!required(feeForm.studentId)) errs.studentId = 'Student is required';
    if (!required(feeForm.title)) errs.title = 'Title is required';
    if (!isNonNegativeNumber(feeForm.total) || Number(feeForm.total) <= 0) errs.total = 'Amount must be a positive number';
    if (!required(feeForm.dueDate)) errs.dueDate = 'Due date is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    store.addItem('fees', { ...feeForm, total: Number(feeForm.total), paid: 0, payments: [] });
    setShowAdd(false);
    setFeeForm({ studentId: '', title: '', total: '', dueDate: '' });
  };

  const savePayment = (e) => {
    e.preventDefault();
    const errs = {};
    if (!isNonNegativeNumber(payForm.amount) || Number(payForm.amount) <= 0) errs.amount = 'Enter a valid amount greater than zero';
    else if (Number(payForm.amount) > feeRemaining(payFor)) errs.amount = `Amount cannot exceed remaining balance (${currency(feeRemaining(payFor))})`;
    if (!required(payForm.date)) errs.date = 'Payment date is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    store.addPayment(payFor.id, Number(payForm.amount), payForm.date);
    setPayFor(null);
    setPayForm({ amount: '', date: todayStr() });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase text-slate-400">Total Billed</p><p className="text-xl font-bold text-slate-900">{currency(totals.billed)}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase text-slate-400">Collected</p><p className="text-xl font-bold text-emerald-600">{currency(totals.collected)}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase text-slate-400">Pending</p><p className="text-xl font-bold text-amber-600">{currency(totals.pending)}</p></div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search fees..." /></div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {['Paid', 'Partially Paid', 'Pending', 'Overdue'].map((s) => <option key={s}>{s}</option>)}
        </Select>
        <Button onClick={() => { setErrors({}); setShowAdd(true); }}><Plus className="h-4 w-4" /> Add Fee Record</Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {rows.length === 0 ? (
          <EmptyState title="No fee records" message="Add a fee record to start tracking payments." />
        ) : (
          <Table>
            <thead><tr><Th>Student</Th><Th>Fee</Th><Th>Total</Th><Th>Paid</Th><Th>Remaining</Th><Th>Due Date</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <Td>{f.student?.name ?? 'Unknown'}</Td>
                  <Td>{f.title}</Td>
                  <Td>{currency(f.total)}</Td>
                  <Td>{currency(f.paid)}</Td>
                  <Td><span className={f.remaining > 0 ? 'font-semibold text-amber-700' : 'text-slate-700'}>{currency(f.remaining)}</span></Td>
                  <Td>{formatDate(f.dueDate)}</Td>
                  <Td><Badge color={statusColor(f.status)}>{f.status}</Badge></Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" disabled={f.remaining <= 0} onClick={() => { setPayFor(f); setPayForm({ amount: '', date: todayStr() }); setErrors({}); }}>
                        <Wallet className="h-4 w-4" /> Pay
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setHistoryFor(f)}>History</Button>
                      <Button size="sm" variant="ghost" aria-label="Delete fee record" onClick={() => setToDelete(f)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Fee Record">
        <form onSubmit={saveFee} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Student" required value={feeForm.studentId} onChange={(e) => setFeeForm({ ...feeForm, studentId: e.target.value })} error={errors.studentId}>
            <option value="">Select student</option>
            {store.students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Input label="Fee Title" required value={feeForm.title} onChange={(e) => setFeeForm({ ...feeForm, title: e.target.value })} error={errors.title} />
          <Input type="number" min="0" label="Total Amount" required value={feeForm.total} onChange={(e) => setFeeForm({ ...feeForm, total: e.target.value })} error={errors.total} />
          <Input type="date" label="Due Date" required value={feeForm.dueDate} onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })} error={errors.dueDate} />
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!payFor} onClose={() => setPayFor(null)} title={`Record Payment — ${payFor?.title ?? ''}`}>
        <form onSubmit={savePayment} className="space-y-4">
          <p className="text-sm text-slate-600">Remaining balance: <span className="font-semibold">{currency(payFor ? feeRemaining(payFor) : 0)}</span></p>
          <Input type="number" min="0" label="Amount" required value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} error={errors.amount} />
          <Input type="date" label="Payment Date" required value={payForm.date} onChange={(e) => setPayForm({ ...payForm, date: e.target.value })} error={errors.date} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setPayFor(null)}>Cancel</Button>
            <Button type="submit">Record Payment</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!historyFor} onClose={() => setHistoryFor(null)} title="Payment History">
        {historyFor && (historyFor.payments?.length ? (
          <ul className="divide-y divide-slate-100 text-sm">
            {historyFor.payments.map((p, i) => (
              <li key={i} className="flex justify-between py-2"><span>{formatDate(p.date)}</span><span className="font-medium text-emerald-600">{currency(p.amount)}</span></li>
            ))}
          </ul>
        ) : <EmptyState title="No payments yet" />)}
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => store.removeItem('fees', toDelete.id)} message={`Delete fee record "${toDelete?.title}"?`} />
    </div>
  );
}
