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
    festive1:   { src: "photos/IMG_1995.jpg", cap: "Oct 29 · Festive lights, brand-new sparks ✨" },
    hallow1:    { src: "photos/IMG_2003.jpg", cap: "Oct 31 · All black, all in 🖤" },
    hallow2:    { src: "photos/IMG_2008.jpg", cap: "Blurry photo, crystal-clear feelings" },
    hallow3:    { src: "photos/IMG_2009.jpg", cap: "Halloween night, holding on tight" },
    halloween:  { src: "photos/IMG_2020.jpg", cap: "Our first Halloween — matching battle scars 🎃" },
    diwali1:    { src: "photos/IMG_2028.jpg", cap: "Nov 1 · Desi mode: activated 🪔" },
    diwali2:    { src: "photos/IMG_2030.jpg", cap: "That green though 💚" },
    diwali3:    { src: "photos/IMG_2037.jpg", cap: "Mirror check: passed" },
    dateNight1: { src: "photos/IMG_2072.jpg", cap: "Nov 2 · Sequins + hoodie = perfect balance ⚖️" },
    dateNight2: { src: "photos/IMG_2074.jpg", cap: "Date night, dressed by two different stylists" },
    earmuffs:   { src: "photos/IMG_2106.jpg", cap: "Nov 7 · Winter shopping — one hat, one pair of earmuffs, zero regrets" },
    winter:     { src: "photos/IMG_2130.jpg", cap: "Nov 10 · Chicago winter tried. We won. ❄️" },
    neon:       { src: "photos/IMG_2198.jpg", cap: "Nov 11 · Glow crew of two 💡" },
    nye:        { src: "photos/IMG_2642.jpg", cap: "Dec 31 · Ending the year under a giant ornament 🎆" },
    lakefill1:  { src: "photos/IMG_4529.jpg", cap: "May 29 · Golden hour at the Lakefill 🌅" },
    lakeside1:  { src: "photos/IMG_4629.jpg", cap: "Jun 5 · Lake days with you >" },
    lakeside2:  { src: "photos/IMG_4645.jpg", cap: "Same lake, favourite company" },
    beach1:     { src: "photos/IMG_4653.jpg", cap: "Jun 6 · Beach day ☀️" },
    beach2:     { src: "photos/IMG_4661.jpg", cap: "Lake Michigan, but the view is you" },
    gradParty1: { src: "photos/IMG_4672.jpg", cap: "Grad-party eve, all white 🤍" },
    gradParty2: { src: "photos/IMG_4676.jpg", cap: "Celebration mode" },
    graduation: { src: "photos/IMG_4702.jpg", cap: "Jun 7 · MBA: UNLOCKED. Kellogg, Class of 2026 🎓" },
    gradSelfie1:{ src: "photos/IMG_4711.jpg", cap: "So proud of you." },
    gradSelfie2:{ src: "photos/IMG_4715.jpg", cap: "My favourite graduate" }
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
      intro: "Our very first Halloween. Match the pairs to piece the night back together.",
      reveals: ["halloween", "hallow1", "hallow3"]
    },
    {
      month: "November 1 '25", title: "Desi Hearts",
      game: "scramble",
      intro: "The morning after Halloween, we turned around and lit it up desi style. Unscramble the words that matter.",
      reveals: ["diwali1", "diwali2", "diwali3"]
    },
    {
      month: "November 2 '25", title: "Date Night",
      game: "quiz",
      intro: "A little quiz. Don't worry — with us, every answer is a good one.",
      reveals: ["dateNight1", "dateNight2"]
    },
    {
      month: "November 7–10 '25", title: "Winter Mode",
      game: "scratch",
      intro: "Chicago started freezing. We went shopping. Scratch away the frost to see what's underneath.",
      reveals: ["winter"]
    },
    {
      month: "November 11 '25", title: "Glow Up",
      game: "catch",
      intro: "Neon lights, glow bands, us. Catch 12 falling hearts before they hit the floor.",
      reveals: ["neon"]
    },
    {
      month: "New Year's Eve '25", title: "Midnight Countdown",
      game: "countdown",
      intro: "We closed out 2025 under a sky full of lights. Tap the fireworks to count down to midnight!",
      reveals: ["nye"]
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
      intro: "The big one. Player 2 did the thing. 🎓",
      reveals: []
    },
    {
      month: "July 24 '26", title: "Final Boss", boss: true,
      game: "finale",
      intro: "After nine months… one question remains.",
      reveals: []
    }
  ],

  // Level 2 — memory match uses these photo faces (6 pairs).
  matchFaces: ["festive1", "halloween", "hallow1", "winter", "neon", "nye"],

  // Level 5 — the scratch card image (frost-covered surprise).
  scratchCard: "earmuffs",

  // Level 4 — quiz. Every question is winnable; wrong answers get a playful retry.
  quiz: [
    {
      q: "Where did Player 2 just earn her MBA?",
      options: ["Kellogg School of Management", "Hogwarts School of Business", "The University of Winning Arguments"],
      correct: 0,
      right: "Correct! Northwestern Kellogg, Class of 2026 💜",
      wrong: "Tempting… but try again 😄"
    },
    {
      q: "What is the official power move of this couple?",
      options: ["Matching outfits", "Eating off each other's plates", "Photoshoots at every landmark"],
      correct: -1,
      right: "Correct. All of the above, always. ✅",
      wrong: ""
    },
    {
      q: "On a scale of 1 to 10, how lucky is Anshul?",
      options: ["10", "100", "∞"],
      correct: -1,
      right: "Mathematically verified. ♾️",
      wrong: ""
    }
  ],

  // Level 3 — word scramble.
  scramble: [
    { word: "DIWALI",  hint: "Festival of lights — and of us dressing up 🪔" },
    { word: "CHICAGO", hint: "The city where our story lives" },
    { word: "FOREVER", hint: "The plan, roughly speaking" }
  ],

  // Level 8 — tile puzzle image.
  puzzleImage: "lakefill1",

  // Level 9 — graduation story sequence.
  story: ["gradParty1", "gradParty2", "graduation", "gradSelfie1", "gradSelfie2"],

  // Final boss.
  finale: {
    beach: ["beach1", "beach2"],
    question: "Preksha, will you keep playing this co-op game with me… forever?",
    yes: "YES ♥",
    no: "no",
    video: "video/our-moment.mp4",
    videoCap: "May '26 · Just us being us 🎬",
    letter: [
      "Dear Preksha,",
      "Nine months ago you pressed start on this game with me, and every single level since has been my favourite one.",
      "We did our first Halloween in matching scars, lit up Diwali the very next morning, wore ridiculous hats in department stores, danced under neon lights, and counted down to a new year beneath a sky of fairy lights. Then summer came, and I watched you walk across that Kellogg stage in purple — and I have never been prouder to be Player 1 beside you.",
      "You make ordinary Tuesdays feel like boss-level victories. You are my favourite notification, my best decision, my whole heart.",
      "Here's to month ten, and the infinite levels after it. I love you.",
      "— Anshul ♥"
    ]
  }
};
