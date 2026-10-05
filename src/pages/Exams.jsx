import { useMemo, useState } from 'react';
import { Plus, Pencil, Eye, Trash2, ClipboardList } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Button, Badge, Modal, ConfirmDialog, SearchBar, Select, Input, EmptyState, Table, Th, Td, Card, statusColor } from '../components/ui';
import { required, isNonNegativeNumber, formatDate, classLabel } from '../utils/helpers';
import { gradeFor, resultStatus } from '../utils/grading';

const emptyExam = { name: '', subject: '', classId: '', date: '', totalMarks: 100 };

function validateExam(f) {
  const e = {};
  if (!required(f.name)) e.name = 'Exam name is required';
  if (!required(f.subject)) e.subject = 'Subject is required';
  if (!required(f.classId)) e.classId = 'Class is required';
  if (!required(f.date)) e.date = 'Date is required';
  if (!isNonNegativeNumber(f.totalMarks) || Number(f.totalMarks) <= 0) e.totalMarks = 'Total marks must be a positive number';
  return e;
}

export default function Exams() {
  const store = useStore();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [modal, setModal] = useState(null); // add | edit | view | marks
  const [toDelete, setToDelete] = useState(null);
  const [examForm, setExamForm] = useState(emptyExam);
  const [errors, setErrors] = useState({});
  const [marksForm, setMarksForm] = useState({});
  const [marksError, setMarksError] = useState('');

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return store.exams.filter((e) =>
      (e.name.toLowerCase().includes(term) || e.subject.toLowerCase().includes(term)) &&
      (!classFilter || e.classId === classFilter)
    );
  }, [store.exams, search, classFilter]);

  const openAdd = () => { setExamForm(emptyExam); setErrors({}); setModal({ mode: 'add' }); };
  const openEdit = (ex) => { setExamForm({ ...ex }); setErrors({}); setModal({ mode: 'edit', exam: ex }); };
  const openMarks = (ex) => {
    const initial = {};
    store.students.filter((s) => s.classId === ex.classId).forEach((s) => {
      const r = store.results.find((r) => r.examId === ex.id && r.studentId === s.id);
      initial[s.id] = r ? String(r.marks) : '';
    });
    setMarksForm(initial);
    setMarksError('');
    setModal({ mode: 'marks', exam: ex });
  };

  const saveExam = (e) => {
    e.preventDefault();
    const errs = validateExam(examForm);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const data = { ...examForm, totalMarks: Number(examForm.totalMarks) };
    if (modal.mode === 'add') store.addItem('exams', data);
    else store.updateItem('exams', { ...modal.exam, ...data });
    setModal(null);
  };

  const saveMarks = (e) => {
    e.preventDefault();
    const ex = modal.exam;
    for (const marks of Object.values(marksForm)) {
      if (marks === '') continue;
      if (!isNonNegativeNumber(marks)) return setMarksError('Marks cannot be negative or non-numeric.');
      if (Number(marks) > Number(ex.totalMarks)) return setMarksError(`Marks cannot exceed total marks (${ex.totalMarks}).`);
    }
    setMarksError('');
    Object.entries(marksForm).forEach(([studentId, marks]) => {
      if (marks === '') return;
      const existing = store.results.find((r) => r.examId === ex.id && r.studentId === studentId);
      if (existing) store.updateItem('results', { ...existing, marks: Number(marks) });
      else store.addItem('results', { examId: ex.id, studentId, marks: Number(marks) });
    });
    setModal(null);
  };

  const viewedResults = useMemo(() => {
    if (modal?.mode !== 'view') return [];
    const ex = modal.exam;
    return store.results
      .filter((r) => r.examId === ex.id)
      .map((r) => {
        const student = store.students.find((s) => s.id === r.studentId);
        const pct = Math.round((r.marks / ex.totalMarks) * 100);
        return { ...r, student, pct, grade: gradeFor(pct), status: resultStatus(pct) };
      })
      .sort((a, b) => b.pct - a.pct);
  }, [modal, store.results, store.students]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search exams..." /></div>
        <Select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} aria-label="Filter by class">
          <option value="">All classes</option>
          {store.classes.map((c) => <option key={c.id} value={c.id}>{classLabel(c)}</option>)}
        </Select>
        <Button onClick={openAdd}><Plus className="h-4 w-4" /> Create Exam</Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <EmptyState title="No exams found" message="Create an exam to get started." />
        ) : (
          <Table>
            <thead><tr><Th>Exam</Th><Th>Subject</Th><Th>Class</Th><Th>Date</Th><Th>Total</Th><Th>Results</Th><Th>Actions</Th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((ex) => {
                const cls = store.classes.find((c) => c.id === ex.classId);
                const count = store.results.filter((r) => r.examId === ex.id).length;
                return (
                  <tr key={ex.id} className="hover:bg-slate-50">
                    <Td><p className="font-medium text-slate-900">{ex.name}</p></Td>
                    <Td>{ex.subject}</Td>
                    <Td>{classLabel(cls)}</Td>
                    <Td>{formatDate(ex.date)}</Td>
                    <Td>{ex.totalMarks}</Td>
                    <Td><Badge color={count ? 'green' : 'slate'}>{count} entered</Badge></Td>
                    <Td>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" aria-label="Enter marks" onClick={() => openMarks(ex)}><ClipboardList className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" aria-label="View results" onClick={() => setModal({ mode: 'view', exam: ex })}><Eye className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" aria-label="Edit exam" onClick={() => openEdit(ex)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" aria-label="Delete exam" onClick={() => setToDelete(ex)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </div>

      <Modal open={modal?.mode === 'add' || modal?.mode === 'edit'} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Edit Exam' : 'Create Exam'}>
        <form onSubmit={saveExam} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Exam Name" required value={examForm.name} onChange={(e) => setExamForm({ ...examForm, name: e.target.value })} error={errors.name} />
          <Input label="Subject" required value={examForm.subject} onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })} error={errors.subject} />
          <Select label="Class" required value={examForm.classId} onChange={(e) => setExamForm({ ...examForm, classId: e.target.value })} error={errors.classId}>
            <option value="">Select class</option>
            {store.classes.map((c) => <option key={c.id} value={c.id}>{classLabel(c)}</option>)}
          </Select>
          <Input type="date" label="Date" required value={examForm.date} onChange={(e) => setExamForm({ ...examForm, date: e.target.value })} error={errors.date} />
          <Input type="number" min="1" label="Total Marks" required value={examForm.totalMarks} onChange={(e) => setExamForm({ ...examForm, totalMarks: e.target.value })} error={errors.totalMarks} />
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit">Save Exam</Button>
          </div>
        </form>
      </Modal>

      <Modal open={modal?.mode === 'marks'} onClose={() => setModal(null)} title={`Enter Marks — ${modal?.exam?.name ?? ''}`} wide>
        <form onSubmit={saveMarks}>
          {marksError && <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700" role="alert">{marksError}</p>}
          <Table>
            <thead><tr><Th>Student</Th><Th>Marks (max {modal?.exam?.totalMarks})</Th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {modal?.exam && store.students.filter((s) => s.classId === modal.exam.classId).map((s) => (
                <tr key={s.id}>
                  <Td>{s.name}</Td>
                  <Td>
                    <input
                      type="number" min="0" max={modal.exam.totalMarks}
                      value={marksForm[s.id] ?? ''}
                      onChange={(e) => setMarksForm({ ...marksForm, [s.id]: e.target.value })}
                      aria-label={`Marks for ${s.name}`}
                      className="w-28 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                    />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit">Save Marks</Button>
          </div>
        </form>
      </Modal>

      <Modal open={modal?.mode === 'view'} onClose={() => setModal(null)} title={`Results — ${modal?.exam?.name ?? ''} (${modal?.exam?.subject ?? ''})`} wide>
        {viewedResults.length === 0 ? (
          <EmptyState title="No marks entered" message="Use the marks button to enter results for this exam." />
        ) : (
          <Table>
            <thead><tr><Th>Student</Th><Th>Marks</Th><Th>Percentage</Th><Th>Grade</Th><Th>Status</Th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {viewedResults.map((r) => (
                <tr key={r.id}>
                  <Td>{r.student?.name ?? 'Unknown'}</Td>
                  <Td>{r.marks} / {modal.exam.totalMarks}</Td>
                  <Td>{r.pct}%</Td>
                  <Td><Badge color={r.grade === 'F' ? 'red' : 'blue'}>{r.grade}</Badge></Td>
                  <Td><Badge color={statusColor(r.status)}>{r.status}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => store.removeItem('exams', toDelete.id)} message={`Delete exam "${toDelete?.name}"? Linked results will remain but the exam will be gone.`} />
    </div>
  );
}
