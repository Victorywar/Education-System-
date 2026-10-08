import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { getCourseById } from '../../services/courseService';

export default function CourseDetails() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourseById(courseId)
      .then((res) => setCourse(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load course.'))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <Loading />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <ErrorMessage message={error} />
      {course && (
        <>
          <h1 className="text-3xl font-bold uppercase">{course.name}</h1>
          <p className="mt-2 text-stone-600">{course.description}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span><strong>Level:</strong> {course.level}</span>
            <span><strong>Duration:</strong> {course.duration}</span>
          </div>
          <Card className="mt-6" title="Modules">
            <ol className="list-decimal pl-5 space-y-2 text-sm text-stone-700">
              {course.modules.map((m, i) => (
                <li key={i}>{m.title}</li>
              ))}
            </ol>
          </Card>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={`/learning/${course._id}`}><Button>Start Learning</Button></Link>
            <Link to="/classes"><Button variant="outline">VIEW WEEKEND CLASSES</Button></Link>
          </div>
        </>
      )}
    </div>
  );
}
