import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { getQuizResult } from '../../services/quizService';

/**
 * Phase 10 — Quiz result (student flow)
 */
export default function SkillQuizResult() {
  const { resultId } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuizResult(resultId)
      .then((res) => setResult(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load result.'))
      .finally(() => setLoading(false));
  }, [resultId]);

  if (loading) return <Loading text="Loading quiz result..." />;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <ErrorMessage message={error} />
      {result && (
        <Card className="rounded-xl">
          <h1 className="text-3xl font-bold text-center mb-6">QUIZ COMPLETED</h1>
          <div className="space-y-3 text-center">
            <p className="text-lg">
              Score:{' '}
              <strong>
                {result.score} / {result.total}
              </strong>
            </p>
            <p className="text-lg">
              Percentage: <strong>{result.percentage}%</strong>
            </p>
            <p className="text-lg">
              Performance:{' '}
              <strong className="text-teal-800">{result.performance}</strong>
            </p>
            {(result.course?.name || result.courseName) && (
              <p className="text-sm text-stone-600">
                Skill: {result.course?.name || result.courseName}
              </p>
            )}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/student/progress">
              <Button>VIEW MY PROGRESS</Button>
            </Link>
            <Link to="/student/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
