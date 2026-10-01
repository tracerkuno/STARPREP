
"use strict";

const firebaseConfig = {
  apiKey: "AIzaSyDvFZjYnKvGIverhcqGE3GNQFVw4ZTeT34",
  authDomain: "starprep-9d3a4.firebaseapp.com",
  projectId: "starprep-9d3a4",
  storageBucket: "starprep-9d3a4.firebasestorage.app",
  messagingSenderId: "60666650865",
  appId: "1:60666650865:web:cc9df3666416be469e8950"
};


/* ============================================================
   2. SCENARIO DATA
   Each scenario = { id, method, tag, title, prompt, steps[] }
   Each step = { label, correct, distractors: [3 strings] }
   Leave title/prompt empty to hide a slot from the list until
   you fill it in (see renderScenarios).
   ============================================================ */

const SCENARIOS = [
  {
    id: 1,
    method: "STAR",
    tag: "Job / college interview",
    title: "A time you solved a difficult problem",
    prompt: "Tell me about a time you faced a difficult problem and how you solved it.",
    steps: [
      {
        label: "Situation",
        correct: "During our group project last term, our presentation file got corrupted the night before it was due.",
        distractors: [
          "I immediately contacted our adviser and asked for a short extension.",
          "Something bad happened one time and it was difficult.",
          "I usually study in the library after class."
        ]
      },
      {
        label: "Task",
        correct: "As the group leader, I was responsible for making sure we still had a presentation ready by morning.",
        distractors: [
          "In the end, we got a passing grade for the project.",
          "I had to do my part in the group.",
          "I enjoy working with my groupmates on most projects."
        ]
      },
      {
        label: "Action",
        correct: "I rebuilt the slides from our shared draft, split the remaining sections among the team, and we rehearsed at 6 a.m. before class.",
        distractors: [
          "Our file got corrupted because of a software update.",
          "I worked hard to fix the problem.",
          "I asked my groupmates how their weekend was."
        ]
      },
      {
        label: "Result",
        correct: "We submitted the presentation on time and received a grade of 92.",
        distractors: [
          "I was in charge of putting the slides back together.",
          "Everything turned out fine.",
          "We decided to grab lunch together after class."
        ]
      }
    ]
  },

  {
    id: 2,
    method: "STAR",
    tag: "Job / college interview",
    title: "A time you worked in a team",
    prompt: "Tell me about a time you worked with others to reach a goal.",
    steps: [
      {
        label: "Situation",
        correct: "Our class was assigned to organize the school's intramurals opening program with only one week to prepare.",
        distractors: [
          "I made a checklist and assigned tasks to each member.",
          "We had a group task once.",
          "I like watching sports events."
        ]
      },
      {
        label: "Task",
        correct: "I was in charge of coordinating the different committees so nothing overlapped.",
        distractors: [
          "The opening program ran smoothly and ended on time.",
          "I had a role in the group.",
          "Our school holds intramurals every year."
        ]
      },
      {
        label: "Action",
        correct: "I set up a shared group chat, checked in with each committee daily, and resolved a scheduling conflict between two performers.",
        distractors: [
          "We were given very short notice for the event.",
          "I communicated with everyone involved.",
          "I asked if anyone wanted to grab snacks."
        ]
      },
      {
        label: "Result",
        correct: "The program started on time and our adviser specifically praised the coordination between committees.",
        distractors: [
          "I was responsible for the overall coordination.",
          "It went well overall.",
          "We took a group photo afterward."
        ]
      }
    ]
  },

  {
    id: 3,
    method: "PREP",
    tag: "Class recitation",
    title: "Should phones be allowed in class?",
    prompt: "Give your stand on: should students be allowed to use phones in class?",
    steps: [
      {
        label: "Point",
        correct: "I believe students should be allowed limited phone use in class, specifically for schoolwork.",
        distractors: [
          "Phones can help students look up information quickly.",
          "Phones are kind of okay I guess.",
          "I got a new phone last month."
        ]
      },
      {
        label: "Reason",
        correct: "Many lessons now require quick research or the use of learning apps that phones can support.",
        distractors: [
          "My stand is that limited use should be allowed.",
          "Because phones are useful.",
          "My phone has a lot of storage."
        ]
      },
      {
        label: "Example",
        correct: "In our science class, we used our phones to access a lab simulation app when the computer lab was unavailable.",
        distractors: [
          "Phones let us search for information fast.",
          "There was a time we used a phone in class.",
          "I use my phone mostly for games."
        ]
      },
      {
        label: "Point (restated)",
        correct: "So overall, allowing limited, teacher-guided phone use in class can support learning rather than disrupt it.",
        distractors: [
          "That app helped us finish the activity faster.",
          "That's basically my opinion.",
          "Phones are very common nowadays."
        ]
      }
    ]
  },

  {
    id: 4,
    method: "PREP",
    tag: "Debate / impromptu",
    title: "Is social media good for teenagers?",
    prompt: "Give your stand on: is social media good for teenagers?",
    steps: [
      {
        label: "Point",
        correct: "I believe social media can be good for teenagers if it's used in moderation.",
        distractors: [
          "It helps them stay connected with friends and family.",
          "Social media is fine I think.",
          "I have three social media accounts."
        ]
      },
      {
        label: "Reason",
        correct: "It allows teenagers to build communication skills and stay updated on current events.",
        distractors: [
          "My stand is that it's good in moderation.",
          "Because it's useful for a lot of things.",
          "I check my phone a lot during the day."
        ]
      },
      {
        label: "Example",
        correct: "I personally learned about a scholarship opportunity through a school page on Facebook.",
        distractors: [
          "It helps students find useful information.",
          "I saw something useful once.",
          "I mostly use social media to watch videos."
        ]
      },
      {
        label: "Point (restated)",
        correct: "So social media, used moderately and purposefully, can genuinely benefit teenagers.",
        distractors: [
          "That scholarship post was very helpful to me.",
          "That's pretty much it.",
          "A lot of my friends use social media too."
        ]
      }
    ]
  },


  // ---- Empty slots: fill in title/prompt/tag + each step's correct + 3 distractors ----

  {
    id: 5,
    method: "STAR",
    tag: "",
    title: "",
    prompt: "",
    steps: ["Situation", "Task", "Action", "Result"].map(
      label => ({
        label,
        correct: "",
        distractors: ["", "", ""]
      })
    )
  },

  {
    id: 6,
    method: "STAR",
    tag: "",
    title: "",
    prompt: "",
    steps: ["Situation", "Task", "Action", "Result"].map(
      label => ({
        label,
        correct: "",
        distractors: ["", "", ""]
      })
    )
  },

  {
    id: 7,
    method: "PREP",
    tag: "",
    title: "",
    prompt: "",
    steps: ["Point", "Reason", "Example", "Point (restated)"].map(
      label => ({
        label,
        correct: "",
        distractors: ["", "", ""]
      })
    )
  },

  {
    id: 8,
    method: "PREP",
    tag: "",
    title: "",
    prompt: "",
    steps: ["Point", "Reason", "Example", "Point (restated)"].map(
      label => ({
        label,
        correct: "",
        distractors: ["", "", ""]
      })
    )
  }
];


