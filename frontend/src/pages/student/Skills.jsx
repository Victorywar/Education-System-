import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import { skills } from '../../data/skills';
import { getAllProgress } from '../../services/progressService';

export default function Skills() {
  const [progressBySkill, setProgressBySkill] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    getAllProgress()
      .then((response) => {
        setProgressBySkill(
          Object.fromEntries((response.data.progress || []).map((item) => [item.skillId, item]))
        );
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load learning progress.'));
  }, []);

  return (
    <div className="mx-auto max-w-6xl overflow-x-hidden px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 md:text-4xl">Explore Learning Paths</h1>
        <p className="mt-2 text-stone-600">
          Choose a course and pass each interactive level to unlock the next one.
        </p>
      </header>
      <ErrorMessage message={error} />

      <div className="grid gap-4 sm:grid-cols-2">
        {skills.map((skill) => {
          const progress = progressBySkill[skill.id];
          const currentLevel = progress?.currentLevel || 1;
          const completedLevels = new Set(
            (progress?.completedLevels || []).map((level) => level.levelNumber)
          );
          const percentage = progress?.percentage || 0;

          return (
            <Card key={skill.id} className="flex flex-col rounded-xl">
              <h2 className="text-xl font-bold text-stone-900">{skill.name}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
                {skill.shortDescription}
              </p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-medium text-stone-700">Course progress</span>
                <span className="font-bold text-teal-800">{percentage}%</span>
              </div>
              <div
                className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-200"
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-label={`${skill.name} completion`}
              >
                <div className="h-full rounded-full bg-teal-700" style={{ width: `${percentage}%` }} />
              </div>
              <ol className="mt-4 flex flex-wrap gap-2" aria-label={`${skill.name} 10-level progress`}>
                {skill.modules.map((level) => {
                  const done = completedLevels.has(level.levelNumber);
                  const unlocked = done || level.levelNumber <= currentLevel;
                  const className = done
                    ? 'bg-emerald-600 text-white'
                    : unlocked
                      ? 'animate-pulse bg-teal-700 text-white'
                      : 'bg-stone-200 text-stone-500';
                  const node = (
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${className}`}
                      title={`Level ${level.levelNumber}${done ? ' completed' : unlocked ? ' unlocked' : ' locked'}`}
                      aria-label={`Level ${level.levelNumber}${done ? ' completed' : unlocked ? ' unlocked' : ' locked'}`}
                    >
                      {done ? '★' : unlocked ? level.levelNumber : '🔒'}
                    </span>
                  );
                  return (
                    <li key={level.id}>
                      {unlocked ? (
                        <Link to={`/student/skills/${skill.id}/module/${level.id}`}>{node}</Link>
                      ) : node}
                    </li>
                  );
                })}
              </ol>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to={`/student/skills/${skill.id}`}>
                  <Button>{progress ? 'Continue Learning' : 'Start Learning'}</Button>
                </Link>
                {progress?.isCourseCompleted && (
                  <Link to={`/student/skills/${skill.id}/certificate`}>
                    <Button variant="outline">View Certificate</Button>
                  </Link>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <Link to="/student/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
      </div>
    </div>
  );
}
