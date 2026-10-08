import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../Button';

export default function VolunteerNavbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/volunteer/login');
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition whitespace-nowrap ${
      isActive ? 'text-teal-800' : 'text-stone-700 hover:text-teal-700'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#f7f4ef]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/volunteer/dashboard" className="font-bold tracking-tight text-teal-800 text-lg">
          VOLUNTEER PORTAL
        </Link>
        <nav className="flex flex-wrap items-center gap-3 sm:gap-4">
          <NavLink to="/volunteer/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/volunteer/students" className={linkClass}>
            Students
          </NavLink>
          <NavLink to="/volunteer/classes" className={linkClass}>
            Classes
          </NavLink>
          <NavLink to="/volunteer/materials" className={linkClass}>
            Materials
          </NavLink>
          <NavLink to="/volunteer/classes/add" className={linkClass}>
            Add Class
          </NavLink>
          <NavLink to="/volunteer/materials/add" className={linkClass}>
            Add Material
          </NavLink>
          <span className="hidden text-sm text-stone-500 md:inline">{user?.name}</span>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </nav>
      </div>
    </header>
  );
}
