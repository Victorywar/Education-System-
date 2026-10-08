import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { deleteClassAdmin, getAdminClasses } from '../../services/adminService';

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminClasses();
      setClasses(response.data.classes || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load classes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const removeClass = async () => {
    if (!selected) return;
    setDeleting(true);
    setError('');
    setSuccess('');
    try {
      const response = await deleteClassAdmin(selected._id);
      setSuccess(`${response.data.message} Audit reference: ${response.data.auditId}`);
      setSelected(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete class.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-stone-900">Community Classes</h1>
      <ErrorMessage message={error} />
      {success && <p className="mb-4 break-all border border-teal-300 bg-teal-50 px-4 py-3 text-sm text-teal-900">{success}</p>}
      {loading ? <Loading text="Loading classes..." /> : (
        <div className="space-y-4">
          {classes.map((classItem) => (
            <Card key={classItem._id} className="rounded-xl">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-stone-900">{classItem.title}</h2>
                  <p className="text-sm text-stone-600">{classItem.skill} · {classItem.day} · {classItem.date}</p>
                  <p className="mt-1 text-sm text-stone-600">
                    {classItem.location} · {classItem.registeredStudents?.length || 0} registrations
                  </p>
                </div>
                <Button variant="danger" onClick={() => setSelected(classItem)}>Delete class</Button>
              </div>
            </Card>
          ))}
          {classes.length === 0 && <Card className="rounded-xl"><p className="text-stone-600">No classes are currently listed.</p></Card>}
        </div>
      )}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 px-4">
          <section role="dialog" aria-modal="true" aria-labelledby="delete-class-title" className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 id="delete-class-title" className="text-xl font-bold text-stone-900">Delete this class?</h2>
            <p className="mt-2 text-sm text-stone-600">
              This force-removes “{selected.title}” and records an admin audit entry.
            </p>
            {error && <p className="mt-3 text-sm text-orange-800" role="alert">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" disabled={deleting} onClick={() => setSelected(null)}>Cancel</Button>
              <Button variant="danger" disabled={deleting} onClick={removeClass}>
                {deleting ? 'Deleting...' : 'Confirm delete'}
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
