const MEMORY_KEY = 'diwali-surprise-v1';

export function siteUrl(name, rel) {
  const url = new URL(import.meta.env.BASE_URL, window.location.origin);
  if (name) url.searchParams.set('name', name);
  if (rel) url.searchParams.set('rel', rel);
  return url.toString();
}

export function readEntry() {
  const params = new URLSearchParams(window.location.search);
  const name = sanitizeName(params.get('name') || '');
  const rel = params.get('rel') || '';
  return { name, rel };
}

export function sanitizeName(value) {
  return String(value || '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 40);
}

export function isReadableName(value) {
  const name = sanitizeName(value);
  if (!name) return false;
  try {
    return /[\p{L}\p{N}]/u.test(name);
  } catch {
    return name.length > 1;
  }
}

export function rememberVisit(name, rel) {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify({ name, rel }));
  } catch {
    /* private mode */
  }
}

export function recallVisit() {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const name = sanitizeName(data.name || '');
    if (!name) return null;
    return { name, rel: data.rel || '' };
  } catch {
    return null;
  }
}

export function syncAddress(name, rel) {
  const url = new URL(window.location.href);
  url.searchParams.set('name', name);
  url.searchParams.set('rel', rel);
  window.history.replaceState({}, '', url);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.top = '0';
    field.style.left = '-9999px';
    document.body.appendChild(field);
    field.focus();
    field.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    field.remove();
    return ok;
  }
}

export async function shareSurprise(name, rel) {
  const url = siteUrl(name, rel);
  const payload = {
    title: 'A Little Diwali Surprise For You',
    text: 'Someone has prepared something special for you.',
    url,
  };
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share(payload);
      return 'shared';
    } catch (error) {
      if (error && error.name === 'AbortError') return 'aborted';
    }
  }
  const ok = await copyText(url);
  return ok ? 'copied' : 'failed';
}

export function whatsAppHref(name, rel) {
  const url = siteUrl(name, rel);
  const text = `A little Diwali surprise is waiting for you: ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
