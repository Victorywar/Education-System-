import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { getPendingVolunteers, updateVolunteerStatus } from '../../services/adminService';

export default function VolunteerApprovals() {
  const [volunteers, setVolunteers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getPendingVolunteers();
      setVolunteers(response.data.volunteers || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load volunteer applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openDecision = (volunteer, nextStatus) => {
    setSelected(volunteer);
    setStatus(nextStatus);
    setReason('');
    setError('');
  };

  const submitDecision = async () => {
    if (!selected) return;
    if (status === 'rejected' && !reason.trim()) {
      setError('Enter a rejection reason before continuing.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await updateVolunteerStatus(selected._id, {
        status,
        rejectionReason: reason.trim(),
      });
      setSuccess(response.data.message || `Volunteer ${status}.`);
      setSelected(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update volunteer status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-stone-900">Volunteer Approvals</h1>
      <ErrorMessage message={error} />
      {success && <p className="mb-4 border border-teal-300 bg-teal-50 px-4 py-3 text-sm text-teal-900">{success}</p>}
      {loading ? <Loading text="Loading applications..." /> : (
        <Card className="overflow-x-auto rounded-xl">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-3 py-3">Applicant</th>
                <th className="px-3 py-3">Contact</th>
                <th className="px-3 py-3">Skills</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Review</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((volunteer) => (
                <tr key={volunteer._id} className="border-b border-stone-100 align-top">
                  <td className="px-3 py-4">
                    <p className="font-semibold text-stone-900">{volunteer.name}</p>
                    <p className="text-stone-500">@{volunteer.username}</p>
                  </td>
                  <td className="px-3 py-4 text-stone-700">
                    <p>{volunteer.email || 'No email provided'}</p>
                    <p>{volunteer.phone || 'No phone provided'}</p>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(volunteer.skills || []).map((skill) => (
                        <span key={skill} className="rounded-full bg-teal-50 px-2 py-1 text-xs text-teal-800">{skill}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900">
                      {volunteer.status}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex gap-2">
                      <Button className="px-3 py-2" onClick={() => openDecision(volunteer, 'approved')}>Approve</Button>
                      <Button className="px-3 py-2" variant="danger" onClick={() => openDecision(volunteer, 'rejected')}>Reject</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {volunteers.length === 0 && <p className="py-8 text-center text-stone-600">There are no pending volunteer applications.</p>}
        </Card>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 px-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="decision-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 id="decision-title" className="text-xl font-bold text-stone-900">
              {status === 'approved' ? 'Approve volunteer?' : 'Reject volunteer?'}
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              {selected.name} (@{selected.username})
            </p>
            {status === 'rejected' && (
              <label className="mt-4 block text-sm font-medium text-stone-700">
                Rejection reason
                <textarea
                  rows="3"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className="mt-1 w-full border border-stone-300 px-3 py-2"
                  required
                />
              </label>
            )}
            {error && <p className="mt-3 text-sm text-orange-800" role="alert">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" disabled={saving} onClick={() => setSelected(null)}>Cancel</Button>
              <Button variant={status === 'rejected' ? 'danger' : 'primary'} disabled={saving} onClick={submitDecision}>
                {saving ? 'Saving...' : status === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
