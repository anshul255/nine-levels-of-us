# Nine Levels of Us 💘

Nine months. Nine levels. One story. A tiny arcade built for Preksha.

**Play it:** https://anshul255.github.io/nine-levels-of-us/

Nine chronological levels (Halloween '25 → Kellogg graduation '26), each a mini-game
that unlocks real photo memories, ending with a final boss question, a letter,
a bonus video, and the full memory vault.

## Editing

Everything personal lives in [`js/data.js`](js/data.js):

- `startDate` — the day it all began (drives the "Day N of forever" counter)
- `photos` — captions for every polaroid
- `levels` — level titles, dates, and intro copy
- `quiz` / `scramble` — the trivia and word games
- `finale.letter` — the letter, line by line

The game engine is [`js/app.js`](js/app.js); styling in [`css/style.css`](css/style.css).
Progress saves to `localStorage` — use "NEW GAME+" at the end (or a private window) to replay.

## Running locally

Any static server works:

```bash
python3 -m http.server 5201
```

then open http://localhost:5201.

## Notes

- Music is synthesized live with WebAudio (a small music-box waltz) — no audio files.
- The photos and video are personal. This repo exists to host the site; please be kind.

Built with ♥ (and Claude) in July 2026.
