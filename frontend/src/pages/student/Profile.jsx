import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { getStudentProfile } from '../../services/studentService';

/**
 * Phase 3 — Student Profile
 * Data loaded from GET /api/students/profile (JWT-based, no password)
 */
export default function Profile() {
  const [student, setStudent] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getStudentProfile()
      .then((res) => {
        if (active) setStudent(res.data.student);
      })
      .catch(() => {
        if (active) setError('Unable to load your profile. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <Loading text="Loading profile..." />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-stone-900">Student Profile</h1>
      <ErrorMessage message={error} />
      {student && (
        <Card className="rounded-xl">
          <dl className="grid gap-4 sm:grid-cols-2 text-sm">
            {[
              ['Full Name', student.name],
              ['Age', student.age],
              ['Class', student.className],
              ['School', student.school],
              ['Location', student.location],
              ['Preferred Language', student.language],
              ['Parent/Guardian Contact', student.guardianContact],
              ['Username', student.username],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-semibold text-stone-800">{label}</dt>
                <dd className="mt-0.5 text-stone-600 break-words">{value ?? '—'}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6">
            <Link to="/student/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
