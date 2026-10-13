"use strict";

const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME",
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

const STEP_SECONDS = 12;
const LEVELS = [ { min: 0, name: "Rookie" }, { min: 150, name: "Communicator" }, { min: 400, name: "Pro Speaker" }, { min: 800, name: "StarPrep Master" } ];

const isPlaceholder = firebaseConfig.apiKey === "REPLACE_ME";
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
  const navId = ["progress", "leaderboard"].includes(id) ? id : "pick";
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
  $("#buildPrompt").textContent = `${state.scenario.prompt}`;
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
    showView("pick");
  } else {
    $("#app").style.display = "none";
    $("#loginScreen").style.display = "flex";
  }
}

$("#tryAnother").addEventListener("click", () => showView("pick"));
$("#toLeaderboard").addEventListener("click", () => { renderLeaderboard(); showView("leaderboard"); });
$("#googleBtn").addEventListener("click", signIn);
$("#signOutBtn").addEventListener("click", signOutUser);
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
