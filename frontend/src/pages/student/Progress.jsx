import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { getAllProgress } from '../../services/progressService';

/**
 * Phase 8 + Phase 10 — Learning progress + quiz scores
 */
export default function Progress() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getAllProgress()
      .then((res) => {
        if (active) setItems(res.data.progress || []);
      })
      .catch(() => {
        if (active) setError('Unable to load your progress.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Loading text="Loading your progress..." />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 overflow-x-hidden">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">My Learning Progress</h1>
      <p className="text-stone-600 mb-6">
        Track completed levels, earned XP, certificates, and quiz results for each course.
      </p>

      <ErrorMessage message={error} />

      {items.length === 0 && !error && (
        <Card className="rounded-xl text-center">
          <p className="font-semibold text-stone-900">You haven&apos;t started learning yet.</p>
          <p className="mt-2 text-sm text-stone-600 mb-4">
            Start learning a skill to track your progress.
          </p>
          <Link to="/student/skills">
            <Button>Explore Skills</Button>
          </Link>
        </Card>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.skillId} className="rounded-xl">
            <h2 className="text-xl font-bold text-stone-900">{item.skillName}</h2>
            <p className="mt-2 text-sm text-stone-600">
              {(item.completedLevels || []).length} / 10 Levels Completed
            </p>
            <p className="mt-1 text-2xl font-extrabold text-teal-800">{item.percentage}%</p>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-3 rounded-full bg-teal-700"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-semibold text-stone-700">Status: {item.status}</p>
            <p className="mt-1 text-sm font-semibold text-stone-700">{item.totalXp || 0} XP earned</p>
            {item.quiz && (
              <p className="mt-2 text-sm text-stone-700">
                Quiz: <strong>{item.quiz.percentage}%</strong> ({item.quiz.score}/{item.quiz.total}) —{' '}
                {item.quiz.performance}
              </p>
            )}
            {item.isCourseCompleted && (
              <p className="mt-2 text-sm text-teal-900">
                Congratulations! You completed all 10 levels and earned your certificate.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to={`/student/skills/${item.skillId}`}>
                <Button>{item.isCourseCompleted ? 'Review Course' : 'Continue Learning'}</Button>
              </Link>
              {item.isCourseCompleted && (
                <Link to={`/student/skills/${item.skillId}/certificate`}>
                  <Button variant="outline">View Certificate</Button>
                </Link>
              )}
              {item.isCourseCompleted && (
                <Link to={`/student/skills/${item.skillId}/quiz`}>
                  <Button variant="outline">{item.quiz ? 'Retake Quiz' : 'TAKE QUIZ'}</Button>
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
