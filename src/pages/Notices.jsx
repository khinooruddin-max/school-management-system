import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, Megaphone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Button, Badge, Modal, ConfirmDialog, SearchBar, Select, Input, Textarea, EmptyState, Table, Th, Td, statusColor } from '../components/ui';
import { required, formatDate, todayStr } from '../utils/helpers';

const emptyForm = { title: '', description: '', date: todayStr(), author: 'Admin Office', priority: 'Normal', status: 'Published' };

export default function Notices() {
  const store = useStore();
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return [...store.notices]
      .filter((n) => (n.title.toLowerCase().includes(term) || n.description.toLowerCase().includes(term)) && (!priorityFilter || n.priority === priorityFilter))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [store.notices, search, priorityFilter]);

  const openAdd = () => { setForm(emptyForm); setErrors({}); setModal({ mode: 'add' }); };
  const openEdit = (n) => { setForm({ ...n }); setErrors({}); setModal({ mode: 'edit', notice: n }); };

  const save = (e) => {
    e.preventDefault();
    const errs = {};
    if (!required(form.title)) errs.title = 'Title is required';
    if (!required(form.description)) errs.description = 'Description is required';
    if (!required(form.date)) errs.date = 'Date is required';
    if (!required(form.author)) errs.author = 'Author is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (modal.mode === 'add') store.addItem('notices', form);
    else store.updateItem('notices', { ...modal.notice, ...form });
    setModal(null);
  };

  const togglePublish = (n) => {
    store.updateItem('notices', { ...n, status: n.status === 'Published' ? 'Draft' : 'Published' });
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search notices..." /></div>
        <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} aria-label="Filter by priority">
          <option value="">All priorities</option>
          <option>Normal</option><option>Important</option><option>Urgent</option>
        </Select>
        <Button onClick={openAdd}><Plus className="h-4 w-4" /> New Notice</Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <EmptyState title="No notices found" message="Create a notice to announce something to the school." />
        ) : (
          <Table>
            <thead><tr><Th>Title</Th><Th>Author</Th><Th>Date</Th><Th>Priority</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50">
                  <Td><p className="font-medium text-slate-900">{n.title}</p></Td>
                  <Td>{n.author}</Td>
                  <Td>{formatDate(n.date)}</Td>
                  <Td><Badge color={statusColor(n.priority)}>{n.priority}</Badge></Td>
                  <Td><Badge color={statusColor(n.status)}>{n.status}</Badge></Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" aria-label="View notice" onClick={() => setModal({ mode: 'view', notice: n })}><Eye className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" aria-label="Edit notice" onClick={() => openEdit(n)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="secondary" onClick={() => togglePublish(n)}>{n.status === 'Published' ? 'Unpublish' : 'Publish'}</Button>
                      <Button size="sm" variant="ghost" aria-label="Delete notice" onClick={() => setToDelete(n)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <Modal open={modal?.mode === 'add' || modal?.mode === 'edit'} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Edit Notice' : 'Create Notice'} wide>
        <form onSubmit={save} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Title" required value={form.title} onChange={(e) => set('title', e.target.value)} error={errors.title} />
          <Input label="Author" required value={form.author} onChange={(e) => set('author', e.target.value)} error={errors.author} />
          <Input type="date" label="Date" required value={form.date} onChange={(e) => set('date', e.target.value)} error={errors.date} />
          <Select label="Priority" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
            <option>Normal</option><option>Important</option><option>Urgent</option>
          </Select>
          <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option>Published</option><option>Draft</option>
          </Select>
          <div className="sm:col-span-2">
            <Textarea label="Description" required value={form.description} onChange={(e) => set('description', e.target.value)} error={errors.description} />
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit"><Megaphone className="h-4 w-4" /> Save Notice</Button>
          </div>
        </form>
      </Modal>

      <Modal open={modal?.mode === 'view'} onClose={() => setModal(null)} title={modal?.notice?.title ?? 'Notice'}>
        {modal?.mode === 'view' && (
          <div className="space-y-2 text-sm">
            <div className="flex gap-2"><Badge color={statusColor(modal.notice.priority)}>{modal.notice.priority}</Badge><Badge color={statusColor(modal.notice.status)}>{modal.notice.status}</Badge></div>
            <p className="whitespace-pre-wrap text-slate-700">{modal.notice.description}</p>
            <p className="text-xs text-slate-400">By {modal.notice.author} · {formatDate(modal.notice.date)}</p>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => store.removeItem('notices', toDelete.id)} message={`Delete notice "${toDelete?.title}"?`} />
    </div>
  );
}
