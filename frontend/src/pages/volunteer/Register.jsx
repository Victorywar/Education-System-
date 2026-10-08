import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import { registerVolunteer } from '../../services/volunteerService';
import { SKILLS } from '../../utils/constants';

const initialForm = {
  name: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  skills: [],
};

export default function VolunteerRegister() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSkillChange = (skill) => {
    setForm((current) => ({
      ...current,
      skills: current.skills.includes(skill)
        ? current.skills.filter((item) => item !== skill)
        : [...current.skills, skill],
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.skills.length === 0) {
      setError('Select at least one skill.');
      return;
    }
    setSubmitting(true);
    try {
      await registerVolunteer(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit your application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <Card className="rounded-xl border-teal-200" title="Application received">
          <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
            <h2 className="font-bold text-amber-900">Pending Approval</h2>
            <p className="mt-1 text-sm text-amber-900">
              Your volunteer application has been submitted and is under admin review. You can sign in after it is approved.
            </p>
          </div>
          <Link to="/volunteer/login" className="mt-4 inline-block text-sm font-medium text-teal-800 hover:underline">
            Return to volunteer login
          </Link>
        </Card>
      </div>
    );
  }

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card title="Volunteer Registration" subtitle="Submit your details for administrator approval.">
        <ErrorMessage message={error} />
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          {[
            ['name', 'Full name', 'text'],
            ['username', 'Username', 'text'],
            ['email', 'Email', 'email'],
            ['phone', 'Phone', 'tel'],
            ['password', 'Password (minimum 6 characters)', 'password'],
          ].map(([name, label, type]) => (
            <div key={name}>
              <label htmlFor={name} className="mb-1 block text-sm font-medium">{label}</label>
              <input
                id={name}
                name={name}
                type={type}
                required
                minLength={name === 'password' ? 6 : undefined}
                autoComplete={name === 'password' ? 'new-password' : name}
                value={form[name]}
                onChange={update}
                className="w-full border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
          ))}
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-medium">Skills you can teach</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {SKILLS.map((skill) => (
                <label key={skill} className="flex items-center gap-2 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    checked={form.skills.includes(skill)}
                    onChange={() => onSkillChange(skill)}
                  />
                  {skill}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap items-center gap-3 pt-2 sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'SUBMIT APPLICATION'}
            </Button>
            <Link to="/volunteer/login" className="text-sm text-teal-800 hover:underline">Already registered? Sign in</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
