export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-900">
      {message}
    </div>
  );
}
