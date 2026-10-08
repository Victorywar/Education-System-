import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { getSkillById } from '../../data/skills';
import { getQuizBySkill, submitQuizBySkill } from '../../services/quizService';

/**
 * Phase 10 — Skill quiz (wired into learning flow)
 */
export default function SkillQuiz() {
  const { skillId } = useParams();
  const skill = getSkillById(skillId);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!skill) {
      setLoading(false);
      return;
    }
    getQuizBySkill(skillId)
      .then((res) => setQuiz(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load quiz.'))
      .finally(() => setLoading(false));
  }, [skillId, skill]);

  if (!skill) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <Card className="rounded-xl text-center">
          <h1 className="text-2xl font-bold mb-3">Skill not found.</h1>
          <Link to="/student/skills">
            <Button>Back to Skills</Button>
          </Link>
        </Card>
      </div>
    );
  }

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
      const res = await submitQuizBySkill(skillId, ordered);
      navigate(`/student/quiz/result/${res.data.resultId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading text="Loading quiz..." />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{quiz?.courseName || skill.name} Quiz</h1>
      <p className="text-stone-600 mb-6">Answer all {quiz?.total || 0} questions.</p>
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
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting quiz...' : 'Submit Quiz'}
            </Button>
            <Link to={`/student/skills/${skillId}`}>
              <Button type="button" variant="outline">
                Back to Skill
              </Button>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
