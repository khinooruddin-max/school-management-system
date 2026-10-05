import { useMemo, useState } from 'react';
import { Check, X as XIcon, Clock, History } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Button, Badge, Select, Input, EmptyState, Table, Th, Td, Card } from '../components/ui';
import { todayStr, formatDate, classLabel } from '../utils/helpers';

const MARKS = [
  { value: 'present', label: 'Present', color: 'green' },
  { value: 'absent', label: 'Absent', color: 'red' },
  { value: 'late', label: 'Late', color: 'amber' },
];

export default function Attendance() {
  const store = useStore();
  const [date, setDate] = useState(todayStr());
  const [classId, setClassId] = useState(store.classes[0]?.id ?? '');
  const [savedMsg, setSavedMsg] = useState('');

  const studentsInClass = useMemo(
    () => store.students.filter((s) => s.classId === classId && s.status !== 'Graduated'),
    [store.students, classId]
  );

  const existing = useMemo(
    () => store.attendance.find((a) => a.date === date && a.classId === classId),
    [store.attendance, date, classId]
  );

  const [records, setRecords] = useState(null);
  const current = records ?? existing?.records ?? Object.fromEntries(studentsInClass.map((s) => [s.id, 'present']));

  const setMark = (id, value) => setRecords({ ...current, [id]: value });
  const markAll = (value) => setRecords(Object.fromEntries(studentsInClass.map((s) => [s.id, value])));

  const summary = useMemo(() => {
    const vals = Object.values(current);
    const present = vals.filter((v) => v === 'present').length;
    const absent = vals.filter((v) => v === 'absent').length;
    const late = vals.filter((v) => v === 'late').length;
    const rate = vals.length ? Math.round(((present + late) / vals.length) * 100) : 0;
    return { present, absent, late, rate };
  }, [current]);

  const save = () => {
    store.saveAttendance(date, classId, current);
    setRecords(null);
    setSavedMsg('Attendance saved successfully.');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const history = useMemo(() => {
    return [...store.attendance]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10)
      .map((a) => {
        const vals = Object.values(a.records);
        const present = vals.filter((v) => v === 'present' || v === 'late').length;
        return { ...a, rate: vals.length ? Math.round((present / vals.length) * 100) : 0 };
      });
  }, [store.attendance]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <Input type="date" label="Date" value={date} onChange={(e) => { setDate(e.target.value); setRecords(null); }} />
        <Select label="Class" value={classId} onChange={(e) => { setClassId(e.target.value); setRecords(null); }}>
          {store.classes.map((c) => <option key={c.id} value={c.id}>{classLabel(c)}</option>)}
        </Select>
        <div className="flex gap-2 pb-0.5">
          <Button size="sm" variant="secondary" onClick={() => markAll('present')}>All Present</Button>
          <Button size="sm" variant="secondary" onClick={() => markAll('absent')}>All Absent</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm"><p className="text-2xl font-bold text-emerald-600">{summary.present}</p><p className="text-xs text-slate-500">Present</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm"><p className="text-2xl font-bold text-red-600">{summary.absent}</p><p className="text-xs text-slate-500">Absent</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm"><p className="text-2xl font-bold text-amber-600">{summary.late}</p><p className="text-xs text-slate-500">Late</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm"><p className="text-2xl font-bold text-primary-600">{summary.rate}%</p><p className="text-xs text-slate-500">Attendance</p></div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {studentsInClass.length === 0 ? (
          <EmptyState title="No students in this class" message="Add students to this class to mark attendance." />
        ) : (
          <>
            <Table>
              <thead><tr><Th>Student</Th><Th>Status</Th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {studentsInClass.map((s) => (
                  <tr key={s.id}>
                    <Td><p className="font-medium text-slate-900">{s.name}</p><p className="text-xs text-slate-400">{s.studentId}</p></Td>
                    <Td>
                      <div className="flex gap-1.5" role="group" aria-label={`Attendance for ${s.name}`}>
                        {MARKS.map((m) => (
                          <button
                            key={m.value}
                            onClick={() => setMark(s.id, m.value)}
                            aria-pressed={current[s.id] === m.value}
                            className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                              current[s.id] === m.value
                                ? m.value === 'present' ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                : m.value === 'absent' ? 'border-red-300 bg-red-50 text-red-700'
                                : 'border-amber-300 bg-amber-50 text-amber-700'
                                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {m.value === 'present' ? <Check className="h-3.5 w-3.5" /> : m.value === 'absent' ? <XIcon className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
              {savedMsg ? <p className="text-sm text-emerald-600" role="status">{savedMsg}</p> : <span />}
              <Button onClick={save}>Save Attendance</Button>
            </div>
          </>
        )}
      </div>

      <Card title={<span className="flex items-center gap-2"><History className="h-4 w-4" /> Attendance History</span>}>
        {history.length === 0 ? (
          <EmptyState title="No history yet" />
        ) : (
          <Table>
            <thead><tr><Th>Date</Th><Th>Class</Th><Th>Attendance Rate</Th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((h) => {
                const cls = store.classes.find((c) => c.id === h.classId);
                return (
                  <tr key={h.id}>
                    <Td>{formatDate(h.date)}</Td>
                    <Td>{classLabel(cls)}</Td>
                    <Td><Badge color={h.rate >= 80 ? 'green' : h.rate >= 60 ? 'amber' : 'red'}>{h.rate}%</Badge></Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
