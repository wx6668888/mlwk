// Line icons drawn to match the 1.5px stroke of the rest of the UI.
type P = { size?: number };

export function InstagramIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 21v-7h3l.5-4H14V8c0-1 .4-2 2-2h1.6V2.5A20 20 0 0 0 15 2.3c-2.6 0-4.4 1.6-4.4 4.5V10H8v4h2.6v7" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z" />
      <path d="M9 8.6c.2-.5.5-.6.8-.6h.5l.9 2.1-.7.9c.5 1 1.3 1.8 2.4 2.4l.9-.7 2.1.9v.5c0 .3-.1.6-.6.8-.6.3-1.5.4-2.6-.1A8 8 0 0 1 9 11.2c-.4-1-.3-2 0-2.6z" />
    </svg>
  );
}
