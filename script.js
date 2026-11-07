"use strict";

const firebaseConfig = {
  apiKey: "AIzaSyDvFZjYnKvGIverhcqGE3GNQFVw4ZTeT34",
  authDomain: "starprep-9d3a4.firebaseapp.com",
  projectId: "starprep-9d3a4",
  storageBucket: "starprep-9d3a4.firebasestorage.app",
  messagingSenderId: "60666650865",
  appId: "1:60666650865:web:cc9df3666416be469e8950"
};

const SCENARIOS = [
  { id: 1, method: "STAR", tag: "Job / college interview",
    title: "A time you solved a difficult problem",
    prompt: "Tell me about a time you faced a difficult problem and how you solved it.",
    steps: [
      { label: "Situation", correct: "During our group project last term, our presentation file got corrupted the night before it was due.",
        distractors: ["I immediately contacted our adviser and asked for a short extension.", "Something bad happened one time and it was difficult.", "I usually study in the library after class."] },
      { label: "Task", correct: "As the group leader, I was responsible for making sure we still had a presentation ready by morning.",
        distractors: ["In the end, we got a passing grade for the project.", "I had to do my part in the group.", "I enjoy working with my groupmates on most projects."] },
      { label: "Action", correct: "I rebuilt the slides from our shared draft, split the remaining sections among the team, and we rehearsed at 6 a.m. before class.",
        distractors: ["Our file got corrupted because of a software update.", "I worked hard to fix the problem.", "I asked my groupmates how their weekend was."] },
      { label: "Result", correct: "We submitted the presentation on time and received a grade of 92.",
        distractors: ["I was in charge of putting the slides back together.", "Everything turned out fine.", "We decided to grab lunch together after class."] },
    ] },
  { id: 2, method: "STAR", tag: "Job / college interview",
    title: "A time you worked in a team",
    prompt: "Tell me about a time you worked with others to reach a goal.",
    steps: [
      { label: "Situation", correct: "Our class was assigned to organize the school's intramurals opening program with only one week to prepare.",
        distractors: ["I made a checklist and assigned tasks to each member.", "We had a group task once.", "I like watching sports events."] },
      { label: "Task", correct: "I was in charge of coordinating the different committees so nothing overlapped.",
        distractors: ["The opening program ran smoothly and ended on time.", "I had a role in the group.", "Our school holds intramurals every year."] },
      { label: "Action", correct: "I set up a shared group chat, checked in with each committee daily, and resolved a scheduling conflict between two performers.",
        distractors: ["We were given very short notice for the event.", "I communicated with everyone involved.", "I asked if anyone wanted to grab snacks."] },
      { label: "Result", correct: "The program started on time and our adviser specifically praised the coordination between committees.",
        distractors: ["I was responsible for the overall coordination.", "It went well overall.", "We took a group photo afterward."] },
    ] },
  { id: 3, method: "PREP", tag: "Class recitation",
    title: "Should phones be allowed in class?",
    prompt: "Give your stand on: should students be allowed to use phones in class?",
    steps: [
      { label: "Point", correct: "I believe students should be allowed limited phone use in class, specifically for schoolwork.",
        distractors: ["Phones can help students look up information quickly.", "Phones are kind of okay I guess.", "I got a new phone last month."] },
      { label: "Reason", correct: "Many lessons now require quick research or the use of learning apps that phones can support.",
        distractors: ["My stand is that limited use should be allowed.", "Because phones are useful.", "My phone has a lot of storage."] },
      { label: "Example", correct: "In our science class, we used our phones to access a lab simulation app when the computer lab was unavailable.",
        distractors: ["Phones let us search for information fast.", "There was a time we used a phone in class.", "I use my phone mostly for games."] },
      { label: "Point (restated)", correct: "So overall, allowing limited, teacher-guided phone use in class can support learning rather than disrupt it.",
        distractors: ["That app helped us finish the activity faster.", "That's basically my opinion.", "Phones are very common nowadays."] },
    ] },
  { id: 4, method: "PREP", tag: "Debate / impromptu",
    title: "Is social media good for teenagers?",
    prompt: "Give your stand on: is social media good for teenagers?",
    steps: [
      { label: "Point", correct: "I believe social media can be good for teenagers if it's used in moderation.",
        distractors: ["It helps them stay connected with friends and family.", "Social media is fine I think.", "I have three social media accounts."] },
      { label: "Reason", correct: "It allows teenagers to build communication skills and stay updated on current events.",
        distractors: ["My stand is that it's good in moderation.", "Because it's useful for a lot of things.", "I check my phone a lot during the day."] },
      { label: "Example", correct: "I personally learned about a scholarship opportunity through a school page on Facebook.",
        distractors: ["It helps students find useful information.", "I saw something useful once.", "I mostly use social media to watch videos."] },
      { label: "Point (restated)", correct: "So social media, used moderately and purposefully, can genuinely benefit teenagers.",
        distractors: ["That scholarship post was very helpful to me.", "That's pretty much it.", "A lot of my friends use social media too."] },
    ] },
  { id: 5, method: "STAR", tag: "", title: "", prompt: "",
    steps: ["Situation", "Task", "Action", "Result"].map(label => ({ label, correct: "", distractors: ["", "", ""] })) },
  { id: 6, method: "STAR", tag: "", title: "", prompt: "",
    steps: ["Situation", "Task", "Action", "Result"].map(label => ({ label, correct: "", distractors: ["", "", ""] })) },
  { id: 7, method: "PREP", tag: "", title: "", prompt: "",
    steps: ["Point", "Reason", "Example", "Point (restated)"].map(label => ({ label, correct: "", distractors: ["", "", ""] })) },
  { id: 8, method: "PREP", tag: "", title: "", prompt: "",
    steps: ["Point", "Reason", "Example", "Point (restated)"].map(label => ({ label, correct: "", distractors: ["", "", ""] })) },
];

