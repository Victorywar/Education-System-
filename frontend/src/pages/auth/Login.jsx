import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { loginStudent } from '../../services/authService';
import { getAuthErrorMessage, validateLogin } from '../../utils/validation';

export default function Login() {
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
      const { data } = await loginStudent(form);
      login({
        token: data.token,
        role: data.role,
        user: data.user,
      });
      navigate('/student/dashboard');
    } catch (err) {
      setApiError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Card title="Student Login" subtitle="Continue your learning journey.">
        <ErrorMessage message={apiError} />
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium">Username</label>
            <input
              className="w-full border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none disabled:opacity-60"
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
              className="w-full border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none disabled:opacity-60"
              value={form.password}
              disabled={loading}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <p className="mt-1 text-xs text-orange-700">{errors.password}</p>}
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in...' : 'Login'}
          </Button>
        </form>
        <p className="mt-4 text-sm text-stone-600">
          New student?{' '}
          <Link to="/register" className="text-teal-800 hover:underline">
            Register here
          </Link>
        </p>
      </Card>
    </div>
  );
}
