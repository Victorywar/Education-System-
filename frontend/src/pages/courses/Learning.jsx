import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { getLearningModule } from '../../services/courseService';
import { updateLearningProgress } from '../../services/studentService';

export default function Learning() {
  const { courseId } = useParams();
  const [moduleIndex, setModuleIndex] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (idx) => {
    setLoading(true);
    setError('');
    try {
      const res = await getLearningModule(courseId, idx);
      setData(res.data);
      await updateLearningProgress({
        courseId,
        currentModule: idx,
        completedModule: idx,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load module.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(moduleIndex);
  }, [courseId, moduleIndex]);

  if (loading && !data) return <Loading />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <ErrorMessage message={error} />
      {data && (
        <>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
            {data.courseName} — Module {data.moduleIndex + 1} of {data.totalModules}
          </p>
          <h1 className="mt-2 text-3xl font-bold uppercase">{data.module.title}</h1>
          <Card className="mt-6">
            <h3 className="font-semibold mb-2">Explanation</h3>
            <p className="text-sm text-stone-700 leading-relaxed mb-4">{data.module.explanation}</p>
            <h3 className="font-semibold mb-2">Example</h3>
            <p className="text-sm text-stone-700 leading-relaxed mb-4">{data.module.example}</p>
            <h3 className="font-semibold mb-2">Practice Question</h3>
            <p className="text-sm text-stone-700 leading-relaxed">{data.module.practiceQuestion}</p>
          </Card>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="outline"
              disabled={moduleIndex === 0}
              onClick={() => setModuleIndex((i) => Math.max(0, i - 1))}
            >
              PREVIOUS
            </Button>
            {!data.isLast ? (
              <Button onClick={() => setModuleIndex((i) => i + 1)}>NEXT</Button>
            ) : (
              <Link to={`/quiz/${courseId}`}><Button>TAKE QUIZ</Button></Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
