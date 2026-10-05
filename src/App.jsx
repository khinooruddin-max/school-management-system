import { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance';
import Exams from './pages/Exams';
import Fees from './pages/Fees';
import Timetable from './pages/Timetable';
import Notices from './pages/Notices';
import Settings from './pages/Settings';

const PAGES = {
  dashboard: Dashboard,
  students: Students,
  teachers: Teachers,
  classes: Classes,
  attendance: Attendance,
  exams: Exams,
  fees: Fees,
  timetable: Timetable,
  notices: Notices,
  settings: Settings,
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  const Page = PAGES[page] ?? Dashboard;

  return (
    <StoreProvider>
      <AppLayout page={page} setPage={setPage}>
        <Page />
      </AppLayout>
    </StoreProvider>
  );
}
