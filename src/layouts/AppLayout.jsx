import { useState } from 'react';
import {
  LayoutDashboard, Users, GraduationCap, School, CalendarCheck, FileText, Wallet,
  CalendarDays, Megaphone, Settings, Menu, Bell, X, Search, ChevronDown,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'teachers', label: 'Teachers', icon: GraduationCap },
  { id: 'classes', label: 'Classes', icon: School },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'exams', label: 'Exams & Results', icon: FileText },
  { id: 'fees', label: 'Fees', icon: Wallet },
  { id: 'timetable', label: 'Timetable', icon: CalendarDays },
  { id: 'notices', label: 'Notices', icon: Megaphone },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function GlobalSearch({ onNavigate }) {
  const store = useStore();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  const term = q.trim().toLowerCase();
  const results = term
    ? [
        ...store.students.filter((s) => s.name.toLowerCase().includes(term) || s.studentId.toLowerCase().includes(term)).slice(0, 4).map((s) => ({ label: s.name, sub: `Student · ${s.studentId}`, page: 'students' })),
        ...store.teachers.filter((t) => t.name.toLowerCase().includes(term) || t.subject.toLowerCase().includes(term)).slice(0, 3).map((t) => ({ label: t.name, sub: `Teacher · ${t.subject}`, page: 'teachers' })),
        ...store.classes.filter((c) => `${c.name} ${c.section}`.toLowerCase().includes(term)).slice(0, 3).map((c) => ({ label: `${c.name} - ${c.section}`, sub: 'Class', page: 'classes' })),
        ...store.notices.filter((n) => n.title.toLowerCase().includes(term)).slice(0, 3).map((n) => ({ label: n.title, sub: 'Notice', page: 'notices' })),
      ]
    : [];

  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
      <input
        type="search"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search students, teachers, classes..."
        aria-label="Global search"
        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-200"
      />
      {open && term && (
        <ul className="absolute z-40 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {results.length === 0 && <li className="px-4 py-3 text-sm text-slate-500">No matches found.</li>}
          {results.map((r, i) => (
            <li key={i}>
              <button
                className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
                onMouseDown={() => { onNavigate(r.page); setQ(''); setOpen(false); }}
              >
                <span className="font-medium text-slate-800">{r.label}</span>
                <span className="ml-2 text-xs text-slate-400">{r.sub}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SidebarContent({ page, setPage, onClose }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
          <School className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-slate-900">BrightFuture</p>
          <p className="text-xs text-slate-400">School Management</p>
        </div>
        {onClose && (
          <button className="ml-auto rounded-md p-1 text-slate-400 hover:bg-slate-100" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Main navigation">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setPage(id); onClose?.(); }}
            aria-current={page === id ? 'page' : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              page === id ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Icon className="h-4.5 w-4.5" />
            {label}
          </button>
        ))}
      </nav>
      <p className="border-t border-slate-100 p-4 text-xs text-slate-400">v1.0 · School Project Demo</p>
    </div>
  );
}

export default function AppLayout({ page, setPage, children }) {
  const store = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const active = NAV_ITEMS.find((n) => n.id === page);
  const recentNotices = store.notices.filter((n) => n.status === 'Published').slice(0, 5);

  return (
    <div className="flex h-full">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-slate-200 bg-white md:block">
        <SidebarContent page={page} setPage={setPage} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            <SidebarContent page={page} setPage={setPage} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3 px-4 py-3">
            <button className="rounded-md p-2 text-slate-500 hover:bg-slate-100 md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-900">{active?.label}</h1>
            <div className="ml-auto hidden sm:block">
              <GlobalSearch onNavigate={setPage} />
            </div>
            <div className="relative">
              <button className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100" onClick={() => setNotifOpen((v) => !v)} aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {recentNotices.length > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg">
                  <p className="border-b border-slate-100 px-4 py-2 text-sm font-semibold">Recent notices</p>
                  {recentNotices.length === 0 && <p className="px-4 py-3 text-sm text-slate-500">No notices.</p>}
                  {recentNotices.map((n) => (
                    <button key={n.id} className="block w-full px-4 py-2 text-left hover:bg-slate-50" onClick={() => { setPage('notices'); setNotifOpen(false); }}>
                      <p className="text-sm font-medium text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-400">{n.date} · {n.priority}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-100" onClick={() => setProfileOpen((v) => !v)}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">AU</span>
                <span className="hidden text-sm font-medium text-slate-700 sm:block">{store.settings.profileName}</span>
                <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                  <p className="px-3 py-1 text-sm font-semibold text-slate-800">{store.settings.profileName}</p>
                  <p className="px-3 pb-2 text-xs text-slate-400">{store.settings.profileEmail}</p>
                  <button className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50" onClick={() => { setPage('settings'); setProfileOpen(false); }}>
                    Profile & Settings
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="px-4 pb-3 sm:hidden">
            <GlobalSearch onNavigate={setPage} />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
