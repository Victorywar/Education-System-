import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import { registerStudent } from '../../services/authService';
import { getAuthErrorMessage, validateRegister } from '../../utils/validation';

const initial = {
  name: '',
  age: '',
  className: '',
  school: '',
  location: '',
  language: '',
  guardianContact: '',
  username: '',
  password: '',
  confirmPassword: '',
};

export default function Register() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess('');

    const v = validateRegister(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      const { data } = await registerStudent(form);
      setSuccess(data.message || 'Registration successful');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setApiError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Full Name' },
    { name: 'age', label: 'Age', type: 'number' },
    { name: 'className', label: 'Class' },
    { name: 'school', label: 'School' },
    { name: 'location', label: 'Location' },
    { name: 'language', label: 'Preferred Language' },
    { name: 'guardianContact', label: 'Parent/Guardian Contact' },
    { name: 'username', label: 'Username' },
    { name: 'password', label: 'Password', type: 'password' },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password' },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card title="Create Student Account" subtitle="Start your personalized learning journey.">
        <ErrorMessage message={apiError} />
        {success && (
          <div className="mb-4 border border-teal-300 bg-teal-50 px-4 py-3 text-sm text-teal-900">
            {success}
          </div>
        )}
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
          {fields.map((f) => (
            <div key={f.name}>
              <label className="mb-1 block text-sm font-medium text-stone-700">{f.label}</label>
              <input
                name={f.name}
                type={f.type || 'text'}
                value={form[f.name]}
                onChange={onChange}
                disabled={loading}
                className="w-full border border-stone-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none disabled:opacity-60"
              />
              {errors[f.name] && <p className="mt-1 text-xs text-orange-700">{errors[f.name]}</p>}
            </div>
          ))}
          <div className="sm:col-span-2 flex flex-wrap items-center gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
            <Link to="/login" className="text-sm text-teal-800 hover:underline">
              Already registered? Login
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
