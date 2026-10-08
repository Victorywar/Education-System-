import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import { addMaterial } from '../../services/volunteerService';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const initialForm = {
  title: '',
  skill: '',
  contentType: 'Custom',
  linkUrl: '',
  fileData: '',
  fileName: '',
  language: 'Tamil',
  description: '',
  contentNotes: '',
};

function detectContentType(file) {
  if (file.type.startsWith('image/')) return 'Image';
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) return 'PDF';
  return 'Document';
}

export default function AddMaterial() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [readingFile, setReadingFile] = useState(false);
  const navigate = useNavigate();

  const onChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const onFileChange = (event) => {
    const file = event.target.files?.[0];
    setError('');

    if (!file) {
      setForm((current) => ({
        ...current,
        fileData: '',
        fileName: '',
        contentType: current.linkUrl ? 'Link' : 'Custom',
      }));
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
      setForm((current) => ({
        ...current,
        fileData: reader.result,
        fileName: file.name,
        contentType: detectContentType(file),
      }));
      setReadingFile(false);
    };
    reader.onerror = () => {
      setError('Unable to read the selected file. Please try again.');
      setReadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.title.trim() || !form.skill.trim()) {
      setError('Enter a title and course or skill name.');
      return;
    }
    if (!form.linkUrl.trim() && !form.fileData) {
      setError('Provide a web link or attach a file.');
      return;
    }

    setLoading(true);
    try {
      const contentType = form.fileData
        ? form.contentType
        : form.linkUrl.trim()
          ? /youtube\.com|youtu\.be/i.test(form.linkUrl)
            ? 'Video'
            : 'Link'
          : 'Custom';
      await addMaterial({
        ...form,
        title: form.title.trim(),
        skill: form.skill.trim(),
        contentType,
        linkUrl: form.linkUrl.trim(),
        language: form.language.trim(),
        description: form.description.trim(),
        contentNotes: form.contentNotes.trim(),
      });
      navigate('/volunteer/materials', {
        state: { message: 'Material added successfully.' },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add material. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-stone-900">Add Course Material</h1>
      <Card className="rounded-xl">
        <ErrorMessage message={error} />
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className="mb-1 block text-sm font-medium">Title</label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={onChange}
              required
              maxLength={160}
              className="w-full border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="skill" className="mb-1 block text-sm font-medium">Course / Skill</label>
            <input
              id="skill"
              name="skill"
              value={form.skill}
              onChange={onChange}
              required
              placeholder="e.g. Spoken English, Vedic Maths, Robotics"
              className="w-full border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="language" className="mb-1 block text-sm font-medium">Language</label>
            <input
              id="language"
              name="language"
              value={form.language}
              onChange={onChange}
              placeholder="e.g. Tamil, English"
              className="w-full border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="linkUrl" className="mb-1 block text-sm font-medium">
              Web Link / YouTube / Drive URL (Optional if file is attached)
            </label>
            <input
              id="linkUrl"
              name="linkUrl"
              type="url"
              value={form.linkUrl}
              onChange={onChange}
              placeholder="https://..."
              className="w-full border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="material-file" className="mb-1 block text-sm font-medium">
              Attachment (image, PDF, DOC, or DOCX; under 10 MB)
            </label>
            <input
              id="material-file"
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={onFileChange}
              className="w-full border border-stone-300 px-3 py-2 text-sm"
            />
            {form.fileName && (
              <p className="mt-1 text-sm text-stone-600">
                {form.fileName} · {form.contentType}
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className="mb-1 block text-sm font-medium">Short Description</label>
            <textarea
              id="description"
              name="description"
              rows="2"
              value={form.description}
              onChange={onChange}
              className="w-full border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="contentNotes" className="mb-1 block text-sm font-medium">
              Detailed Notes / Homework
            </label>
            <textarea
              id="contentNotes"
              name="contentNotes"
              rows="6"
              value={form.contentNotes}
              onChange={onChange}
              className="w-full border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-3 pt-2 sm:col-span-2">
            <Button type="submit" disabled={loading || readingFile}>
              {readingFile ? 'Reading file...' : loading ? 'Adding material...' : 'ADD MATERIAL'}
            </Button>
            <Link to="/volunteer/materials">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
