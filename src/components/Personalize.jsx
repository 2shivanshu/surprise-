import { relationships } from '../config/relationships.js';
import { Mark } from './Icons.jsx';

export function Personalize({ name, rel, error, onName, onRel, onSubmit }) {
  const selected = relationships.find((item) => item.id === rel);

  return (
    <section className="personalize">
      <form className="sheet" onSubmit={onSubmit} noValidate>
        <p className="eyebrow">Before the lights</p>
        <h2>Who should this night answer to?</h2>

        <div className="field">
          <label htmlFor="guest-name">Your Name</label>
          <input
            id="guest-name"
            name="name"
            type="text"
            inputMode="text"
            autoComplete="name"
            enterKeyHint="next"
            maxLength={40}
            placeholder="Enter your beautiful name..."
            value={name}
            onChange={(event) => onName(event.target.value)}
            aria-invalid={error === 'name'}
            aria-describedby={error === 'name' ? 'name-error' : undefined}
          />
          {error === 'name' ? (
            <p id="name-error" className="field-error">
              I&apos;d love to know what to call you.
            </p>
          ) : null}
        </div>

        <fieldset className="field">
          <legend>Your Relationship With Shivanshu</legend>
          <div className="rel-list" role="radiogroup" aria-label="Your Relationship With Shivanshu">
            {relationships.map((item, index) => (
              <label
                key={item.id}
                className={rel === item.id ? 'rel is-on' : 'rel'}
                style={{ '--swatch': item.theme.particle[0], '--swatch-2': item.theme.fill }}
              >
                <input
                  type="radio"
                  name="relationship"
                  value={item.id}
                  checked={rel === item.id}
                  onChange={() => onRel(item.id)}
                />
                <span className="rel-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="rel-icon">
                  <Mark id={item.icon} />
                </span>
                <span className="rel-copy">
                  <span className="rel-label">{item.label}</span>
                </span>
              </label>
            ))}
          </div>
          {error === 'rel' ? <p className="field-error">Choose how we know each other.</p> : null}
          <p className="caption" aria-live="polite">
            {selected ? selected.caption : 'Pick one. The sky will change with you.'}
          </p>
        </fieldset>

        <button type="submit" className="cta">
          Create My Diwali Surprise ✨
        </button>
      </form>
    </section>
  );
}
