import { useMemo, useState } from 'react';
import { Plus, Pencil, Eye, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Button, Badge, Modal, ConfirmDialog, SearchBar, Select, Input, EmptyState } from '../components/ui';
import { required } from '../utils/helpers';

const emptyForm = { name: '', section: '', teacherId: '', room: '', subjects: '' };

function validateClass(f) {
  const e = {};
  if (!required(f.name)) e.name = 'Class name is required';
  if (!required(f.section)) e.section = 'Section is required';
  if (!required(f.teacherId)) e.teacherId = 'Class teacher is required';
  if (!required(f.room)) e.room = 'Room number is required';
  return e;
}

export default function Classes() {
  const store = useStore();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return store.classes.filter((c) => `${c.name} ${c.section}`.toLowerCase().includes(term) || c.room.toLowerCase().includes(term));
  }, [store.classes, search]);

  const openAdd = () => { setForm(emptyForm); setErrors({}); setModal({ mode: 'add' }); };
  const openEdit = (c) => { setForm({ ...c, subjects: c.subjects.join(', ') }); setErrors({}); setModal({ mode: 'edit', cls: c }); };

  const save = (e) => {
    e.preventDefault();
    const errs = validateClass(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const data = { ...form, subjects: form.subjects.split(',').map((s) => s.trim()).filter(Boolean) };
    if (modal.mode === 'add') store.addItem('classes', data);
    else store.updateItem('classes', { ...modal.cls, ...data });
    setModal(null);
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search classes..." /></div>
        <Button onClick={openAdd}><Plus className="h-4 w-4" /> Add Class</Button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm"><EmptyState title="No classes found" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const teacher = store.teachers.find((t) => t.id === c.teacherId);
            const count = store.students.filter((s) => s.classId === c.id).length;
            return (
              <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{c.name} - {c.section}</h3>
                    <p className="text-sm text-slate-500">Room {c.room}</p>
                  </div>
                  <Badge color="blue">{count} students</Badge>
                </div>
                <p className="mt-3 text-sm text-slate-600"><span className="font-medium">Class Teacher:</span> {teacher?.name ?? 'Unassigned'}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.subjects.map((s) => <Badge key={s} color="slate">{s}</Badge>)}
                </div>
                <div className="mt-4 flex gap-1 border-t border-slate-100 pt-3">
                  <Button size="sm" variant="ghost" onClick={() => setModal({ mode: 'view', cls: c })} aria-label={`View ${c.name} ${c.section}`}><Eye className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(c)} aria-label={`Edit ${c.name} ${c.section}`}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => setToDelete(c)} aria-label={`Delete ${c.name} ${c.section}`}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modal?.mode === 'add' || modal?.mode === 'edit'} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Edit Class' : 'Add Class'}>
        <form onSubmit={save} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Class Name" required value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} placeholder="Grade 9" />
          <Input label="Section" required value={form.section} onChange={(e) => set('section', e.target.value)} error={errors.section} placeholder="A" />
          <Select label="Class Teacher" required value={form.teacherId} onChange={(e) => set('teacherId', e.target.value)} error={errors.teacherId}>
            <option value="">Select teacher</option>
            {store.teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
          <Input label="Room Number" required value={form.room} onChange={(e) => set('room', e.target.value)} error={errors.room} placeholder="R-101" />
          <div className="sm:col-span-2">
            <Input label="Subjects (comma separated)" value={form.subjects} onChange={(e) => set('subjects', e.target.value)} placeholder="Mathematics, English, Science" />
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit">Save Class</Button>
          </div>
        </form>
      </Modal>

      <Modal open={modal?.mode === 'view'} onClose={() => setModal(null)} title="Class Details">
        {modal?.mode === 'view' && (() => {
          const c = modal.cls;
          const teacher = store.teachers.find((t) => t.id === c.teacherId);
          const students = store.students.filter((s) => s.classId === c.id);
          return (
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Class:</span> {c.name} - {c.section}</p>
              <p><span className="font-medium">Teacher:</span> {teacher?.name ?? '—'}</p>
              <p><span className="font-medium">Room:</span> {c.room}</p>
              <p><span className="font-medium">Subjects:</span> {c.subjects.join(', ')}</p>
              <p><span className="font-medium">Students:</span> {students.length}</p>
              <ul className="mt-2 list-inside list-disc text-slate-600">
                {students.slice(0, 8).map((s) => <li key={s.id}>{s.name}</li>)}
                {students.length > 8 && <li>...and {students.length - 8} more</li>}
              </ul>
            </div>
          );
        })()}
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => store.removeItem('classes', toDelete.id)} message={`Delete class "${toDelete?.name} - ${toDelete?.section}"?`} />
    </div>
  );
}
