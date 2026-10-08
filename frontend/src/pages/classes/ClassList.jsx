import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { getClasses, registerForClass } from '../../services/classService';
import { DAYS, SKILLS } from '../../utils/constants';

export default function ClassList() {
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState({ skill: '', day: '', location: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registeredCourseId, setRegisteredCourseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(null);

  const load = async (params = filters) => {
    setLoading(true);
    setError('');
    try {
      const query = {};
      if (params.skill) query.skill = params.skill;
      if (params.day) query.day = params.day;
      if (params.location) query.location = params.location;
      const res = await getClasses(query);
      setClasses(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load classes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRegister = async (classId) => {
    setError('');
    setSuccess('');
    setRegistering(classId);
    try {
      const res = await registerForClass(classId);
      setSuccess(res.data.message);
      setRegisteredCourseId(res.data.courseId);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setRegistering(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Weekend / Holiday Community Classes</h1>
      <p className="text-stone-600 mb-6">Register for skill sessions at community centres.</p>

      <div className="mb-6 border border-teal-200 bg-teal-50/80 px-5 py-4">
        <h2 className="font-bold text-teal-900">NO PERSONAL DEVICE? NO PROBLEM.</h2>
        <p className="mt-1 text-sm text-stone-700">
          Students who do not own a personal smartphone or computer can use the system with the
          assistance of teachers or volunteers at participating community centres.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <select
          className="border border-stone-300 px-3 py-2 text-sm"
          value={filters.skill}
          onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
        >
          <option value="">All Skills</option>
          {SKILLS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          className="border border-stone-300 px-3 py-2 text-sm"
          value={filters.day}
          onChange={(e) => setFilters({ ...filters, day: e.target.value })}
        >
          <option value="">All Days</option>
          {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <input
          className="border border-stone-300 px-3 py-2 text-sm"
          placeholder="Location / Centre"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
        <Button onClick={() => load(filters)}>Apply Filters</Button>
      </div>

      <ErrorMessage message={error} />
      {success && (
        <div className="mb-4 border border-teal-300 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          {success}
          {registeredCourseId && (
            <div className="mt-2">
              <Link to={`/learning/${registeredCourseId}`}><Button>START LEARNING</Button></Link>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <Loading />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <Card key={c._id}>
              <h3 className="text-xl font-bold uppercase text-stone-900">{c.skill}</h3>
              <ul className="mt-3 space-y-1 text-sm text-stone-600">
                <li>{c.day}</li>
                <li>{c.date}</li>
                <li>{c.time}</li>
                <li>{c.communityCentre}</li>
                <li>Location: {c.location}</li>
                <li>Volunteer: {c.volunteerName}</li>
                <li className="font-semibold text-teal-800">Seats Available: {c.availableSeats}</li>
              </ul>
              <div className="mt-4 flex gap-2">
                <Button
                  disabled={c.availableSeats <= 0 || registering === c._id}
                  onClick={() => onRegister(c._id)}
                >
                  {registering === c._id ? 'Registering...' : 'REGISTER'}
                </Button>
                <Link to={`/classes/${c._id}`}><Button variant="ghost">Details</Button></Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
