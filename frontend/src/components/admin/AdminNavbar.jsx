import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../Button';
import { getAdminStats } from '../../services/adminService';

export default function AdminNavbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [inactiveCount, setInactiveCount] = useState(0);
  const linkClass = ({ isActive }) =>
    `whitespace-nowrap text-sm font-medium transition ${
      isActive ? 'text-teal-800' : 'text-stone-700 hover:text-teal-700'
    }`;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  useEffect(() => {
    getAdminStats()
      .then((response) => setInactiveCount(response.data.stats.inactiveStudentsCount || 0))
      .catch((error) => console.error('Unable to load inactive student count:', error.message));
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#f7f4ef]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/admin/dashboard" className="text-lg font-bold tracking-tight text-teal-800">
          ADMIN PORTAL
        </Link>
        <nav className="flex flex-wrap items-center gap-3 sm:gap-4">
          <NavLink to="/admin/dashboard" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/admin/volunteers" className={linkClass}>Volunteer Approvals</NavLink>
          <NavLink to="/admin/students" className={linkClass}>Students</NavLink>
          <NavLink to="/admin/inactive-students" className={linkClass}>
            Inactive Alerts
            {inactiveCount > 0 && (
              <span className="ml-1 rounded-full bg-orange-700 px-2 py-0.5 text-xs font-bold text-white">
                {inactiveCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/admin/classes" className={linkClass}>Classes</NavLink>
          <span className="hidden text-sm text-stone-500 md:inline">{user?.name}</span>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </nav>
      </div>
    </header>
  );
}
