import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Button, Modal, ConfirmDialog, Select, Input, EmptyState, Table, Th, Td } from '../components/ui';
import { required, classLabel } from '../utils/helpers';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const emptyForm = { day: 'Monday', startTime: '08:00', endTime: '08:45', subject: '', teacherId: '', classId: '', room: '' };

export default function Timetable() {
  const store = useStore();
  const [classFilter, setClassFilter] = useState('all');
  const [modal, setModal] = useState(null); // {mode:'add'|'edit', entry?}
  const [toDelete, setToDelete] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const filtered = useMemo(() => {
    return store.timetable.filter((t) => classFilter === 'all' || t.classId === classFilter);
  }, [store.timetable, classFilter]);

  const byDayTime = useMemo(() => {
    const map = {};
    filtered.forEach((t) => {
      const key = `${t.day}|${t.startTime}`;
      map[key] = t;
    });
    return map;
  }, [filtered]);

  const times = [...new Set(store.timetable.map((t) => t.startTime))].sort();

  const openAdd = () => { setForm(emptyForm); setErrors({}); setModal({ mode: 'add' }); };
  const openEdit = (t) => { setForm({ ...t }); setErrors({}); setModal({ mode: 'edit', entry: t }); };

  const save = (e) => {
    e.preventDefault();
    const errs = {};
    if (!required(form.subject)) errs.subject = 'Subject is required';
    if (!required(form.teacherId)) errs.teacherId = 'Teacher is required';
    if (!required(form.classId)) errs.classId = 'Class is required';
    if (!required(form.room)) errs.room = 'Room is required';
    if (!required(form.startTime) || !required(form.endTime)) errs.startTime = 'Times are required';
    else if (form.endTime <= form.startTime) errs.startTime = 'End time must be after start time';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (modal.mode === 'add') store.addItem('timetable', form);
    else store.updateItem('timetable', { ...modal.entry, ...form });
    setModal(null);
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="max-w-xs">
          <Select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} aria-label="Filter by class">
            <option value="all">All classes</option>
            {store.classes.map((c) => <option key={c.id} value={c.id}>{classLabel(c)}</option>)}
          </Select>
        </div>
        <div className="ml-auto"><Button onClick={openAdd}><Plus className="h-4 w-4" /> Add Entry</Button></div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <EmptyState title="No timetable entries" message="Add an entry to build the weekly schedule." />
        ) : (
          <>
            {/* Desktop grid */}
            <div className="hidden overflow-x-auto p-4 md:block">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-500">Time</th>
                    {DAYS.map((d) => <th key={d} className="border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-500">{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {times.map((time) => (
                    <tr key={time}>
                      <td className="border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500">{time}</td>
                      {DAYS.map((day) => {
                        const t = byDayTime[`${day}|${time}`];
                        return (
                          <td key={day} className="border border-slate-200 px-2 py-2 align-top">
                            {t ? (
                              <div className="rounded-lg bg-primary-50 p-2">
                                <p className="text-xs font-bold text-primary-800">{t.subject}</p>
                                <p className="text-[11px] text-primary-700">{store.teachers.find((x) => x.id === t.teacherId)?.name ?? '—'}</p>
                                <p className="text-[11px] text-slate-500">{classLabel(store.classes.find((c) => c.id === t.classId))} · {t.room}</p>
                                <div className="mt-1 flex gap-0.5">
                                  <button className="rounded p-0.5 text-slate-400 hover:bg-white" aria-label="Edit entry" onClick={() => openEdit(t)}><Pencil className="h-3 w-3" /></button>
                                  <button className="rounded p-0.5 text-slate-400 hover:bg-white" aria-label="Delete entry" onClick={() => setToDelete(t)}><Trash2 className="h-3 w-3 text-red-400" /></button>
                                </div>
                              </div>
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile list */}
            <div className="block divide-y divide-slate-100 md:hidden">
              {[...filtered].sort((a, b) => `${a.day}${a.startTime}`.localeCompare(`${b.day}${b.startTime}`)).map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.subject} <span className="font-normal text-slate-400">· {t.day}</span></p>
                    <p className="text-xs text-slate-500">{t.startTime}–{t.endTime} · {classLabel(store.classes.find((c) => c.id === t.classId))} · {t.room}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" aria-label="Edit entry" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" aria-label="Delete entry" onClick={() => setToDelete(t)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Edit Timetable Entry' : 'Add Timetable Entry'}>
        <form onSubmit={save} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Day" value={form.day} onChange={(e) => set('day', e.target.value)}>{DAYS.map((d) => <option key={d}>{d}</option>)}</Select>
          <Select label="Class" required value={form.classId} onChange={(e) => set('classId', e.target.value)} error={errors.classId}>
            <option value="">Select class</option>
            {store.classes.map((c) => <option key={c.id} value={c.id}>{classLabel(c)}</option>)}
          </Select>
          <Input type="time" label="Start Time" required value={form.startTime} onChange={(e) => set('startTime', e.target.value)} error={errors.startTime} />
          <Input type="time" label="End Time" required value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />
          <Input label="Subject" required value={form.subject} onChange={(e) => set('subject', e.target.value)} error={errors.subject} />
          <Select label="Teacher" required value={form.teacherId} onChange={(e) => set('teacherId', e.target.value)} error={errors.teacherId}>
            <option value="">Select teacher</option>
            {store.teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
          <Input label="Room" required value={form.room} onChange={(e) => set('room', e.target.value)} error={errors.room} />
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit">Save Entry</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => store.removeItem('timetable', toDelete.id)} message={`Delete this timetable entry for "${toDelete?.subject}"?`} />
    </div>
  );
}
