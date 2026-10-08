import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { getClassById, registerForClass } from '../../services/classService';

export default function ClassDetails() {
  const { classId } = useParams();
  const [classSession, setClassSession] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClassById(classId)
      .then((res) => setClassSession(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load class.'))
      .finally(() => setLoading(false));
  }, [classId]);

  const onRegister = async () => {
    setError('');
    try {
      const res = await registerForClass(classId);
      setSuccess(res.data.message);
      const refreshed = await getClassById(classId);
      setClassSession(refreshed.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <ErrorMessage message={error} />
      {success && (
        <div className="mb-4 border border-teal-300 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          {success}
          {classSession?.course && (
            <div className="mt-2">
              <Link to={`/learning/${classSession.course._id || classSession.course}`}>
                <Button>START LEARNING</Button>
              </Link>
            </div>
          )}
        </div>
      )}
      {classSession && (
        <Card title={classSession.skill}>
          <ul className="space-y-2 text-sm text-stone-700">
            <li><strong>Day:</strong> {classSession.day}</li>
            <li><strong>Date:</strong> {classSession.date}</li>
            <li><strong>Time:</strong> {classSession.time}</li>
            <li><strong>Community Centre:</strong> {classSession.communityCentre}</li>
            <li><strong>Location:</strong> {classSession.location}</li>
            <li><strong>Volunteer:</strong> {classSession.volunteerName}</li>
            <li><strong>Seats Available:</strong> {classSession.availableSeats}</li>
          </ul>
          <div className="mt-6">
            <Button disabled={classSession.availableSeats <= 0} onClick={onRegister}>
              REGISTER
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
