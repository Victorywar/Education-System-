import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { getQuiz, submitQuiz } from '../../services/quizService';

export default function Quiz() {
  const { courseId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getQuiz(courseId)
      .then((res) => setQuiz(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load quiz.'))
      .finally(() => setLoading(false));
  }, [courseId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!quiz) return;
    const ordered = quiz.questions.map((q) => answers[q.index]);
    if (ordered.some((a) => a === undefined || a === null)) {
      setError('Please answer all quiz questions.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitQuiz(courseId, ordered);
      navigate(`/quiz/result/${res.data.resultId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{quiz?.courseName} Quiz</h1>
      <p className="text-stone-600 mb-6">Answer all {quiz?.total} questions.</p>
      <ErrorMessage message={error} />
      {quiz && (
        <form onSubmit={onSubmit} className="space-y-4">
          {quiz.questions.map((q, i) => (
            <Card key={q.index} title={`Q${i + 1}. ${q.question}`}>
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <label key={oi} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name={`q-${q.index}`}
                      checked={answers[q.index] === oi}
                      onChange={() => setAnswers({ ...answers, [q.index]: oi })}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </Card>
          ))}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        </form>
      )}
    </div>
  );
}
