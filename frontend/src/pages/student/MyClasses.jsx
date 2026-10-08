import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { getMyRegistrations } from '../../services/classService';

/**
 * Phase 7 — My weekend class registrations
 */
export default function MyClasses() {
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getMyRegistrations()
      .then((res) => {
        if (active) setClasses(res.data.classes || []);
      })
      .catch(() => {
        if (active) setError('Unable to load your registrations. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Loading text="Loading your weekend classes..." />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 overflow-x-hidden">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">My Weekend Classes</h1>
      <p className="text-stone-600 mb-6">
        Classes you have registered for during weekends and holidays.
      </p>

      <ErrorMessage message={error} />

      {classes.length === 0 && !error && (
        <Card className="rounded-xl">
          <p className="text-stone-600 mb-4">You have not registered for any weekend class yet.</p>
          <Link to="/student/classes">
            <Button>Browse Weekend Classes</Button>
          </Link>
        </Card>
      )}

      <div className="space-y-4">
        {classes.map((c) => (
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
              <li className="font-semibold text-teal-800">Status: Registered</li>
            </ul>
            <div className="mt-4">
              <Link to={`/student/classes/${c.id}`}>
                <Button variant="outline">View Details</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Link to="/student/classes">
          <Button variant="ghost">Back to All Classes</Button>
        </Link>
      </div>
    </div>
  );
}
