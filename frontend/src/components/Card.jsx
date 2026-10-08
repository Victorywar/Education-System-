export default function Card({ children, className = '', title, subtitle }) {
  return (
    <div className={`bg-white/90 border border-stone-200 p-5 shadow-sm ${className}`}>
      {title && <h3 className="text-lg font-bold text-stone-900 mb-1">{title}</h3>}
      {subtitle && <p className="text-sm text-stone-600 mb-3">{subtitle}</p>}
      {children}
    </div>
  );
}
