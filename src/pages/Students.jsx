import { useMemo, useState } from 'react';
import { Plus, Pencil, Eye, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Button, Badge, Modal, ConfirmDialog, SearchBar, Select, Input, EmptyState, Table, Th, Td, Pagination, statusColor } from '../components/ui';
import { classLabel, formatDate, isEmail, isPhone, required, todayStr } from '../utils/helpers';

const STATUS = ['Active', 'Inactive', 'Graduated'];
const emptyForm = { studentId: '', name: '', dob: '', gender: 'Male', classId: '', section: '', parentName: '', parentPhone: '', email: '', address: '', admissionDate: todayStr(), status: 'Active', emergencyContact: '' };

export function studentToForm(s) { return { ...emptyForm, ...s }; }

export function validateStudent(f) {
  const e = {};
  if (!required(f.studentId)) e.studentId = 'Student ID is required';
  if (!required(f.name)) e.name = 'Full name is required';
  if (!required(f.dob)) e.dob = 'Date of birth is required';
  if (!required(f.classId)) e.classId = 'Class is required';
  if (!required(f.parentName)) e.parentName = 'Parent/guardian name is required';
  if (!required(f.parentPhone)) e.parentPhone = 'Parent phone is required';
  else if (!isPhone(f.parentPhone)) e.parentPhone = 'Enter a valid phone number';
  if (!required(f.email)) e.email = 'Email is required';
  else if (!isEmail(f.email)) e.email = 'Enter a valid email address';
  if (!required(f.emergencyContact)) e.emergencyContact = 'Emergency contact is required';
  else if (!isPhone(f.emergencyContact)) e.emergencyContact = 'Enter a valid phone number';
  if (!required(f.admissionDate)) e.admissionDate = 'Admission date is required';
  return e;
}

function StudentForm({ initial, classes, onCancel, onSave }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const errs = validateStudent(form);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      const cls = classes.find((c) => c.id === form.classId);
      onSave({ ...form, section: cls ? cls.section : form.section });
    }
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Input label="Student ID" required value={form.studentId} onChange={(e) => set('studentId', e.target.value)} error={errors.studentId} />
      <Input label="Full Name" required value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
      <Input type="date" label="Date of Birth" required value={form.dob} onChange={(e) => set('dob', e.target.value)} error={errors.dob} />
      <Select label="Gender" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
        <option>Male</option><option>Female</option><option>Other</option>
      </Select>
      <Select label="Class" required value={form.classId} onChange={(e) => set('classId', e.target.value)} error={errors.classId}>
        <option value="">Select class</option>
        {classes.map((c) => <option key={c.id} value={c.id}>{classLabel(c)}</option>)}
      </Select>
      <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
        {STATUS.map((s) => <option key={s}>{s}</option>)}
      </Select>
      <Input label="Parent/Guardian Name" required value={form.parentName} onChange={(e) => set('parentName', e.target.value)} error={errors.parentName} />
      <Input label="Parent Phone" required value={form.parentPhone} onChange={(e) => set('parentPhone', e.target.value)} error={errors.parentPhone} />
      <Input label="Email" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
      <Input label="Admission Date" type="date" required value={form.admissionDate} onChange={(e) => set('admissionDate', e.target.value)} error={errors.admissionDate} />
      <Input label="Emergency Contact" required value={form.emergencyContact} onChange={(e) => set('emergencyContact', e.target.value)} error={errors.emergencyContact} />
      <Input label="Address" value={form.address} onChange={(e) => set('address', e.target.value)} />
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Student</Button>
      </div>
    </form>
  );
}

