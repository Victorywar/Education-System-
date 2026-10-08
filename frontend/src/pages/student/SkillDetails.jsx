import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import CompletionCelebrationModal from '../../components/student/CompletionCelebrationModal';
import StoryBuilderCanvas from '../../components/student/StoryBuilderCanvas';
import CertificatePreviewCard from '../../components/student/CertificatePreviewCard';
import { useAuth } from '../../context/AuthContext';
import { getPreferredBuilderTheme } from '../../data/builderThemes';
import { getSkillById } from '../../data/skills';
import { getSkillProgress } from '../../services/progressService';

export default function SkillDetails() {
  const { skillId } = useParams();
  const { user } = useAuth();
  const skill = getSkillById(skillId);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationTheme, setCelebrationTheme] = useState('skyscraper');

  const hasMasteredSkill = Boolean(
    progress?.isCourseCompleted ||
      progress?.percentage === 100 ||
      (progress?.completedLevels?.length === 10 &&
        progress.completedLevels.every((level) => level.score >= 70))
  );

  useEffect(() => {
    if (!skill) {
      setLoading(false);
      return undefined;
    }
    let active = true;
    const refreshProgress = () => {
      getSkillProgress(skill.id)
        .then((response) => {
          if (active) {
            setProgress(response.data);
            setError('');
          }
        })
        .catch((err) => {
          if (active) setError(err.response?.data?.message || 'Unable to load your progress.');
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refreshProgress();
    };
    refreshProgress();
    window.addEventListener('focus', refreshProgress);
    window.addEventListener('pageshow', refreshProgress);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      active = false;
      window.removeEventListener('focus', refreshProgress);
      window.removeEventListener('pageshow', refreshProgress);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [skill]);

  useEffect(() => {
    if (!skill || !hasMasteredSkill) return;
    setCelebrationTheme(getPreferredBuilderTheme(skill.id));
    if (window.localStorage.getItem(`celebrated_level10_${skill.id}`) !== 'true') {
      setShowCelebration(true);
    }
  }, [skill, hasMasteredSkill]);

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

  if (loading) return <Loading text="Loading your progress..." />;

  const completedLevels = new Set(
    (progress?.completedLevels || []).map((level) => level.levelNumber)
  );
  const completedModuleIds = new Set(
    (progress?.modules || [])
      .filter((moduleProgress) => moduleProgress.completed)
      .map((moduleProgress) => moduleProgress.moduleId)
  );
  const currentLevel = progress?.currentLevel || 1;
  const percentage = progress?.percentage || 0;
  const completedCount = Math.max(completedLevels.size, completedModuleIds.size);

  return (
    <div className="mx-auto max-w-4xl overflow-x-hidden px-4 py-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">Learning path</p>
      <h1 className="mt-1 text-3xl font-bold text-stone-900">{skill.name}</h1>
      <p className="mt-3 leading-relaxed text-stone-600">{skill.description}</p>
      <ErrorMessage message={error} />

      <Card className="mt-6 rounded-xl" title="Your course progress">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm text-stone-700">{completedCount} of 10 levels completed</p>
          <p className="text-2xl font-extrabold text-teal-800">{percentage}%</p>
        </div>
        <div
          className="mt-3 h-3 w-full overflow-hidden rounded-full bg-stone-200"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div className="h-full rounded-full bg-teal-700" style={{ width: `${percentage}%` }} />
        </div>
        <p className="mt-3 text-sm font-semibold text-stone-700">
          {progress?.totalXp || 0} XP earned
        </p>
        {progress?.isCourseCompleted && (
          <div className="mt-4">
            <Link to={`/student/skills/${skill.id}/certificate`}>
              <Button>View Skill Certificate</Button>
            </Link>
          </div>
        )}
        {hasMasteredSkill && (
          <button
            className="mt-4 inline-flex rounded-full border border-amber-500/50 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-900 transition hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
            onClick={() => {
              setCelebrationTheme(getPreferredBuilderTheme(skill.id));
              setShowCelebration(true);
            }}
            type="button"
          >
            ✨ View Mastery Milestone
          </button>
        )}
      </Card>

      <StoryBuilderCanvas
        currentLevel={completedCount}
        totalLevels={skill.modules.length}
        skillName={skill.name}
        skillId={skill.id}
      />

      <h2 className="mb-4 mt-8 text-xl font-bold text-stone-900">Your 10-level learning road</h2>
      <ol className="grid gap-3 sm:grid-cols-2">
        {skill.modules.map((level) => {
          const done =
            completedLevels.has(level.levelNumber) || completedModuleIds.has(level.id);
          const unlocked = done || level.levelNumber <= currentLevel;
          const score = progress?.completedLevels?.find(
            (item) => item.levelNumber === level.levelNumber
          )?.score;
          return (
            <li key={level.id}>
              <Card className={`h-full rounded-xl ${!unlocked ? 'bg-stone-50' : ''}`}>
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${
                      done
                        ? 'bg-emerald-600 text-white'
                        : unlocked
                          ? 'animate-pulse bg-teal-700 text-white'
                          : 'bg-stone-200 text-stone-500'
                    }`}
                    aria-label={`Level ${level.levelNumber}${done ? ' completed' : unlocked ? ' unlocked' : ' locked'}`}
                  >
                    {done ? '★' : unlocked ? level.levelNumber : '🔒'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-stone-900">{level.title}</h3>
                    <p className="mt-1 text-sm text-stone-600">{level.description}</p>
                    {done && (
                      <p className="mt-2 text-sm font-semibold text-emerald-700">
                        Cleared · {score}% accuracy
                      </p>
                    )}
                    {unlocked ? (
                      <Link
                        className="mt-3 inline-block"
                        to={`/student/skills/${skill.id}/module/${level.id}`}
                      >
                        <Button variant={done ? 'outline' : 'primary'}>
                          {done ? 'Review Level' : 'Play Level'}
                        </Button>
                      </Link>
                    ) : (
                      <p className="mt-3 text-sm font-medium text-stone-500">
                        Pass Level {level.levelNumber - 1} with 70% to unlock
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </li>
          );
        })}
      </ol>

      <CertificatePreviewCard skill={skill} progress={progress} student={user} />
      <CompletionCelebrationModal
        open={showCelebration}
        onClose={() => setShowCelebration(false)}
        skillId={skill.id}
        skillName={skill.name}
        studentName={user?.name}
        theme={celebrationTheme}
      />

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/student/skills"><Button variant="outline">Back to Skills</Button></Link>
        <Link to="/student/progress"><Button variant="ghost">View Progress</Button></Link>
      </div>
    </div>
  );
}
