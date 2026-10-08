import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { getCourses } from '../../services/courseService';

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses()
      .then((res) => setCourses(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load courses.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Skill Courses</h1>
      <ErrorMessage message={error} />
      <div className="grid gap-4 sm:grid-cols-2">
        {courses.map((c) => (
          <Card key={c._id} title={c.name} subtitle={`${c.level} · ${c.duration}`}>
            <p className="text-sm text-stone-600 mb-4">{c.description}</p>
            <Link to={`/courses/${c._id}`}><Button>View Details</Button></Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
