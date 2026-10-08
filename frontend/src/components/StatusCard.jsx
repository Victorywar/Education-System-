import { Link } from 'react-router-dom';
import Button from './Button';

/**
 * Phase 3 — Dashboard status card
 */
export default function StatusCard({ title, description, status, buttonLabel, to, statusTone = 'neutral' }) {
  const toneClasses = {
    success: 'bg-teal-100 text-teal-900',
    warning: 'bg-amber-100 text-amber-900',
    neutral: 'bg-stone-100 text-stone-700',
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-stone-200 bg-white/90 p-5 shadow-sm">
      <h3 className="text-lg font-bold text-stone-900">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">{description}</p>
      <div className="mt-4">
        <span
          className={`inline-block rounded-md px-2.5 py-1 text-xs font-semibold ${toneClasses[statusTone] || toneClasses.neutral}`}
        >
          Status: {status}
        </span>
      </div>
      <div className="mt-4">
        <Link to={to}>
          <Button className="w-full sm:w-auto">{buttonLabel}</Button>
        </Link>
      </div>
    </div>
  );
}
