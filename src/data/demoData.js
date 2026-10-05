import { uid } from '../utils/helpers';

// Deterministic pseudo-random so the demo data looks the same on first load.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const TEACHERS = [
  { id: 't1', teacherId: 'T-101', name: 'Sarah Mitchell', email: 'sarah.mitchell@brightfuture.edu', phone: '+1 555-0101', subject: 'Mathematics', qualification: 'M.Sc. Mathematics', joiningDate: '2019-08-12', classIds: ['c1', 'c3', 'c5'], status: 'Active' },
  { id: 't2', teacherId: 'T-102', name: 'James Carter', email: 'james.carter@brightfuture.edu', phone: '+1 555-0102', subject: 'English', qualification: 'M.A. English Literature', joiningDate: '2018-06-20', classIds: ['c2', 'c4'], status: 'Active' },
  { id: 't3', teacherId: 'T-103', name: 'Priya Sharma', email: 'priya.sharma@brightfuture.edu', phone: '+1 555-0103', subject: 'Science', qualification: 'M.Sc. Physics', joiningDate: '2020-01-15', classIds: ['c1', 'c2', 'c6'], status: 'Active' },
  { id: 't4', teacherId: 'T-104', name: 'David Okafor', email: 'david.okafor@brightfuture.edu', phone: '+1 555-0104', subject: 'History', qualification: 'M.A. History', joiningDate: '2017-03-08', classIds: ['c3', 'c4', 'c6'], status: 'Active' },
  { id: 't5', teacherId: 'T-105', name: 'Emily Chen', email: 'emily.chen@brightfuture.edu', phone: '+1 555-0105', subject: 'Computer Science', qualification: 'B.Tech Computer Science', joiningDate: '2021-07-01', classIds: ['c1', 'c5'], status: 'Active' },
  { id: 't6', teacherId: 'T-106', name: 'Michael Brown', email: 'michael.brown@brightfuture.edu', phone: '+1 555-0106', subject: 'Physical Education', qualification: 'B.P.Ed', joiningDate: '2016-09-05', classIds: ['c2', 'c5', 'c6'], status: 'Inactive' },
];

export const CLASSES = [
  { id: 'c1', name: 'Grade 8', section: 'A', teacherId: 't1', room: 'R-101', subjects: ['Mathematics', 'English', 'Science', 'History', 'Computer Science'] },
  { id: 'c2', name: 'Grade 9', section: 'A', teacherId: 't2', room: 'R-102', subjects: ['Mathematics', 'English', 'Science', 'History'] },
  { id: 'c3', name: 'Grade 9', section: 'B', teacherId: 't4', room: 'R-103', subjects: ['Mathematics', 'English', 'Science'] },
  { id: 'c4', name: 'Grade 10', section: 'A', teacherId: 't1', room: 'R-201', subjects: ['Mathematics', 'Science', 'English', 'History'] },
  { id: 'c5', name: 'Grade 10', section: 'B', teacherId: 't5', room: 'R-202', subjects: ['Computer Science', 'Mathematics', 'English'] },
  { id: 'c6', name: 'Grade 11', section: 'A', teacherId: 't3', room: 'R-301', subjects: ['Science', 'Mathematics', 'History'] },
];

const FIRST = ['Aarav', 'Mia', 'Liam', 'Sofia', 'Noah', 'Aisha', 'Ethan', 'Zara', 'Lucas', 'Chloe', 'Omar', 'Lily', 'Jacob', 'Ava', 'Daniel', 'Nina'];
const LAST = ['Khan', 'Patel', 'Smith', 'Garcia', 'Johnson', 'Ali', 'Brown', 'Nguyen', 'Williams', 'Kim', 'Hassan', 'Wilson', 'Davis', 'Lee', 'Rahman', 'Martin'];
const GENDERS = ['Male', 'Female'];

export function buildStudents() {
  const rnd = mulberry32(42);
  return FIRST.map((first, i) => {
    const last = LAST[i];
    const cls = CLASSES[i % CLASSES.length];
    const year = 2008 + (i % 4);
    const month = String(1 + Math.floor(rnd() * 12)).padStart(2, '0');
    const day = String(1 + Math.floor(rnd() * 28)).padStart(2, '0');
    return {
      id: `s${i + 1}`,
      studentId: `STU-2026-${String(100 + i)}`,
      name: `${first} ${last}`,
      dob: `${year}-${month}-${day}`,
      gender: GENDERS[i % 2],
      classId: cls.id,
      section: cls.section,
      parentName: `${last} Family`,
      parentPhone: `+1 555-0${200 + i}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@student.brightfuture.edu`,
      address: `${10 + i} Maple Street, Springfield`,
      admissionDate: `2026-04-${String(1 + (i % 20)).padStart(2, '0')}`,
      status: i === 15 ? 'Graduated' : i === 13 ? 'Inactive' : 'Active',
      emergencyContact: `+1 555-0${300 + i}`,
    };
  });
}

export function buildAttendance(students) {
  const rnd = mulberry32(7);
  const records = [];
  const dates = [];
  // Last 6 weekdays (excluding weekends) ending 2026-10-02
  const base = new Date('2026-10-02');
  for (let i = 0; i < 9 && dates.length < 6; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const day = d.getDay();
    if (day !== 0 && day !== 6) dates.push(d.toISOString().slice(0, 10));
  }
  CLASSES.forEach((cls) => {
    dates.forEach((date) => {
      const recs = {};
      students
        .filter((s) => s.classId === cls.id)
        .forEach((s) => {
          const r = rnd();
          recs[s.id] = r < 0.82 ? 'present' : r < 0.93 ? 'late' : 'absent';
        });
      records.push({ id: uid('att'), date, classId: cls.id, records: recs });
    });
  });
  return records;
}

