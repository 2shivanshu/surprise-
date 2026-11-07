const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function Mark({ id }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      {id === 'best' && (
        <>
          <path {...stroke} d="M16 6.5l1.6 4.2 4.4.4-3.3 2.9.9 4.3L16 16.2l-3.6 2.1.9-4.3-3.3-2.9 4.4-.4z" />
          <path {...stroke} d="M7 22.5c2.2-1.6 4.2-1.4 6.2.2M19 22.7c2-.1 3.8.4 6 2" />
        </>
      )}
      {id === 'close' && (
        <>
          <path {...stroke} d="M11 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zM21 24a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
          <path {...stroke} d="M14.2 12.2l3.6 3.6" />
        </>
      )}
      {id === 'school' && (
        <>
          <path {...stroke} d="M6 14.5L16 9l10 5.5L16 20z" />
          <path {...stroke} d="M10 16.2V21c1.8 1.4 8.2 1.4 12 0v-4.8" />
        </>
      )}
      {id === 'college' && (
        <>
          <path {...stroke} d="M8 20.5l8-12 8 12" />
          <path {...stroke} d="M11 20.5h10M16 8.5V6" />
        </>
      )}
      {id === 'brother' && (
        <>
          <path {...stroke} d="M16 5.5l8 3.2v6.4c0 4.6-3.2 7.6-8 9.4-4.8-1.8-8-4.8-8-9.4V8.7z" />
          <path {...stroke} d="M16 12.5v6" />
        </>
      )}
      {id === 'sister' && (
        <path {...stroke} d="M16 25c-1-6 6-9.5 6-14a4.2 4.2 0 0 0-6-3.6A4.2 4.2 0 0 0 10 11c0 4.5 7 8 6 14z" />
      )}
      {id === 'cousin' && (
        <>
          <path {...stroke} d="M16 6v4M16 22v4M6 16h4M22 16h4" />
          <path {...stroke} d="M9.2 9.2l2.6 2.6M20.2 20.2l2.6 2.6M22.8 9.2l-2.6 2.6M11.8 20.2l-2.6 2.6" />
        </>
      )}
      {id === 'family' && (
        <>
          <path {...stroke} d="M6 15.5L16 7l10 8.5" />
          <path {...stroke} d="M9 14.5V24h14v-9.5" />
          <path {...stroke} d="M16 24v-5" />
        </>
      )}
      {id === 'special' && (
        <>
          <circle {...stroke} cx="16" cy="16" r="6.5" />
          <circle {...stroke} cx="16" cy="16" r="1.4" />
        </>
      )}
      {id === 'someone' && (
        <path {...stroke} d="M16 24s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 16 11a4.2 4.2 0 0 1 7.5 3c0 5.4-7.5 10-7.5 10z" />
      )}
      {id === 'other' && (
        <>
          <path {...stroke} d="M16 7.5l1.3 3.6H21l-3 2.3 1.1 3.6L16 15.8l-3.1 1.2 1.1-3.6-3-2.3h3.7z" />
          <circle {...stroke} cx="16" cy="16" r="9" />
        </>
      )}
    </svg>
  );
}

export function SoundIcon({ on }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path {...stroke} d="M4 10h3.2L12 6.5v11L7.2 14H4z" />
      {on ? (
        <path {...stroke} d="M15.5 9.2a3.6 3.6 0 0 1 0 5.6M17.8 7a6.2 6.2 0 0 1 0 10" />
      ) : (
        <path {...stroke} d="M16 10l4 4M20 10l-4 4" />
      )}
    </svg>
  );
}
