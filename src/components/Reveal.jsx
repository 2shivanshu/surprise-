export function Reveal({ lead, body, whatsapp, copied, onShare, onCopy, onRestart }) {
  return (
    <section className="reveal" aria-live="polite">
      <div className="reveal-copy">
        <p className="eyebrow rise">For you</p>
        <h2 className="rise" style={{ animationDelay: '0.12s' }}>
          {lead} <span className="spark">✨</span>
        </h2>
        <p className="message rise" style={{ animationDelay: '0.28s' }}>
          {body}
        </p>
        <p className="signature rise" style={{ animationDelay: '0.42s' }}>
          With love, Shivanshu ❤️
        </p>
        <div className="actions rise" style={{ animationDelay: '0.54s' }}>
          <button type="button" className="cta" onClick={onShare}>
            Share surprise
          </button>
          <a className="ghost" href={whatsapp} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          <button type="button" className="ghost" onClick={onCopy}>
            {copied ? 'Link copied' : 'Copy link'}
          </button>
          <button type="button" className="text-btn" onClick={onRestart}>
            Restart surprise
          </button>
        </div>
      </div>
    </section>
  );
}
