import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import ConfirmModal from '../../components/volunteer/ConfirmModal';
import { deleteClass, getVolunteerClasses } from '../../services/volunteerService';

export default function ManageClasses() {
  const location = useLocation();
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getVolunteerClasses();
      setClasses(res.data.classes || []);
    } catch {
      setError('Unable to load classes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setError('');
    setSuccess('');
    try {
      const res = await deleteClass(deleteId);
      setSuccess(res.data.message || 'Class deleted successfully.');
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete class. Please try again.');
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 overflow-x-hidden">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-stone-900">Manage Classes</h1>
        <Link to="/volunteer/classes/add">
          <Button>ADD CLASS</Button>
        </Link>
      </div>

      <ErrorMessage message={error} />
      {success && (
        <div className="mb-4 border border-teal-300 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          {success}
        </div>
      )}

      {loading ? (
        <Loading text="Loading classes..." />
      ) : (
        <div className="space-y-4">
          {classes.map((c) => (
            <Card key={c.id} className="rounded-xl">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold uppercase text-stone-900">{c.skill}</h2>
                  <p className="text-sm font-medium text-stone-800">{c.title}</p>
                  <ul className="mt-2 space-y-1 text-sm text-stone-600">
                    <li>
                      {c.day} · {c.displayDate}
                    </li>
                    <li>
                      {c.startTime} - {c.endTime}
                    </li>
                    <li>{c.location}</li>
                    <li>Volunteer: {c.facilitator}</li>
                    <li className="font-semibold text-teal-800">
                      {c.availableSeats} seats available ({c.registeredCount} registered)
                    </li>
                  </ul>
                </div>
                <div className="flex gap-2">
                  <Link to={`/volunteer/classes/${c.id}/edit`}>
                    <Button variant="outline">EDIT</Button>
                  </Link>
                  <Button variant="danger" onClick={() => setDeleteId(c.id)}>
                    DELETE
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {classes.length === 0 && (
            <Card className="rounded-xl">
              <p className="text-stone-600">No classes yet. Create the first community class.</p>
            </Card>
          )}
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete Class"
        message="Are you sure you want to delete this class?"
        confirmLabel="DELETE CLASS"
        cancelLabel="CANCEL"
        loading={deleting}
        onCancel={() => setDeleteId(null)}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
}
