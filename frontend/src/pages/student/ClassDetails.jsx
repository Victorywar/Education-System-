import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { getClassById, registerForClass } from '../../services/classService';

/**
 * Phase 7 — Class details + registration
 */
export default function ClassDetails() {
  const { classId } = useParams();
  const [classItem, setClassItem] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getClassById(classId)
      .then((res) => {
        if (active) setClassItem(res.data.class);
      })
      .catch((err) => {
        if (active) {
          setClassItem(null);
          setError(err.response?.data?.message || 'Class not found.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [classId]);

  const onRegister = async () => {
    setError('');
    setSuccess('');
    setRegistering(true);
    try {
      const res = await registerForClass(classId);
      setSuccess(res.data.message || 'Registration successful!');
      setClassItem(res.data.class);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to register for this class. Please try again.'
      );
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <Loading text="Loading class details..." />;

  if (!classItem) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <Card className="rounded-xl text-center">
          <h1 className="text-2xl font-bold mb-3">Class not found.</h1>
          <ErrorMessage message={error} />
          <Link to="/student/classes">
            <Button>Back to Classes</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 overflow-x-hidden">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
        Recommended Skill: {classItem.skill}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-stone-900">{classItem.title}</h1>

      <ErrorMessage message={error} />
      {success && (
        <div className="mb-4 border border-teal-300 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          Registration successful!
        </div>
      )}

      <Card className="mt-6 rounded-xl">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-semibold text-stone-800">Skill</dt>
            <dd className="text-stone-600">{classItem.skill}</dd>
          </div>
          <div>
            <dt className="font-semibold text-stone-800">Date</dt>
            <dd className="text-stone-600">
              {classItem.day}, {classItem.displayDate}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-stone-800">Time</dt>
            <dd className="text-stone-600">
              {classItem.startTime} – {classItem.endTime}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-stone-800">Location</dt>
            <dd className="text-stone-600">{classItem.location}</dd>
          </div>
          <div>
            <dt className="font-semibold text-stone-800">Facilitator</dt>
            <dd className="text-stone-600">{classItem.facilitator}</dd>
          </div>
          <div>
            <dt className="font-semibold text-stone-800">Description</dt>
            <dd className="text-stone-600 leading-relaxed">{classItem.description}</dd>
          </div>
          {(classItem.linkUrl || classItem.fileData) && (
            <div>
              <dt className="font-semibold text-stone-800">Class Resources</dt>
              <dd className="mt-1 flex flex-wrap gap-3 text-teal-800">
                {classItem.linkUrl && (
                  <a href={classItem.linkUrl} target="_blank" rel="noreferrer" className="underline">
                    Open class resource
                  </a>
                )}
                {classItem.fileData && (
                  <a
                    href={classItem.fileData}
                    download={classItem.fileName || 'class-resource'}
                    className="underline"
                  >
                    Download {classItem.fileName || 'attachment'}
                  </a>
                )}
              </dd>
            </div>
          )}
          <div>
            <dt className="font-semibold text-stone-800">Available Seats</dt>
            <dd className="font-semibold text-teal-800">{classItem.availableSeats}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          {classItem.isRegistered ? (
            <Button disabled>Registered</Button>
          ) : (
            <Button onClick={onRegister} disabled={registering || classItem.availableSeats <= 0}>
              {registering ? 'Registering...' : 'Register'}
            </Button>
          )}
          <Link to="/student/classes">
            <Button variant="outline">Back to Classes</Button>
          </Link>
          {classItem.isRegistered && (
            <Link to="/student/classes/my-registrations">
              <Button variant="ghost">My Weekend Classes</Button>
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
