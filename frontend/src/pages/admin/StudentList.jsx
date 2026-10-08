import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { getAdminStudents } from '../../services/adminService';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStudents()
      .then((response) => setStudents(response.data.students || []))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load student roster.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) =>
      [student.name, student.username, student.className, student.school, student.location]
        .some((value) => String(value || '').toLowerCase().includes(query))
    );
  }, [search, students]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-stone-900">Student Roster</h1>
      <ErrorMessage message={error} />
      {loading ? <Loading text="Loading students..." /> : (
        <>
          <label htmlFor="student-search" className="mb-4 block max-w-md">
            <span className="mb-1 block text-sm font-medium text-stone-700">Search students</span>
            <input
              id="student-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, username, school, class or location"
              className="w-full border border-stone-300 px-3 py-2 text-sm"
            />
          </label>
          <Card className="overflow-x-auto rounded-xl">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-3 py-3">Student</th>
                  <th className="px-3 py-3">Class / School</th>
                  <th className="px-3 py-3">Assessment</th>
                  <th className="px-3 py-3">Recommended Skill</th>
                  <th className="px-3 py-3">Quiz</th>
                  <th className="px-3 py-3">Weekend Class</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="border-b border-stone-100 align-top">
                    <td className="px-3 py-4">
                      <p className="font-semibold text-stone-900">{student.name}</p>
                      <p className="text-stone-500">@{student.username}</p>
                    </td>
                    <td className="px-3 py-4 text-stone-700">{student.className} · {student.school}</td>
                    <td className="px-3 py-4">{student.assessmentStatus}</td>
                    <td className="px-3 py-4">{student.recommendedSkill}</td>
                    <td className="px-3 py-4">
                      {student.latestQuiz
                        ? `${student.latestQuiz.courseName}: ${student.latestQuiz.percentage}%`
                        : student.quizStatus}
                    </td>
                    <td className="px-3 py-4">
                      {student.registeredClass
                        ? `${student.registeredClass.title} (${student.registeredClass.day})`
                        : student.classRegistrationStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && <p className="py-8 text-center text-stone-600">No students match this search.</p>}
          </Card>
        </>
      )}
    </div>
  );
}
