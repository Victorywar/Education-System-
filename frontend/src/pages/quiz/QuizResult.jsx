import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { getQuizResult } from '../../services/quizService';

export default function QuizResult() {
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

  if (loading) return <Loading />;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <ErrorMessage message={error} />
      {result && (
        <Card>
          <h1 className="text-3xl font-bold text-center mb-6">QUIZ COMPLETED</h1>
          <div className="space-y-3 text-center">
            <p className="text-lg">Score: <strong>{result.score} / {result.total}</strong></p>
            <p className="text-lg">Percentage: <strong>{result.percentage}%</strong></p>
            <p className="text-lg">Performance: <strong className="text-teal-800">{result.performance}</strong></p>
            {result.course?.name && (
              <p className="text-sm text-stone-600">Course: {result.course.name}</p>
            )}
          </div>
          <div className="mt-8 text-center">
            <Link to="/student/progress"><Button>VIEW MY PROGRESS</Button></Link>
          </div>
        </Card>
      )}
    </div>
  );
}
