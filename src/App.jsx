import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Landing } from './components/Landing.jsx';
import { Personalize } from './components/Personalize.jsx';
import { Reveal } from './components/Reveal.jsx';
import { SceneCanvas } from './components/SceneCanvas.jsx';
import { SoundIcon } from './components/Icons.jsx';
import { landingTheme, relationshipById, themeFor, writeGreeting } from './config/relationships.js';
import { createAmbience } from './lib/audio.js';
import {
  copyText,
  isReadableName,
  readEntry,
  recallVisit,
  rememberVisit,
  sanitizeName,
  shareSurprise,
  siteUrl,
  syncAddress,
  whatsAppHref,
} from './lib/share.js';

function splitWish(rel, name) {
  const full = writeGreeting(rel, name);
  const mark = full.indexOf('!');
  if (mark < 0) return { lead: `Happy Diwali, ${name}!`, body: full };
  return { lead: full.slice(0, mark + 1), body: full.slice(mark + 1).trim() };
}

export default function App() {
  const sceneRef = useRef(null);
  const audioRef = useRef(null);
  const [stage, setStage] = useState('landing');
  const [booting, setBooting] = useState(true);
  const [name, setName] = useState('');
  const [rel, setRel] = useState('');
  const [error, setError] = useState('');
  const [welcome, setWelcome] = useState('');
  const [soundOn, setSoundOn] = useState(false);
  const [copied, setCopied] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const params = readEntry();
    const memory = recallVisit();
    const known = params.rel && relationshipById(params.rel) ? params.rel : '';
    if (params.name) setName(params.name);
    if (known) setRel(known);
    if (params.name) setWelcome(`${params.name}, this one was lit with you in mind.`);
    else if (memory?.name) setWelcome(`Welcome back, ${memory.name}.`);

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(media.matches);
    apply();
    media.addEventListener?.('change', apply);
    const failSafe = window.setTimeout(() => setBooting(false), 3200);
    return () => {
      media.removeEventListener?.('change', apply);
      window.clearTimeout(failSafe);
    };
  }, []);

  useEffect(() => {
    audioRef.current = createAmbience();
    return () => audioRef.current?.dispose();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [stage]);

  const theme = useMemo(() => (rel ? themeFor(rel) : landingTheme), [rel]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg-a', theme.bg[0]);
    root.style.setProperty('--bg-b', theme.bg[1]);
    root.style.setProperty('--bg-c', theme.bg[2]);
    root.style.setProperty('--gold', theme.light);
    root.style.setProperty('--fill', theme.fill);
  }, [theme]);

  const onReady = useCallback(() => {
    window.setTimeout(() => setBooting(false), 480);
  }, []);

  const onFallback = useCallback(() => setWebgl(false), []);

  function begin() {
    setStage('form');
    setError('');
  }

  function submit(event) {
    event.preventDefault();
    const clean = sanitizeName(name);
    if (!isReadableName(clean)) {
      setError('name');
      document.getElementById('guest-name')?.focus();
      return;
    }
    if (!relationshipById(rel)) {
      setError('rel');
      return;
    }
    setName(clean);
    setError('');
    setCopied(false);
    rememberVisit(clean, rel);
    syncAddress(clean, rel);
    document.title = `Happy Diwali, ${clean}`;
    setStage('reveal');
  }

  useEffect(() => {
    if (stage === 'reveal') sceneRef.current?.celebrate();
  }, [stage]);

  async function toggleSound() {
    const next = audioRef.current?.toggle();
    setSoundOn(Boolean(next));
  }

  async function onShare() {
    const result = await shareSurprise(name, rel);
    if (result === 'copied') flash('Link copied');
    if (result === 'failed') flash('Could not copy the link');
    if (result === 'copied') setCopied(true);
  }

  async function onCopy() {
    const ok = await copyText(siteUrl(name, rel));
    setCopied(ok);
    flash(ok ? 'Link copied' : 'Could not copy the link');
  }

  function flash(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  }

  function restart() {
    setStage('form');
    setCopied(false);
    document.title = 'A Little Diwali Surprise For You';
  }

  const wish = stage === 'reveal' && rel ? splitWish(rel, name) : null;

  return (
    <>
      <div className="sky" />
      <div className="vignette" />
      {webgl ? (
        <SceneCanvas
          ref={sceneRef}
          theme={theme}
          phase={stage === 'reveal' ? 'reveal' : stage === 'form' ? 'form' : 'landing'}
          reduced={reduced}
          onReady={onReady}
          onFallback={onFallback}
        />
      ) : (
        <div className="css-diya" aria-hidden="true">
          <span className="css-flame" />
          <span className="css-bowl" />
        </div>
      )}

      <header className="topbar">
        <span className="brand">Shivanshu</span>
        <button
          type="button"
          className="sound"
          aria-pressed={soundOn}
          aria-label={soundOn ? 'Mute festive sound' : 'Play festive sound'}
          onClick={toggleSound}
        >
          <SoundIcon on={soundOn} />
        </button>
      </header>

      <main>
        {stage === 'landing' && <Landing welcome={welcome} onBegin={begin} onPoke={() => sceneRef.current?.poke()} />}
        {stage === 'form' && (
          <Personalize
            name={name}
            rel={rel}
            error={error}
            onName={(value) => {
              setName(value);
              if (error === 'name') setError('');
            }}
            onRel={(value) => {
              setRel(value);
              if (error === 'rel') setError('');
            }}
            onSubmit={submit}
          />
        )}
        {stage === 'reveal' && wish && (
          <Reveal
            lead={wish.lead}
            body={wish.body}
            whatsapp={whatsAppHref(name, rel)}
            copied={copied}
            onShare={onShare}
            onCopy={onCopy}
            onRestart={restart}
          />
        )}
      </main>

      {booting && (
        <div className="loader" role="status">
          <div className="css-diya loader-diya" aria-hidden="true">
            <span className="css-flame" />
            <span className="css-bowl" />
          </div>
          <p>Lighting the diya</p>
        </div>
      )}
      {toast ? <p className="toast" role="status">{toast}</p> : null}
    </>
  );
}
