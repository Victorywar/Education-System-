export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold tracking-wide transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-teal-700 text-white hover:bg-teal-800 focus:ring-teal-600',
    secondary: 'bg-stone-800 text-white hover:bg-stone-900 focus:ring-stone-700',
    outline: 'border-2 border-teal-700 text-teal-800 hover:bg-teal-50 focus:ring-teal-600',
    danger: 'bg-orange-700 text-white hover:bg-orange-800 focus:ring-orange-600',
    ghost: 'text-teal-800 hover:bg-teal-50 focus:ring-teal-600',
  };

  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
