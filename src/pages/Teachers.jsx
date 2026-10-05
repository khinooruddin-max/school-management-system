import { useMemo, useState } from 'react';
import { Plus, Pencil, Eye, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Button, Badge, Modal, ConfirmDialog, SearchBar, Select, Input, EmptyState, Table, Th, Td, Pagination, statusColor } from '../components/ui';
import { formatDate, isEmail, isPhone, required, todayStr, classLabel } from '../utils/helpers';

const emptyForm = { teacherId: '', name: '', email: '', phone: '', subject: '', qualification: '', joiningDate: todayStr(), classIds: [], status: 'Active' };

function validateTeacher(f) {
  const e = {};
  if (!required(f.teacherId)) e.teacherId = 'Teacher ID is required';
  if (!required(f.name)) e.name = 'Full name is required';
  if (!required(f.email)) e.email = 'Email is required'; else if (!isEmail(f.email)) e.email = 'Enter a valid email';
  if (!required(f.phone)) e.phone = 'Phone is required'; else if (!isPhone(f.phone)) e.phone = 'Enter a valid phone number';
  if (!required(f.subject)) e.subject = 'Subject is required';
  if (!required(f.joiningDate)) e.joiningDate = 'Joining date is required';
  return e;
}

function TeacherForm({ initial, classes, onCancel, onSave }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleClass = (id) => set('classIds', form.classIds.includes(id) ? form.classIds.filter((x) => x !== id) : [...form.classIds, id]);

  const submit = (e) => {
    e.preventDefault();
    const errs = validateTeacher(form);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSave(form);
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Input label="Teacher ID" required value={form.teacherId} onChange={(e) => set('teacherId', e.target.value)} error={errors.teacherId} placeholder="e.g. T-07" />
      <Input label="Full Name" required value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
      <Input label="Email" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
      <Input label="Phone" required value={form.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} />
      <Input label="Subject" required value={form.subject} onChange={(e) => set('subject', e.target.value)} error={errors.subject} />
      <Input label="Qualification" value={form.qualification} onChange={(e) => set('qualification', e.target.value)} />
      <Input type="date" label="Joining Date" required value={form.joiningDate} onChange={(e) => set('joiningDate', e.target.value)} error={errors.joiningDate} />
      <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
        <option>Active</option><option>Inactive</option>
      </Select>
      <fieldset className="sm:col-span-2">
        <legend className="mb-1 text-sm font-medium text-slate-700">Assigned Classes</legend>
        <div className="flex flex-wrap gap-3">
          {classes.map((c) => (
            <label key={c.id} className="flex items-center gap-1.5 text-sm text-slate-600">
              <input type="checkbox" checked={form.classIds.includes(c.id)} onChange={() => toggleClass(c.id)} className="rounded border-slate-300" />
              {classLabel(c)}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Teacher</Button>
      </div>
    </form>
  );
}

export default function Teachers() {
  const store = useStore();
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const pageSize = 8;

  const subjects = [...new Set(store.teachers.map((t) => t.subject))];

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return store.teachers.filter((t) =>
      (t.name.toLowerCase().includes(term) || (t.teacherId || '').toLowerCase().includes(term) || t.email.toLowerCase().includes(term)) &&
      (!subjectFilter || t.subject === subjectFilter) &&
      (!statusFilter || t.status === statusFilter)
    );
  }, [store.teachers, search, subjectFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const save = (form) => {
    if (modal.mode === 'add') store.addItem('teachers', form);
    else store.updateItem('teachers', form);
    setModal(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex-1"><SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search teachers..." /></div>
        <Select value={subjectFilter} onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }} aria-label="Filter by subject">
          <option value="">All subjects</option>
          {subjects.map((s) => <option key={s}>{s}</option>)}
        </Select>
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option>Active</option><option>Inactive</option>
        </Select>
        <Button onClick={() => setModal({ mode: 'add' })}><Plus className="h-4 w-4" /> Add Teacher</Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {rows.length === 0 ? (
          <EmptyState title="No teachers found" message="Try adjusting your search or add a new teacher." />
        ) : (
          <>
            <Table>
              <thead><tr><Th>Name</Th><Th>Subject</Th><Th>Qualification</Th><Th>Classes</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <Td><p className="font-medium text-slate-900">{t.name}</p><p className="text-xs text-slate-400">{t.email}</p></Td>
                    <Td>{t.subject}</Td>
                    <Td>{t.qualification || '—'}</Td>
                    <Td>{t.classIds.length}</Td>
                    <Td><Badge color={statusColor(t.status)}>{t.status}</Badge></Td>
                    <Td>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" aria-label={`View ${t.name}`} onClick={() => setModal({ mode: 'view', teacher: t })}><Eye className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" aria-label={`Edit ${t.name}`} onClick={() => setModal({ mode: 'edit', teacher: t })}><Pencil className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" aria-label={`Delete ${t.name}`} onClick={() => setToDelete(t)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={page} pageCount={pageCount} onChange={setPage} />
          </>
        )}
      </div>

      <Modal open={modal?.mode === 'add' || modal?.mode === 'edit'} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Edit Teacher' : 'Add Teacher'} wide>
        {(modal?.mode === 'add' || modal?.mode === 'edit') && (
          <TeacherForm
            initial={modal.teacher ? { ...emptyForm, ...modal.teacher } : { ...emptyForm }}
            classes={store.classes}
            onCancel={() => setModal(null)}
            onSave={save}
          />
        )}
      </Modal>

      <Modal open={modal?.mode === 'view'} onClose={() => setModal(null)} title="Teacher Details">
        {modal?.mode === 'view' && (() => {
          const t = modal.teacher;
          return (
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ['Teacher ID', t.teacherId || t.id], ['Full Name', t.name], ['Email', t.email], ['Phone', t.phone],
                ['Subject', t.subject], ['Qualification', t.qualification || '—'], ['Joining Date', formatDate(t.joiningDate)], ['Status', t.status],
              ].map(([k, v]) => <div key={k}><p className="text-xs uppercase text-slate-400">{k}</p><p className="font-medium text-slate-800">{v}</p></div>)}
              <div className="col-span-2"><p className="text-xs uppercase text-slate-400">Assigned Classes</p>
                <p className="text-slate-800">{t.classIds.map((id) => classLabel(store.classes.find((c) => c.id === id))).join(', ') || '—'}</p>
              </div>
            </div>
          );
        })()}
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => store.removeItem('teachers', toDelete.id)} message={`Delete teacher "${toDelete?.name}"? This cannot be undone.`} />
    </div>
  );
}
