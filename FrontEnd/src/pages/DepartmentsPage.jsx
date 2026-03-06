import { useState, useEffect } from 'react';
import { departmentApi } from '../services/api';
import { useToast } from '../hooks/useToast';
import { Toast, Modal, ConfirmDialog, InputField, Badge, Spinner, EmptyState } from '../components/UI';

function DepartmentForm({ initial, onSubmit, onClose, loading }) {
  const [form, setForm] = useState({
    departmentCode: initial?.departmentCode || '',  // ← add this
    departmentName: initial?.departmentName || '',
  });
  const [errors, setErrors] = useState({});
  

  const validate = () => {
    const e = {};
    if (!form.departmentCode.trim()) e.departmentCode = 'Department code is required';
    else if (form.departmentCode.trim().length > 10) e.departmentCode = 'Code must be 10 characters or less';
    if (!form.departmentName.trim()) e.departmentName = 'Department name is required';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    onSubmit(form);
  };

  return (
    <div className="flex flex-col gap-4">
      <InputField
        label="Department Code *"
        placeholder="e.g. HR, IT, FIN"
        value={form.departmentCode}
        maxLength={10}
        disabled={!!initial}  // ← cannot change code after creation
        onChange={(e) => {
          setForm({ ...form, departmentCode: e.target.value.toUpperCase() });
          setErrors({});
        }}
        error={errors.departmentCode}
      />
      {initial && (
        <span className="text-xs text-slate-400 -mt-2">Department code cannot be changed after creation</span>
      )}

      <InputField
        label="Department Name *"
        placeholder="e.g. Human Resources"
        value={form.departmentName}
        onChange={(e) => {
          setForm({ ...form, departmentName: e.target.value });
          setErrors({});
        }}
        error={errors.departmentName}
      />

      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : initial ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  );
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const { toasts, addToast, removeToast } = useToast();
  const [reactivateTarget, setReactivateTarget] = useState(null);
const [pendingForm, setPendingForm] = useState(null);

  const fetchDepartments = async () => {
    setLoading(true);
    const res = await departmentApi.getAll();
    if (res.success) setDepartments(res.data);
    else addToast(res.error, 'error');
    setLoading(false);
  };

  useEffect(() => { fetchDepartments(); }, []);

  const openCreate = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (dept) => { setEditTarget(dept); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const handleCreate = async (form) => {
    setFormLoading(true);
    const res = await departmentApi.create(form);

    if (res.success) {
        addToast('Department created successfully');
        closeModal();
        fetchDepartments();
    } else if (res.data?.inactiveFound) {
        // Inactive department found — ask user to confirm reactivation
        setReactivateTarget(res.data.inactiveFound);
        setPendingForm(form);
        closeModal();
    } else {
        addToast(res.error, 'error');
    }
    setFormLoading(false);
};

const handleReactivate = async () => {
    const res = await departmentApi.reactivate(reactivateTarget.departmentId, pendingForm);
    if (res.success) {
        addToast('Department reactivated successfully');
        fetchDepartments();
    } else {
        addToast(res.error, 'error');
    }
    setReactivateTarget(null);
    setPendingForm(null);
};
  const handleUpdate = async (form) => {
    setFormLoading(true);
    const res = await departmentApi.update({
      departmentId: editTarget.departmentId,
      departmentCode: editTarget.departmentCode,
      departmentName: form.departmentName,
    });
    if (res.success) {
      addToast('Department updated successfully');
      closeModal();
      fetchDepartments();
    } else {
      addToast(res.error, 'error');
    }
    setFormLoading(false);
  };

  const handleDelete = async () => {
    const res = await departmentApi.delete(deleteTarget.departmentId);
    if (res.success) {
        addToast('Department deleted successfully');
        fetchDepartments();
    } else {
        addToast(res.error, 'error');
    }
    setDeleteTarget(null);
};

  const filtered = departments.filter((d) =>
    d.departmentName.toLowerCase().includes(search.toLowerCase()) ||
    d.departmentCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Departments</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your organization's departments</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <span className="text-lg leading-none">+</span> Add Department
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Departments', value: departments.length, icon: '🏢' },
          { label: 'Active', value: departments.length, icon: '✅' },
          { label: 'Last Added', value: departments.at(-1)?.departmentCode || '—', icon: '🆕' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <div className="text-2xl">{s.icon}</div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search departments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department Name</th>
              <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4}><Spinner /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4}><EmptyState icon="🏢" title="No departments found" description="Add your first department to get started" /></td></tr>
            ) : (
              filtered.map((dept, i) => (
                <tr key={dept.departmentId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-400">{i + 1}</td>
                  <td className="px-6 py-4">
                    <Badge color="blue">{dept.departmentCode}</Badge>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">{dept.departmentName}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(dept)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(dept)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editTarget ? 'Edit Department' : 'New Department'}
      >
        <DepartmentForm
          initial={editTarget}
          onSubmit={editTarget ? handleUpdate : handleCreate}
          onClose={closeModal}
          loading={formLoading}
        />
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={`Are you sure you want to delete "${deleteTarget?.departmentName}"? This cannot be undone.`}
      />

      <ConfirmDialog
        isOpen={!!reactivateTarget}
        onClose={() => { setReactivateTarget(null); setPendingForm(null); }}
        onConfirm={handleReactivate}
        message={`'${reactivateTarget?.departmentName}' (${reactivateTarget?.departmentCode}) already exists but is inactive. Would you like to reactivate it?`}
        confirmText="Yes"
        confirmColor="blue"
        icon="✓"
      />
    </div>
  );
}