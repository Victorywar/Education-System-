import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { getVolunteerDashboard } from '../../services/volunteerService';

export default function VolunteerDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVolunteerDashboard()
      .then((res) => setStats(res.data.stats))
      .catch(() => setError('Unable to load dashboard. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-900">VOLUNTEER DASHBOARD</h1>
      <p className="mt-2 text-stone-600">Welcome, Volunteer!</p>

      {loading && <Loading text="Loading dashboard..." />}
      <ErrorMessage message={error} />

      {stats && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['REGISTERED STUDENTS', stats.registeredStudents],
            ['AVAILABLE CLASSES', stats.availableClasses],
            ['WEEKEND CLASSES', stats.weekendClasses],
            ['HOLIDAY CLASSES', stats.holidayClasses],
          ].map(([label, value]) => (
            <Card key={label} className="rounded-xl">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</p>
              <p className="mt-2 text-3xl font-extrabold text-teal-800">{value}</p>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-8 rounded-xl" title="QUICK ACTIONS">
        <div className="flex flex-wrap gap-3">
          <Link to="/volunteer/students">
            <Button>VIEW STUDENTS</Button>
          </Link>
          <Link to="/volunteer/classes">
            <Button variant="outline">MANAGE CLASSES</Button>
          </Link>
          <Link to="/volunteer/classes/add">
            <Button variant="secondary">ADD CLASS</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}