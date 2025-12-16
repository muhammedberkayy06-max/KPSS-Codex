/* KPSS Dijital Koç – Ultimate
   - JSON dosyaları index.html ile aynı klasörde olmalı
   - Offline için sw.js cache'ler
*/

const APP_VERSION = "v6";

const FILES = {
  "Türkçe": "turkce.json",
  "Matematik": "matematik.json",
  "Tarih": "tarih.json",
  "Coğrafya": "cografya.json",
  "Vatandaşlık": "vatandaslik.json",
  "İktisat": "iktisat.json",
  "Çalışma Ekonomisi": "calismaekonomisi.json",
  "Hukuk": "hukuk.json",
  "Kamu Yönetimi": "kamuyonetimi.json",
  "Uluslararası İlişkiler": "uluslararasiiliskiler.json",
};

const LESSON_ICONS = {
  "Türkçe": "📝",
  "Matematik": "🔢",
  "Tarih": "📜",
  "Coğrafya": "🗺️",
  "Vatandaşlık": "⚖️",
  "İktisat": "📈",
  "Çalışma Ekonomisi": "🏭",
  "Hukuk": "🏛️",
  "Kamu Yönetimi": "🏢",
  "Uluslararası İlişkiler": "🌐",
};

const GK_GY_DISTRIBUTION = {
  "Türkçe": 30,
  "Matematik": 30,
  "Tarih": 27,
  "Coğrafya": 18,
  "Vatandaşlık": 9,
};

const A_GROUP_LESSONS = ["Kamu Yönetimi", "İktisat", "Çalışma Ekonomisi", "Hukuk", "Uluslararası İlişkiler"]; // 40'ar

const STORE_KEY = "kpss_ultimate_v1";

// ---------- small helpers ----------
const $ = (id) => document.getElementById(id);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const now = () => new Date().toISOString();

function typesetMath(root){
  try{
    if (!window.MathJax || !MathJax.typesetPromise) return;
    const target = root || document.body;
    MathJax.typesetPromise([target]).catch(console.warn);
  }catch(e){ console.warn(e); }
}

function syncLessonUI(mode = App.mode){
  const sel = $("lessonSelect");
  const wrap = $("lessonIcons");
  if (!sel || !wrap) return;

  // Seçili ders geçersizse veya yoksa ilk derse düş
  if (!App.lesson || !FILES[App.lesson]) {
    App.lesson = Object.keys(FILES)[0];
  }

  // Select boş kaldıysa yeniden doldur
  if (!sel.options.length) {
    Object.keys(FILES).forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      sel.appendChild(opt);
    });
  }

  sel.value = App.lesson;

  // Ikonları görünür kıl
  renderLessonIcons(mode);
}

function safeText(v){
  return (v===null || v===undefined) ? "" : String(v);
}

function normalizeQuestion(q){
  const konu = q.konu || q.topic || "Genel";
  const soru = q.soru || q.question || "";
  const paragraf = (q.paragraf ?? q.paragraph) || null;

  // --- seçenekleri normalize et: array veya {A:..,B:..} gelebilir ---
  let optionsRaw = q.secenekler ?? q.options ?? [];
  let options = [];

  if (Array.isArray(optionsRaw)) {
    options = optionsRaw.map(x => safeText(x));
  } else if (optionsRaw && typeof optionsRaw === "object") {
    // {A:"",B:"",C:"",D:"",E:""} => ["","",...]
    const order = ["A","B","C","D","E","F"];
    options = order
      .filter(k => k in optionsRaw)
      .map(k => safeText(optionsRaw[k]));
    // eğer anahtarlar farklıysa (nadir), değerleri sırayla al
    if (options.length === 0) options = Object.values(optionsRaw).map(v => safeText(v));
  } else {
    options = [];
  }

  // --- doğru cevabı normalize et: index veya harf gelebilir ---
  let correct = (q.dogru_index ?? q.dogruIndex ?? q.correct_index ?? q.correctIndex ?? q.answer_index ?? q.answerIndex);
  if (correct === undefined || correct === null) {
    correct = q.dogru ?? q.correct ?? q.answer; // "A" / "B" gibi
  }

  let ci = 0;
  if (typeof correct === "string") {
    const up = correct.trim().toUpperCase();
    const letter = up[0];
    const idx = "ABCDEF".indexOf(letter);
    ci = idx >= 0 ? idx : parseInt(up, 10);
  } else {
    ci = correct;
  }

  ci = Number.isFinite(ci) ? parseInt(ci, 10) : 0;
  if (!Number.isFinite(ci)) ci = 0;

  // sınır kontrolü
  if (options.length > 0) ci = clamp(ci, 0, options.length - 1);

  const explain = q.aciklama || q.explain || q.explanation || q.cozum || q.cözüm || "";
  const difficulty = q.zorluk || q.difficulty || null;
  const kazanım = q.kazanim || q.kazanım || null;

  return {
    raw:q,
    konu,
    soru,
    paragraf,
    options,
    correctIndex: ci,
    explain,
    difficulty,
    kazanım,
  };
}

