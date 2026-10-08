import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { getStudentDetails } from '../../services/volunteerService';

export default function VolunteerStudentDetails() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentDetails(id)
      .then((res) => setStudent(res.data.student))
      .catch(() => setError('Unable to load student details. Please try again.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-900 mb-6">Student Details</h1>
      {loading && <Loading text="Loading student..." />}
      <ErrorMessage message={error} />
      {student && (
        <Card className="rounded-xl">
          <dl className="grid gap-4 sm:grid-cols-2 text-sm">
            {[
              ['Name', student.name],
              ['Class', student.className],
              ['School', student.school],
              ['Location', student.location],
              ['Assessment', student.assessmentStatus],
              ['Recommended Skill', student.recommendedSkill],
              ['Weekend Class', student.classRegistrationStatus],
              ['Registered Class', student.registeredClass || '—'],
              ['Latest Quiz Score', student.latestQuizScore ?? 'Not available'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-semibold text-stone-800">{k}</dt>
                <dd className="text-stone-600">{v}</dd>
              </div>
            ))}
          </dl>

          <h3 className="mt-6 font-bold text-stone-900">Basic Progress</h3>
          {student.progress?.length ? (
            <ul className="mt-2 space-y-2 text-sm text-stone-700">
              {student.progress.map((p) => (
                <li key={p.skillId}>
                  {p.skillName}: {p.completedModules}/{p.totalModules} ({p.percentage}%)
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-stone-500">No learning progress yet.</p>
          )}

          <div className="mt-6">
            <Link to="/volunteer/students">
              <Button variant="outline">Back to Students</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
