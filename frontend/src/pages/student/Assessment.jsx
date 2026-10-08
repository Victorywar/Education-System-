import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import {
  getAssessment,
  getAssessmentQuestions,
  submitAssessment,
} from '../../services/studentService';

/**
 * Phase 4 — Interest Assessment (wizard)
 * Saves answers only — no recommendation calculation.
 */
export default function Assessment() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // answers[questionId] = { answer, category }
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [qRes, aRes] = await Promise.all([getAssessmentQuestions(), getAssessment()]);
        if (!active) return;

        setQuestions(qRes.data.questions || []);

        const saved = aRes.data?.assessment?.answers;
        if (Array.isArray(saved) && saved.length) {
          const prefill = {};
          saved.forEach((item) => {
            prefill[item.questionId] = {
              answer: item.answer,
              category: item.category,
            };
          });
          setAnswers(prefill);
        }
      } catch (err) {
        if (!active) return;
        if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError('Unable to load the assessment. Please try again.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const total = questions.length || 5;
  const current = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / total) * 100;
  const isLast = currentIndex === total - 1;

  const selectOption = (optionText, category) => {
    if (!current) return;
    setError('');
    setAnswers((prev) => ({
      ...prev,
      [current.questionId]: { answer: optionText, category },
    }));
  };

  // Map option text → category using fixed Phase 4 mapping
  const getCategoryForOption = (questionId, optionText) => {
    const maps = {
      1: {
        'Working with numbers': 'Abacus',
        'Using computers': 'Coding',
        'Speaking with others': 'Communication Skills',
        'Solving puzzles': 'Logical Reasoning',
      },
      2: {
        Abacus: 'Abacus',
        Coding: 'Coding',
        'Communication Skills': 'Communication Skills',
        'Logical Reasoning': 'Logical Reasoning',
      },
      3: {
        Mathematics: 'Abacus',
        'Computer Science': 'Coding',
        English: 'Communication Skills',
        'General Knowledge': 'Logical Reasoning',
      },
      4: {
        Calculations: 'Abacus',
        'Computer activities': 'Coding',
        Speaking: 'Communication Skills',
        'Problem solving': 'Logical Reasoning',
      },
      5: {
        'Numerical ability': 'Abacus',
        'Computer skills': 'Coding',
        Communication: 'Communication Skills',
        'Logical thinking': 'Logical Reasoning',
      },
    };
    return maps[questionId]?.[optionText] || '';
  };

  const goNext = () => {
    setError('');
    if (!answers[current.questionId]) {
      setError('Please select an option before continuing.');
      return;
    }
    if (!isLast) setCurrentIndex((i) => i + 1);
  };

  const goBack = () => {
    setError('');
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    const payload = [];
    for (let id = 1; id <= 5; id += 1) {
      if (!answers[id]?.answer || !answers[id]?.category) {
        setError('Please answer all questions before submitting.');
        // Jump to first unanswered
        const firstMissing = [1, 2, 3, 4, 5].find((qid) => !answers[qid]?.answer);
        if (firstMissing) setCurrentIndex(firstMissing - 1);
        return;
      }
      payload.push({
        questionId: id,
        answer: answers[id].answer,
        category: answers[id].category,
      });
    }

    setSubmitting(true);
    try {
      const { data } = await submitAssessment(payload);
      setSuccess(data.message || 'Assessment completed successfully!');
      setTimeout(() => navigate('/student/dashboard'), 1000);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Please answer all questions before submitting.');
      } else {
        setError('Unable to submit your assessment. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading text="Loading assessment..." />;
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <ErrorMessage message={error || 'Unable to load the assessment. Please try again.'} />
      </div>
    );
  }

  const selectedAnswer = answers[current.questionId]?.answer;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 overflow-x-hidden">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-stone-900">Discover Your Interests</h1>
        <p className="mt-2 text-stone-600">
          Answer these simple questions so we can understand which skills may be suitable for you.
        </p>
      </header>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-sm font-medium text-stone-700">
          <span>
            Question {currentIndex + 1} of {total}
          </span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200" aria-hidden="true">
          <div
            className="h-2 rounded-full bg-teal-700 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <ErrorMessage message={error} />
      {success && (
        <div className="mb-4 border border-teal-300 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          {success}
        </div>
      )}

      <Card className="rounded-xl">
        <h2 className="text-lg font-semibold text-stone-900 mb-4">{current.question}</h2>
        <fieldset disabled={submitting} className="border-0 p-0 m-0">
          <legend className="sr-only">{current.question}</legend>
          <div className="space-y-3" role="radiogroup" aria-label={current.question}>
            {current.options.map((optionText) => {
              const isSelected = selectedAnswer === optionText;
              return (
                <label
                  key={optionText}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                    isSelected
                      ? 'border-teal-700 bg-teal-50 text-teal-900 font-medium'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-teal-300'
                  }`}
                >
                  <input
                    type="radio"
                    className="h-4 w-4 accent-teal-700"
                    name={`question-${current.questionId}`}
                    value={optionText}
                    checked={isSelected}
                    onChange={() =>
                      selectOption(optionText, getCategoryForOption(current.questionId, optionText))
                    }
                  />
                  <span>{optionText}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={goBack} disabled={currentIndex === 0 || submitting}>
            BACK
          </Button>
          {!isLast ? (
            <Button type="button" onClick={goNext} disabled={submitting}>
              NEXT
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'SUBMIT ASSESSMENT'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
