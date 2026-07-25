/* ============================================================
   NINE MONTHS: THE GAME — all editable content lives here.
   Change captions, dates, quiz questions, and the letter freely.
   Levels follow the real photo timestamps (Oct 2025 → Jun 2026).
   ============================================================ */

const DATA = {
  player1: "Anshul",
  player2: "Preksha",

  // The day it all began (YYYY-MM-DD). Used for the live day counter.
  startDate: "2025-10-24",

  // Photo captions — path is relative to the site root.
  photos: {
    festive1:   { src: "photos/IMG_1995.jpg", cap: "Oct 29 · The lights were beautiful. I was looking at you. ✨" },
    hallowPre:  { src: "photos/IMG_2002.jpg", cap: "Oct 31 · Ready for mischief 🖤" },
    hallow1:    { src: "photos/IMG_2003.jpg", cap: "Dressed in black, falling anyway" },
    hallowWink: { src: "photos/IMG_2005.jpg", cap: "The wink that keeps winning me over 😜" },
    hallowEyes: { src: "photos/IMG_2006.jpg", cap: "Scary? No. Adorable? Extremely." },
    hallowSoft: { src: "photos/IMG_2007.jpg", cap: "Before the scars: just us and the skyline" },
    hallow2:    { src: "photos/IMG_2008.jpg", cap: "Blurry photo, crystal-clear feelings" },
    hallow3:    { src: "photos/IMG_2009.jpg", cap: "Halloween night, holding on tight" },
    hallowScars:{ src: "photos/IMG_2015.jpg", cap: "Scars on, chaos loading…" },
    halloween:  { src: "photos/IMG_2020.jpg", cap: "Our first Halloween — fake scars, real butterflies 🎃" },
    hallowParty:{ src: "photos/IMG_2022.jpg", cap: "A whole party around us, my whole world right here 💜" },
    diwali1:    { src: "photos/IMG_2028.jpg", cap: "Nov 1 · New festival, same favourite person 🪔" },
    diwali2:    { src: "photos/IMG_2030.jpg", cap: "Every diya in the city was jealous of your glow 💚" },
    diwali3:    { src: "photos/IMG_2037.jpg", cap: "The mirror agreed: we make sense together" },
    bday1: { src: "photos/IMG_2072.jpg", cap: "Nov 2 · Birthday girl in sequins ✨ (I was the one getting the gift)" },
    bday2: { src: "photos/IMG_2074.jpg", cap: "Your first birthday with me — celebrating you came easy 🎂" },
    earmuffs:   { src: "photos/IMG_2106.jpg", cap: "Nov 7 · One silly hat, one pair of earmuffs, zero regrets" },
    winter:     { src: "photos/IMG_2130.jpg", cap: "Nov 10 · Chicago turned cold. You kept me warm. ❄️" },
    neon:       { src: "photos/IMG_2198.jpg", cap: "Nov 11 · Neon paint, silly grins, one unforgettable night 💡" },
    bdaySurprise: { src: "photos/IMG_2307.jpg", cap: "Nov 29 · My surprise party, your masterpiece. Tiara mandatory. 👑" },
    nye:        { src: "photos/IMG_2642.jpg", cap: "Dec 31 · The year ended exactly where I belonged — next to you 🎆" },
    nye2:       { src: "photos/IMG_2643.jpg", cap: "One ornament, two of us ✨" },
    lakefill1:  { src: "photos/IMG_4529.jpg", cap: "May 29 · Golden hour had competition 🌅" },
    lakeside1:  { src: "photos/IMG_4629.jpg", cap: "Jun 5 · The lake was pretty. You were prettier." },
    lakeside2:  { src: "photos/IMG_4645.jpg", cap: "My favourite view was never the water" },
    beach1:     { src: "photos/IMG_4653.jpg", cap: "Jun 6 · Sunshine, sand, and you — a perfect day ☀️" },
    beach2:     { src: "photos/IMG_4661.jpg", cap: "Lake Michigan, but the view is you" },
    gradParty1: { src: "photos/IMG_4672.jpg", cap: "The night before your big day — I couldn't stop smiling 🤍" },
    gradParty2: { src: "photos/IMG_4676.jpg", cap: "Celebrating you comes naturally" },
    graduation: { src: "photos/IMG_4702.jpg", cap: "Jun 7 · MBA: UNLOCKED. Kellogg, Class of 2026 🎓" },
    gradSelfie1:{ src: "photos/IMG_4711.jpg", cap: "So proud of you." },
    gradSelfie2:{ src: "photos/IMG_4715.jpg", cap: "My favourite graduate" }
  },

  // Video memories — referenced from levels as "video:<key>".
  videos: {
    midnight: { src: "video/midnight.mp4", poster: "video/midnight-poster.jpg", cap: "12:08 AM · Fireworks above, you in my arms 🎆" }
  },

  // Level definitions — 9 chapters + a final boss, in true chronological order.
  levels: [
    {
      month: "Late October '25", title: "It Begins",
      game: "hearts",
      intro: "Two players joined the game. Tap all nine hearts — one for every month together.",
      reveals: ["festive1"]
    },
    {
      month: "October 31 '25", title: "Trick or Treat",
      game: "match",
      intro: "Our very first Halloween — the black outfits, the goofy faces, the fake scars, the party. Match the pairs to piece the night back together.",
      reveals: ["halloween", "hallowParty", "hallow2"]
    },
    {
      month: "November 1 '25", title: "Desi Hearts",
      game: "scramble",
      intro: "The morning after Halloween, we turned around and lit it up desi style. Unscramble the words that matter.",
      reveals: ["diwali1", "diwali2", "diwali3"]
    },
    {
      month: "November 2 '25", title: "Birthday Girl",
      game: "quiz",
      intro: "Halloween, then Diwali, then the real celebration — your birthday. A little quiz, about you, me, and us. Every answer is a good one.",
      reveals: ["bday1", "bday2"]
    },
    {
      month: "November 7–10 '25", title: "Winter Mode",
      game: "scratch",
      intro: "Chicago started freezing. We went shopping. Scratch away the frost to see what's underneath.",
      reveals: ["winter"]
    },
    {
      month: "November 11–29 '25", title: "Glow Up",
      game: "catch",
      intro: "Neon nights — and then the surprise party you secretly threw for my birthday. November kept glowing. Catch 12 falling hearts before they hit the floor.",
      reveals: ["neon", "bdaySurprise"]
    },
    {
      month: "New Year's Eve '25", title: "Midnight Countdown",
      game: "countdown",
      intro: "We closed out 2025 under a sky full of lights. Tap the fireworks to count down to midnight!",
      reveals: ["nye", "nye2", "video:midnight"]
    },
    {
      month: "May–June '26", title: "Golden Hour",
      game: "puzzle",
      intro: "Summer finally showed up. Some evenings are worth putting back together, piece by piece.",
      reveals: ["lakefill1", "lakeside2", "beach2"]
    },
    {
      month: "June 7 '26", title: "Graduation Day",
      game: "story",
      intro: "The big one. Preksha did the thing. 🎓",
      reveals: []
    },
    {
      month: "July 24 '26", title: "One Last Question", boss: true,
      game: "finale",
      intro: "After nine months of us… I have one more question.",
      reveals: []
    }
  ],

  // Level 2 — memory match faces: six distinct moments, all from Halloween night.
  matchFaces: ["hallowPre", "hallowWink", "hallowEyes", "hallowScars", "halloween", "hallowParty"],

  // Level 5 — the scratch card image (frost-covered surprise).
  scratchCard: "earmuffs",

  // Level 4 — quiz, written from Anshul to Preksha. correct: -1 means every answer is right.
  quiz: [
    {
      q: "Where do I feel most at home?",
      options: ["Wherever you are", "Anywhere, as long as you're there", "With you. Obviously."],
      correct: -1,
      right: "Exactly. You're my favourite place. ❤️",
      wrong: ""
    },
    {
      q: "When does my heart still skip a beat?",
      options: ["When you laugh at my jokes", "When you look at me like that", "Every time you walk into the room"],
      correct: -1,
      right: "All of the above. It has never once recovered. 💓",
      wrong: ""
    },
    {
      q: "What have these nine months really been?",
      options: ["The happiest of my life", "The easiest yes I've ever said", "Nine months I'll never forget"],
      correct: -1,
      right: "Correct, correct, and correct. ✨",
      wrong: ""
    }
  ],

  // Level 3 — word scramble.
  scramble: [
    { word: "DIWALI",  hint: "Festival of lights — and of us dressing up 🪔" },
    { word: "CHICAGO", hint: "The city where our story lives" },
    { word: "GRATEFUL", hint: "How you make me feel, every single day" }
  ],

  // Level 8 — tile puzzle image.
  puzzleImage: "lakefill1",

  // Level 9 — graduation story sequence.
  story: ["gradParty1", "gradParty2", "graduation", "gradSelfie1", "gradSelfie2"],

  // Final boss.
  finale: {
    beach: ["beach1", "beach2"],
    question: "Preksha, do you know how lucky I am to have you in my life?",
    yes: "YES ♥",
    no: "no",
    bonusScenes: [
      { src: "video/our-moment.mp4", poster: "video/our-moment-poster.jpg", cap: "May '26 · Just us being us 🎬" },
      { src: "video/midnight.mp4", poster: "video/midnight-poster.jpg", cap: "Jan 1 · Midnight, fireworks, you 🎆" }
    ],
    letter: [
      "Dear Preksha,",
      "Nine months ago, you pressed start on this game with me. I've been replaying every level since.",
      "I think about our first Halloween — you drawing fake scars on our faces, laughing at how seriously I took mine. Waking up the next morning and lighting up Diwali together, you in that green, me forgetting whatever I was about to say. Your birthday the day after, when I learned that celebrating you might be my favourite thing in the world. And then you went and secretly planned a whole party for mine — balloons, banner, tiara, everything — and I understood, properly, what it feels like to be loved the way you love.",
      "I think about the earmuffs we tried on and never bought. The neon night we glowed like fools. Standing under a giant glowing ornament while the year quietly ran out, and holding you at 12:08 with fireworks filling the sky. Golden hour at the Lakefill, lazy lake days, that beach afternoon — and the June evening you crossed the Kellogg stage in purple while I cheered so loudly that strangers turned around.",
      "Here's the thing: none of these were big moments when they happened. They were just us. And that's what I love most — with you, 'just us' has always been more than enough.",
      "Happy nine months, my love. Thank you for every single one of these days. I am so lucky it's you.",
      "— Anshul ♥"
    ]
  }
};
