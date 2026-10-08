import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { loginVolunteer } from '../../services/volunteerService';
import { validateLogin } from '../../utils/validation';

export default function VolunteerLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const v = validateLogin(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      const { data } = await loginVolunteer(form);
      login({
        token: data.token,
        role: data.role,
        user: data.user,
      });
      navigate('/volunteer/dashboard');
    } catch (err) {
      setApiError(
        err.response?.data?.message || 'Invalid volunteer username or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Card title="Volunteer Login" subtitle="Manage community weekend and holiday classes.">
        <ErrorMessage message={apiError} />
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium">Username</label>
            <input
              className="w-full border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
              value={form.username}
              disabled={loading}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            {errors.username && <p className="mt-1 text-xs text-orange-700">{errors.username}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
              value={form.password}
              disabled={loading}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <p className="mt-1 text-xs text-orange-700">{errors.password}</p>}
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in...' : 'LOGIN AS VOLUNTEER'}
          </Button>
        </form>
        <p className="mt-4 text-xs text-stone-500">Demo: volunteer / volunteer123</p>
        <p className="mt-2 text-sm text-stone-600">
          <Link to="/volunteer/register" className="text-teal-800 hover:underline">
            Apply to become a volunteer
          </Link>
        </p>
        <p className="mt-2 text-sm text-stone-600">
          <Link to="/" className="text-teal-800 hover:underline">
            Back to Home
          </Link>
        </p>
      </Card>
    </div>
  );
}