/* ============================================================
   3. FIREBASE INIT
   ============================================================ */

const isPlaceholder = firebaseConfig.apiKey === "REPLACE_ME";

if (isPlaceholder) {
  document.getElementById("configWarning").style.display = "block";
}

let db, auth;

try {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
} catch (e) {
  console.error("Firebase init failed:", e);
}


/* ============================================================
   4. STATE + SMALL HELPERS
   ============================================================ */

const state = {
  scenario: null,
  choices: [],
  picks: [],
  user: null
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const shuffle = (arr) => {
  const a = arr.slice();

  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
};

function showView(id) {
  $$(".view").forEach((v) => v.classList.remove("active"));
  $("#" + id).classList.add("active");

  $$("nav button").forEach((b) => b.classList.remove("active"));

  const navId = id === "progress" ? "progress" : "pick";

  $(`nav button[data-view="${navId}"]`)?.classList.add("active");
}


/* ============================================================
   5. SCENARIO LIST + BUILDER (MCQ)
   ============================================================ */

function renderScenarios() {
  const wrap = $("#scnList");

  wrap.innerHTML = "";

  SCENARIOS
    .filter((s) => s.title)
    .forEach((s) => {
      const d = document.createElement("div");

      d.className = "scn ui";

      d.innerHTML = `
        <span class="tag">${s.tag} · <span class="pill">${s.method}</span></span>
        <h3>${s.title}</h3>
        <p>${s.prompt}</p>
      `;

      d.addEventListener("click", () => openBuilder(s));
      wrap.appendChild(d);
    });
}

function openBuilder(s) {
  state.scenario = s;

  state.choices = s.steps.map((step) => {
    const options = shuffle([
      step.correct,
      ...step.distractors
    ]);

    return {
      label: step.label,
      options,
      correctIndex: options.indexOf(step.correct)
    };
  });

  state.picks = new Array(state.choices.length).fill(null);

  $("#buildPrompt").textContent =
    `${s.prompt}  —  pick the best sentence for each ${s.method} step.`;

  const stepsEl = $("#steps");

  stepsEl.innerHTML = state.choices
    .map((c, si) => `
      <div class="step ui" data-n="${si + 1}">
        <label>${c.label}</label>
        ${c.options
          .map(
            (opt, oi) =>
              `<button type="button" class="choice" data-step="${si}" data-opt="${oi}">${opt}</button>`
          )
          .join("")}
      </div>
    `)
    .join("");

  stepsEl.querySelectorAll(".choice").forEach((btn) => {
    btn.addEventListener("click", () => {
      const si = Number(btn.dataset.step);
      const oi = Number(btn.dataset.opt);

      state.picks[si] = oi;

      stepsEl
        .querySelectorAll(`.choice[data-step="${si}"]`)
        .forEach((b) => b.classList.remove("picked"));

      btn.classList.add("picked");

      $("#scoreBtn").disabled = state.picks.includes(null);
    });
  });

  $("#scoreBtn").disabled = true;

  showView("build");
}


/* ============================================================
   6. SCORING + FEEDBACK
   ============================================================ */

function scoreAttempt() {
  const rows = state.choices.map((c, si) => ({
    label: c.label,
    ok: state.picks[si] === c.correctIndex
  }));

  const correctCount = rows.filter((r) => r.ok).length;
  const score = Math.round(
    (correctCount / state.choices.length) * 100
  );

  if (db && state.user) {
    db.collection("attempts")
      .add({
        uid: state.user.uid,
        name: state.user.displayName,
        date: new Date().toISOString().slice(0, 10),
        scenario: state.scenario.title,
        method: state.scenario.method,
        score,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      })
      .catch((err) => console.error("Save failed:", err));
  }

  $("#scoreNum").textContent =
    `${correctCount}/${state.choices.length}`;

  $("#fbRows").innerHTML = rows
    .map(
      (r) =>
        `<div class="fb-row"><span>${r.label}</span><span class="${r.ok ? "ok" : "no"}">${r.ok ? "Correct" : "Incorrect"}</span></div>`
    )
    .join("");

  $("#fbTip").textContent =
    correctCount === state.choices.length
      ? "Perfect — you correctly identified every step."
      : correctCount >= state.choices.length / 2
      ? "Good sense of the structure. Review the steps marked Incorrect."
      : "Review each step's purpose again before trying another prompt.";

  showView("feedback");
}


/* ============================================================
   7. PROGRESS (reads from Firestore for the signed-in user)
   ============================================================ */

function renderProgress() {
  const wrap = $("#progTable");

  if (!db || !state.user) {
    wrap.innerHTML =
      '<div class="empty ui">Sign in to see your saved attempts.</div>';

    return;
  }

  wrap.innerHTML =
    '<div class="empty ui">Loading…</div>';

  db.collection("attempts")
    .where("uid", "==", state.user.uid)
    .orderBy("createdAt", "asc")
    .get()
    .then((snap) => {
      if (snap.empty) {
        wrap.innerHTML =
          '<div class="empty ui">No attempts scored yet.</div>';

        return;
      }

      const rows = [];

      snap.forEach((doc) => rows.push(doc.data()));

      let html =
        '<table class="ui"><tr><th>Date</th><th>Prompt</th><th>Method</th><th>Score</th></tr>';

      rows
        .slice()
        .reverse()
        .forEach((a) => {
          html +=
            `<tr><td>${a.date}</td><td>${a.scenario}</td><td>${a.method}</td><td>${a.score}</td></tr>`;
        });

      html += "</table>";

      if (rows.length >= 2) {
        const first = rows[0].score;
        const last = rows[rows.length - 1].score;
        const diff = last - first;

        html +=
          `<p class="ui" style="margin-top:16px; font-size:14.5px;">First attempt: ${first} → latest attempt: ${last} (${diff >= 0 ? "+" : ""}${diff} point change).</p>`;
      }

      wrap.innerHTML = html;
    })
    .catch((err) => {
      console.error(err);

      wrap.innerHTML =
        '<div class="empty ui">Could not load your attempts right now.</div>';
    });
}


/* ============================================================
   8. AUTH (Google sign-in via Firebase)
   ============================================================ */

function signIn() {
  if (!auth) {
    alert(
      "Firebase isn't configured yet — paste your config in the CONFIG section."
    );

    return;
  }

  auth
    .signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .catch((err) => {
      console.error(err);
      alert("Sign-in failed: " + err.message);
    });
}

function signOutUser() {
  auth?.signOut();
}

function onAuthChange(user) {
  state.user = user;

  if (user) {
    $("#loginScreen").style.display = "none";
    $("#app").style.display = "block";
    $("#whoName").textContent =
      user.displayName || user.email || "Signed in";

    renderScenarios();
    showView("pick");
  } else {
    $("#app").style.display = "none";
    $("#loginScreen").style.display = "flex";
  }
}


/* ============================================================
   9. WIRE UP EVENTS + START
   ============================================================ */

$("#backBtn").addEventListener("click", () => showView("pick"));
$("#scoreBtn").addEventListener("click", scoreAttempt);
$("#tryAnother").addEventListener("click", () => showView("pick"));
$("#googleBtn").addEventListener("click", signIn);
$("#signOutBtn").addEventListener("click", signOutUser);

$$("nav button").forEach((b) => {
  b.addEventListener("click", () => {
    const v = b.dataset.view;

    if (v === "progress") {
      renderProgress();
    }

    showView(v);
  });
});

if (auth) {
  auth.onAuthStateChanged(onAuthChange);
} else {
  $("#loginScreen").style.display = "flex";
}