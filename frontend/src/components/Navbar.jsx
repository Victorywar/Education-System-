import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

export default function Navbar() {
  const { isAuthenticated, role, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition whitespace-nowrap ${
      isActive ? 'text-teal-800' : 'text-stone-700 hover:text-teal-700'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#f7f4ef]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="font-bold tracking-tight text-teal-800 text-lg">
          SMART COMMUNITY EDUCATION
        </Link>
        <nav className="flex flex-wrap items-center gap-3 sm:gap-4">
          {!isAuthenticated && (
            <>
              <NavLink to="/login" className={linkClass}>
                Student Login
              </NavLink>
              <NavLink to="/volunteer/login" className={linkClass}>
                Volunteer
              </NavLink>
              <NavLink to="/admin/login" className={linkClass}>
                Admin
              </NavLink>
              <Button onClick={() => navigate('/register')}>Get Started</Button>
            </>
          )}
          {isAuthenticated && role === 'student' && (
            <>
              <NavLink to="/student/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/student/profile" className={linkClass}>
                Profile
              </NavLink>
              <NavLink to="/student/assessment" className={linkClass}>
                Assessment
              </NavLink>
              <NavLink to="/student/recommendations" className={linkClass}>
                Recommendations
              </NavLink>
              <NavLink to="/student/skills" className={linkClass}>
                Skills
              </NavLink>
              <NavLink to="/student/classes" className={linkClass}>
                Classes
              </NavLink>
              <NavLink to="/student/progress" className={linkClass}>
                Progress
              </NavLink>
              <span className="hidden text-sm text-stone-500 md:inline">{user?.name}</span>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
          {isAuthenticated && role === 'volunteer' && (
            <>
              <NavLink to="/volunteer/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/volunteer/students" className={linkClass}>
                Students
              </NavLink>
              <NavLink to="/volunteer/classes" className={linkClass}>
                Classes
              </NavLink>
              <span className="hidden text-sm text-stone-500 md:inline">{user?.name}</span>
              <Button
                variant="outline"
                onClick={() => {
                  logout();
                  navigate('/volunteer/login');
                }}
              >
                Logout
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
