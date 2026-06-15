// STigen-logotypen: en slingrande stig uppåt med milstolpar och en målflagga.
// Återanvänds i sidofältet och mobilmenyn så märket är konsekvent.
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} role="img" aria-label="STigen">
      <defs>
        <linearGradient id="stigen-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2f8a99" />
          <stop offset="1" stopColor="#173f48" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="120" fill="url(#stigen-bg)" />
      <path
        d="M156 392 C156 332 356 332 356 272 C356 212 156 212 156 152 C156 124 198 114 252 112"
        fill="none"
        stroke="#ffffff"
        strokeWidth="26"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />
      <circle cx="156" cy="392" r="21" fill="#ffffff" />
      <circle cx="156" cy="392" r="8" fill="#2f8a99" />
      <circle cx="356" cy="272" r="21" fill="#ffffff" />
      <circle cx="356" cy="272" r="8" fill="#2f8a99" />
      <circle cx="156" cy="152" r="21" fill="#ffffff" />
      <circle cx="156" cy="152" r="8" fill="#2f8a99" />
      <line
        x1="252"
        y1="118"
        x2="252"
        y2="64"
        stroke="#ffffff"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path d="M252 70 L300 84 L252 100 Z" fill="#7ad9c4" />
    </svg>
  );
}
