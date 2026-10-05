import { useMemo } from 'react';
import { Users, GraduationCap, School, CalendarCheck, Wallet, FileText, Megaphone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Card, Badge, statusColor, EmptyState } from '../components/ui';
import { todayStr, formatDate, currency, feeStatus, feeRemaining, classLabel } from '../utils/helpers';

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${accent}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const store = useStore();

  const stats = useMemo(() => {
    const today = todayStr();
    const todayClasses = store.attendance.filter((a) => a.date === today);
    let present = 0, total = 0;
    todayClasses.forEach((a) => Object.values(a.records).forEach((r) => { total++; if (r === 'present' || r === 'late') present++; }));
    const pendingFees = store.fees.filter((f) => feeStatus(f) !== 'Paid');
    const pendingAmount = pendingFees.reduce((sum, f) => sum + feeRemaining(f), 0);
    const upcoming = store.exams.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
    return {
      students: store.students.length,
      teachers: store.teachers.length,
      classes: store.classes.length,
      attendanceRate: total ? Math.round((present / total) * 100) : null,
      pendingFees: pendingFees.length,
      pendingAmount,
      upcoming,
    };
  }, [store]);

  const attendanceByDate = useMemo(() => {
    const map = {};
    store.attendance.forEach((a) => {
      const m = map[a.date] = map[a.date] || { present: 0, total: 0 };
      Object.values(a.records).forEach((r) => { m.total++; if (r === 'present' || r === 'late') m.present++; });
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  }, [store.attendance]);

  const studentsPerClass = useMemo(() => {
    return store.classes.map((c) => ({
      label: `${c.name}-${c.section}`,
      count: store.students.filter((s) => s.classId === c.id).length,
    }));
  }, [store.classes, store.students]);

  const maxStudents = Math.max(1, ...studentsPerClass.map((c) => c.count));

  const feeSummary = useMemo(() => {
    const collected = store.fees.reduce((sum, f) => sum + Number(f.paid), 0);
    const pending = store.fees.reduce((sum, f) => sum + feeRemaining(f), 0);
    return { collected, pending, total: collected + pending };
  }, [store.fees]);

  const recentActivity = useMemo(() => {
    const activities = [];
    store.attendance.slice(-4).forEach((a) => {
      const cls = store.classes.find((c) => c.id === a.classId);
      activities.push({ date: a.date, text: `Attendance saved for ${classLabel(cls)}`, icon: CalendarCheck });
    });
    store.fees.forEach((f) => (f.payments || []).forEach((p) => {
      const s = store.students.find((x) => x.id === f.studentId);
      activities.push({ date: p.date, text: `${s?.name ?? 'Student'} paid ${currency(p.amount)} for ${f.title}`, icon: Wallet });
    }));
    store.notices.forEach((n) => activities.push({ date: n.date, text: `Notice "${n.title}" (${n.status.toLowerCase()})`, icon: Megaphone }));
    return activities.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  }, [store]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Users} label="Total Students" value={stats.students} accent="bg-primary-50 text-primary-600" />
        <StatCard icon={GraduationCap} label="Total Teachers" value={stats.teachers} accent="bg-purple-50 text-purple-600" />
        <StatCard icon={School} label="Total Classes" value={stats.classes} accent="bg-amber-50 text-amber-600" />
        <StatCard icon={CalendarCheck} label="Attendance Today" value={stats.attendanceRate === null ? '—' : `${stats.attendanceRate}%`} accent="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Wallet} label="Pending Fees" value={stats.pendingFees} sub={currency(stats.pendingAmount)} accent="bg-red-50 text-red-600" />
        <StatCard icon={FileText} label="Upcoming Exams" value={stats.upcoming.length} accent="bg-blue-50 text-blue-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Attendance Overview (last days with records)" className="lg:col-span-2">
          {attendanceByDate.length === 0 ? (
            <EmptyState title="No attendance records" message="Save attendance to see trends here." />
          ) : (
            <div className="flex h-48 items-end gap-3">
              {attendanceByDate.map(([date, m]) => {
                const pct = Math.round((m.present / m.total) * 100);
                return (
                  <div key={date} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-slate-600">{pct}%</span>
                    <div className="w-full rounded-t-md bg-primary-500" style={{ height: `${Math.max(8, pct * 1.4)}px` }} title={`${date}: ${pct}%`} />
                    <span className="text-[10px] text-slate-400">{date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card title="Fee Overview">
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Collected</span><span className="font-semibold text-emerald-600">{currency(feeSummary.collected)}</span></div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-emerald-500" style={{ width: `${feeSummary.total ? (feeSummary.collected / feeSummary.total) * 100 : 0}%` }} />
            </div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Pending</span><span className="font-semibold text-amber-600">{currency(feeSummary.pending)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Total billed</span><span className="font-semibold text-slate-800">{currency(feeSummary.total)}</span></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Students per Class">
          <div className="space-y-2">
            {studentsPerClass.map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <span className="w-20 text-xs text-slate-500">{c.label}</span>
                <div className="h-2.5 flex-1 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary-500" style={{ width: `${(c.count / maxStudents) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-xs font-semibold text-slate-700">{c.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Upcoming Exams">
          {stats.upcoming.length === 0 ? (
            <EmptyState title="No upcoming exams" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.upcoming.slice(0, 5).map((e) => {
                const cls = store.classes.find((c) => c.id === e.classId);
                return (
                  <li key={e.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{e.name} — {e.subject}</p>
                      <p className="text-xs text-slate-400">{classLabel(cls)}</p>
                    </div>
                    <Badge color="blue">{formatDate(e.date)}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="Recent Notices">
          <ul className="divide-y divide-slate-100">
            {store.notices.filter((n) => n.status === 'Published').slice(0, 4).map((n) => (
              <li key={n.id} className="py-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-800">{n.title}</p>
                  <Badge color={statusColor(n.priority)}>{n.priority}</Badge>
                </div>
                <p className="text-xs text-slate-400">{formatDate(n.date)} · {n.author}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Recent Activity">
        {recentActivity.length === 0 ? (
          <EmptyState title="No activity yet" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentActivity.map((a, i) => (
              <li key={i} className="flex items-center gap-3 py-2">
                <a.icon className="h-4 w-4 text-slate-400" />
                <span className="flex-1 text-sm text-slate-700">{a.text}</span>
                <span className="text-xs text-slate-400">{formatDate(a.date)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
