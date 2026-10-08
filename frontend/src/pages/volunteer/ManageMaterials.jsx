import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import ConfirmModal from '../../components/volunteer/ConfirmModal';
import { deleteMaterial, getMyMaterials } from '../../services/volunteerService';

function getSafeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
}

function getVideoEmbedUrl(value) {
  const url = getSafeUrl(value);
  if (!url) return '';

  let videoId = '';
  if (url.hostname === 'youtu.be') {
    videoId = url.pathname.slice(1).split('/')[0];
  } else if (
    ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com']
      .includes(url.hostname)
  ) {
    videoId = url.pathname === '/watch' ? url.searchParams.get('v') || '' : url.pathname.split('/').filter(Boolean).pop() || '';
  }
  return videoId
    ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`
    : '';
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ManageMaterials() {
  const location = useLocation();
  const [materials, setMaterials] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMaterials = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getMyMaterials();
      setMaterials(response.data.materials || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load materials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const onConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setError('');
    setSuccess('');
    try {
      const response = await deleteMaterial(deleteId);
      setSuccess(response.data.message || 'Material deleted successfully.');
      setDeleteId(null);
      await loadMaterials();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete material. Please try again.');
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl overflow-x-hidden px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-stone-900">Manage Materials</h1>
        <Link to="/volunteer/materials/add"><Button>ADD NEW MATERIAL</Button></Link>
      </div>

      <ErrorMessage message={error} />
      {success && (
        <div className="mb-4 border border-teal-300 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          {success}
        </div>
      )}

      {loading ? <Loading text="Loading materials..." /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {materials.map((material) => {
            const linkUrl = material.linkUrl || material.videoUrl || '';
            const safeUrl = getSafeUrl(linkUrl);
            const embedUrl = getVideoEmbedUrl(linkUrl);
            const contentType = material.contentType || (material.type === 'video' ? 'Video' : 'Custom');

            return (
              <Card key={material._id} className="rounded-xl">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">{material.title}</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-medium text-teal-800">
                        {material.skill}
                      </span>
                      <span className="rounded-full bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">
                        {contentType}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    className="px-3 py-2"
                    onClick={() => setDeleteId(material._id)}
                  >
                    Delete
                  </Button>
                </div>

                {material.description && (
                  <p className="mb-3 whitespace-pre-wrap text-sm text-stone-700">{material.description}</p>
                )}

                {material.fileData && contentType === 'Image' && (
                  <img
                    src={material.fileData}
                    alt={material.fileName || material.title}
                    className="mb-3 max-h-80 w-full rounded-lg bg-stone-100 object-contain"
                  />
                )}
                {material.fileData && contentType !== 'Image' && (
                  <p className="mb-3 break-all text-sm">
                    <a
                      href={material.fileData}
                      download={material.fileName || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-teal-800 underline hover:text-teal-900"
                    >
                      📄 Download: {material.fileName || 'View attachment'}
                    </a>
                  </p>
                )}

                {embedUrl && (
                  <div className="mb-3 aspect-video overflow-hidden rounded-lg bg-stone-100">
                    <iframe
                      src={embedUrl}
                      title={`${material.title} video`}
                      className="h-full w-full"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                )}
                {safeUrl && (
                  <p className="mb-3 break-all text-sm">
                    <a
                      href={safeUrl.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded bg-teal-700 px-3 py-2 font-medium text-white hover:bg-teal-800"
                    >
                      Open Web Link
                    </a>
                  </p>
                )}

                {material.contentNotes && (
                  <div className="mb-3 whitespace-pre-wrap rounded-lg bg-stone-50 p-3 text-sm text-stone-700">
                    {material.contentNotes}
                  </div>
                )}

                <p className="text-sm text-stone-600">
                  Language: {material.language || 'Tamil'} · Added {formatDate(material.createdAt)}
                </p>
              </Card>
            );
          })}
          {materials.length === 0 && (
            <Card className="rounded-xl md:col-span-2">
              <p className="text-stone-600">No materials yet. Add your first course material.</p>
            </Card>
          )}
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete Material"
        message="Are you sure you want to delete this material?"
        confirmLabel="DELETE MATERIAL"
        cancelLabel="CANCEL"
        loading={deleting}
        onCancel={() => setDeleteId(null)}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
}
