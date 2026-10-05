import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Button, Input, Select, Card, ConfirmDialog } from '../components/ui';
import { isEmail, isPhone, required } from '../utils/helpers';

export default function Settings() {
  const store = useStore();
  const s = store.settings;
  const [form, setForm] = useState({ schoolName: s.schoolName, email: s.email, phone: s.phone, address: s.address, academicYear: s.academicYear, theme: s.theme });
  const [profile, setProfile] = useState({ profileName: s.profileName, profileEmail: s.profileEmail, profileRole: s.profileRole });
  const [notif, setNotif] = useState(s.notifications);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState('');
  const [showReset, setShowReset] = useState(false);

  const save = (e) => {
    e.preventDefault();
    const errs = {};
    if (!required(form.schoolName)) errs.schoolName = 'School name is required';
    if (!required(form.email)) errs.email = 'Email is required'; else if (!isEmail(form.email)) errs.email = 'Enter a valid email';
    if (!required(form.phone)) errs.phone = 'Phone is required'; else if (!isPhone(form.phone)) errs.phone = 'Enter a valid phone number';
    if (!required(form.academicYear)) errs.academicYear = 'Academic year is required';
    if (profile.profileEmail && !isEmail(profile.profileEmail)) errs.profileEmail = 'Enter a valid email';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    store.setSettings({ ...form, notifications: notif, ...profile });
    setSaved('Settings saved.');
    setTimeout(() => setSaved(''), 3000);
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card title="School Information">
        <form onSubmit={save} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="School Name" required value={form.schoolName} onChange={(e) => set('schoolName', e.target.value)} error={errors.schoolName} />
          <Input label="School Email" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
          <Input label="School Phone" required value={form.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} />
          <Input label="Academic Year" required value={form.academicYear} onChange={(e) => set('academicYear', e.target.value)} error={errors.academicYear} />
          <Input label="Address" value={form.address} onChange={(e) => set('address', e.target.value)} />
          <Select label="Theme Preference" value={form.theme} onChange={(e) => set('theme', e.target.value)}>
            <option>Light</option><option>System Default</option>
          </Select>

          <div className="sm:col-span-2">
            <h3 className="mb-2 text-sm font-semibold text-slate-800">Profile</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input label="Name" value={profile.profileName} onChange={(e) => setProfile({ ...profile, profileName: e.target.value })} />
              <Input label="Email" type="email" value={profile.profileEmail} onChange={(e) => setProfile({ ...profile, profileEmail: e.target.value })} error={errors.profileEmail} />
              <Input label="Role" value={profile.profileRole} onChange={(e) => setProfile({ ...profile, profileRole: e.target.value })} />
            </div>
          </div>

          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-semibold text-slate-800">Notification Preferences</legend>
            <div className="flex flex-wrap gap-6 text-sm text-slate-600">
              {[['email', 'Email notifications'], ['push', 'Push notifications'], ['notices', 'Notice announcements']].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2">
                  <input type="checkbox" checked={!!notif[key]} onChange={(e) => setNotif({ ...notif, [key]: e.target.checked })} className="rounded border-slate-300" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex items-center justify-between sm:col-span-2">
            {saved ? <p className="text-sm text-emerald-600" role="status">{saved}</p> : <span />}
            <Button type="submit">Save Settings</Button>
          </div>
        </form>
      </Card>

      <Card title="Data Management">
        <p className="mb-3 text-sm text-slate-600">All data is stored in your browser's local storage. You can reset the application back to the built-in demo dataset.</p>
        <Button variant="danger" onClick={() => setShowReset(true)}>Reset Demo Data</Button>
      </Card>

      <ConfirmDialog
        open={showReset}
        onClose={() => setShowReset(false)}
        onConfirm={() => store.resetData()}
        title="Reset demo data?"
        message="This will erase all current changes and restore the original demo dataset."
        confirmLabel="Reset"
      />
    </div>
  );
}