const STEP_HINTS = {
  "Situation": "Set the scene: where and when did it happen?",
  "Task": "What were you responsible for?",
  "Action": "What exactly did you do, step by step?",
  "Result": "What happened because of what you did?",
  "Point": "State your stand in one clear sentence.",
  "Reason": "Why do you believe that?",
  "Example": "Give one concrete example or piece of evidence.",
  "Point (restated)": "Say your stand again to close the loop.",
};
const STEP_SECONDS = 12;
const LEVELS = [ { min: 0, name: "Rookie" }, { min: 150, name: "Communicator" }, { min: 400, name: "Pro Speaker" }, { min: 800, name: "StarPrep Master" } ];

const isPlaceholder = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes("REPLACE_ME");
if (isPlaceholder) document.getElementById("configWarning").style.display = "block";

let db, auth;
try {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
} catch (e) { console.error("Firebase init failed:", e); }

const state = { scenario: null, choices: [], stepIndex: 0, combo: 0, runScore: 0, timer: null, timeLeft: STEP_SECONDS, user: null };
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function showView(id) {
  $$(".view").forEach((v) => v.classList.remove("active"));
  $("#" + id).classList.add("active");
  $$("nav button").forEach((b) => b.classList.remove("active"));
  const navId = ["progress", "leaderboard"].includes(id) ? id : "home";
  $(`nav button[data-view="${navId}"]`)?.classList.add("active");
}

function flash(kind) {
  const el = $("#flashLayer");
  el.className = "flash " + kind;
  requestAnimationFrame(() => setTimeout(() => (el.className = "flash"), 350));
}
function popup(text, kind) {
  const p = document.createElement("div");
  p.className = "popup " + kind;
  p.textContent = text;
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 700);
}
function levelFor(xp) {
  let cur = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.min) cur = l;
  return cur.name;
}

function renderScenarios() {
  const wrap = $("#scnList");
  wrap.innerHTML = "";
  SCENARIOS.filter((s) => s.title).forEach((s) => {
    const d = document.createElement("div");
    d.className = "scn";
    d.innerHTML = `<span class="tag">${s.tag} · <span class="pill">${s.method}</span></span><h3>${s.title}</h3><p>${s.prompt}</p>`;
    d.addEventListener("click", () => startRun(s));
    wrap.appendChild(d);
  });
}

