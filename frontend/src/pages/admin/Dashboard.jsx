import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { getAdminStats } from '../../services/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then((response) => setStats(response.data.stats))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load dashboard statistics.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-900">Admin Dashboard</h1>
      <p className="mt-2 text-stone-600">System overview and volunteer management.</p>
      {loading && <Loading text="Loading statistics..." />}
      <ErrorMessage message={error} />
      {stats && (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Total Students', stats.students],
            ['Pending Approvals', stats.pendingVolunteers],
            ['Approved Volunteers', stats.approvedVolunteers],
            ['Active Classes', stats.classes],
            ['Total Volunteers', stats.volunteers],
            ['Learning Materials', stats.materials],
          ].map(([label, value]) => (
            <Card key={label} className="rounded-xl">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</p>
              <p className="mt-2 text-3xl font-extrabold text-teal-800">{value}</p>
            </Card>
          ))}
        </div>
      )}
      {stats && (
        <Link to="/admin/inactive-students" className="mt-4 block">
          <Card className="rounded-xl border-orange-300 bg-orange-50 hover:bg-orange-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-900">
              ⚠️ INACTIVE STUDENTS (30+ DAYS)
            </p>
            <p className="mt-2 text-3xl font-extrabold text-orange-800">{stats.inactiveStudentsCount}</p>
            <p className="mt-1 text-sm text-orange-900">Review and manage inactive student accounts</p>
          </Card>
        </Link>
      )}
      <Card className="mt-8 rounded-xl" title="Quick actions">
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/volunteers"><Button>REVIEW VOLUNTEERS</Button></Link>
          <Link to="/admin/students"><Button variant="outline">VIEW STUDENTS</Button></Link>
          <Link to="/admin/classes"><Button variant="secondary">MANAGE CLASSES</Button></Link>
        </div>
      </Card>
    </div>
  );
}
