export default function Loading({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-700" />
        <p className="text-stone-600">{text}</p>
      </div>
    </div>
  );
}
