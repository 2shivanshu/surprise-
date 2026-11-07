export function Landing({ welcome, onBegin, onPoke }) {
  return (
    <section className="landing">
      <button type="button" className="diya-hit" onClick={onPoke} aria-label="Brighten the flame" />
      <div className="landing-copy">
        <p className="eyebrow">A private note</p>
        <h1>
          A Little Diwali
          <em> Surprise </em>
          For You
        </h1>
        <p className="lede">Someone has prepared something special for you. Let&apos;s make this Diwali memorable.</p>
        {welcome ? <p className="welcome">{welcome}</p> : null}
        <button type="button" className="cta" onClick={onBegin}>
          Discover Your Surprise
        </button>
      </div>
    </section>
  );
}