export function buildExams() {
  return [
    { id: 'e1', name: 'Midterm Exam', subject: 'Mathematics', classId: 'c1', date: '2026-09-15', totalMarks: 100 },
    { id: 'e2', name: 'Midterm Exam', subject: 'English', classId: 'c1', date: '2026-09-17', totalMarks: 100 },
    { id: 'e3', name: 'Quiz 1', subject: 'Science', classId: 'c2', date: '2026-09-10', totalMarks: 50 },
    { id: 'e4', name: 'Final Exam', subject: 'Computer Science', classId: 'c5', date: '2026-10-20', totalMarks: 100 },
    { id: 'e5', name: 'Midterm Exam', subject: 'History', classId: 'c3', date: '2026-09-22', totalMarks: 100 },
    { id: 'e6', name: 'Unit Test 2', subject: 'Mathematics', classId: 'c6', date: '2026-10-12', totalMarks: 60 },
  ];
}

export function buildResults(students) {
  const rnd = mulberry32(99);
  const results = [];
  const examStudentMap = [
    { examId: 'e1', classId: 'c1' },
    { examId: 'e2', classId: 'c1' },
    { examId: 'e3', classId: 'c2' },
    { examId: 'e4', classId: 'c5' },
    { examId: 'e5', classId: 'c3' },
  ];
  examStudentMap.forEach(({ examId, classId }) => {
    students
      .filter((s) => s.classId === classId)
      .forEach((s) => {
        const total = examId === 'e3' ? 50 : 100;
        results.push({
          id: uid('res'),
          examId,
          studentId: s.id,
          marks: Math.round(total * (0.45 + rnd() * 0.5)),
        });
      });
  });
  return results;
}

export function buildFees(students) {
  const fees = [];
  const plans = [
    { title: 'Tuition Fee - Term 1', total: 1200, dueDate: '2026-09-30' },
    { title: 'Lab Fee', total: 150, dueDate: '2026-10-15' },
  ];
  students.slice(0, 16).forEach((s, i) => {
    plans.forEach((p, j) => {
      const paid = i % 4 === 0 && j === 0 ? 0 : i % 3 === 0 ? p.total / 2 : p.total;
      const payments = paid > 0 ? [{ date: '2026-09-05', amount: paid }] : [];
      fees.push({ id: uid('fee'), studentId: s.id, title: p.title, total: p.total, paid, dueDate: p.dueDate, payments });
    });
  });
  return fees;
}

export function buildNotices() {
  return [
    { id: 'n1', title: 'Parent-Teacher Meeting', description: 'PTM scheduled for all grades on October 10, 2026 from 9:00 AM to 12:00 PM in the main hall.', date: '2026-10-01', author: 'Principal', priority: 'Important', status: 'Published' },
    { id: 'n2', title: 'Annual Sports Day', description: 'The Annual Sports Day will be held on October 25, 2026. House captains should submit team lists by October 8.', date: '2026-09-28', author: 'Sports Committee', priority: 'Normal', status: 'Published' },
    { id: 'n3', title: 'Library Book Return', description: 'All borrowed library books must be returned by Friday this week to avoid late fines.', date: '2026-10-02', author: 'Librarian', priority: 'Urgent', status: 'Published' },
    { id: 'n4', title: 'Science Fair Registration', description: 'Students interested in the Science Fair can register with their science teachers before October 12.', date: '2026-09-25', author: 'Science Dept.', priority: 'Normal', status: 'Published' },
    { id: 'n5', title: 'Draft: Holiday Notice', description: 'Proposed holiday calendar for winter break — pending approval from the board.', date: '2026-10-03', author: 'Admin Office', priority: 'Normal', status: 'Draft' },
  ];
}

export function buildTimetable() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const slots = [
    { start: '08:00', end: '08:45' },
    { start: '08:50', end: '09:35' },
    { start: '09:55', end: '10:40' },
    { start: '10:45', end: '11:30' },
    { start: '12:00', end: '12:45' },
  ];
  const picks = [
    ['Mathematics', 't1', 'c1', 'R-101'],
    ['English', 't2', 'c2', 'R-102'],
    ['Science', 't3', 'c1', 'R-101'],
    ['History', 't4', 'c3', 'R-103'],
    ['Computer Science', 't5', 'c5', 'R-202'],
  ];
  const entries = [];
  days.forEach((day, di) => {
    slots.forEach((slot, si) => {
      const [subject, teacherId, classId, room] = picks[(di + si) % picks.length];
      entries.push({ id: uid('tt'), day, startTime: slot.start, endTime: slot.end, subject, teacherId, classId, room });
    });
  });
  return entries;
}

export function buildSettings() {
  return {
    schoolName: 'BrightFuture School',
    email: 'info@brightfuture.edu',
    phone: '+1 555-1000',
    address: '45 Education Avenue, Springfield',
    academicYear: '2026-2027',
    theme: 'Light',
    notifications: { email: true, push: true, notices: true },
    profileName: 'Admin User',
    profileEmail: 'admin@brightfuture.edu',
    profileRole: 'Administrator',
  };
}

export function buildDemoData() {
  const students = buildStudents();
  return {
    students,
    teachers: TEACHERS,
    classes: CLASSES,
    attendance: buildAttendance(students),
    exams: buildExams(),
    results: buildResults(students),
    fees: buildFees(students),
    notices: buildNotices(),
    timetable: buildTimetable(),
    settings: buildSettings(),
  };
}