export default function Students() {
  const store = useStore();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // {mode:'add'|'edit'|'view', student?}
  const [toDelete, setToDelete] = useState(null);
  const pageSize = 8;

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return store.students.filter((s) =>
      (s.name.toLowerCase().includes(term) || s.studentId.toLowerCase().includes(term) || s.email.toLowerCase().includes(term)) &&
      (!classFilter || s.classId === classFilter) &&
      (!statusFilter || s.status === statusFilter)
    );
  }, [store.students, search, classFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const save = (form) => {
    if (modal.mode === 'add') store.addItem('students', form);
    else store.updateItem('students', form);
    setModal(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex-1"><SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search students..." /></div>
        <Select value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setPage(1); }} aria-label="Filter by class">
          <option value="">All classes</option>
          {store.classes.map((c) => <option key={c.id} value={c.id}>{classLabel(c)}</option>)}
        </Select>
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} aria-label="Filter by status">
          <option value="">All statuses</option>
          {STATUS.map((s) => <option key={s}>{s}</option>)}
        </Select>
        <Button onClick={() => setModal({ mode: 'add' })}><Plus className="h-4 w-4" /> Add Student</Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {rows.length === 0 ? (
          <EmptyState title="No students found" message="Try adjusting your search or add a new student." />
        ) : (
          <>
            <Table>
              <thead>
                <tr><Th>Student</Th><Th>ID</Th><Th>Class</Th><Th>Guardian</Th><Th>Status</Th><Th>Actions</Th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((s) => {
                  const cls = store.classes.find((c) => c.id === s.classId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <Td><p className="font-medium text-slate-900">{s.name}</p><p className="text-xs text-slate-400">{s.email}</p></Td>
                      <Td>{s.studentId}</Td>
                      <Td>{classLabel(cls)}</Td>
                      <Td>{s.parentName}</Td>
                      <Td><Badge color={statusColor(s.status)}>{s.status}</Badge></Td>
                      <Td>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" aria-label={`View ${s.name}`} onClick={() => setModal({ mode: 'view', student: s })}><Eye className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" aria-label={`Edit ${s.name}`} onClick={() => setModal({ mode: 'edit', student: s })}><Pencil className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" aria-label={`Delete ${s.name}`} onClick={() => setToDelete(s)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Pagination page={page} pageCount={pageCount} onChange={setPage} />
          </>
        )}
      </div>

      <Modal open={modal?.mode === 'add' || modal?.mode === 'edit'} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Edit Student' : 'Add Student'} wide>
        {(modal?.mode === 'add' || modal?.mode === 'edit') && (
          <StudentForm initial={modal.student ? studentToForm(modal.student) : emptyForm} classes={store.classes} onCancel={() => setModal(null)} onSave={save} />
        )}
      </Modal>

      <Modal open={modal?.mode === 'view'} onClose={() => setModal(null)} title="Student Profile" wide>
        {modal?.mode === 'view' && (() => {
          const s = modal.student;
          const cls = store.classes.find((c) => c.id === s.classId);
          const fees = store.fees.filter((f) => f.studentId === s.id);
          return (
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              {[
                ['Student ID', s.studentId], ['Full Name', s.name], ['DOB', formatDate(s.dob)],
                ['Gender', s.gender], ['Class', classLabel(cls)], ['Status', s.status],
                ['Guardian', s.parentName], ['Guardian Phone', s.parentPhone], ['Email', s.email],
                ['Address', s.address || '—'], ['Admission Date', formatDate(s.admissionDate)], ['Emergency Contact', s.emergencyContact],
              ].map(([k, v]) => (
                <div key={k}><p className="text-xs uppercase text-slate-400">{k}</p><p className="font-medium text-slate-800">{v}</p></div>
              ))}
              <div className="col-span-full mt-2">
                <p className="mb-1 text-xs uppercase text-slate-400">Fee Records</p>
                {fees.length === 0 ? <p className="text-slate-500">No fee records.</p> : fees.map((f) => (
                  <p key={f.id} className="text-slate-700">{f.title}: paid ${f.paid} / ${f.total} · due {formatDate(f.dueDate)}</p>
                ))}
              </div>
            </div>
          );
        })()}
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => store.removeItem('students', toDelete.id)} message={`Delete student "${toDelete?.name}"? This cannot be undone.`} />
    </div>
  );
}
