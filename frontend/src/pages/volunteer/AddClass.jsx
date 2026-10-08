import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import { createClass } from '../../services/volunteerService';

const DAYS = ['Saturday', 'Sunday', 'Holiday'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const initial = {
  skill: '',
  date: '',
  day: 'Saturday',
  time: '',
  communityCentre: '',
  volunteerName: '',
  availableSeats: 15,
  linkUrl: '',
  fileData: '',
  fileName: '',
};

export default function AddClass() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [readingFile, setReadingFile] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onFileChange = (event) => {
    const file = event.target.files?.[0];
    setError('');
    if (!file) {
      setForm((current) => ({ ...current, fileData: '', fileName: '' }));
      return;
    }
    if (file.size >= MAX_FILE_SIZE) {
      setError('The selected file must be under 10 MB.');
      event.target.value = '';
      setForm((current) => ({ ...current, fileData: '', fileName: '' }));
      return;
    }
    if (
      !file.type.startsWith('image/') &&
      file.type !== 'application/pdf' &&
      !/\.(pdf|doc|docx)$/i.test(file.name)
    ) {
      setError('Choose an image, PDF, DOC, or DOCX file.');
      event.target.value = '';
      setForm((current) => ({ ...current, fileData: '', fileName: '' }));
      return;
    }

    setReadingFile(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setError('Unable to read the selected file.');
        setReadingFile(false);
        return;
      }
      setForm((current) => ({ ...current, fileData: reader.result, fileName: file.name }));
      setReadingFile(false);
    };
    reader.onerror = () => {
      setError('Unable to read the selected file. Please try again.');
      setReadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !form.skill.trim() ||
      !form.date ||
      !form.day ||
      !form.time.trim() ||
      !form.communityCentre.trim() ||
      !form.volunteerName.trim() ||
      Number(form.availableSeats) < 1
    ) {
      setError('All fields are required. Seats must be greater than 0.');
      return;
    }

    setLoading(true);
    try {
      await createClass({
        skill: form.skill.trim(),
        date: form.date,
        day: form.day,
        time: form.time,
        communityCentre: form.communityCentre,
        volunteerName: form.volunteerName,
        availableSeats: Number(form.availableSeats),
        linkUrl: form.linkUrl.trim(),
        fileData: form.fileData,
        fileName: form.fileName,
        title: `${form.skill.trim()} Workshop`,
      });
      navigate('/volunteer/classes', {
        state: { message: 'Community class created successfully.' },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-900 mb-6">Add Community Class</h1>
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
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="class-link-url" className="mb-1 block text-sm font-medium">
              Class Resource Link (Optional)
            </label>
            <input
              id="class-link-url"
              name="linkUrl"
              type="url"
              value={form.linkUrl}
              onChange={onChange}
              placeholder="https://..."
              className="w-full border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="class-file" className="mb-1 block text-sm font-medium">
              Class Attachment (image, PDF, DOC, or DOCX; under 10 MB, optional)
            </label>
            <input
              id="class-file"
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={onFileChange}
              className="w-full border border-stone-300 px-3 py-2 text-sm"
            />
            {form.fileName && <p className="mt-1 text-sm text-stone-600">{form.fileName}</p>}
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
              placeholder="10:00 AM - 11:00 AM"
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
            <label className="mb-1 block text-sm font-medium">Available Seats</label>
            <input
              type="number"
              min="1"
              name="availableSeats"
              value={form.availableSeats}
              onChange={onChange}
              className="w-full border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2 flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={loading || readingFile}>
              {readingFile ? 'Reading file...' : loading ? 'Creating class...' : 'CREATE CLASS'}
            </Button>
            <Link to="/volunteer/classes">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
