import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import CompletionCelebrationModal from '../../components/student/CompletionCelebrationModal';
import { getPreferredBuilderTheme } from '../../data/builderThemes';
import { useAuth } from '../../context/AuthContext';
import { getModuleById, getModuleIndex, getSkillById } from '../../data/skills';
import {
  checkLevelAnswer,
  getLevelChallenge,
  getSkillProgress,
  submitLevel,
} from '../../services/progressService';

const speechRecognitionConstructor = () =>
  window.SpeechRecognition || window.webkitSpeechRecognition;

export default function ModuleDetails() {
  const { skillId, moduleId } = useParams();
  const { user } = useAuth();
  const skill = getSkillById(skillId);
  const module = skill ? getModuleById(skill, moduleId) : null;
  const index = skill ? getModuleIndex(skill, moduleId) : -1;
  const levelNumber = module?.levelNumber;
  const [challenge, setChallenge] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerInput, setAnswerInput] = useState('');
  const [streak, setStreak] = useState(0);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationTheme, setCelebrationTheme] = useState('skyscraper');
  const [timeRemaining, setTimeRemaining] = useState(
    levelNumber >= 4 && levelNumber <= 7 ? levelNumber * 5 * 20 : null
  );
  const recognitionRef = useRef(null);

  const currentQuestion = challenge?.questions?.[questionIndex];
  const previousQuestionResult = currentQuestion ? answers[currentQuestion.id] : null;
  const liveAccuracy = useMemo(() => {
    const results = Object.values(answers);
    const questionCount = challenge?.questions?.length || 0;
    if (!questionCount) return 0;
    return Math.round(
      results.reduce((total, item) => total + (item.accuracy ?? (item.correct ? 100 : 0)), 0) /
        questionCount
    );
  }, [answers, challenge]);

  useEffect(() => {
    if (!skill || !module) {
      setLoading(false);
      return undefined;
    }
    let active = true;
    setChallenge(null);
    setCompleted(false);
    setAnswers({});
    setQuestionIndex(0);
    setAnswerInput('');
    setStreak(0);
    setResult(null);
    setError('');
    setTimeRemaining(levelNumber >= 4 && levelNumber <= 7 ? levelNumber * 5 * 20 : null);
    Promise.all([getLevelChallenge(skill.id, levelNumber), getSkillProgress(skill.id)])
      .then(([challengeResponse, progressResponse]) => {
        if (!active) return;
        setChallenge(challengeResponse.data.challenge);
        setCompleted(challengeResponse.data.completed);
        setProgress(progressResponse.data);
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.message || 'Unable to load this level. Please try again.'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      recognitionRef.current?.stop();
    };
  }, [skill, module, levelNumber]);

  const startSpeechRecognition = useCallback(() => {
    const Recognition = speechRecognitionConstructor();
    if (!Recognition) {
      setError('Speech recognition is not supported in this browser. You can enter your transcript below.');
      return;
    }
    setError('');
    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const spokenText = event.results?.[0]?.[0]?.transcript || '';
      setTranscript(spokenText);
      setAnswerInput(spokenText);
    };
    recognition.onerror = () => {
      setListening(false);
      setError('We could not capture your speech. Please allow microphone access and try again.');
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }, []);

  useEffect(() => {
    if (!challenge || completed || result || timeRemaining === null) return undefined;
    if (timeRemaining <= 0) {
      setResult({
        passed: false,
        score: liveAccuracy,
        passingScore: 70,
        xpEarned: 0,
        timedOut: true,
      });
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setTimeRemaining((remaining) => Math.max(remaining - 1, 0));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [challenge, completed, liveAccuracy, result, timeRemaining]);

  if (!skill) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <Card className="rounded-xl text-center">
          <h1 className="mb-3 text-2xl font-bold text-stone-900">Course not found.</h1>
          <Link to="/student/skills"><Button>Back to Skills</Button></Link>
        </Card>
      </div>
    );
  }
  if (!module || index < 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <Card className="rounded-xl text-center">
          <h1 className="mb-3 text-2xl font-bold text-stone-900">Learning level not found.</h1>
          <Link to={`/student/skills/${skill.id}`}><Button>Back to Learning Path</Button></Link>
        </Card>
      </div>
    );
  }
  if (loading) return <Loading text="Loading your level challenge..." />;

  const next = index < skill.modules.length - 1 ? skill.modules[index + 1] : null;
  const wordResults = previousQuestionResult?.words || [];
  const answeredAll = challenge?.questions?.every((question) => answers[question.id]);

  const checkAnswer = async () => {
    if (!currentQuestion || !answerInput.trim()) return;
    setChecking(true);
    setError('');
    try {
      const response = await checkLevelAnswer(skill.id, levelNumber, {
        questionId: currentQuestion.id,
        answer: answerInput.trim(),
      });
      const feedback = response.data;
      setAnswers((current) => ({ ...current, [currentQuestion.id]: { ...feedback, answer: answerInput.trim() } }));
      setStreak((current) => (feedback.correct ? current + 1 : 0));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to check your answer.');
    } finally {
      setChecking(false);
    }
  };

  const goToNextQuestion = () => {
    setQuestionIndex((current) => current + 1);
    setAnswerInput('');
    setTranscript('');
    setError('');
  };

  const finishLevel = async () => {
    if (!answeredAll) return;
    setSubmitting(true);
    setError('');
    try {
      const submittedAnswers = challenge.questions.map((question) => ({
        questionId: question.id,
        answer: answers[question.id].answer,
      }));
      const response = await submitLevel(skill.id, levelNumber, submittedAnswers);
      setResult(response.data);
      setProgress(response.data.progress);
      setCompleted(response.data.passed);
      if (levelNumber === 10 && response.data.passed && response.data.score >= 70) {
        setCelebrationTheme(getPreferredBuilderTheme(skill.id));
        setShowCelebration(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit your level.');
    } finally {
      setSubmitting(false);
    }
  };

  const retryLevel = () => {
    setAnswers({});
    setQuestionIndex(0);
    setAnswerInput('');
    setTranscript('');
    setStreak(0);
    setResult(null);
    setError('');
    setTimeRemaining(levelNumber >= 4 && levelNumber <= 7 ? levelNumber * 5 * 20 : null);
  };

  return (
    <div className="mx-auto max-w-3xl overflow-x-hidden px-4 py-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">{skill.name}</p>
      <p className="mt-1 text-sm text-stone-500">Level {levelNumber} of 10</p>
      <h1 className="mt-1 text-3xl font-bold text-stone-900">{module.title}</h1>
      <p className="mt-2 text-sm text-stone-600">{module.description}</p>
      <p className="mt-2 text-sm font-semibold text-stone-700">
        {module.difficulty} · {module.questionCount} questions · pass at 70%
      </p>
      {completed && (
        <p className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">
          ✓ Completed
        </p>
      )}
      <ErrorMessage message={error} />

      {!challenge && (
        <Card className="mt-6 rounded-xl">
          <p className="font-semibold text-stone-900">This level is locked.</p>
          <p className="mt-2 text-sm text-stone-600">Pass the previous level with 70% accuracy to unlock it.</p>
          <Link className="mt-4 inline-block" to={`/student/skills/${skill.id}`}>
            <Button>Return to Learning Path</Button>
          </Link>
        </Card>
      )}

      {challenge && completed && !result && (
        <Card className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50">
          <p className="text-xl font-bold text-emerald-800">★ Level Cleared</p>
          <p className="mt-2 text-stone-700">
            Your saved score: {progress?.completedLevels?.find((item) => item.levelNumber === levelNumber)?.score ?? '—'}%
          </p>
          <p className="mt-1 text-sm text-stone-600">Total course XP: {progress?.totalXp || 0}</p>
          {next ? (
            <Link className="mt-4 inline-block" to={`/student/skills/${skill.id}/module/${next.id}`}>
              <Button>Play Level {next.levelNumber}</Button>
            </Link>
          ) : (
            <Link className="mt-4 inline-block" to={`/student/skills/${skill.id}/certificate`}>
              <Button>View Certificate</Button>
            </Link>
          )}
        </Card>
      )}

      {challenge && !completed && !result && currentQuestion && (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Card className="rounded-xl p-4">
              <p className="text-xs font-semibold uppercase text-stone-500">Live accuracy</p>
              <p className="mt-1 text-2xl font-bold text-teal-800">{liveAccuracy}%</p>
            </Card>
            <Card className="rounded-xl p-4">
              <p className="text-xs font-semibold uppercase text-stone-500">Answer streak</p>
              <p className="mt-1 text-2xl font-bold text-orange-700">{streak} 🔥</p>
            </Card>
          </div>

          <Card className="mt-5 rounded-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-stone-600">
                Challenge {questionIndex + 1} of {challenge.questions.length}
              </span>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
                {challenge.difficulty}
              </span>
            </div>
            {timeRemaining !== null && (
              <p className={`mb-3 text-right text-sm font-bold ${timeRemaining <= 20 ? 'text-red-700' : 'text-stone-600'}`}>
                Time remaining: {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
              </p>
            )}
            <h2 className="text-xl font-bold leading-relaxed text-stone-900">{currentQuestion.question}</h2>

            {currentQuestion.inputType === 'speech' && (
              <div className="mt-4 rounded-xl bg-stone-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Read aloud</p>
                <p className="mt-2 text-lg font-medium leading-relaxed text-stone-900">
                  {currentQuestion.targetText}
                </p>
                {!previousQuestionResult && (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button type="button" onClick={startSpeechRecognition} disabled={listening}>
                      {listening ? 'Listening…' : '🎙 Start Speaking'}
                    </Button>
                    {listening && (
                      <Button type="button" variant="outline" onClick={() => recognitionRef.current?.stop()}>
                        Stop
                      </Button>
                    )}
                  </div>
                )}
                {transcript && !previousQuestionResult && (
                  <p className="mt-3 text-sm text-stone-700">Recognized: “{transcript}”</p>
                )}
                {wordResults.length > 0 && (
                  <p className="mt-3 flex flex-wrap gap-1 text-lg font-semibold" aria-label="Speech word accuracy">
                    {wordResults.map((item, wordIndex) => (
                      <span
                        key={`${item.word}-${wordIndex}`}
                        className={item.matched ? 'text-emerald-700' : 'text-red-700 underline decoration-2'}
                      >
                        {item.word}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            )}

            {!previousQuestionResult && currentQuestion.inputType === 'choice' && (
              <fieldset className="mt-5 space-y-3">
                <legend className="sr-only">Choose an answer</legend>
                {currentQuestion.options.map((option) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                      answerInput === option ? 'border-teal-700 bg-teal-50' : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`answer-${currentQuestion.id}`}
                      value={option}
                      checked={answerInput === option}
                      onChange={(event) => setAnswerInput(event.target.value)}
                      className="mt-1 accent-teal-700"
                    />
                    <span className="text-sm text-stone-800">{option}</span>
                  </label>
                ))}
              </fieldset>
            )}

            {!previousQuestionResult && currentQuestion.inputType !== 'choice' && currentQuestion.inputType !== 'speech' && (
              <input
                type="text"
                inputMode={currentQuestion.inputType === 'number' ? 'numeric' : 'text'}
                value={answerInput}
                onChange={(event) => setAnswerInput(event.target.value)}
                className="mt-5 w-full rounded-lg border border-stone-300 px-4 py-3 focus:border-teal-700 focus:outline-none"
                aria-label="Your answer"
              />
            )}

            {currentQuestion.inputType === 'speech' && !previousQuestionResult &&
              !speechRecognitionConstructor() && (
                <label className="mt-4 block text-sm font-medium text-stone-700">
                  Speech recognition is unavailable. Enter the words you spoke:
                  <input
                    type="text"
                    value={answerInput}
                    onChange={(event) => {
                      setAnswerInput(event.target.value);
                      setTranscript(event.target.value);
                    }}
                    className="mt-2 w-full rounded-lg border border-stone-300 px-4 py-3"
                  />
                </label>
              )}

            {previousQuestionResult && (
              <div
                className={`mt-5 rounded-lg p-4 ${
                  previousQuestionResult.correct ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'
                }`}
                role="status"
              >
                <p className="font-bold">
                  {currentQuestion.inputType === 'speech'
                    ? `Speech accuracy: ${previousQuestionResult.accuracy}%`
                    : previousQuestionResult.correct
                      ? 'Correct!'
                      : 'Not quite — keep practicing.'}
                </p>
                {previousQuestionResult.correctAnswer && (
                  <p className="mt-1 text-sm">Correct answer: {previousQuestionResult.correctAnswer}</p>
                )}
                <p className="mt-1 text-sm">{previousQuestionResult.explanation}</p>
              </div>
            )}

            <div className="mt-5">
              {!previousQuestionResult ? (
                <Button
                  type="button"
                  onClick={checkAnswer}
                  disabled={checking || !answerInput.trim() || listening}
                >
                  {checking ? 'Checking…' : 'Check Answer'}
                </Button>
              ) : questionIndex < challenge.questions.length - 1 ? (
                <Button type="button" onClick={goToNextQuestion}>Next Challenge</Button>
              ) : (
                <Button type="button" onClick={finishLevel} disabled={submitting || !answeredAll}>
                  {submitting ? 'Submitting…' : 'Submit Level Challenge'}
                </Button>
              )}
            </div>
          </Card>
        </>
      )}

      {result && (
        <Card className={`mt-6 rounded-xl ${result.passed ? 'border border-emerald-200 bg-emerald-50' : 'border border-amber-200 bg-amber-50'}`}>
          <p className={`text-2xl font-extrabold ${result.passed ? 'text-emerald-800' : 'text-amber-900'}`}>
            {result.passed ? '★ Level Cleared!' : 'Keep Practicing'}
          </p>
          <p className="mt-3 text-lg font-semibold text-stone-800">
            Accuracy: {result.score}% · Required: {result.passingScore}%
          </p>
          {result.timedOut && (
            <p className="mt-2 text-sm text-stone-700">Time ran out before the challenge was completed.</p>
          )}
          <p className="mt-1 text-stone-700">
            {result.xpEarned > 0 ? `+${result.xpEarned} XP earned` : 'Try again to earn this level’s XP.'}
          </p>
          <p className="mt-1 text-sm text-stone-600">Total XP: {progress?.totalXp || 0}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {result.passed && next && (
              <Link to={`/student/skills/${skill.id}/module/${next.id}`}>
                <Button>Level {next.levelNumber} Unlocked</Button>
              </Link>
            )}
            {result.passed && !next && (
              <Link to={`/student/skills/${skill.id}/certificate`}>
                <Button>Get Your Certificate</Button>
              </Link>
            )}
            {!result.passed && <Button onClick={retryLevel}>Try Again</Button>}
            <Link to={`/student/skills/${skill.id}`}><Button variant="outline">Learning Path</Button></Link>
          </div>
        </Card>
      )}

      <CompletionCelebrationModal
        open={showCelebration}
        onClose={() => setShowCelebration(false)}
        skillId={skill.id}
        skillName={skill.name}
        studentName={user?.name}
        theme={celebrationTheme}
      />

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to={`/student/skills/${skill.id}`}><Button variant="ghost">Back to Learning Path</Button></Link>
        <Link to="/student/progress"><Button variant="outline">View Progress</Button></Link>
      </div>
    </div>
  );
}
