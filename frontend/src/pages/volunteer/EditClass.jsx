import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { getVolunteerClassById, updateClass } from '../../services/volunteerService';

const DAYS = ['Saturday', 'Sunday', 'Holiday'];

export default function EditClass() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getVolunteerClassById(id)
      .then((res) => {
        const c = res.data.class;
        setRegisteredCount(c.registeredCount || 0);
        setForm({
          skill: c.skill,
          title: c.title,
          date: c.date,
          day: c.day,
          time: `${c.startTime} - ${c.endTime}`,
          communityCentre: c.location,
          volunteerName: c.facilitator,
          availableSeats: c.capacity,
        });
      })
      .catch(() => setError('Unable to load class. Please try again.'))
      .finally(() => setLoading(false));
  }, [id]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const seats = Number(form.availableSeats);
    if (seats < registeredCount) {
      setError('Available seats cannot be less than registered students.');
      return;
    }
    if (!form.skill.trim() || !form.date || !form.day || !form.time || !form.communityCentre || !form.volunteerName) {
      setError('All fields are required.');
      return;
    }

    setSaving(true);
    try {
      await updateClass(id, {
        skill: form.skill.trim(),
        date: form.date,
        day: form.day,
        time: form.time,
        communityCentre: form.communityCentre,
        volunteerName: form.volunteerName,
        availableSeats: seats,
        title: form.title,
      });
      navigate('/volunteer/classes', {
        state: { message: 'Class updated successfully.' },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update class. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-900 mb-6">Edit Class</h1>
      {loading && <Loading text="Loading class..." />}
      {!loading && form && (
        <Card className="rounded-xl">
          <ErrorMessage message={error} />
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="skill" className="mb-1 block text-sm font-medium">Course / Skill</label>
              <input
                id="skill"
                name="skill"
                value={form.skill}
                onChange={onChange}
                placeholder="Type course/skill name (e.g. Spoken English, Vedic Maths, Robotics)"
                required
                className="w-full border border-stone-300 px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-stone-500">Registered students: {registeredCount}</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={onChange}
                className="w-full border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Day</label>
              <select
                name="day"
                value={form.day}
                onChange={onChange}
                className="w-full border border-stone-300 px-3 py-2 text-sm"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Time</label>
              <input
                name="time"
                value={form.time}
                onChange={onChange}
                className="w-full border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Community Centre</label>
              <input
                name="communityCentre"
                value={form.communityCentre}
                onChange={onChange}
                className="w-full border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Volunteer Name</label>
              <input
                name="volunteerName"
                value={form.volunteerName}
                onChange={onChange}
                className="w-full border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Available Seats (Capacity)</label>
              <input
                type="number"
                min={registeredCount || 1}
                name="availableSeats"
                value={form.availableSeats}
                onChange={onChange}
                className="w-full border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? 'Updating class...' : 'Update Class'}
              </Button>
              <Link to="/volunteer/classes">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
