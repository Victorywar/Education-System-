import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { getRecommendations } from '../../services/studentService';
import { skillNameToId } from '../../data/skills';

/**
 * Phase 5 — Smart Skill Recommendations
 * Scores come from the rule-based engine on the backend.
 */
export default function Recommendations() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [needsAssessment, setNeedsAssessment] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getRecommendations()
      .then((res) => {
        if (active) setData(res.data);
      })
      .catch((err) => {
        if (!active) return;
        const status = err.response?.status;
        const message = err.response?.data?.message;

        if (status === 400 || (message && message.toLowerCase().includes('assessment'))) {
          setNeedsAssessment(true);
          setError(message || 'Please complete your interest assessment first.');
        } else if (status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError('Unable to load recommendations. Please try again.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <Loading text="Analyzing your interests..." />;
  }

  if (needsAssessment) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <Card className="rounded-xl text-center">
          <h1 className="text-2xl font-bold text-stone-900 mb-3">Assessment Required</h1>
          <ErrorMessage message={error} />
          <p className="text-sm text-stone-600 mb-6">
            Complete the interest assessment so we can calculate personalized skill recommendations.
          </p>
          <Button onClick={() => navigate('/student/assessment')}>Take Assessment</Button>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <ErrorMessage message={error || 'Unable to load recommendations. Please try again.'} />
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  const { topRecommendation, recommendations } = data;

  const levelTone = (level) => {
    if (level === 'Strong Match') return 'bg-teal-100 text-teal-900';
    if (level === 'Good Match') return 'bg-lime-100 text-lime-900';
    if (level === 'Possible Match') return 'bg-amber-100 text-amber-900';
    return 'bg-stone-100 text-stone-700';
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 overflow-x-hidden">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 md:text-4xl">
          Your Smart Skill Recommendations
        </h1>
        <p className="mt-2 text-stone-600">
          Based on your interests, these skills may be suitable for you.
        </p>
      </header>

      {topRecommendation && (
        <section className="mb-8 rounded-xl border-2 border-teal-700/30 bg-teal-50/80 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-3">
            Top Recommendation
          </p>
          <h2 className="text-3xl font-extrabold text-stone-900">{topRecommendation.skill}</h2>
          <p className="mt-2 text-2xl font-bold text-teal-800">
            {topRecommendation.percentage}% Match
          </p>
          <p className="mt-1 text-sm text-stone-600">
            Score: {topRecommendation.score}/5
          </p>
          <span
            className={`mt-3 inline-block rounded-md px-2.5 py-1 text-xs font-semibold ${levelTone(
              topRecommendation.level
            )}`}
          >
            {topRecommendation.level}
          </span>
          <div className="mt-5 border-t border-teal-200 pt-4">
            <h3 className="text-sm font-semibold text-stone-800 mb-1">Why this skill?</h3>
            <p className="text-sm leading-relaxed text-stone-700">
              {topRecommendation.explanation}
            </p>
          </div>
          {skillNameToId[topRecommendation.skill] && (
            <div className="mt-5">
              <Link to={`/student/skills/${skillNameToId[topRecommendation.skill]}`}>
                <Button>Start Learning</Button>
              </Link>
            </div>
          )}
        </section>
      )}

      <h2 className="text-xl font-bold text-stone-900 mb-4">All Recommended Skills</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {(recommendations || []).map((rec) => (
          <Card key={rec.skill} className="rounded-xl">
            <h3 className="text-lg font-bold text-stone-900">{rec.skill}</h3>
            <p className="mt-2 text-xl font-extrabold text-teal-800">{rec.percentage}% Match</p>
            <p className="mt-1 text-xs text-stone-500">Score: {rec.score}/5</p>
            <span
              className={`mt-3 inline-block rounded-md px-2.5 py-1 text-xs font-semibold ${levelTone(
                rec.level
              )}`}
            >
              {rec.level}
            </span>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-2 rounded-full bg-teal-700"
                style={{ width: `${rec.percentage}%` }}
              />
            </div>
            {skillNameToId[rec.skill] && (
              <div className="mt-4">
                <Link to={`/student/skills/${skillNameToId[rec.skill]}`}>
                  <Button>Start Learning</Button>
                </Link>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Link to="/student/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
