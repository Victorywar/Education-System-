import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import StatusCard from '../../components/StatusCard';
import { getDashboard } from '../../services/studentService';

/**
 * Phase 3 + Phase 8 dashboard
 */
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getDashboard()
      .then((res) => {
        if (active) setData(res.data);
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

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorMessage message={error} />
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const student = data?.student || {};
  const assessmentDone = !!student.assessmentCompleted;
  const learning = data?.learningProgress;
  const hasProgress = !!learning?.hasProgress;
  const highlight = learning?.highlight;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 md:text-4xl">
          Welcome, {student.name}!
        </h1>
        <p className="mt-2 text-stone-600">
          Discover your interests. Build your skills. Shape your future.
        </p>
      </header>

      {data.daysInactive >= 15 && (
        <div
          role="alert"
          className="mb-6 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
        >
          ⚠️ Inactivity Warning: You haven't been active in the past {data.daysInactive} days.
          Complete a learning module or attend a class to keep your account active.
        </div>
      )}

      <Card className="mb-8 rounded-xl" title="Your Information">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          {[
            ['Name', student.name],
            ['Class', student.className],
            ['School', student.school],
            ['Location', student.location],
            ['Preferred Language', student.language],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="font-semibold text-stone-800">{label}</dt>
              <dd className="mt-0.5 text-stone-600">{value || '—'}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/student/profile">
            <Button variant="outline">View Full Profile</Button>
          </Link>
          <Link to="/student/skills">
            <Button>Explore Skills</Button>
          </Link>
        </div>
      </Card>

      <Card className="mb-8 rounded-xl" title="My Learning Progress">
        {hasProgress && highlight ? (
          <>
            <p className="text-lg font-bold text-stone-900">{highlight.skillName}</p>
            <p className="mt-1 text-2xl font-extrabold text-teal-800">
              {highlight.percentage}% Complete
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-2 rounded-full bg-teal-700"
                style={{ width: `${highlight.percentage}%` }}
              />
            </div>
            <div className="mt-4">
              <Link to="/student/progress">
                <Button>View Progress</Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-stone-600">
              Start learning a skill to track your progress.
            </p>
            <div className="mt-4">
              <Link to="/student/skills">
                <Button>Explore Skills</Button>
              </Link>
            </div>
          </>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Interest Assessment"
          description="Tell us about your interests so we can identify suitable skills for you."
          status={data.assessmentStatus}
          statusTone={assessmentDone ? 'success' : 'warning'}
          buttonLabel={assessmentDone ? 'Retake Assessment' : 'Take Assessment'}
          to="/student/assessment"
        />
        <StatusCard
          title="Smart Recommendation"
          description="Get skill recommendations based on your interests."
          status={data.recommendationStatus}
          statusTone={assessmentDone ? 'success' : 'neutral'}
          buttonLabel="View Recommendations"
          to="/student/recommendations"
        />
        <StatusCard
          title="Weekend / Holiday Learning"
          description="Find skill-development classes available during weekends and holidays."
          status={data.classStatus}
          statusTone={data.classStatus === 'Registered' ? 'success' : 'neutral'}
          buttonLabel={data.classStatus === 'Registered' ? 'View My Classes' : 'View Classes'}
          to={
            data.classStatus === 'Registered'
              ? '/student/classes/my-registrations'
              : '/student/classes'
          }
        />
        <StatusCard
          title="My Progress"
          description="Track your learning module completion."
          status={data.progressStatus}
          statusTone={hasProgress ? 'success' : 'neutral'}
          buttonLabel="View Progress"
          to="/student/progress"
        />
      </div>
    </div>
  );
}
