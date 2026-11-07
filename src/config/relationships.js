import { greetingFor } from '../content/greetings.js';

/**
 * One record drives the form, the sky, the particle rig, and the note.
 * motif: spark | confetti | petal | heart
 * firework: playful | elegant | soft | powerful | romantic
 */
const theme = (partial) => ({
  motif: 'spark',
  energy: 1,
  lanterns: 2,
  diyas: 1,
  rays: 0,
  geometry: false,
  firework: 'elegant',
  glow: 1,
  ...partial,
});

export const landingTheme = theme({
  id: 'landing',
  bg: ['#07040f', '#24143d', '#6a3414'],
  light: '#ffc56d',
  fill: '#6d28d9',
  particle: ['#f2c56a', '#ffb15a', '#e4c8ff', '#fff4d4'],
  energy: 0.72,
  lanterns: 3,
  glow: 1,
});

export const relationships = [
  {
    id: 'best-friend',
    label: 'Best Friend',
    icon: 'best',
    caption: 'Loud lights. The kind of night that feels like us.',
    theme: theme({
      id: 'best-friend',
      bg: ['#120816', '#4a1868', '#9a3d12'],
      light: '#ffb15a',
      fill: '#c084fc',
      particle: ['#f2c14e', '#ff7a29', '#e7c4ff', '#fff1c9'],
      motif: 'confetti',
      energy: 1.45,
      lanterns: 3,
      firework: 'playful',
      glow: 1.25,
    }),
  },
  {
    id: 'close-friend',
    label: 'Close Friend',
    icon: 'close',
    caption: 'Warm gold, and room to talk.',
    theme: theme({
      id: 'close-friend',
      bg: ['#100818', '#3a2158', '#6e4a16'],
      light: '#f0c56e',
      fill: '#a78bfa',
      particle: ['#e6c36a', '#f3d9a4', '#c4a0e8', '#fff6e2'],
      motif: 'spark',
      energy: 0.9,
      lanterns: 2,
      firework: 'elegant',
      glow: 1.05,
    }),
  },
  {
    id: 'school-friend',
    label: 'School Friend',
    icon: 'school',
    caption: 'A softer glow, like old evenings after the bell.',
    theme: theme({
      id: 'school-friend',
      bg: ['#140c10', '#4a2a14', '#8a4b16'],
      light: '#f0b45a',
      fill: '#c47a3a',
      particle: ['#f0b45a', '#ffcf99', '#e7a15a', '#fff1d0'],
      motif: 'spark',
      energy: 0.95,
      lanterns: 2,
      firework: 'soft',
      glow: 1,
    }),
  },
  {
    id: 'college-friend',
    label: 'College Friend',
    icon: 'college',
    caption: 'Electric, a little chaotic, very us.',
    theme: theme({
      id: 'college-friend',
      bg: ['#0c0618', '#3b1570', '#5b2a86'],
      light: '#e6c36a',
      fill: '#7c5cff',
      particle: ['#c084fc', '#7c5cff', '#f2c14e', '#f5f0ff'],
      motif: 'confetti',
      energy: 1.6,
      lanterns: 2,
      firework: 'playful',
      glow: 1.3,
    }),
  },
  {
    id: 'brother',
    label: 'Brother',
    icon: 'brother',
    caption: 'Steady gold. A bigger sky.',
    theme: theme({
      id: 'brother',
      bg: ['#070a16', '#14284a', '#3d3420'],
      light: '#e8c872',
      fill: '#3b82f6',
      particle: ['#e8c872', '#f4e2b0', '#7eb6ff', '#dbe7ff'],
      motif: 'spark',
      energy: 1.15,
      lanterns: 1,
      rays: 0.28,
      geometry: true,
      firework: 'powerful',
      glow: 1.15,
    }),
  },
  {
    id: 'sister',
    label: 'Sister',
    icon: 'sister',
    caption: 'Rose light, and petals in the air.',
    theme: theme({
      id: 'sister',
      bg: ['#160910', '#4a2038', '#6e4520'],
      light: '#f2c7a0',
      fill: '#e48ab0',
      particle: ['#f2a7c3', '#e8c36a', '#ffd6e4', '#fff0e4'],
      motif: 'petal',
      energy: 0.7,
      lanterns: 2,
      firework: 'soft',
      glow: 1.05,
    }),
  },
  {
    id: 'cousin',
    label: 'Cousin',
    icon: 'cousin',
    caption: 'Crackling orange. Too many stories at once.',
    theme: theme({
      id: 'cousin',
      bg: ['#140a08', '#5a2410', '#8a3e12'],
      light: '#ffb15a',
      fill: '#ff8a3d',
      particle: ['#ff8a3d', '#f2c14e', '#ffd7a1', '#fff4df'],
      motif: 'confetti',
      energy: 1.25,
      lanterns: 3,
      firework: 'playful',
      glow: 1.15,
    }),
  },
  {
    id: 'family-member',
    label: 'Family Member',
    icon: 'family',
    caption: 'Many diyas. One home.',
    theme: theme({
      id: 'family-member',
      bg: ['#140806', '#4a1814', '#6a3018'],
      light: '#ffb347',
      fill: '#c2412d',
      particle: ['#ffb347', '#f0c14e', '#ffd7a8', '#fff1d8'],
      motif: 'spark',
      energy: 0.78,
      lanterns: 4,
      diyas: 3,
      rays: 0.62,
      firework: 'elegant',
      glow: 1.1,
    }),
  },
  {
    id: 'special-person',
    label: 'Special Person',
    icon: 'special',
    caption: 'A quieter light, kept for you.',
    theme: theme({
      id: 'special-person',
      bg: ['#120814', '#3a1848', '#5c3048'],
      light: '#f0c4b4',
      fill: '#c084fc',
      particle: ['#e7b3c5', '#d4a0ff', '#f2c14e', '#ffe8f0'],
      motif: 'heart',
      energy: 0.68,
      lanterns: 1,
      firework: 'romantic',
      glow: 1.05,
    }),
  },
  {
    id: 'someone-special',
    label: 'Someone Special ❤️',
    icon: 'someone',
    caption: 'The night slows down here.',
    theme: theme({
      id: 'someone-special',
      bg: ['#100612', '#3a1248', '#5a2844'],
      light: '#f0c9d4',
      fill: '#db7ea6',
      particle: ['#e9b3d1', '#c084fc', '#f0c9a0', '#ffe4f0'],
      motif: 'heart',
      energy: 0.62,
      lanterns: 2,
      rays: 0.18,
      firework: 'romantic',
      glow: 1.12,
    }),
  },
  {
    id: 'other',
    label: 'Other',
    icon: 'other',
    caption: 'Classic flames. An open sky.',
    theme: theme({
      id: 'other',
      bg: ['#0c0814', '#2e1848', '#6a4018'],
      light: '#f0c14e',
      fill: '#a78bfa',
      particle: ['#f0c14e', '#d4b4ff', '#ffe1a8', '#fff6e0'],
      motif: 'confetti',
      energy: 1,
      lanterns: 3,
      diyas: 3,
      firework: 'elegant',
      glow: 1,
    }),
  },
];

export function relationshipById(id) {
  return relationships.find((item) => item.id === id) || null;
}

export function themeFor(id) {
  return relationshipById(id)?.theme || landingTheme;
}

export function writeGreeting(id, name) {
  return greetingFor(id, name);
}