function startRun(s) {
  state.scenario = s;
  state.choices = s.steps.map((step) => {
    const options = shuffle([step.correct, ...step.distractors]);
    return { label: step.label, options, correctIndex: options.indexOf(step.correct) };
  });
  state.stepIndex = 0;
  state.combo = 0;
  state.runScore = 0;
  showView("build");
  playStep();
}

function playStep() {
  const c = state.choices[state.stepIndex];
  $("#roundNo").textContent = state.stepIndex + 1;
  $("#stepLabel").textContent = c.label.toUpperCase();
  $("#buildPrompt").textContent = `${state.scenario.prompt} (${STEP_HINTS[c.label]})`;
  $("#comboText").textContent = `COMBO x${1 + state.combo}`;

  $("#choices").innerHTML = c.options
    .map((opt, oi) => `<button type="button" class="choice" data-opt="${oi}">${opt}</button>`)
    .join("");
  $("#choices").querySelectorAll(".choice").forEach((btn) => btn.addEventListener("click", () => handlePick(Number(btn.dataset.opt))));

  state.timeLeft = STEP_SECONDS;
  updateTimerBar();
  clearInterval(state.timer);
  state.timer = setInterval(() => {
    state.timeLeft -= 0.1;
    updateTimerBar();
    if (state.timeLeft <= 0) { clearInterval(state.timer); handlePick(-1); }
  }, 100);
}

function updateTimerBar() {
  $("#timerFill").style.width = Math.max(0, (state.timeLeft / STEP_SECONDS) * 100) + "%";
}

function handlePick(oi) {
  clearInterval(state.timer);
  const c = state.choices[state.stepIndex];
  const ok = oi === c.correctIndex;
  const btns = $("#choices").querySelectorAll(".choice");
  btns.forEach((b) => (b.disabled = true));
  if (btns[c.correctIndex]) btns[c.correctIndex].classList.add("correct");
  if (!ok && oi >= 0 && btns[oi]) btns[oi].classList.add("wrong");

  if (ok) {
    state.combo += 1;
    const speedBonus = Math.round((state.timeLeft / STEP_SECONDS) * 15);
    const points = 25 * (1 + Math.min(state.combo - 1, 4) * 0.25) + speedBonus;
    state.runScore += Math.round(points);
    popup("+" + Math.round(points), "good");
    flash("good");
    const ct = $("#comboText"); ct.classList.remove("on"); void ct.offsetWidth; ct.classList.add("on");
  } else {
    state.combo = 0;
    popup(oi === -1 ? "TIME UP" : "MISS", "bad");
    flash("bad");
  }

  setTimeout(() => {
    state.stepIndex += 1;
    if (state.stepIndex < state.choices.length) playStep();
    else endRun();
  }, 750);
}

function endRun() {
  $("#scoreNum").textContent = state.runScore;
  saveRun();
  showView("feedback");
}

