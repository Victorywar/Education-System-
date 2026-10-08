import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { getClasses } from '../../services/classService';

/**
 * Phase 7 + Phase 10 — Weekend & Holiday Learning list with filters
 */
export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ skill: '', day: '', location: '' });

  useEffect(() => {
    let active = true;
    getClasses()
      .then((res) => {
        if (active) setClasses(res.data.classes || []);
      })
      .catch(() => {
        if (active) setError('Unable to load classes. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return classes.filter((c) => {
      if (filters.skill && c.skill !== filters.skill) return false;
      if (filters.day && c.day !== filters.day) return false;
      if (
        filters.location &&
        !String(c.location || '')
          .toLowerCase()
          .includes(filters.location.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [classes, filters]);

  const skills = [...new Set(classes.map((c) => c.skill))].sort();

  if (loading) return <Loading text="Loading weekend classes..." />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 overflow-x-hidden">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-stone-900 md:text-4xl">
          Weekend & Holiday Learning
        </h1>
        <p className="mt-2 text-stone-600">
          Learn new skills through community classes conducted on weekends and holidays.
        </p>
      </header>

      <div className="mb-6 rounded-xl border border-teal-200 bg-teal-50/80 px-5 py-4">
        <h2 className="font-bold text-teal-900">ACCESSIBILITY</h2>
        <p className="mt-1 text-sm text-stone-700">
          The system is designed to be accessed through shared devices at community centres when
          students do not have personal devices. Teachers and volunteers can help students register
          and learn.
        </p>
      </div>

      <div className="mb-6">
        <Link to="/student/classes/my-registrations">
          <Button variant="outline">My Weekend Classes</Button>
        </Link>
      </div>

      <Card className="mb-6 rounded-xl">
        <div className="grid gap-3 sm:grid-cols-3">
          <select
            className="border border-stone-300 px-3 py-2 text-sm"
            value={filters.skill}
            onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
          >
            <option value="">All Skills</option>
            {skills.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="border border-stone-300 px-3 py-2 text-sm"
            value={filters.day}
            onChange={(e) => setFilters({ ...filters, day: e.target.value })}
          >
            <option value="">All Days</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
            <option value="Holiday">Holiday</option>
          </select>
          <input
            className="border border-stone-300 px-3 py-2 text-sm"
            placeholder="Filter by location"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          />
        </div>
      </Card>

      <ErrorMessage message={error} />

      {!error && filtered.length === 0 && (
        <Card className="rounded-xl text-center">
          <p className="font-semibold text-stone-900">No weekend classes match your filters.</p>
          <p className="mt-2 text-sm text-stone-600">Try clearing filters or check again later.</p>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((c) => (
          <Card key={c.id} className="rounded-xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">{c.skill}</p>
            <h2 className="mt-1 text-xl font-bold text-stone-900">{c.title}</h2>
            <ul className="mt-3 space-y-1 text-sm text-stone-600">
              <li>
                {c.day}, {c.displayDate}
              </li>
              <li>
                {c.startTime} – {c.endTime}
              </li>
              <li>{c.location}</li>
              <li>Facilitator: {c.facilitator}</li>
              <li className="font-semibold text-teal-800">
                Available Seats: {c.availableSeats}
              </li>
              <li>
                Status:{' '}
                <span className="font-semibold">
                  {c.isRegistered ? 'Registered' : c.status}
                </span>
              </li>
            </ul>
            <div className="mt-4">
              <Link to={`/student/classes/${c.id}`}>
                <Button>View Details</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
