import { useState, useEffect } from 'react';
import { employeeApi, departmentApi } from '../services/api';
import { useToast } from '../hooks/useToast';
import { Toast, Modal, ConfirmDialog, InputField, SelectField, Badge, Spinner, EmptyState } from '../components/UI';

// Age Calculator
function calculateAge(dob) {
  if (!dob) return '';
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  if (birth > new Date(today.getFullYear(), today.getMonth(), today.getDate())) age--;
  return age;
}

// Validate Email
function isValidEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

// Form
function EmployeeForm({ initial, departments, onSubmit, onClose, loading }) {
  const [form, setForm] = useState({
    firstName: initial?.firstName || '',
    lastName: initial?.lastName || '',
    email: initial?.email || '',
    dateOfBirth: initial?.dateOfBirth ? initial.dateOfBirth.split('T')[0] : '',
    salary: initial?.salary || '',
    departmentId: initial?.departmentId || '',
  });
  const [errors, setErrors] = useState({});

  const age = calculateAge(form.dateOfBirth);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!isValidEmail(form.email)) e.email = 'Enter a valid email address';
    if (!form.dateOfBirth) e.dateOfBirth = 'Date of birth is required';
    else if (calculateAge(form.dateOfBirth) < 18) e.dateOfBirth = 'Employee must be at least 18 years old';
    if (!form.salary) e.salary = 'Salary is required';
    else if (isNaN(form.salary) || Number(form.salary) < 0) e.salary = 'Enter a valid salary amount';
    if (!form.departmentId) e.departmentId = 'Department is required';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    onSubmit({ ...form, salary: parseFloat(form.salary), departmentId: parseInt(form.departmentId) });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <InputField label="First Name *" placeholder="John" value={form.firstName}
          onChange={(e) => set('firstName', e.target.value)} error={errors.firstName} />
        <InputField label="Last Name *" placeholder="Doe" value={form.lastName}
          onChange={(e) => set('lastName', e.target.value)} error={errors.lastName} />
      </div>

      <InputField label="Email Address *" type="email" placeholder="john@example.com"
        value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <InputField label="Date of Birth *" type="date" value={form.dateOfBirth}
            onChange={(e) => set('dateOfBirth', e.target.value)} error={errors.dateOfBirth} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Age (Auto-calculated)</label>
          <div className={`px-3 py-2.5 rounded-lg border text-sm font-semibold
            ${age >= 18 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : age ? 'bg-red-50 border-red-200 text-red-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
            {age ? `${age} years old` : '—'}
          </div>
        </div>
      </div>

      <InputField label="Salary (LKR) *" type="number" placeholder="50000" min="0"
        value={form.salary} onChange={(e) => set('salary', e.target.value)} error={errors.salary} />

      <SelectField label="Department *" value={form.departmentId}
        onChange={(e) => set('departmentId', e.target.value)} error={errors.departmentId}>
        <option value="">Select department</option>
        {departments.map((d) => (
          <option key={d.departmentId} value={d.departmentId}>
            {d.departmentCode} — {d.departmentName}
          </option>
        ))}
      </SelectField>

      <div className="flex gap-3 pt-2">
        <button onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
          {loading ? 'Saving...' : initial ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  );
}

// Page
export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const { toasts, addToast, removeToast } = useToast();

  const fetchAll = async () => {
    setLoading(true);
    const [empRes, deptRes] = await Promise.all([employeeApi.getAll(), departmentApi.getAll()]);
    if (empRes.success) setEmployees(empRes.data);
    if (deptRes.success) setDepartments(deptRes.data);
    if (!empRes.success) addToast(empRes.error, 'error');
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (emp) => { setEditTarget(emp); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const handleCreate = async (form) => {
    setFormLoading(true);
    const res = await employeeApi.create(form);
    if (res.success) { addToast('Employee created successfully'); closeModal(); fetchAll(); }
    else addToast(res.error, 'error');
    setFormLoading(false);
  };

  const handleUpdate = async (form) => {
    setFormLoading(true);
    const res = await employeeApi.update({ ...form, employeeId: editTarget.employeeId });
    if (res.success) { addToast('Employee updated successfully'); closeModal(); fetchAll(); }
    else addToast(res.error, 'error');
    setFormLoading(false);
  };

  const handleDelete = async () => {
    const res = await employeeApi.delete(deleteTarget.employeeId);
    if (res.success) { addToast('Employee deleted successfully'); fetchAll(); }
    else addToast(res.error, 'error');
    setDeleteTarget(null);
  };

  const filtered = employees.filter((e) => {
    const matchSearch =
      e.firstName.toLowerCase().includes(search.toLowerCase()) ||
      e.lastName.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept ? e.departmentId === parseInt(filterDept) : true;
    return matchSearch && matchDept;
  });

  const formatSalary = (val) =>
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your organization's workforce</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <span className="text-lg leading-none">+</span> Add Employee
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Employees', value: employees.length, icon: '👥' },
          { label: 'Departments', value: departments.length, icon: '🏢' },
          { label: 'Avg. Age', value: employees.length ? Math.round(employees.reduce((s, e) => s + e.age, 0) / employees.length) + ' yrs' : '—', icon: '🎂' },
          { label: 'Avg. Salary', value: employees.length ? formatSalary(employees.reduce((s, e) => s + e.salary, 0) / employees.length) : '—', icon: '💰' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <div className="text-2xl">{s.icon}</div>
            <div>
              <p className="text-xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input type="text" placeholder="Search by name or email..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['#', 'Name', 'Email', 'Age', 'Department', 'Salary', 'Actions'].map((h) => (
                <th key={h} className={`px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}><Spinner /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7}><EmptyState icon="👥" title="No employees found" description="Add your first employee to get started" /></td></tr>
            ) : (
              filtered.map((emp, i) => (
                <tr key={emp.employeeId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 text-slate-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{emp.firstName} {emp.lastName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-500">{emp.email}</td>
                  <td className="px-4 py-4">
                    <Badge color="purple">{emp.age} yrs</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-slate-700 font-medium">{emp.departmentName}</span>
                      <span className="text-xs text-slate-400">{emp.departmentCode}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-800">{formatSalary(emp.salary)}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(emp)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        Edit
                      </button>
                      <button onClick={() => setDeleteTarget(emp)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">
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

      {/* Result count */}
      {!loading && (
        <p className="text-xs text-slate-400 mt-3">
          Showing {filtered.length} of {employees.length} employees
        </p>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editTarget ? 'Edit Employee' : 'New Employee'}>
        <EmployeeForm
          initial={editTarget}
          departments={departments}
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
        message={`Are you sure you want to delete "${deleteTarget?.firstName} ${deleteTarget?.lastName}"? This cannot be undone.`}
      />
    </div>
  );
}