function saveRun() {
  if (!db || !state.user) return;
  const uid = state.user.uid, name = state.user.displayName;

  db.collection("attempts").add({
    uid, name,
    date: new Date().toISOString().slice(0, 10),
    scenario: state.scenario.title,
    method: state.scenario.method,
    score: state.runScore,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  }).catch((err) => console.error("Save attempt failed:", err));

  const playerRef = db.collection("players").doc(uid);
  db.runTransaction(async (tx) => {
    const doc = await tx.get(playerRef);
    const prevXp = doc.exists ? doc.data().totalScore || 0 : 0;
    const newXp = prevXp + state.runScore;
    tx.set(playerRef, { name, totalScore: newXp, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
    const prevLevel = levelFor(prevXp), newLevel = levelFor(newXp);
    if (newLevel !== prevLevel) {
      const el = $("#levelupMsg");
      el.style.display = "block";
      el.textContent = `LEVEL UP! YOU'RE NOW A ${newLevel.toUpperCase()}`;
    } else {
      $("#levelupMsg").style.display = "none";
    }
  }).catch((err) => console.error("XP update failed:", err));
}

function renderProgress() {
  const wrap = $("#progTable");
  if (!db || !state.user) { wrap.innerHTML = '<div class="empty">Sign in to see your runs.</div>'; return; }
  wrap.innerHTML = '<div class="empty">Loading…</div>';
  db.collection("attempts").where("uid", "==", state.user.uid).orderBy("createdAt", "asc").get()
    .then((snap) => {
      if (snap.empty) { wrap.innerHTML = '<div class="empty">No runs yet — go play!</div>'; return; }
      const rows = []; snap.forEach((d) => rows.push(d.data()));
      let html = '<table><tr><th>Date</th><th>Level</th><th>Method</th><th>Score</th></tr>';
      rows.slice().reverse().forEach((a) => { html += `<tr><td>${a.date}</td><td>${a.scenario}</td><td>${a.method}</td><td>${a.score}</td></tr>`; });
      html += "</table>";
      if (rows.length >= 2) {
        const first = rows[0].score, last = rows[rows.length - 1].score, diff = last - first;
        html += `<p style="margin-top:16px; font-size:13px; color:var(--dim);">First run: ${first} → latest run: ${last} (${diff >= 0 ? "+" : ""}${diff}).</p>`;
      }
      wrap.innerHTML = html;
    })
    .catch((err) => { console.error(err); wrap.innerHTML = '<div class="empty">Could not load your runs right now.</div>'; });
}

function renderLeaderboard() {
  const wrap = $("#lbTable");
  if (!db) { wrap.innerHTML = '<div class="empty">Not connected.</div>'; return; }
  wrap.innerHTML = '<div class="empty">Loading…</div>';
  db.collection("players").orderBy("totalScore", "desc").limit(20).get()
    .then((snap) => {
      if (snap.empty) { wrap.innerHTML = '<div class="empty">No scores yet — be the first!</div>'; return; }
      let html = '<table><tr><th>#</th><th>Player</th><th>XP</th></tr>';
      let rank = 1;
      snap.forEach((doc) => {
        const d = doc.data();
        const isMe = state.user && doc.id === state.user.uid;
        html += `<tr class="${isMe ? "me" : ""}"><td class="rank">${String(rank).padStart(2, "0")}</td><td>${d.name || "Player"}${isMe ? " (you)" : ""}</td><td>${d.totalScore} — ${levelFor(d.totalScore)}</td></tr>`;
        rank++;
      });
      html += "</table>";
      wrap.innerHTML = html;
    })
    .catch((err) => { console.error(err); wrap.innerHTML = '<div class="empty">Could not load the leaderboard right now.</div>'; });
}

function signIn() {
  if (!auth) { alert("Firebase isn't configured yet — paste your config in the CONFIG section."); return; }
  auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch((err) => { console.error(err); alert("Sign-in failed: " + err.message); });
}
function signOutUser() { auth?.signOut(); }
function onAuthChange(user) {
  state.user = user;
  if (user) {
    $("#loginScreen").style.display = "none";
    $("#app").style.display = "block";
    $("#whoName").textContent = user.displayName || user.email || "Signed in";
    renderScenarios();
    showView("home");
  } else {
    $("#app").style.display = "none";
    $("#loginScreen").style.display = "flex";
  }
}

$("#tryAnother").addEventListener("click", () => showView("pick"));
$("#toLeaderboard").addEventListener("click", () => { renderLeaderboard(); showView("leaderboard"); });
$("#googleBtn").addEventListener("click", signIn);
$("#signOutBtn").addEventListener("click", signOutUser);
$("#homeQuickPlay").addEventListener("click", () => { renderScenarios(); showView("pick"); });
$("#homeTowerDefense").addEventListener("click", () => { tdRenderStart(); showView("towerdefense"); });
$$(".backhome").forEach((b) => b.addEventListener("click", () => showView("home")));
$$("nav button").forEach((b) => {
  b.addEventListener("click", () => {
    const v = b.dataset.view;
    if (v === "progress") renderProgress();
    if (v === "leaderboard") renderLeaderboard();
    showView(v);
  });
});

if (auth) auth.onAuthStateChanged(onAuthChange);
else $("#loginScreen").style.display = "flex";

/* ============================================================
   TOWER DEFENSE MODE
   Self-contained — reuses the same SCENARIOS question data,
   but does not touch any Quick Play functions above.
   ============================================================ */
const td = { level: 1, hp: 100, maxHp: 100, enemyHp: 0, enemyMaxHp: 100, enemiesLeft: 0, enemiesTotal: 0, score: 0, qTimer: null, timeLeft: 0, timeLimit: 60, busy: false };
const TD_DMG_BEST = 55;   // damage dealt when you pick the best answer
const TD_DMG_SECOND = 25; // damage dealt when you pick the 2nd-best answer (your request: less damage)

function tdPool() {
  return SCENARIOS.filter((s) => s.title).flatMap((s) =>
    s.steps.map((st, i) => ({
      method: s.method, label: st.label, prompt: s.prompt,
      context: s.steps.slice(0, i).map((p) => ({ label: p.label, text: p.correct })), // story so far
      correct: st.correct, distractors: st.distractors,
    }))
  );
}

function tdRenderStart() {
  $("#tdRoot").innerHTML = `
    <div class="td-start">
      <h2>TOWER DEFENSE</h2>
      <p>An enemy spawns and the game freezes. Pick the <b>best</b> sentence for full damage, the <b>2nd-best</b> for a weaker hit, or anything else and it gets a free shot at your tower. Defeat each wave to level up.</p>
      <button class="primary" id="tdStartBtn" style="max-width:280px; margin:0 auto;">START DEFENSE</button>
      <button class="ghost backhome" style="max-width:280px; margin:10px auto 0;">BACK TO MENU</button>
    </div>`;
  $("#tdStartBtn").addEventListener("click", tdStart);
  $$(".backhome").forEach((b) => b.addEventListener("click", () => showView("home")));
}

function tdStart() {
  td.level = 1; td.hp = 100; td.maxHp = 100; td.score = 0;
  tdStartLevel();
}

function tdStartLevel() {
  td.enemiesTotal = 2 + td.level;
  td.enemiesLeft = td.enemiesTotal;
  td.timeLimit = Math.max(20, 60 - (td.level - 1) * 5);
  tdRenderGameScreen();
  tdSpawnEnemy();
}

function tdRenderGameScreen() {
  $("#tdRoot").innerHTML = `
    <div class="td-hud">
      <span class="td-level px">LEVEL ${td.level}</span>
      <span>ENEMIES LEFT: <b id="tdEnemiesLeft">${td.enemiesLeft}</b></span>
      <span>SCORE: <b id="tdScore">${td.score}</b></span>
    </div>
    <div class="td-hpbar"><div class="td-hpfill" id="tdHpFill" style="width:${(td.hp / td.maxHp) * 100}%"></div></div>
    <div class="td-lane">
      <div class="td-enemy-hpbar"><div class="td-enemy-hpfill" id="tdEnemyHpFill" style="width:100%"></div></div>
      <div class="td-tower">🏰</div>
      <div class="td-enemy" id="tdEnemy" style="display:none;">👾</div>
      <div class="td-soldier" id="tdSoldier">💂</div>
    </div>
    <div id="tdOverlayMount"></div>`;
}

// Spawns a brand-new enemy (full HP) and asks its first question.
function tdSpawnEnemy() {
  td.busy = false;
  td.enemyMaxHp = 100 + (td.level - 1) * 20;
  td.enemyHp = td.enemyMaxHp;
  const enemyEl = $("#tdEnemy");
  if (enemyEl) { enemyEl.style.transition = "none"; enemyEl.style.left = "8px"; enemyEl.style.display = "block"; enemyEl.classList.remove("dead"); }
  tdUpdateEnemyHpBar();
  tdNextQuestion();
}

// Asks another question for whichever enemy is currently on screen
// (used both for a fresh spawn and for a surviving multi-hit enemy).
function tdNextQuestion() {
  const pool = tdPool();
  const q = pool[Math.floor(Math.random() * pool.length)];
  tdAskQuestion(q);
}

function tdUpdateScore() {
  const el = $("#tdScore");
  if (el) el.textContent = td.score;
}

function tdUpdateEnemyHpBar() {
  const el = $("#tdEnemyHpFill");
  if (el) el.style.width = Math.max(0, (td.enemyHp / td.enemyMaxHp) * 100) + "%";
}

function tdAskQuestion(q) {
  const options = shuffle([q.correct, q.distractors[0], q.distractors[1], q.distractors[2]]);
  const bestIndex = options.indexOf(q.correct);
  const secondIndex = options.indexOf(q.distractors[0]);
  td.busy = false; // unlock input for this question
  td.timeLeft = td.timeLimit;

  const mount = $("#tdOverlayMount");
  mount.innerHTML = `
    <div class="td-overlay">
      <div class="td-overlay-inner">
        <div class="stepno px" style="text-align:center; color:var(--magenta); margin-bottom:8px;">${q.method} — ${q.label.toUpperCase()}</div>
        <div class="td-prompt">${q.prompt}</div>
        ${q.context.length ? `<div class="td-context">${q.context.map((c) => `<div><b>${c.label}:</b> ${c.text}</div>`).join("")}</div>` : ""}
        <div class="td-hint">Pick the best sentence for <b>${q.label}</b> — ${STEP_HINTS[q.label]}</div>
        <div class="timerbar"><div class="timerbar-fill" id="tdTimerFill"></div></div>
        <div id="tdChoices"></div>
      </div>
    </div>`;
  $("#tdChoices").innerHTML = options.map((opt, oi) => `<button type="button" class="choice" data-opt="${oi}">${opt}</button>`).join("");
  $("#tdChoices").querySelectorAll(".choice").forEach((btn) => btn.addEventListener("click", () => {
    const oi = Number(btn.dataset.opt);
    const tier = oi === bestIndex ? "best" : oi === secondIndex ? "second" : "wrong";
    tdAnswer(tier);
  }));

  clearInterval(td.qTimer);
  td.qTimer = setInterval(() => {
    td.timeLeft -= 0.1;
    $("#tdTimerFill").style.width = Math.max(0, (td.timeLeft / td.timeLimit) * 100) + "%";
    if (td.timeLeft <= 0) { clearInterval(td.qTimer); tdAnswer("wrong"); }
  }, 100);
}

function tdMove(el, left, ms) {
  if (!el) return;
  el.style.transition = `left ${ms}ms ease-in-out`;
  void el.offsetWidth;
  el.style.left = left;
}

function tdAnswer(tier) {
  if (td.busy) return;
  td.busy = true;
  clearInterval(td.qTimer);
  $("#tdOverlayMount").innerHTML = "";
  const enemyEl = $("#tdEnemy"), soldierEl = $("#tdSoldier"), towerEl = $(".td-tower");
  const hit = tier === "best" || tier === "second";

  // The monster always charges the tower...
  tdMove(enemyEl, hit ? "calc(48% - 30px)" : "calc(100% - 124px)", 450);
  // ...a good answer sends the soldier out to meet it; a bad one leaves him stunned.
  if (hit) tdMove(soldierEl, "calc(48% + 6px)", 450);
  else if (soldierEl) soldierEl.classList.add("stun");

  setTimeout(() => {
    if (hit) {
      const dmg = tier === "best" ? TD_DMG_BEST : TD_DMG_SECOND;
      td.enemyHp = Math.max(0, td.enemyHp - dmg);
      td.score += dmg;
      tdUpdateEnemyHpBar();
      tdUpdateScore();
      popup("+" + dmg, tier === "best" ? "good" : "ok");
      flash(tier === "best" ? "good" : "ok");
      tdMove(soldierEl, "calc(100% - 96px)", 400); // soldier walks back to the tower

      if (td.enemyHp <= 0) {
        td.score += 50; // kill bonus
        setTimeout(tdUpdateScore, 300);
        if (enemyEl) enemyEl.classList.add("dead");
        setTimeout(tdEnemyCleared, 400);
      } else {
        tdMove(enemyEl, "8px", 350); // knocked back, still alive
        setTimeout(tdNextQuestion, 700);
      }
    } else {
      popup("MISS", "bad");
      flash("bad");
      if (towerEl) { towerEl.classList.add("hit"); setTimeout(() => towerEl.classList.remove("hit"), 350); }
      tdMove(enemyEl, "8px", 400);
      setTimeout(() => { if (soldierEl) soldierEl.classList.remove("stun"); tdEnemyHitTower(); }, 450);
    }
  }, 470);
}

// Called when a miss lets the current (still-alive) enemy strike the tower.
function tdEnemyHitTower() {
  const dmg = 15 + td.level * 2;
  td.hp = Math.max(0, td.hp - dmg);
  const fill = $("#tdHpFill");
  if (fill) fill.style.width = (td.hp / td.maxHp) * 100 + "%";
  if (td.hp <= 0) { tdGameOver(); return; }
  setTimeout(tdNextQuestion, 400); // same enemy keeps fighting
}

// Called only when an enemy's HP actually reaches 0.
function tdEnemyCleared() {
  td.enemiesLeft -= 1;
  const left = $("#tdEnemiesLeft"); if (left) left.textContent = td.enemiesLeft;
  const sc = $("#tdScore"); if (sc) sc.textContent = td.score;
  const enemyEl = $("#tdEnemy"); if (enemyEl) enemyEl.style.display = "none";

  if (td.enemiesLeft <= 0) { tdLevelComplete(); return; }
  setTimeout(tdSpawnEnemy, 500);
}

function tdLevelComplete() {
  $("#tdRoot").innerHTML = `
    <div class="td-start">
      <h2>LEVEL ${td.level} CLEARED</h2>
      <p>Tower HP: ${td.hp}/${td.maxHp} · Score so far: ${td.score}</p>
      <button class="primary" id="tdNextBtn" style="max-width:280px; margin:0 auto;">NEXT LEVEL</button>
      <button class="ghost backhome" style="max-width:280px; margin:10px auto 0;">BACK TO MENU</button>
    </div>`;
  $("#tdNextBtn").addEventListener("click", () => { td.level += 1; tdStartLevel(); });
  $$(".backhome").forEach((b) => b.addEventListener("click", () => showView("home")));
}

function tdGameOver() {
  clearInterval(td.qTimer);
  tdSaveRun();
  $("#tdRoot").innerHTML = `
    <div class="td-over">
      <h2 style="color:var(--coral, var(--magenta));">TOWER DOWN</h2>
      <p>You reached Level ${td.level} with a score of ${td.score}.</p>
      <button class="primary" id="tdRetryBtn" style="max-width:280px; margin:0 auto;">TRY AGAIN</button>
      <button class="ghost backhome" style="max-width:280px; margin:10px auto 0;">BACK TO MENU</button>
    </div>`;
  $("#tdRetryBtn").addEventListener("click", tdRenderStart);
  $$(".backhome").forEach((b) => b.addEventListener("click", () => showView("home")));
}

function tdSaveRun() {
  if (!db || !state.user) return;
  const uid = state.user.uid, name = state.user.displayName;

  db.collection("attempts").add({
    uid, name,
    date: new Date().toISOString().slice(0, 10),
    scenario: `Tower Defense — reached Level ${td.level}`,
    method: "TOWER DEFENSE",
    score: td.score,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  }).catch((err) => console.error("TD save attempt failed:", err));

  const playerRef = db.collection("players").doc(uid);
  db.runTransaction(async (tx) => {
    const doc = await tx.get(playerRef);
    const prevXp = doc.exists ? doc.data().totalScore || 0 : 0;
    tx.set(playerRef, { name, totalScore: prevXp + td.score, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
  }).catch((err) => console.error("TD XP update failed:", err));
}
