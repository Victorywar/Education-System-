import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { getStudents } from '../../services/volunteerService';

export default function VolunteerStudents() {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    className: '',
    location: '',
    assessmentStatus: '',
    search: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (params = filters) => {
    setLoading(true);
    setError('');
    try {
      const query = {};
      if (params.className) query.className = params.className;
      if (params.location) query.location = params.location;
      if (params.assessmentStatus) query.assessmentStatus = params.assessmentStatus;
      if (params.search) query.search = params.search;
      const res = await getStudents(query);
      setStudents(res.data.students || []);
    } catch {
      setError('Unable to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 overflow-x-hidden">
      <h1 className="text-3xl font-bold text-stone-900 mb-6">Registered Students</h1>

      <Card className="mb-6 rounded-xl">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            className="border border-stone-300 px-3 py-2 text-sm"
            placeholder="Search by name"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <input
            className="border border-stone-300 px-3 py-2 text-sm"
            placeholder="Class"
            value={filters.className}
            onChange={(e) => setFilters({ ...filters, className: e.target.value })}
          />
          <input
            className="border border-stone-300 px-3 py-2 text-sm"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          />
          <select
            className="border border-stone-300 px-3 py-2 text-sm"
            value={filters.assessmentStatus}
            onChange={(e) => setFilters({ ...filters, assessmentStatus: e.target.value })}
          >
            <option value="">All Assessment Status</option>
            <option value="Completed">Completed</option>
            <option value="Not Completed">Not Completed</option>
          </select>
          <Button onClick={() => load(filters)}>Apply Filters</Button>
        </div>
      </Card>

      <ErrorMessage message={error} />
      {loading ? (
        <Loading text="Loading students..." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white/90">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">School</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Assessment</th>
                <th className="px-4 py-3">Recommended Skill</th>
                <th className="px-4 py-3">Weekend Class</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-stone-100">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3">{s.className}</td>
                  <td className="px-4 py-3">{s.school}</td>
                  <td className="px-4 py-3">{s.location}</td>
                  <td className="px-4 py-3">{s.assessmentStatus}</td>
                  <td className="px-4 py-3">{s.recommendedSkill}</td>
                  <td className="px-4 py-3">{s.classRegistrationStatus}</td>
                  <td className="px-4 py-3">
                    <Link to={`/volunteer/students/${s.id}`}>
                      <Button variant="ghost">VIEW</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && (
            <p className="px-4 py-6 text-stone-500">No students found.</p>
          )}
        </div>
      )}
    </div>
  );
}