function estimateDifficulty(q){
  // heuristic: longer prompt/paragraph and options => harder
  const len = (q.soru?.length||0) + (q.paragraf?.length||0);
  if (len < 90) return "easy";
  if (len < 170) return "medium";
  return "hard";
}

function shuffle(arr){
  for (let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

function pickN(arr, n){
  if (n<=0) return [];
  if (arr.length<=n) return shuffle([...arr]);
  return shuffle([...arr]).slice(0,n);
}

function groupBy(arr, keyFn){
  const m = new Map();
  for (const x of arr){
    const k = keyFn(x);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(x);
  }
  return m;
}

// ---------- persistence ----------
function loadState(){
  try{
    return JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
  }catch{ return {}; }
}

function saveState(s){
  localStorage.setItem(STORE_KEY, JSON.stringify(s));
}

function ensureState(){
  const s = loadState();
  s.profile ??= { xp:0, level:1, streak:0, badges:[], lastActive:null };
  s.history ??= []; // {date, lesson, mode, total, correct, topicStats}
  s.topicPerf ??= {}; // lesson -> topic -> {correct,total}
  return s;
}

function addXP(state, amount){
  state.profile.xp += amount;
  const lvl = Math.floor(state.profile.xp / 250) + 1;
  state.profile.level = lvl;
}

function badgeCheck(state){
  const b = new Set(state.profile.badges || []);
  const xp = state.profile.xp || 0;
  const lvl = state.profile.level || 1;
  if (xp >= 250) b.add("Başlangıç Rozeti");
  if (xp >= 1000) b.add("İstikrarlı Çalışan");
  if (lvl >= 10) b.add("Seviye 10");
  if ((state.profile.streak||0) >= 10) b.add("10 Gün Seri");
  state.profile.badges = [...b];
}

function updateStreak(state){
  const last = state.profile.lastActive ? new Date(state.profile.lastActive) : null;
  const today = new Date();
  today.setHours(0,0,0,0);
  if (!last){
    state.profile.streak = 1;
  } else {
    const d = new Date(last); d.setHours(0,0,0,0);
    const diffDays = Math.round((today - d) / 86400000);
    if (diffDays === 0) {
      // keep
    } else if (diffDays === 1) {
      state.profile.streak = (state.profile.streak||0) + 1;
    } else {
      state.profile.streak = 1;
    }
  }
  state.profile.lastActive = now();
}

// ---------- app state ----------
const App = {
  mode:"single",
  lesson:"Matematik",
  allBanks:{}, // lesson -> questions[]
  currentTest:null,
  voice:{ rec:null, enabled:false },
  ttsEnabled:false,
};

// ---------- UI wiring ----------
function setNotice(msg, kind="info"){
  const el = $("loadStatus");
  el.hidden = !msg;
  if (!msg) return;
  el.textContent = msg;
  el.style.background = kind==="error" ? "rgba(220,38,38,.07)" : "rgba(10,132,255,.06)";
  el.style.borderColor = kind==="error" ? "rgba(220,38,38,.18)" : "rgba(17,24,39,.08)";
}

function showAlert(msg){
  const box = $("alertBox");
  const txt = $("alertText");
  if (!msg){
    box.hidden = true;
    return;
  }
  txt.textContent = msg;
  box.hidden = false;
}

function goHome(){
  setView("setup");
  window.scrollTo({ top: 0, behavior: "smooth" });
  setNotice("Başlangıç ekranına döndün. Yeni testi başlatabilirsin.", "info");
}

function setMode(mode){
  App.mode = mode;
  document.querySelectorAll(".mode-btn").forEach(b=>{
    b.classList.toggle("active", b.dataset.mode===mode);
  });

  const showLesson = (mode === "single");
  $("fieldLesson").hidden = !showLesson;

  if (mode === "gkgy"){
    $("countInput").value = Object.values(GK_GY_DISTRIBUTION).reduce((a,b)=>a+b,0);
    $("countInput").disabled = true;
    $("countHint").textContent = "GK-GY: Türkçe 30, Matematik 30, Tarih 27, Coğrafya 18, Vatandaşlık 9 (toplam 114).";
  } else if (mode === "a"){
    $("countInput").value = 200;
    $("countInput").disabled = true;
    $("countHint").textContent = "A Grubu deneme: 5 ders x 40 = 200 soru (maraton).";
  } else {
    $("countInput").disabled = false;
    $("countHint").textContent = "Tek ders pratik: 5-300 arası seçebilirsin.";
  }

  syncLessonUI(mode);
}

function fillLessonSelect(){
  const sel = $("lessonSelect");
  sel.innerHTML = "";
  Object.keys(FILES).forEach(name=>{
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  });
  sel.value = App.lesson;
}

function setLesson(lesson){
  if (!FILES[lesson]) return;
  App.lesson = lesson;
  $("lessonSelect").value = lesson;
  highlightLessonIcon();
}

function highlightLessonIcon(){
  document.querySelectorAll(".icon-tile").forEach(t=>{
    t.classList.toggle("active", t.dataset.lesson === App.lesson);
  });
}

function renderLessonIcons(mode="single"){
  const allowed = mode === "gkgy" ? Object.keys(GK_GY_DISTRIBUTION)
    : mode === "a" ? [...A_GROUP_LESSONS]
    : Object.keys(FILES);

  if (!allowed.includes(App.lesson)){
    App.lesson = allowed[0];
    $("lessonSelect").value = App.lesson;
  }

  const wrap = $("lessonIcons");
  wrap.innerHTML = "";

  allowed.forEach(lesson=>{
    const div = document.createElement("button");
    div.className = "icon-tile";
    div.dataset.lesson = lesson;
    const count = App.allBanks?.[lesson]?.length || 0;
    div.innerHTML = `<span class="emoji">${LESSON_ICONS[lesson]||"📘"}</span>`+
                    `<div class="meta"><span class="name">${lesson}</span><span class="count">${count} soru</span></div>`;
    div.addEventListener("click", ()=> setLesson(lesson));
    wrap.appendChild(div);
  });

  highlightLessonIcon();
}

// ---------- loading question banks ----------
async function fetchJSON(path){
  const urlObj = new URL(path, location.href);
  urlObj.searchParams.set("v", APP_VERSION);
  const url = urlObj.toString();

  const tryParse = (txt) => {
    const clean = txt.replace(/^\uFEFF/, "").replace(/^[^\[{]+/, "").trim();
    if (!clean || /^[<]/.test(clean)) return null; // büyük ihtimalle HTML veya boş yanıt
    try {
      return JSON.parse(clean);
    } catch { return null; }
  };

  const fetchAndParse = async () => {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`${path} yüklenemedi (${res.status})`);
    const rawText = await res.text();
    const parsed = tryParse(rawText);
    if (parsed) return parsed;
    throw new Error(`JSON parse hatası (${path}): Beklenmeyen içerik (ilk bayt: ${rawText[0]||"?"})`);
  };

  // Ana deneme
  try {
    const data = await fetchAndParse();
    if (!Array.isArray(data)) throw new Error(`${path} geçerli bir dizi değil`);
    return data.map(normalizeQuestion);
  } catch (err) {
    console.warn(`İlk deneme başarısız (${path}):`, err);

    // SW cache veya tarayıcı cache'inde kalan sağlam kopyayı deneyelim
    if (typeof caches !== "undefined") {
      const cacheKeys = [url, path];
      for (const key of cacheKeys) {
        try {
          const cached = await caches.match(key);
          if (cached) {
            const txt = await cached.text();
            const parsed = tryParse(txt);
            if (Array.isArray(parsed)) {
              console.info(`Cache'ten geri yüklendi (${key})`);
              return parsed.map(normalizeQuestion);
            }
          }
        } catch (e) {
          console.warn(`Cache okuma hatası (${key}):`, e);
        }
      }
    }

    throw err;
  }
}

async function loadAllBanks(){
  setNotice("Soru paketleri yükleniyor…", "info");
  const banks = {};
  const missing = [];

  const jobs = Object.entries(FILES).map(async ([lesson, file]) => {
    try {
      const data = await fetchJSON(file);
      banks[lesson] = data;
    } catch (e) {
      console.error(e);
      banks[lesson] = [];
      missing.push({ lesson, file, error: e?.message || e });
    }
  });

  await Promise.all(jobs);
  App.allBanks = banks;

  renderLessonIcons(App.mode);

  if (missing.length){
    const names = missing.map(m=>`${m.lesson} (${m.file})`).join(", ");
    setNotice(`Bazı paketler okunamadı: ${names}. Yenileyip tekrar dene.`, "error");
    showAlert("Güncel dosyalar tarayıcıda önbelleğe takılmış olabilir. Sayfayı yenileyip ⚡ Güncellemeleri denetle, ardından 🏠 Ana sayfa ile yeniden başlatmayı dene.");
  } else {
    const total = Object.values(banks).reduce((a,b)=> a + (b?.length||0), 0);
    setNotice(`Soru paketleri hazır ✅ · ${total} soru`, "info");
  }

  syncLessonUI(App.mode);
}

// ---------- test builder ----------
function buildTest(mode, lesson, count, goal, diffSel){
  const state = ensureState();
  const banks = App.allBanks;
  const out = [];

  const wantDiff = (q) => {
    const d = q.difficulty || estimateDifficulty(q);
    if (diffSel === "auto") return true;
    return d === diffSel;
  };

  const preferWeak = (lessonName, topic) => {
    const tp = state.topicPerf?.[lessonName]?.[topic];
    if (!tp || tp.total < 6) return 1.0;
    const acc = tp.correct / tp.total;
    // lower accuracy => higher weight
    return clamp(1.8 - acc, 1.0, 1.8);
  };

  function pickFromLesson(lessonName, n){
    const pool = (banks[lessonName]||[]).filter(wantDiff);
    if (pool.length === 0) return [];
    if (goal !== "mastery") return pickN(pool, n);

    // mastery: weighted by weak topics
    const byTopic = groupBy(pool, x => x.konu);
    const topics = [...byTopic.keys()];
    // make weighted topic list
    const weightedTopics = [];
    for (const t of topics){
      const w = preferWeak(lessonName, t);
      const times = Math.round(w*10);
      for (let i=0;i<times;i++) weightedTopics.push(t);
    }
    shuffle(weightedTopics);

    const chosen = [];
    const used = new Set();
    let guard = 0;
    while (chosen.length < n && guard < n*40){
      guard++;
      const t = weightedTopics[Math.floor(Math.random()*weightedTopics.length)];
      const items = byTopic.get(t);
      const q = items[Math.floor(Math.random()*items.length)];
      const key = q.soru + "|" + q.konu;
      if (used.has(key)) continue;
      used.add(key);
      chosen.push(q);
    }
    // if still short, fill random
    if (chosen.length < n){
      const rest = pool.filter(q=>!used.has(q.soru+"|"+q.konu));
      chosen.push(...pickN(rest, n-chosen.length));
    }
    return chosen;
  }

  if (mode === "gkgy"){
    for (const [les, n] of Object.entries(GK_GY_DISTRIBUTION)){
      out.push(...pickFromLesson(les, n));
    }
  } else if (mode === "a"){
    for (const les of A_GROUP_LESSONS){
      out.push(...pickFromLesson(les, 40));
    }
  } else {
    out.push(...pickFromLesson(lesson, count));
  }

  // ensure at least one per topic (if possible)
  const byTopic = groupBy(out, q=> q.konu);
  const topics = [...byTopic.keys()];
  if (topics.length > 0){
    // already fine; nothing
  }

  shuffle(out);

  return {
    id: crypto.randomUUID?.() || String(Math.random()).slice(2),
    mode,
    lesson,
    createdAt: now(),
    goal,
    diffSel,
    questions: out,
    index: 0,
    answers: new Array(out.length).fill(null), // {picked, correct}
    topicStats: {}, // topic -> {correct,total}
    correct: 0,
    total: out.length,
  };
}

// ---------- quiz rendering ----------
function setView(view){
  $("setupCard").hidden = view !== "setup";
  $("quizCard").hidden = view !== "quiz";
  $("resultsCard").hidden = view !== "results";
}

function renderQuestion(){
  const t = App.currentTest;
  if (!t || t.total === 0){
    setNotice("Bu mod için soru bulunamadı. JSON dosyalarında soru var mı?", "error");
    return;
  }

  const q = t.questions[t.index];
  const lessonName = (t.mode === "single") ? t.lesson : inferLesson(q);

  $("pillMeta").textContent = `${lessonName} · ${q.konu}`;
  $("qTitle").textContent = q.soru;

  if (q.paragraf){
    $("qParagraph").hidden = false;
    $("qParagraph").textContent = q.paragraf;
  } else {
    $("qParagraph").hidden = true;
    $("qParagraph").textContent = "";
  }

  $("counter").textContent = `${t.index+1} / ${t.total}`;
  $("bar").style.width = `${Math.round(((t.index)/Math.max(1,t.total))*100)}%`;

  const opts = $("options");
  opts.innerHTML = "";
  const picked = t.answers[t.index]?.picked;
  const locked = t.answers[t.index] !== null;

  q.options.forEach((text, i)=>{
    const b = document.createElement("button");
    b.className = "opt";
    b.innerHTML = `${String.fromCharCode(65+i)}) ${safeText(text)}`;
    b.onclick = () => onPick(i);
    if (locked) b.classList.add("disabled");
    opts.appendChild(b);
  });

  $("explain").hidden = true;
  $("explainText").textContent = "";
  $("coachTip").textContent = "";

  // if already answered, paint
  if (locked){
    paintOptions();
    showExplanation();
  }

  typesetMath($("quizCard"));
}

function inferLesson(q){
  // We don’t store lesson inside question; use current mode mapping by reference
  // fall back to selected
  return App.currentTest?.lesson || "Ders";
}

function paintOptions(){
  const t = App.currentTest;
  const q = t.questions[t.index];
  const picked = t.answers[t.index]?.picked;
  const correct = q.correctIndex;
  const buttons = [...$("options").children];

  buttons.forEach((b, i)=>{
    b.classList.remove("correct","wrong");
    if (i === correct) b.classList.add("correct");
    if (picked !== null && i === picked && picked !== correct) b.classList.add("wrong");
    b.classList.add("disabled");
  });
}

function getCoachTip(lesson, topic, ok){
  const tips = {
    "Türkçe": [
      "Paragrafta önce ana düşünceyi bul, sonra seçenekleri ele.",
      "Sözel mantıkta kesin bilgi → kesin sonuç; varsayım yapma.",
    ],
    "Matematik": [
      "Problemlerde önce verilenleri sembolleştir, sonra denklem kur.",
      "Oran-orantıda birimleri ve pay/payda tutarlılığını kontrol et.",
    ],
    "Tarih": [
      "Kronoloji çalış: olayları sıraya koymak hatayı azaltır.",
      "Benzer antlaşmaları tablo yapıp farklarını yaz.",
    ],
    "Vatandaşlık": [
      "Anayasa maddelerini anahtar kelimelerle eşleştir.",
      "Yetki–görev ayrımını tabloyla çalış.",
    ]
  };
  const base = tips[lesson] || ["Zayıf olduğun konuyu 20 dk tekrar + 10 soru ile pekiştir."];
  const t = base[Math.floor(Math.random()*base.length)];
  return ok ? `✅ Devam! ${t}` : `🎯 Bu konuya odaklan: ${topic}. ${t}`;
}

function showExplanation(){
  const t = App.currentTest;
  const q = t.questions[t.index];
  const ans = t.answers[t.index];
  const ok = !!ans?.correct;

  $("explain").hidden = false;
  $("tagResult").textContent = ok ? "Doğru ✅" : "Yanlış ❌";
  $("tagResult").className = "tag " + (ok ? "ok" : "bad");

  const explain = q.explain || "";
  const fallback = ok ? "Kısa not: Doğru seçeneği koru." : "Kısa not: Açıklama eklenmemiş.";
  const html = (explain || fallback).replace(/\n/g, "<br>");
  $("explainText").innerHTML = html;

  const lessonName = (t.mode === "single") ? t.lesson : inferLesson(q);
  $("coachTip").textContent = getCoachTip(lessonName, q.konu, ok);

  if (App.ttsEnabled){
    speak(`${ok ? "Doğru" : "Yanlış"}. ${$("explainText").textContent}`);
  }

  typesetMath($("explain"));
}

function onPick(i){
  const t = App.currentTest;
  if (!t) return;
  if (t.answers[t.index] !== null) return; // locked

  const q = t.questions[t.index];
  const correct = q.correctIndex;
  const ok = (i === correct);
  t.answers[t.index] = { picked:i, correct:ok };

  // stats
  if (ok) t.correct++;
  const topic = q.konu;
  t.topicStats[topic] ??= {correct:0,total:0};
  t.topicStats[topic].total++;
  if (ok) t.topicStats[topic].correct++;

  // XP / streak
  const state = ensureState();
  updateStreak(state);
  addXP(state, ok ? 12 : 4);
  badgeCheck(state);
  saveState(state);

  $("xp").textContent = state.profile.xp;
  $("streak").textContent = state.profile.streak;

  paintOptions();
  showExplanation();
}

function next(){
  const t = App.currentTest;
  if (!t) return;
  if (t.index < t.total-1){
    t.index++;
    renderQuestion();
  } else {
    finish();
  }
}

function prev(){
  const t = App.currentTest;
  if (!t) return;
  if (t.index > 0){
    t.index--;
    renderQuestion();
  }
}

function skip(){
  const t = App.currentTest;
  if (!t) return;
  if (t.answers[t.index] === null){
    // mark as skipped
    t.answers[t.index] = {picked:null, correct:false, skipped:true};
    const q = t.questions[t.index];
    const topic = q.konu;
    t.topicStats[topic] ??= {correct:0,total:0};
    t.topicStats[topic].total++;
  }
  next();
}

function finish(){
  const t = App.currentTest;
  if (!t) return;

  const state = ensureState();

  // merge topic perf
  for (const [topic, st] of Object.entries(t.topicStats)){
    const lessonName = (t.mode === "single") ? t.lesson : "Karma";
    state.topicPerf[lessonName] ??= {};
    state.topicPerf[lessonName][topic] ??= {correct:0,total:0};
    state.topicPerf[lessonName][topic].correct += st.correct;
    state.topicPerf[lessonName][topic].total += st.total;
  }

  state.history.push({
    date: now(),
    mode: t.mode,
    lesson: t.mode === "single" ? t.lesson : (t.mode === "gkgy" ? "GK-GY" : "A Grubu"),
    total: t.total,
    correct: t.correct,
    topicStats: t.topicStats,
  });
  // keep last 90
  if (state.history.length > 90) state.history = state.history.slice(-90);

  badgeCheck(state);
  saveState(state);

  renderResults();
  setView("results");
}

// ---------- results ----------
function renderResults(){
  const t = App.currentTest;
  const state = ensureState();

  const acc = t.total ? Math.round((t.correct / t.total) * 100) : 0;
  const lvl = state.profile.level;
  const badges = state.profile.badges?.slice(0,6).join(" · ") || "—";

  $("summary").textContent = `Doğru: ${t.correct} / ${t.total}  ·  Başarı: %${acc}  ·  Seviye: ${lvl}  ·  Rozetler: ${badges}`;

  // topic map
  const map = $("topicMap");
  map.innerHTML = "";
  const entries = Object.entries(t.topicStats);
  entries.sort((a,b)=> (a[1].correct/a[1].total) - (b[1].correct/b[1].total));

  for (const [topic, st] of entries){
    const a = st.total ? st.correct / st.total : 0;
    const pill = document.createElement("div");
    pill.className = "topic " + (a>=0.75 ? "good" : a>=0.45 ? "mid" : "bad");
    pill.textContent = `${topic} · %${Math.round(a*100)} (${st.correct}/${st.total})`;
    map.appendChild(pill);
  }

  // plan (simple AI-like rules)
  const plan = $("plan");
  plan.innerHTML = "";
  const weak = entries.slice(0, Math.min(3, entries.length));

  if (weak.length === 0){
    const x = document.createElement("div");
    x.className = "plan-item";
    x.innerHTML = `<b>Harika!</b> Bugün denemeyi bitirdin. Yarın bir üst seviye zorluk seç ve süre tut.`;
    plan.appendChild(x);
  } else {
    const mins = 120;
    const per = Math.floor(mins / (weak.length + 1));
    weak.forEach(([topic, st])=>{
      const x = document.createElement("div");
      x.className = "plan-item";
      x.innerHTML = `<b>${topic}</b> ${per} dk konu tekrarı + ${Math.max(10, st.total)} soru. Not: Yanlış yaptığın seçenek türünü not al.`;
      plan.appendChild(x);
    });
    const x = document.createElement("div");
    x.className = "plan-item";
    x.innerHTML = `<b>Tekrar</b> Kalan ${per} dk: Bugünün yanlışlarını yeniden çöz ve açıklamaları sesli dinle.`;
    plan.appendChild(x);
  }

  drawChart(state.history);
}

function drawChart(history){
  const c = $("chart");
  const ctx = c.getContext("2d");
  const w = c.width, h = c.height;
  ctx.clearRect(0,0,w,h);

  const last = history.slice(-14);
  if (last.length === 0){
    ctx.fillText("Henüz geçmiş yok.", 10, 20);
    return;
  }

  const vals = last.map(x=> x.total ? (x.correct/x.total) : 0);
  const max = 1;
  const pad = 30;
  // axes
  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, h-pad);
  ctx.lineTo(w-pad, h-pad);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // line
  ctx.beginPath();
  last.forEach((x,i)=>{
    const px = pad + (i*(w-2*pad)/Math.max(1,last.length-1));
    const py = (h-pad) - (vals[i]*(h-2*pad));
    if (i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
  });
  ctx.strokeStyle = "#0A84FF";
  ctx.lineWidth = 3;
  ctx.stroke();

  // points
  last.forEach((x,i)=>{
    const px = pad + (i*(w-2*pad)/Math.max(1,last.length-1));
    const py = (h-pad) - (vals[i]*(h-2*pad));
    ctx.beginPath();
    ctx.arc(px,py,4,0,Math.PI*2);
    ctx.fillStyle = "#0A84FF";
    ctx.fill();
  });

  // labels
  ctx.fillStyle = "#111827";
  ctx.font = "12px ui-sans-serif";
  const lastAcc = Math.round(vals[vals.length-1]*100);
  ctx.fillText(`Son: %${lastAcc}`, pad, 18);
}

// ---------- voice ----------
function speak(text){
  try{
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "tr-TR";
    window.speechSynthesis.speak(u);
  }catch(e){ console.warn(e); }
}

function startVoice(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR){
    setNotice("Bu tarayıcı sesli komutu desteklemiyor (SpeechRecognition yok).", "error");
    return;
  }
  const rec = new SR();
  rec.lang = "tr-TR";
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  rec.onresult = (e)=>{
    const text = (e.results?.[0]?.[0]?.transcript || "").trim();
    if (!text) return;
    handleVoiceCommand(text);
  };
  rec.onerror = (e)=>{
    console.warn(e);
    setNotice("Sesli komut hatası: " + (e.error||""), "error");
  };

  rec.onend = ()=>{
    App.voice.enabled = false;
    $("btnVoice").classList.remove("active");
  };

  App.voice.rec = rec;
  rec.start();
  App.voice.enabled = true;
  setNotice("Dinliyorum… Komut söyle.", "info");
}

function handleVoiceCommand(raw){
  const t = raw.toLowerCase();
  setNotice(`Komut: “${raw}”`, "info");

  if (t.includes("sonraki")) return next();
  if (t.includes("geri")) return prev();
  if (t.includes("bitir")) return finish();
  if (t.includes("oku")) return readCurrent();

  if (t.includes("gkgy") || t.includes("genel kültür") || t.includes("genel yetenek")){
    setMode("gkgy");
    return;
  }
  if (t.includes("a grubu") || t.includes("a grubu deneme")){
    setMode("a");
    return;
  }

  // “Matematikten 10 soru”
  const m = t.match(/(türkçe|matematik|tarih|coğrafya|cografya|vatandaşlık|vatandaslik|iktisat|hukuk|kamu|uluslararası|uluslararasi)\s*(?:ten|dan)?\s*(\d+)\s*soru/);
  if (m){
    const name = m[1];
    const n = parseInt(m[2],10);
    const map = {
      "türkçe":"Türkçe",
      "matematik":"Matematik",
      "tarih":"Tarih",
      "coğrafya":"Coğrafya",
      "cografya":"Coğrafya",
      "vatandaşlık":"Vatandaşlık",
      "vatandaslik":"Vatandaşlık",
      "iktisat":"İktisat",
      "hukuk":"Hukuk",
      "kamu":"Kamu Yönetimi",
      "uluslararası":"Uluslararası İlişkiler",
      "uluslararasi":"Uluslararası İlişkiler",
    };
    const lesson = map[name] || "Matematik";
    setMode("single");
    setLesson(lesson);
    $("countInput").value = clamp(n,5,300);
    return;
  }

  if (t.includes("başlat") || t.includes("test")){
    return startTest();
  }
}

function readCurrent(){
  const t = App.currentTest;
  if (!t) return;
  const q = t.questions[t.index];
  const opts = q.options.map((x,i)=> `${String.fromCharCode(65+i)}. ${x}`).join(". ");
  const p = q.paragraf ? `Paragraf: ${q.paragraf}. ` : "";
  speak(`${q.soru}. ${p} Seçenekler: ${opts}`);
}

// ---------- online update stub ----------
async function checkUpdates(){
  // For GitHub Pages: if you later publish a version.json you can compare.
  setNotice("Online güncelleme kontrolü: Şimdilik demo. (İleride version.json ekleyebiliriz)", "info");
}

// ---------- wiring ----------
async function startTest(){
  try{
    if (!Object.keys(App.allBanks||{}).length) await loadAllBanks();
  }catch{ return; }

  const mode = App.mode;
  // App.lesson her zaman ikonlar ve açılır liste ile senkron tutuluyor;
  // doğrudan bu kaynaktan alarak seçim sorunlarını önlüyoruz.
  const lesson = App.lesson;
  const count = clamp(parseInt($("countInput").value||"10",10), 5, 300);
  const goal = $("goal").value;
  const diffSel = $("difficulty").value;
  App.ttsEnabled = $("ttsToggle").checked;

  const test = buildTest(mode, lesson, count, goal, diffSel);
  App.currentTest = test;

  // initialize XP
  const state = ensureState();
  $("xp").textContent = state.profile.xp;
  $("streak").textContent = state.profile.streak;

  setView("quiz");
  renderQuestion();
}

function quick2hPlan(){
  // build “today 2h” : short mixed 5 lessons
  setMode("gkgy");
  $("goal").value = "mastery";
  $("difficulty").value = "auto";
  setNotice("2 saat plan: GK-GY karışık + zayıf konulara ağırlık. Başlat’a bas.", "info");
}

function exportData(){
  const state = ensureState();
  const blob = new Blob([JSON.stringify(state,null,2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "kpss_ultimate_progress.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function share(){
  const t = App.currentTest;
  const state = ensureState();
  const acc = t.total ? Math.round((t.correct/t.total)*100) : 0;
  const msg = `KPSS Dijital Koç: %${acc} başarı · ${t.correct}/${t.total} · Seviye ${state.profile.level}`;

  if (navigator.share){
    navigator.share({ title:"KPSS Dijital Koç", text: msg, url: location.href }).catch(()=>{});
  } else {
    navigator.clipboard?.writeText(msg + " " + location.href);
    setNotice("Paylaşım metni panoya kopyalandı ✅", "info");
  }
}

// PWA install helper
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  $("btnInstall").style.display = "inline-flex";
});

async function installPWA(){
  if (!deferredPrompt){
    setNotice("iPad Safari için: Paylaş → Ana Ekrana Ekle.", "info");
    return;
  }
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
}

async function init(){
  fillLessonSelect();
  setMode("single");

  // mode buttons (yalnızca mod anahtarları)
  document.querySelectorAll(".mode-btn").forEach(b=>{
    b.addEventListener("click", ()=> setMode(b.dataset.mode));
  });

  $("lessonSelect").addEventListener("change", (e)=> setLesson(e.target.value));

  $("btnStart").addEventListener("click", startTest);
  $("btnQuick10").addEventListener("click", quick2hPlan);
  $("btnUpdate").addEventListener("click", checkUpdates);
  $("btnHome").addEventListener("click", goHome);

  $("btnNext").addEventListener("click", next);
  $("btnPrev").addEventListener("click", prev);
  $("btnSkip").addEventListener("click", skip);
  $("btnFinish").addEventListener("click", finish);

  $("btnRestart").addEventListener("click", ()=>{ setView("setup"); });
  $("btnExport").addEventListener("click", exportData);
  $("btnShare").addEventListener("click", share);

  $("btnVoice").addEventListener("click", ()=> startVoice());
  $("btnRead").addEventListener("click", ()=> readCurrent());
  $("btnInstall").addEventListener("click", ()=> installPWA());
  $("alertClose").addEventListener("click", ()=> showAlert(null));

  $("btnWhy").addEventListener("click", ()=>{
    const t = App.currentTest;
    if (!t) return;
    const q = t.questions[t.index];
    const k = q.kazanım || `Kazanım: ${q.konu}`;
    setNotice(k, "info");
  });

  // service worker
  if ("serviceWorker" in navigator){
    navigator.serviceWorker.register("sw.js").catch(console.warn);
  }

  // initial state info
  const state = ensureState();
  saveState(state);
  setNotice("Soru paketleri yükleniyor…", "info");

  try {
    await loadAllBanks();
    syncLessonUI(App.mode);
    setNotice("Hazır. Başlamak için ‘Testi Başlat’.", "info");
  } catch (e) {
    console.error(e);
    setNotice("Soru bankaları yüklenemedi. Dosyaları yenileyip tekrar deneyin.", "error");
    // UI boş kalmasın diye son kez senkronla
    syncLessonUI(App.mode);
  }
}

window.addEventListener("DOMContentLoaded", init);
