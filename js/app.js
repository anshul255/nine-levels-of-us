/* ============================================================
   NINE MONTHS: THE GAME — engine
   ============================================================ */

(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const STORE_KEY = "nm_progress_v1";

  const state = {
    unlocked: 0,           // highest level index reachable
    hearts: 0,             // hearts collected across games
    current: null,         // active level index
    cleanup: null,         // teardown fn for the active game
    token: 0               // bumped on any navigation; stale deferred callbacks check it
  };

  /* ---------- persistence ---------- */
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ unlocked: state.unlocked, hearts: state.hearts })); } catch (e) {}
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        state.unlocked = Math.min(p.unlocked || 0, DATA.levels.length - 1);
        state.hearts = p.hearts || 0;
      }
    } catch (e) {}
  }

  /* ---------- screens ---------- */
  function show(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    $(id).classList.add("active");
    $("#topbar").classList.toggle("visible", id !== "#boot");
    window.scrollTo(0, 0);
  }

  function updateTopbar() {
    $("#heartCount").textContent = `♥ ${state.hearts}`;
    $("#levelCount").textContent = `LV ${Math.min(state.unlocked + 1, DATA.levels.length)}/${DATA.levels.length}`;
  }

  /* ---------- starfield ---------- */
  function initStars() {
    const c = $("#stars"), ctx = c.getContext("2d");
    let stars = [];
    function size() {
      c.width = innerWidth; c.height = innerHeight;
      stars = Array.from({ length: 90 }, () => ({
        x: Math.random() * c.width, y: Math.random() * c.height,
        r: Math.random() * 1.6 + 0.4, tw: Math.random() * Math.PI * 2,
        sp: 0.008 + Math.random() * 0.02
      }));
    }
    size();
    addEventListener("resize", size);
    (function tick() {
      ctx.clearRect(0, 0, c.width, c.height);
      for (const s of stars) {
        s.tw += s.sp;
        ctx.globalAlpha = 0.35 + Math.abs(Math.sin(s.tw)) * 0.65;
        ctx.fillStyle = "#fdf6f0";
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    })();
  }

  /* ---------- confetti ---------- */
  const confetti = (() => {
    const c = $("#confetti"), ctx = c.getContext("2d");
    let parts = [], running = false;
    const COLORS = ["#ff5c8a", "#ffd166", "#7ce7d8", "#a78bfa", "#fdf6f0", "#ff8fb0"];
    function size() { c.width = innerWidth; c.height = innerHeight; }
    size(); addEventListener("resize", size);
    function burst(n = 120, origin) {
      const ox = origin ? origin.x : c.width / 2;
      const oy = origin ? origin.y : c.height * 0.3;
      for (let i = 0; i < n; i++) {
        parts.push({
          x: ox, y: oy,
          vx: (Math.random() - 0.5) * 14, vy: Math.random() * -13 - 3,
          g: 0.28 + Math.random() * 0.12,
          w: 6 + Math.random() * 6, h: 4 + Math.random() * 4,
          rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
          col: COLORS[(Math.random() * COLORS.length) | 0], life: 220
        });
      }
      if (!running) { running = true; tick(); }
    }
    function tick() {
      ctx.clearRect(0, 0, c.width, c.height);
      parts = parts.filter(p => p.life-- > 0 && p.y < c.height + 30);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= 0.985; p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.col; ctx.globalAlpha = Math.min(1, p.life / 60);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (parts.length) requestAnimationFrame(tick); else running = false;
    }
    return { burst };
  })();

  /* ---------- music: dreamy lo-fi loop (WebAudio, starts on Press Start) ---------- */
  const music = (() => {
    let ctx = null, master = null, bus = null, delaySend = null;
    let started = false, muted = false, step = 0, nextTime = 0, timer = null;
    // A slow music-box waltz in 3/4 — C · Am · F · G, the classic love-song changes.
    const BPM = 84, STEP = 60 / BPM;                        // one beat per step
    const VOL = 0.5;
    const mf = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const BARS = [
      { bass: 48, dyad: [64, 67], melody: [76, null, 79] },          // C:  E  ·  G
      { bass: 45, dyad: [64, 69], melody: [81, null, [79, 76]] },    // Am: A  ·  G-E
      { bass: 41, dyad: [65, 69], melody: [77, 81, null] },          // F:  F  A  ·
      { bass: 43, dyad: [62, 67], melody: [79, null, [74, 71]] },    // G:  G  ·  D-B
      { bass: 48, dyad: [64, 67], melody: [72, 76, 79] },            // C:  C  E  G
      { bass: 45, dyad: [64, 69], melody: [84, null, 81] },          // Am: C6 ·  A
      { bass: 41, dyad: [65, 69], melody: [79, 77, 74] },            // F:  G  F  D
      { bass: 43, dyad: [62, 67], melody: [71, null, null] }         // G:  B  ·  ·  (resolves home)
    ];
    function ensure() {
      if (ctx) return;
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = VOL;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -22; comp.ratio.value = 6;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass"; lp.frequency.value = 3200; lp.Q.value = 0.4;
      bus = lp;
      lp.connect(comp); comp.connect(master); master.connect(ctx.destination);
      // dreamy echo
      const delay = ctx.createDelay(2);
      delay.delayTime.value = STEP * 1.5;
      const fb = ctx.createGain(); fb.gain.value = 0.26;
      const wet = ctx.createGain(); wet.gain.value = 0.32;
      delaySend = ctx.createGain(); delaySend.gain.value = 1;
      delaySend.connect(delay); delay.connect(fb); fb.connect(delay);
      delay.connect(wet); wet.connect(bus);
    }
    // music-box voice: pure tone + faint octave shimmer, long gentle decay
    function box(midi, t, vel, decay) {
      const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain();
      o.type = "sine"; o.frequency.value = mf(midi);
      o2.type = "sine"; o2.frequency.value = mf(midi) * 2;
      g2.gain.value = 0.18;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vel, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      o.connect(g); o2.connect(g2); g2.connect(g);
      g.connect(bus); g.connect(delaySend);
      o.start(t); o2.start(t);
      o.stop(t + decay + 0.1); o2.stop(t + decay + 0.1);
    }
    function bass(midi, t) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = mf(midi);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.085, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t + STEP * 2.9);
      o.connect(g); g.connect(bus);
      o.start(t); o.stop(t + STEP * 3);
    }
    // soft sustained warmth under each bar
    function pad(midi, t, dur) {
      const lpp = ctx.createBiquadFilter();
      lpp.type = "lowpass"; lpp.frequency.value = 620;
      lpp.connect(bus);
      [midi + 12, midi + 19].forEach(m => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "triangle"; o.frequency.value = mf(m);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.02, t + dur * 0.4);
        g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.3);
        o.connect(g); g.connect(lpp);
        o.start(t); o.stop(t + dur + 0.4);
      });
    }
    function scheduleStep(s, t) {
      const bar = BARS[Math.floor(s / 3) % BARS.length], beat = s % 3;
      if (beat === 0) { bass(bar.bass, t); pad(bar.bass, t, STEP * 3); }
      else bar.dyad.forEach(m => box(m, t, 0.028, 0.9));      // gentle waltz sway on 2 & 3
      const note = bar.melody[beat];
      if (note != null) {
        if (Array.isArray(note)) {
          box(note[0], t, 0.075, 1.6);
          box(note[1], t + STEP / 2, 0.07, 1.6);
        } else {
          box(note, t, 0.075 + Math.random() * 0.015, 1.8);
        }
      }
    }
    function loop() {
      // if the timer starved (backgrounded), jump forward instead of burst-scheduling the past
      if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.05;
      // 1.4s lookahead so playback survives background-tab timer throttling
      while (nextTime < ctx.currentTime + 1.4) {
        scheduleStep(step, nextTime);
        step = (step + 1) % (BARS.length * 3);
        nextTime += STEP;
      }
    }
    // iOS suspends/interrupts the context on backgrounding, calls, Siri — revive it
    function revive() {
      if (ctx && ctx.state !== "running") { try { ctx.resume(); } catch (e) {} }
    }
    function start() {
      ensure();
      revive();
      if (started) return;
      started = true;
      nextTime = ctx.currentTime + 0.1;
      timer = setInterval(loop, 250);
      loop();
      updateBtn();
      document.addEventListener("visibilitychange", () => { if (!document.hidden && !muted) revive(); });
      document.addEventListener("pointerdown", () => { if (!muted) revive(); }, { passive: true });
    }
    function toggle() {
      if (!started) { start(); return; }
      muted = !muted;
      if (!muted) revive();
      master.gain.setTargetAtTime(muted ? 0 : VOL, ctx.currentTime, 0.05);
      updateBtn();
    }
    function updateBtn() {
      $("#musicBtn").textContent = muted ? "🔇" : "🔊";
      $("#musicBtn").classList.toggle("on", !muted);
    }
    // soft UI blip, shares the same output chain (muting mutes blips too)
    function blip(freq) {
      try {
        if (!ctx || ctx.state !== "running") return;
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.value = freq;
        const t = ctx.currentTime;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.045, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
        o.connect(g); g.connect(bus);
        o.start(t); o.stop(t + 0.16);
      } catch (e) {}
    }
    return { start, toggle, blip };
  })();

  function ping(freq = 880) { music.blip(freq); }

  /* ---------- boot ---------- */
  function initBoot() {
    const start = new Date(DATA.startDate + "T00:00:00");
    const days = Math.max(1, Math.floor((Date.now() - start.getTime()) / 86400000) + 1);
    $("#dayCounter").innerHTML = `Day <b>${days}</b> of us`;
    $("#p1name").textContent = `P1: ${DATA.player1.toUpperCase()}`;
    $("#p2name").textContent = `P2: ${DATA.player2.toUpperCase()}`;
    $("#pressStart").addEventListener("click", () => { music.start(); ping(660); show("#map"); renderMap(); });
  }

  /* ---------- level map ---------- */
  const BADGES = ["💘", "🎃", "🪔", "🎂", "❄️", "💡", "🎆", "🌅", "🎓", "💌"];
  function renderMap() {
    updateTopbar();
    const path = $("#path");
    path.innerHTML = "";
    DATA.levels.forEach((lv, i) => {
      const b = document.createElement("button");
      b.className = "node";
      const done = i < state.unlocked;
      const current = i === state.unlocked;
      if (done) b.classList.add("done");
      else if (current) b.classList.add("current");
      else b.classList.add("locked");
      b.innerHTML = `
        <span class="badge">${done ? "⭐" : current ? BADGES[i] : "🔒"}</span>
        <span class="meta">
          <span class="month pixel">${lv.month.toUpperCase()}</span>
          <span class="title">${lv.boss ? "💌 " : ""}${lv.title}</span>
        </span>`;
      if (!current && !done) b.disabled = true;
      b.addEventListener("click", () => openLevel(i));
      path.appendChild(b);
    });
  }

  /* ---------- level plumbing ---------- */
  function openLevel(i) {
    ping(740);
    if (state.cleanup) { state.cleanup(); state.cleanup = null; }
    state.token++;
    state.current = i;
    const lv = DATA.levels[i];
    // priority-load everything this level shows
    const priority = lv.reveals.filter(k => !k.startsWith("video:")).map(k => DATA.photos[k].src);
    if (lv.game === "match") priority.push(...DATA.matchFaces.map(k => DATA.photos[k].src));
    if (lv.game === "puzzle") priority.push(DATA.photos[DATA.puzzleImage].src);
    if (lv.game === "scratch") priority.push(DATA.photos[DATA.scratchCard].src);
    if (lv.game === "story") priority.push(...DATA.story.map(k => DATA.photos[k].src));
    if (lv.game === "finale") priority.push(...DATA.finale.beach.map(k => DATA.photos[k].src));
    warm(priority);
    $("#levelMonth").textContent = lv.month.toUpperCase();
    $("#levelTitle").textContent = lv.title;
    $("#levelIntro").textContent = lv.intro;
    $("#gameArea").innerHTML = "";
    $("#gameMsg").textContent = "";
    show("#level");
    GAMES[lv.game](i);
  }

  function completeLevel(i) {
    state.token++;
    if (state.cleanup) { state.cleanup(); state.cleanup = null; }
    const lv = DATA.levels[i];
    if (i === state.unlocked) state.unlocked = i + 1;
    save(); updateTopbar();
    confetti.burst(90);
    if (lv.reveals.length) {
      showReveal(lv);
    } else {
      show("#map"); renderMap();
    }
  }

  function showReveal(lv) {
    const wrap = $("#revealCards");
    wrap.innerHTML = "";
    lv.reveals.forEach(key => wrap.appendChild(polaroid(key)));
    $("#reveal").classList.add("active");
  }
  function polaroid(key) {
    const d = document.createElement("div");
    d.className = "polaroid";
    if (key.startsWith("video:")) {
      const v = DATA.videos[key.slice(6)];
      d.innerHTML = `<video src="${v.src}" poster="${v.poster}" controls playsinline preload="none"></video><div class="cap hand">${v.cap}</div>`;
    } else {
      const p = DATA.photos[key];
      d.innerHTML = `<img src="${p.src}" alt=""><div class="cap hand">${p.cap}</div>`;
    }
    return d;
  }

  function addHeart(n = 1) { state.hearts += n; save(); updateTopbar(); }

  /* ---------- image preloading ---------- */
  const preloadedSrcs = new Set();
  function warm(srcs) {
    srcs.forEach(src => {
      if (!src || preloadedSrcs.has(src)) return;
      preloadedSrcs.add(src);
      const im = new Image();
      im.src = src;
    });
  }
  // trickle-load every photo in the background (3 lanes) while she's on the title screen
  function warmAll() {
    const urls = Object.values(DATA.photos).map(p => p.src)
      .filter(src => !preloadedSrcs.has(src));
    let idx = 0;
    function lane() {
      if (idx >= urls.length) return;
      const src = urls[idx++];
      if (preloadedSrcs.has(src)) return lane();
      preloadedSrcs.add(src);
      const im = new Image();
      im.onload = im.onerror = lane;
      im.src = src;
    }
    lane(); lane(); lane();
  }

  function skipBtnHandler() {
    if (state.current != null) { ping(500); completeLevel(state.current); }
  }

  /* ============================================================
     GAMES
     ============================================================ */
  const GAMES = {};

  // 9 non-overlapping jittered positions (3x3 grid) for tap games
  function scatterPositions() {
    const cells = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(v => ({ v, r: Math.random() })).sort((a, b) => a.r - b.r).map(o => o.v);
    return cells.map(c => ({
      left: 6 + (c % 3) * 28 + Math.random() * 10,
      top: 4 + Math.floor(c / 3) * 28 + Math.random() * 12
    }));
  }

  /* ----- 1. tap the hearts ----- */
  GAMES.hearts = (i) => {
    const tok = state.token;
    const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const area = $("#gameArea");
    area.innerHTML = `
      <div class="meter"><div id="heartMeter"></div></div>
      <div id="heartField"></div>`;
    const field = $("#heartField");
    let popped = 0;
    const spots = scatterPositions();
    MONTHS.forEach((m, idx) => {
      const b = document.createElement("button");
      b.className = "tap-heart";
      b.textContent = ["💖", "💗", "💓", "💞", "💕", "❤️", "🧡", "💛", "💜"][idx];
      b.style.left = `${spots[idx].left}%`;
      b.style.top = `${spots[idx].top}%`;
      b.style.animationDelay = `${Math.random() * 2}s`;
      b.addEventListener("click", (e) => {
        if (b.classList.contains("popped")) return;
        b.classList.add("popped");
        ping(600 + popped * 60);
        addHeart();
        const lbl = document.createElement("span");
        lbl.className = "heart-label";
        lbl.textContent = m;
        lbl.style.left = b.style.left; lbl.style.top = b.style.top;
        field.appendChild(lbl);
        popped++;
        $("#heartMeter").style.width = `${(popped / 9) * 100}%`;
        if (popped === 9) setTimeout(() => { if (tok === state.token) completeLevel(i); }, 550);
      });
      field.appendChild(b);
    });
  };

  /* ----- 2. memory match ----- */
  GAMES.match = (i) => {
    const tok = state.token;
    const area = $("#gameArea");
    area.innerHTML = `<div id="matchGrid"></div>`;
    const grid = $("#matchGrid");
    const faces = [...DATA.matchFaces, ...DATA.matchFaces]
      .map(k => ({ k, r: Math.random() })).sort((a, b) => a.r - b.r).map(o => o.k);
    let open = [], lock = false, matched = 0;
    faces.forEach(key => {
      const b = document.createElement("button");
      b.className = "card";
      b.innerHTML = `
        <span class="face back">🎃</span>
        <span class="face front"><img src="${DATA.photos[key].src}" alt=""></span>`;
      b.dataset.key = key;
      b.addEventListener("click", () => {
        if (lock || b.classList.contains("flipped")) return;
        ping(700);
        b.classList.add("flipped");
        open.push(b);
        if (open.length === 2) {
          lock = true;
          const [a, c] = open;
          if (a.dataset.key === c.dataset.key) {
            setTimeout(() => {
              if (tok !== state.token) return;
              a.classList.add("matched"); c.classList.add("matched");
              ping(1000); addHeart();
              matched++; open = []; lock = false;
              $("#gameMsg").textContent = matched === 6 ? "" : `${matched}/6 pairs found`;
              if (matched === 6) setTimeout(() => { if (tok === state.token) completeLevel(i); }, 500);
            }, 350);
          } else {
            setTimeout(() => {
              if (tok !== state.token) return;
              a.classList.remove("flipped"); c.classList.remove("flipped");
              open = []; lock = false;
            }, 750);
          }
        }
      });
      grid.appendChild(b);
    });
  };

  /* ----- 3. word scramble ----- */
  GAMES.scramble = (i) => {
    const tok = state.token;
    const area = $("#gameArea");
    let round = 0;
    function renderRound() {
      const { word, hint } = DATA.scramble[round];
      area.innerHTML = `
        <p class="scramble-hint">${round + 1}/${DATA.scramble.length} — ${hint}</p>
        <div id="scrambleSlots"></div>
        <div id="scrambleLetters"></div>`;
      const slots = $("#scrambleSlots"), letters = $("#scrambleLetters");
      const answer = word.split("");
      let filled = [];
      answer.forEach(() => {
        const s = document.createElement("div");
        s.className = "slot";
        slots.appendChild(s);
      });
      let shuffled = answer.map((ch, i) => ({ ch, i, r: Math.random() })).sort((a, b) => a.r - b.r);
      // ensure it's actually scrambled
      if (shuffled.map(o => o.ch).join("") === word) shuffled.reverse();
      shuffled.forEach(({ ch }) => {
        const b = document.createElement("button");
        b.className = "letter";
        b.textContent = ch;
        b.addEventListener("click", () => {
          if (b.classList.contains("used")) return;
          ping(650 + filled.length * 40);
          b.classList.add("used");
          const slot = slots.children[filled.length];
          slot.textContent = ch; slot.classList.add("filled");
          filled.push({ ch, btn: b });
          if (filled.length === answer.length) {
            const attempt = filled.map(f => f.ch).join("");
            if (attempt === word) {
              ping(1100); addHeart();
              $("#gameMsg").textContent = "✓ " + word;
              round++;
              if (round < DATA.scramble.length) setTimeout(() => { if (tok !== state.token) return; $("#gameMsg").textContent = ""; renderRound(); }, 800);
              else setTimeout(() => { if (tok === state.token) completeLevel(i); }, 700);
            } else {
              $("#gameMsg").textContent = "Not quite — try again!";
              setTimeout(() => {
                if (tok !== state.token) return;
                filled.forEach(f => f.btn.classList.remove("used"));
                [...slots.children].forEach(s => { s.textContent = ""; s.classList.remove("filled"); });
                filled = [];
                $("#gameMsg").textContent = "";
              }, 700);
            }
          }
        });
        letters.appendChild(b);
      });
    }
    renderRound();
  };

  /* ----- 4. quiz ----- */
  GAMES.quiz = (i) => {
    const tok = state.token;
    const area = $("#gameArea");
    let qi = 0;
    function renderQ() {
      const item = DATA.quiz[qi];
      area.innerHTML = `<p class="quiz-q">${qi + 1}/${DATA.quiz.length} · ${item.q}</p>`;
      item.options.forEach((opt, oi) => {
        const b = document.createElement("button");
        b.className = "quiz-opt";
        b.textContent = opt;
        b.addEventListener("click", () => {
          const ok = item.correct === -1 || oi === item.correct;
          if (ok) {
            b.classList.add("right");
            ping(1000); addHeart();
            $("#gameMsg").textContent = item.right;
            area.querySelectorAll(".quiz-opt").forEach(o => o.disabled = true);
            qi++;
            setTimeout(() => {
              if (tok !== state.token) return;
              $("#gameMsg").textContent = "";
              if (qi < DATA.quiz.length) renderQ();
              else completeLevel(i);
            }, 1300);
          } else {
            b.classList.add("wrong");
            ping(220);
            $("#gameMsg").textContent = item.wrong;
            setTimeout(() => b.classList.remove("wrong"), 500);
          }
        });
        area.appendChild(b);
      });
    }
    renderQ();
  };

  /* ----- 5. scratch the frost ----- */
  GAMES.scratch = (i) => {
    const tok = state.token;
    const area = $("#gameArea");
    const photo = DATA.photos[DATA.scratchCard];
    area.innerHTML = `
      <p class="game-msg" style="margin-bottom:10px">Rub the frost off! ☃️</p>
      <div id="scratchWrap">
        <img src="${photo.src}" alt="">
        <canvas id="scratchCanvas"></canvas>
      </div>
      <p class="hand" style="font-size:20px;margin-top:12px;color:var(--pink2)">${photo.cap}</p>`;
    const wrap = $("#scratchWrap"), canvas = $("#scratchCanvas"), img = wrap.querySelector("img");
    const ctx = canvas.getContext("2d");
    const RADIUS = 28, COLS = 10, ROWS = 14;
    let done = false, cells = new Set();

    function setup() {
      canvas.width = wrap.clientWidth;
      canvas.height = wrap.clientHeight;
      // frosty layer
      const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      g.addColorStop(0, "#cfe6f5"); g.addColorStop(0.5, "#eef7fd"); g.addColorStop(1, "#b8d9ef");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const drawHint = () => {
        if (done || cells.size) return;               // don't redraw over scratches
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "rgba(90,120,160,0.55)";
        ctx.font = `${Math.max(16, canvas.width / 14)}px Caveat, cursive`;
        ctx.textAlign = "center";
        ctx.fillText("scratch here ❄", canvas.width / 2, canvas.height / 2);
        ctx.globalCompositeOperation = "destination-out";
      };
      drawHint();
      // re-render once the handwritten webfont arrives (canvas text doesn't auto-repaint)
      if (document.fonts && document.fonts.load) {
        document.fonts.load("20px Caveat").then(() => {
          if (tok !== state.token || done || cells.size) return;
          ctx.globalCompositeOperation = "source-over";
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          drawHint();
        }).catch(() => {});
      }
      ctx.globalCompositeOperation = "destination-out";
    }
    if (img.complete && img.naturalWidth) setup(); else img.addEventListener("load", setup);

    function finish() {
      done = true;
      canvas.style.transition = "opacity 0.8s ease";
      canvas.style.opacity = "0";
      ping(1050); addHeart();
      setTimeout(() => { if (tok === state.token) completeLevel(i); }, 1100);
    }
    let scratching = false;
    function scratch(e) {
      if (done || !canvas.width) return;
      const rect = canvas.getBoundingClientRect();
      const pt = e.touches ? e.touches[0] : e;
      const x = (pt.clientX - rect.left) * (canvas.width / rect.width);
      const y = (pt.clientY - rect.top) * (canvas.height / rect.height);
      ctx.beginPath(); ctx.arc(x, y, RADIUS, 0, 7); ctx.fill();
      // coverage: mark grid cells the scratch circle touches (no pixel readback)
      const cw = canvas.width / COLS, ch = canvas.height / ROWS;
      for (let dx = -RADIUS; dx <= RADIUS; dx += cw / 2) {
        for (let dy = -RADIUS; dy <= RADIUS; dy += ch / 2) {
          const cx = Math.floor((x + dx) / cw), cy = Math.floor((y + dy) / ch);
          if (cx >= 0 && cx < COLS && cy >= 0 && cy < ROWS) cells.add(cy * COLS + cx);
        }
      }
      if (cells.size / (COLS * ROWS) > 0.55) finish();
    }
    const down = (e) => { scratching = true; scratch(e); };
    const move = (e) => { if (scratching) { e.preventDefault(); scratch(e); } };
    const up = () => { scratching = false; };
    canvas.addEventListener("mousedown", down);
    canvas.addEventListener("mousemove", move);
    addEventListener("mouseup", up);
    canvas.addEventListener("touchstart", down, { passive: true });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", up);
    state.cleanup = () => removeEventListener("mouseup", up);
  };

  /* ----- 6. catch the hearts ----- */
  GAMES.catch = (i) => {
    const tok = state.token;
    const area = $("#gameArea");
    area.innerHTML = `
      <div class="meter"><div id="catchMeter"></div></div>
      <canvas id="catchCanvas"></canvas>`;
    const canvas = $("#catchCanvas"), ctx = canvas.getContext("2d");
    const W = Math.min(380, area.clientWidth || 340);
    // fit the play field to the space below the header so the basket stays on screen
    const H = Math.max(280, Math.min(420, innerHeight - canvas.getBoundingClientRect().top - 90));
    canvas.width = W; canvas.height = H;
    const GOAL = 12;
    let caught = 0, drops = [], raf = null, over = false;
    const basket = { x: W / 2, w: 74 };

    function spawn() {
      drops.push({
        x: 20 + Math.random() * (W - 40), y: -20,
        v: 1.6 + Math.random() * 1.8,
        emo: Math.random() < 0.15 ? "💜" : "💖",
        sway: Math.random() * Math.PI * 2
      });
    }
    let spawnTimer = setInterval(spawn, 700);

    function draw() {
      ctx.clearRect(0, 0, W, H);
      // basket
      ctx.font = "38px serif";
      ctx.textAlign = "center";
      ctx.fillText("🧺", basket.x, H - 12);
      // drops
      ctx.font = "30px serif";
      for (const d of drops) {
        d.y += d.v; d.sway += 0.04; d.x += Math.sin(d.sway) * 0.6;
        ctx.fillText(d.emo, d.x, d.y);
      }
      drops = drops.filter(d => {
        if (d.y > H - 34 && d.y < H && Math.abs(d.x - basket.x) < basket.w / 2) {
          caught += d.emo === "💜" ? 2 : 1;
          ping(700 + caught * 25); addHeart();
          $("#catchMeter").style.width = `${Math.min(100, (caught / GOAL) * 100)}%`;
          return false;
        }
        return d.y < H + 30;
      });
      if (caught >= GOAL && !over) {
        over = true;
        clearInterval(spawnTimer);
        cancelAnimationFrame(raf);
        setTimeout(() => { if (tok === state.token) completeLevel(i); }, 400);
        return;
      }
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    function steer(e) {
      const rect = canvas.getBoundingClientRect();
      const pt = e.touches ? e.touches[0] : e;
      basket.x = Math.max(30, Math.min(W - 30, (pt.clientX - rect.left) * (W / rect.width)));
    }
    canvas.addEventListener("mousemove", steer);
    canvas.addEventListener("touchstart", steer, { passive: true });
    canvas.addEventListener("touchmove", (e) => { e.preventDefault(); steer(e); }, { passive: false });

    state.cleanup = () => { clearInterval(spawnTimer); cancelAnimationFrame(raf); };
  };

  /* ----- 7. NYE midnight clock — time your tap as the spark crosses 12 ----- */
  GAMES.countdown = (i) => {
    const tok = state.token;
    const area = $("#gameArea");
    area.innerHTML = `
      <div class="meter"><div id="cdMeter"></div></div>
      <canvas id="clockCanvas"></canvas>`;
    const canvas = $("#clockCanvas"), ctx = canvas.getContext("2d");
    const S = Math.min(320, area.clientWidth || 320);
    canvas.width = S; canvas.height = S;
    const C = S / 2, R = S / 2 - 26;
    const HOURS = ["10 o'clock!", "11 o'clock!", "🎉 MIDNIGHT! HAPPY NEW YEAR! 🎉"];
    let angle = Math.PI / 2;          // start at the bottom, sweep clockwise
    let speed = 0.028, zone = 0.42;   // radians; zone tightens, spark speeds up
    let hits = 0, raf = null, done = false, flashUntil = 0, missUntil = 0;

    function draw() {
      ctx.clearRect(0, 0, S, S);
      // face
      ctx.strokeStyle = "#3a4085"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(C, C, R, 0, 7); ctx.stroke();
      // hour ticks
      for (let t = 0; t < 12; t++) {
        const a = t * Math.PI / 6;
        ctx.strokeStyle = t === 0 ? "#ffd166" : "#2e3572";
        ctx.lineWidth = t === 0 ? 4 : 2;
        ctx.beginPath();
        ctx.moveTo(C + Math.sin(a) * (R - 12), C - Math.cos(a) * (R - 12));
        ctx.lineTo(C + Math.sin(a) * R, C - Math.cos(a) * R);
        ctx.stroke();
      }
      // midnight sweet zone (top arc)
      ctx.strokeStyle = Date.now() < flashUntil ? "#ffd166" : "rgba(255, 209, 102, 0.45)";
      ctx.lineWidth = 10;
      ctx.beginPath(); ctx.arc(C, C, R, -Math.PI / 2 - zone, -Math.PI / 2 + zone); ctx.stroke();
      ctx.font = "22px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("🕛", C, C - R + 1);
      // centre label
      ctx.font = `700 ${S / 16}px Outfit, sans-serif`;
      ctx.fillStyle = Date.now() < missUntil ? "#ff8fb0" : "#fdf6f0";
      ctx.fillText(Date.now() < missUntil ? "almost!" : (hits === 0 ? "9 PM" : HOURS[hits - 1].replace(/[^0-9ao'clk ]/gi, "").trim() || "…"), C, C);
      // spark hand
      const hx = C + Math.cos(angle) * (R - 4), hy = C + Math.sin(angle) * (R - 4);
      ctx.strokeStyle = "rgba(255, 92, 138, 0.55)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(C, C); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.font = "26px serif";
      ctx.fillText("✨", hx, hy);
      if (!done) {
        angle += speed;
        canvas.dataset.angle = angle;    // read by tap handler; normalized there
        raf = requestAnimationFrame(draw);
      }
    }
    raf = requestAnimationFrame(draw);

    function tap() {
      if (done) return;
      // angular distance from the top (-PI/2), normalized to [-PI, PI]
      let d = ((angle - (-Math.PI / 2)) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      if (d > Math.PI) d -= 2 * Math.PI;
      if (Math.abs(d) <= zone) {
        hits++;
        flashUntil = Date.now() + 400;
        ping(600 + hits * 150); addHeart(3);
        confetti.burst(60, { x: innerWidth * (0.25 + Math.random() * 0.5), y: innerHeight * 0.25 });
        $("#cdMeter").style.width = `${(hits / 3) * 100}%`;
        $("#gameMsg").textContent = HOURS[hits - 1];
        if (hits >= 3) {
          done = true;
          confetti.burst(160);
          setTimeout(() => confetti.burst(120), 500);
          setTimeout(() => { if (tok === state.token) completeLevel(i); }, 1400);
        } else {
          speed += 0.012; zone = Math.max(0.3, zone - 0.06);
          angle = Math.PI / 2;           // restart sweep from the bottom
        }
      } else {
        missUntil = Date.now() + 550;
        ping(220);
        $("#gameMsg").textContent = "So close! Tap right as the spark crosses 12 🕛";
      }
    }
    canvas.addEventListener("pointerdown", tap);
    $("#gameMsg").textContent = "Tap when the spark reaches midnight! 🕛";
    state.cleanup = () => { done = true; cancelAnimationFrame(raf); };
  };

  /* ----- 8. tile puzzle (tap two tiles to swap) ----- */
  GAMES.puzzle = (i) => {
    const tok = state.token;
    const area = $("#gameArea");
    const photo = DATA.photos[DATA.puzzleImage];
    area.innerHTML = `
      <img id="puzzleRef" src="${photo.src}" alt="">
      <div id="puzzleGrid"></div>
      <p class="game-msg" style="margin-top:10px">Tap two tiles to swap them</p>`;
    const grid = $("#puzzleGrid");
    let order = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    do {
      order = order.map(v => ({ v, r: Math.random() })).sort((a, b) => a.r - b.r).map(o => o.v);
    } while (order.every((v, i) => v === i));
    let selected = null, solvedFlag = false;

    function render() {
      grid.innerHTML = "";
      order.forEach((pieceIdx, cellIdx) => {
        const b = document.createElement("button");
        b.className = "tile";
        const row = Math.floor(pieceIdx / 3), col = pieceIdx % 3;
        b.innerHTML = `<img src="${photo.src}" style="left:${-col * 100}%;top:${-row * 100}%" alt="">`;
        if (pieceIdx === cellIdx) b.classList.add("correct-flash");
        b.addEventListener("click", () => {
          if (solvedFlag) return;
          ping(680);
          if (selected === null) {
            selected = cellIdx;
            render();
            grid.children[cellIdx].classList.add("selected");
          } else if (selected === cellIdx) {
            selected = null; render();
          } else {
            [order[selected], order[cellIdx]] = [order[cellIdx], order[selected]];
            selected = null;
            render();
            if (order.every((v, idx2) => v === idx2)) {
              solvedFlag = true;
              ping(1150); addHeart(3);
              $("#gameMsg").textContent = "Perfect. Just like that evening. 🌅";
              setTimeout(() => { if (tok === state.token) completeLevel(i); }, 900);
            }
          }
        });
        grid.appendChild(b);
      });
    }
    render();
  };

  /* ----- 9. graduation story ----- */
  GAMES.story = (i) => {
    const area = $("#gameArea");
    let idx = 0;
    area.innerHTML = `
      <div id="storyWrap">
        <div id="storySlot"></div>
        <div id="storyDots"></div>
        <div id="storyNav">
          <button class="btn ghost" id="storyPrev">←</button>
          <button class="btn gold" id="storyNext">Next</button>
        </div>
      </div>`;
    const dots = $("#storyDots");
    DATA.story.forEach(() => dots.appendChild(document.createElement("span")));
    function render() {
      $("#storySlot").innerHTML = "";
      $("#storySlot").appendChild(polaroid(DATA.story[idx]));
      [...dots.children].forEach((d, i) => d.classList.toggle("on", i === idx));
      $("#storyPrev").style.visibility = idx === 0 ? "hidden" : "visible";
      $("#storyNext").textContent = idx === DATA.story.length - 1 ? "She did it! 🎓" : "Next";
    }
    $("#storyPrev").addEventListener("click", () => { if (idx > 0) { idx--; ping(600); render(); } });
    $("#storyNext").addEventListener("click", (e) => {
      ping(800);
      confetti.burst(50, { x: e.clientX || innerWidth / 2, y: e.clientY || innerHeight / 2 });
      if (idx < DATA.story.length - 1) { idx++; addHeart(); render(); }
      else { addHeart(2); completeLevel(i); }
    });
    render();
  };

  /* ----- 10. finale ----- */
  GAMES.finale = () => {
    show("#finale");
    // reset so re-entering the finale never stacks listeners or stale state
    $("#bossArea").style.display = "";
    $("#afterYes").classList.remove("active");
    $("#gameMsg2").textContent = "";
    const oldYes = $("#yesBtn"), oldNo = $("#noBtn");
    const yesBtn = oldYes.cloneNode(true), noBtn = oldNo.cloneNode(true);
    oldYes.replaceWith(yesBtn); oldNo.replaceWith(noBtn);
    noBtn.removeAttribute("style");

    const row = $("#finale .beach-row");
    row.innerHTML = "";
    DATA.finale.beach.forEach(k => row.appendChild(polaroid(k)));
    $("#bossQuestion").textContent = DATA.finale.question;
    yesBtn.textContent = DATA.finale.yes;
    noBtn.textContent = DATA.finale.no;

    let dodges = 0;
    const zone = $("#answerZone");
    function dodge() {
      dodges++;
      ping(300);
      const zr = zone.getBoundingClientRect();
      const nx = Math.random() * (zr.width - noBtn.offsetWidth);
      const ny = Math.random() * (zr.height - noBtn.offsetHeight);
      noBtn.style.position = "absolute";
      noBtn.style.left = `${nx}px`;
      noBtn.style.top = `${ny}px`;
      if (dodges >= 3) noBtn.style.transform = `scale(${Math.max(0.3, 1 - dodges * 0.15)})`;
      if (dodges >= 6) { noBtn.style.opacity = "0"; noBtn.style.pointerEvents = "none"; }
      $("#gameMsg2").textContent = ["Nice try 😌", "The button disagrees", "It's shy", "Physically impossible", "Just accept fate 💘", "…and it's gone"][Math.min(dodges - 1, 5)];
    }
    // mouse chases the cursor; touch dodges once per deliberate tap
    noBtn.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") dodge(); });
    noBtn.addEventListener("click", (e) => { if (e.pointerType !== "mouse" || e.detail > 0) dodge(); });

    yesBtn.addEventListener("click", () => {
      state.unlocked = DATA.levels.length; save(); updateTopbar();
      confetti.burst(220);
      setTimeout(() => confetti.burst(180), 600);
      setTimeout(() => confetti.burst(160), 1200);
      $("#bossArea").style.display = "none";
      const after = $("#afterYes");
      after.classList.add("active");
      // letter
      const letter = $("#letter");
      letter.innerHTML = "";
      DATA.finale.letter.forEach((line, i) => {
        const p = document.createElement("p");
        p.className = i === 0 || i === DATA.finale.letter.length - 1 ? "hand" : "";
        p.textContent = line;
        letter.appendChild(p);
      });
      // stats
      const start = new Date(DATA.startDate + "T00:00:00");
      const days = Math.max(1, Math.floor((Date.now() - start.getTime()) / 86400000) + 1);
      $("#statDays").textContent = days;
      $("#statHearts").textContent = state.hearts;
      $("#statLevels").textContent = DATA.levels.length;
      $("#statPhotos").textContent = Object.keys(DATA.photos).length;
      // bonus scenes
      const scenes = $("#bonusScenes");
      scenes.innerHTML = "";
      DATA.finale.bonusScenes.forEach(s => {
        const wrap = document.createElement("div");
        wrap.className = "bonus-scene";
        wrap.innerHTML = `<video src="${s.src}" poster="${s.poster}" controls playsinline preload="none"></video><p class="hand">${s.cap}</p>`;
        scenes.appendChild(wrap);
      });
      // gallery
      const g = $("#gallery");
      g.innerHTML = "";
      Object.values(DATA.photos).forEach(p => {
        const im = document.createElement("img");
        im.src = p.src; im.alt = ""; im.loading = "lazy";
        im.addEventListener("click", () => {
          $("#lightbox img").src = p.src;
          $("#lightboxCap").textContent = p.cap;
          $("#lightbox").classList.add("active");
        });
        g.appendChild(im);
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, { once: true });
  };

  /* ---------- wiring ---------- */
  function init() {
    load();
    initStars();
    initBoot();
    updateTopbar();
    $("#musicBtn").addEventListener("click", music.toggle);
    $("#skipBtn").addEventListener("click", skipBtnHandler);
    $("#backBtn").addEventListener("click", () => {
      state.token++;
      if (state.cleanup) { state.cleanup(); state.cleanup = null; }
      show("#map"); renderMap();
    });
    $("#revealDone").addEventListener("click", () => {
      $("#reveal").classList.remove("active");
      show("#map"); renderMap();
    });
    $("#lightbox").addEventListener("click", () => $("#lightbox").classList.remove("active"));
    $("#replayBtn").addEventListener("click", () => {
      try { localStorage.removeItem(STORE_KEY); } catch (e) {}
      location.reload();
    });
    setTimeout(warmAll, 1200);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
