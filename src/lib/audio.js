/** Original ambient bed: a low fifth and occasional soft bells. No sample files. */
export function createAmbience() {
  let ctx = null;
  let master = null;
  let oscillators = [];
  let timer = 0;
  let playing = false;

  const bells = [392, 493.88, 587.33, 659.25, 783.99];

  function chime() {
    if (!ctx || !master) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = 'sine';
    osc.frequency.value = bells[Math.floor(Math.random() * bells.length)];
    filter.type = 'lowpass';
    filter.frequency.value = 1800;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + 2.5);
  }

  function start() {
    if (playing) return true;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return false;
    ctx = new AudioCtx();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    filter.connect(master);

    [110, 164.81, 220].forEach((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = index === 2 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.value = index === 2 ? 0.015 : 0.04;
      osc.connect(gain);
      gain.connect(filter);
      osc.start();
      oscillators.push(osc);
    });

    const now = ctx.currentTime;
    master.gain.linearRampToValueAtTime(0.9, now + 1.1);
    timer = window.setInterval(chime, 5200);
    window.setTimeout(chime, 700);
    playing = true;
    return true;
  }

  function stop() {
    if (!playing || !ctx) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0.0001, now + 0.4);
    const closing = ctx;
    window.clearInterval(timer);
    timer = 0;
    oscillators.forEach((osc) => {
      try {
        osc.stop(now + 0.45);
      } catch {
        /* already stopped */
      }
    });
    oscillators = [];
    playing = false;
    window.setTimeout(() => {
      closing.close().catch(() => {});
      if (ctx === closing) {
        ctx = null;
        master = null;
      }
    }, 500);
  }

  function toggle() {
    if (playing) {
      stop();
      return false;
    }
    return start();
  }

  function dispose() {
    window.clearInterval(timer);
    oscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        /* ignore */
      }
    });
    oscillators = [];
    playing = false;
    if (ctx) {
      ctx.close().catch(() => {});
      ctx = null;
    }
  }

  return {
    toggle,
    dispose,
    get playing() {
      return playing;
    },
  };
}
