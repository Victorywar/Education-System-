import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import ConfirmModal from '../../components/volunteer/ConfirmModal';
import { deleteStudentAdmin, getInactiveStudents } from '../../services/adminService';

function formatLastActive(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Unknown'
    : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function InactiveStudents() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getInactiveStudents();
      setStudents(response.data.students || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load inactive students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const confirmDelete = async () => {
    if (!selectedStudent) return;
    setDeleting(true);
    setError('');
    setSuccess('');
    try {
      const response = await deleteStudentAdmin(selectedStudent.id);
      setSuccess(response.data.message || `${selectedStudent.name} was removed.`);
      setSelectedStudent(null);
      await loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove this student.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-stone-900">Inactive Student Alerts</h1>
      <p className="mb-6 text-stone-600">Students with no tracked activity for at least 30 days.</p>
      <ErrorMessage message={error} />
      {success && (
        <p className="mb-4 break-words border border-teal-300 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          {success}
        </p>
      )}
      {loading ? <Loading text="Loading inactive students..." /> : (
        <Card className="overflow-x-auto rounded-xl">
          <table className="w-full min-w-[1450px] text-left text-sm">
            <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-3 py-3">Student Name</th>
                <th className="px-3 py-3">Username</th>
                <th className="px-3 py-3">Age / Class</th>
                <th className="px-3 py-3">School</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">Language</th>
                <th className="px-3 py-3">Guardian Contact</th>
                <th className="px-3 py-3">Assessment</th>
                <th className="px-3 py-3">Registered Class</th>
                <th className="px-3 py-3">Days Inactive</th>
                <th className="px-3 py-3">Last Active Date</th>
                <th className="px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b border-stone-100">
                  <td className="px-3 py-4 font-semibold text-stone-900">{student.name}</td>
                  <td className="px-3 py-4">@{student.username}</td>
                  <td className="px-3 py-4">{student.age ?? '—'} / {student.className || '—'}</td>
                  <td className="px-3 py-4">{student.school}</td>
                  <td className="px-3 py-4">{student.location}</td>
                  <td className="px-3 py-4">{student.language || '—'}</td>
                  <td className="px-3 py-4">{student.guardianContact || '—'}</td>
                  <td className="px-3 py-4">{student.assessmentStatus}</td>
                  <td className="px-3 py-4">{student.registeredClass || '—'}</td>
                  <td className="px-3 py-4 font-semibold text-orange-800">{student.daysInactive}</td>
                  <td className="px-3 py-4">{formatLastActive(student.lastActiveAt)}</td>
                  <td className="px-3 py-4">
                    <Button
                      variant="danger"
                      className="px-3 py-2"
                      onClick={() => setSelectedStudent(student)}
                    >
                      Remove Inactive Student
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && (
            <p className="py-8 text-center text-stone-600">No students currently meet the 30-day inactivity threshold.</p>
          )}
        </Card>
      )}

      {selectedStudent && (
        <ConfirmModal
          open={!!selectedStudent}
          title="Remove inactive student?"
          message={`This permanently removes ${selectedStudent.name} and their progress, quiz records, and class registrations. The admin action will be recorded.`}
          confirmLabel="REMOVE STUDENT"
          cancelLabel="CANCEL"
          loading={deleting}
          error={error}
          onCancel={() => setSelectedStudent(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
