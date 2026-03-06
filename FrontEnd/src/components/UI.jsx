// Toast Notification
export function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300
            ${t.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}
        >
          <span>{t.type === 'success' ? '✓' : '✕'}</span>
          <span>{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="ml-2 opacity-70 hover:opacity-100">✕</button>
        </div>
      ))}
    </div>
  );
}

// Modal
export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-light">✕</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

//Confirm Dialog
export function ConfirmDialog({ isOpen, onClose, onConfirm, message, confirmText = 'Delete', confirmColor = 'red', icon = '!' }) {
  if (!isOpen) return null;
  const iconBgColor = confirmColor === 'red' ? 'bg-red-100' : 'bg-blue-100';
  const iconTextColor = confirmColor === 'red' ? 'text-red-500' : 'text-blue-500';
  const buttonBgColor = confirmColor === 'red' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="text-center">
          <div className={`w-12 h-12 ${iconBgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <span className={`${iconTextColor} text-xl`}>{icon}</span>
          </div>
          <p className="text-slate-700 mb-6">{message}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onClose} className="px-5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm} className={`px-5 py-2 rounded-lg ${buttonBgColor} text-white transition-colors`}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Input Field
export function InputField({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-600">{label}</label>
      <input
        className={`px-3 py-2.5 rounded-lg border text-sm text-slate-800 outline-none transition-all
          focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
          ${error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

// Select Field
export function SelectField({ label, error, children, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-600">{label}</label>
      <select
        className={`px-3 py-2.5 rounded-lg border text-sm text-slate-800 outline-none transition-all bg-slate-50
          focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
          ${error ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

// Badge
export function Badge({ children, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    purple: 'bg-violet-50 text-violet-700 border-violet-100',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
}

// Spinner
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
}

// Empty State
export function EmptyState({ title, description, icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-slate-700 font-semibold mb-1">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}