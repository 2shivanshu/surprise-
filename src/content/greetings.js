/** Spoken-in notes. The lead line is split off in the reveal so the name can be set large. */
export const greetings = {
  'best-friend': (name) =>
    `Happy Diwali, ${name}! Life would honestly be boring without crazy friends like you. May our friendship keep shining brighter than all the lights around us. Keep smiling, keep growing, and never change!`,

  'close-friend': (name) =>
    `Happy Diwali, ${name}! I don't have to tidy up my sentences with you, and that is rare. Thank you for the random calls and the honest opinions. May this year be gentle on you, and a little bit lucky.`,

  'school-friend': (name) =>
    `Happy Diwali, ${name}! I still think of school Diwalis — the half day, the crackers we weren't supposed to have, and the argument about whose mum made the better snacks. Those memories show up every year. Wishing you a bright one, and a year that feels like yours.`,

  'college-friend': (name) =>
    `Happy Diwali, ${name}! From college memories to all those unforgettable moments, I hope we keep making many more. Wishing you success, happiness, and a future brighter than ever!`,

  brother: (name) =>
    `Happy Diwali, ${name}! May you always have the courage to chase your dreams and the strength to achieve everything you deserve. Stay happy, stay blessed, and keep shining!`,

  sister: (name) =>
    `Happy Diwali, ${name}! May your life always be filled with happiness, beautiful memories, and endless smiles. Keep spreading your positivity wherever you go!`,

  cousin: (name) =>
    `Happy Diwali, ${name}! It doesn't feel like a festival until the cousins are in the house and nobody can hear themselves. May your year be full, your plate fuller, and may we actually meet instead of just saying we will.`,

  'family-member': (name) =>
    `Happy Diwali, ${name}! Family makes every celebration special. May this festival bring peace, good health, prosperity, and countless happy moments to your life!`,

  'special-person': (name) =>
    `Happy Diwali, ${name}! You have a way of making an ordinary day feel carefully held. I hope tonight brings you something you've been quietly hoping for, and that the rest of the year takes its cue from this light.`,

  'someone-special': (name) =>
    `Happy Diwali, ${name}! I thought of you before I thought of the lights. Thank you for being the calm and the spark, sometimes in the same hour. Stay close. Stay exactly as you are.`,

  other: (name) =>
    `Happy Diwali, ${name}! I'm glad we know each other, however that came to be. May your house be bright tonight, and may the year ahead be kinder than you are bracing for.`,
};

export function greetingFor(id, name) {
  const write = greetings[id] || greetings.other;
  return write(name);
}
