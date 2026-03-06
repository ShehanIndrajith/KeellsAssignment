import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
    }`;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">K</span>
          </div>
          <div>
            <h1 className="text-slate-800 font-semibold text-sm leading-none">Keells</h1>
            <p className="text-slate-400 text-xs">HR Management</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          <NavLink to="/departments" className={linkClass}>
            🏢 Departments
          </NavLink>
          <NavLink to="/employees" className={linkClass}>
            👥 Employees
          </NavLink>
        </nav>
      </div>
    </header>
  );
}