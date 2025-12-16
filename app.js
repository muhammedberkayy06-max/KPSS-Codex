/* KPSS Dijital Koç – Ultimate
   - JSON dosyaları index.html ile aynı klasörde olmalı
   - Offline için sw.js cache'ler
*/

const APP_VERSION = "v16";

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

// 120 soruluk AI deneme için ölçeklenmiş dağılım
const GK_GY_EXAM_DISTRIBUTION = {
  "Türkçe": 30,
  "Matematik": 30,
  "Tarih": 27,
  "Coğrafya": 18,
  "Vatandaşlık": 15,
};

const A_GROUP_LESSONS = ["Kamu Yönetimi", "İktisat", "Çalışma Ekonomisi", "Hukuk", "Uluslararası İlişkiler"]; // 40'ar

const STORE_KEY = "kpss_ultimate_v1";

// ---------- small helpers ----------
const $ = (id) => document.getElementById(id);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const now = () => new Date().toISOString();
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const delay = (ms) => new Promise((resolve)=> setTimeout(resolve, ms));

// ---------- konu rehberi (AI istemi için) ----------
const TOPIC_GUIDE = {
  "Türkçe": ["Sözcükte Anlam", "Cümlede Anlam", "Paragraf", "Ses Bilgisi", "Sözcükte Yapı", "Sözcük Türleri", "Cümlenin Türleri", "Yazım Kuralları", "Noktalama İşaretleri", "Anlatım Bozuklukları", "Sözel Mantık", "Cümle Ögeleri / Anlatım Biçimleri"],
  "Matematik": ["Temel Kavramlar", "Sayılar", "EBOB-EKOK", "Denklemler", "Rasyonel Sayılar", "Eşitsizlik", "Mutlak Değer", "Üslü ve Köklü Sayılar", "Çarpanlara Ayırma", "Oran-Orantı", "Problemler", "Kümeler", "Permütasyon", "Kombinasyon", "Olasılık", "Tablo & Grafikler", "Sayısal Mantık"],
  "Tarih": ["İslamiyet Öncesi Türk Tarihi", "İlk Müslüman Türk Devletleri", "Osmanlı Tarihi", "Yenileşme ve Demokratikleşme", "XX. Yüzyıl Osmanlı", "Kurtuluş Savaşı", "Cumhuriyet Dönemi", "Atatürk Dönemi Dış Politika", "Çağdaş Türk ve Dünya Tarihi"],
  "Coğrafya": ["Türkiye Coğrafi Konumu", "Türkiye İklimi", "Bitki Örtüsü", "Fiziki Özellikler", "Nüfus & Yerleşme", "Ekonomik Coğrafya", "Bölgeler Coğrafyası"],
  "Vatandaşlık": ["Temel Hukuk", "Anayasa ve Devlet Yapısı", "1982 Anayasası İlkeleri", "Temel Hak ve Hürriyetler", "Yasama", "Yürütme", "Yargı", "İdare Hukuku"],
  "Kamu Yönetimi": ["Siyaset Bilimi", "Anayasa", "Yönetim Bilimleri", "Kamu Politikası", "Yönetim Hukuku", "Kentleşme", "Çevre Sorunları", "Türk Siyasi Hayatı"],
  "Uluslararası İlişkiler": ["Uluslararası İlişkiler Teorisi", "Uluslararası Hukuk", "Siyasi Tarih", "Güncel Sorunlar", "Uluslararası Örgütler", "Türk Dış Politikası"],
  "Çalışma Ekonomisi": ["İş ve Sosyal Güvenlik Hukuku", "Çalışma Ekonomisi", "Psikoloji", "Sosyoloji"],
  "Hukuk": ["Anayasa Hukuku", "İdare Hukuku", "İdari Yargı", "Ceza Hukuku", "Ceza Usulü", "Borçlar Hukuku", "Medeni Hukuk", "Ticaret Hukuku", "İcra-İflas"],
  "İktisat": ["Mikro İktisat", "Makro İktisat", "Para-Banka-Kredi", "Uluslararası İktisat", "Kalkınma & Büyüme", "Türkiye Ekonomisi", "İktisadi Düşünceler Tarihi"],
};

const HF_MODEL_DEFAULT = "HuggingFaceH4/zephyr-7b-beta";

// ---------- ücretsiz yerel AI soru üretici ----------
const AI_TEMPLATES = {
  "Türkçe": () => {
    const temas = ["dil bilgisi", "paragraf yorumu", "anlatım bozukluğu", "anlam ilişkisi"];
    const konu = pick(temas);
    const paragraf = "Okuma alışkanlığı, düşünme biçimimizi ve kelime hazinemizi geliştirirken, " +
      "farklı bakış açılarını tanımamıza da yardımcı olur.";
    const yorumlar = [
      "Okuma, zihinsel esnekliği artırır",
      "Okuma yalnızca akademik başarı için değildir",
      "Okuma, empati kurma becerisini güçlendirir",
      "Okuma zamanı planlı olmalıdır",
    ];
    const dogru = pick(yorumlar);
    const secenekler = [dogru,
      "Okuma yalnızca sınav başarısını etkiler",
      "Okuma kelime hazinesini daraltır",
      "Okuma alışkanlığı iletişim becerisine katkı sağlamaz",
      "Okuma eleştirel düşünmeyi zayıflatır"].sort(() => Math.random() - 0.5);
    const dogru_index = secenekler.indexOf(dogru);
    return {
      konu: `AI ${konu}`,
      soru: "Paragrafın temel çıkarımı nedir?",
      paragraf,
      secenekler,
      dogru_index,
      aciklama: "Yerel üretici, paragrafın vurguladığı olumlu etkilerden birini seçmeni ister.",
    };
  },
  "Matematik": () => {
    const a = rand(5, 30);
    const b = rand(2, 15);
    const c = rand(2, 9);
    const soruTipi = pick(["işlem", "oran-orantı", "kâr-zarar"]);
    if (soruTipi === "işlem") {
      const sonuc = a * b - c;
      return {
        konu: "AI İşlem",
        soru: `${a} × ${b} - ${c} işleminin sonucu kaçtır?`,
        secenekler: [sonuc, sonuc + 2, sonuc - 3, sonuc + 5].map(String),
        dogru_index: 0,
        aciklama: "Çarpma önce yapılır, ardından çıkarma uygulanır.",
      };
    }
    const toplam = a + b;
    const oran = toplam / c;
    const dogru = oran.toFixed(1);
    const secenekler = [dogru, (oran + 0.5).toFixed(1), (oran - 0.5).toFixed(1), (oran + 1).toFixed(1)];
    return {
      konu: "AI Oran-Orantı",
      soru: `${a} ve ${b} sayılarının toplamının ${c} katına oranı kaçtır?`,
      secenekler,
      dogru_index: 0,
      aciklama: "Toplam hesaplanır, ardından oran bulunur.",
    };
  },
  "Tarih": () => {
    const olaylar = [
      { y: 1921, acik: "Teşkilat-ı Esasiye" },
      { y: 1923, acik: "Cumhuriyetin ilanı" },
      { y: 1934, acik: "Soyadı Kanunu" },
      { y: 1946, acik: "Çok partili hayata geçiş" },
    ];
    const sec = pick(olaylar);
    const sirali = olaylar.map(o => `${o.y} - ${o.acik}`);
    return {
      konu: "AI İnkılap Tarihi",
      soru: `${sec.y} yılında gerçekleşen gelişme aşağıdakilerden hangisidir?`,
      secenekler: sirali,
      dogru_index: sirali.indexOf(`${sec.y} - ${sec.acik}`),
      aciklama: "Zaman çizelgesindeki yıl-gelişme eşleşmesi istenir.",
    };
  },
  "Coğrafya": () => {
    const sehirler = [
      { ad: "Erzurum", iklim: "Karasal iklim etkilidir" },
      { ad: "Antalya", iklim: "Akdeniz iklimi baskındır" },
      { ad: "Rize", iklim: "Karadeniz iklimi hâkimdir" },
      { ad: "İzmir", iklim: "Akdeniz iklimi özellikleri görülür" },
    ];
    const sec = pick(sehirler);
    const dogru = `${sec.ad} - ${sec.iklim}`;
    const yanlis = sehirler.filter(s => s.ad !== sec.ad).map(s => `${sec.ad} - ${s.iklim}`);
    const secenekler = [dogru, ...yanlis.slice(0,3)].sort(() => Math.random() - 0.5);
    return {
      konu: "AI İklim Bilgisi",
      soru: `${sec.ad} şehri için doğru iklim eşleşmesi hangisidir?`,
      secenekler,
      dogru_index: secenekler.indexOf(dogru),
      aciklama: "Şehir-iklim eşleştirmesi temel coğrafya bilgisidir.",
    };
  },
  "Vatandaşlık": () => {
    const kavramlar = [
      { k: "yürütme", org: "Cumhurbaşkanı ve Cumhurbaşkanlığı kabinesi" },
      { k: "yasama", org: "TBMM" },
      { k: "yargı", org: "Bağımsız ve tarafsız mahkemeler" },
    ];
    const sec = pick(kavramlar);
    const dogru = `${sec.k} - ${sec.org}`;
    const secenekler = kavramlar.map(x => `${x.k} - ${x.org}`);
    const karisik = [...secenekler];
    while (karisik.length < 4) karisik.push("Temel hak ve özgürlükler");
    karisik.sort(() => Math.random() - 0.5);
    return {
      konu: "AI Anayasa",
      soru: "Kuvvetler ayrılığına göre aşağıdaki eşleşmelerden hangisi doğrudur?",
      secenekler: karisik,
      dogru_index: karisik.indexOf(dogru),
      aciklama: "Yasama-yürütme-yargı organlarının doğru eşleşmesi istenir.",
    };
  },
  "Uluslararası İlişkiler": () => {
    const kurumlar = ["NATO", "BM", "AB", "OECD"];
    const gorev = {
      "NATO": "kolektif savunma",
      "BM": "barış ve güvenliği koruma",
      "AB": "ekonomik ve siyasal bütünleşme",
      "OECD": "ekonomik iş birliği",
    };
    const sec = pick(kurumlar);
    const dogru = `${sec} - ${gorev[sec]}`;
    const yanlis = kurumlar.filter(k => k !== sec).map(k => `${sec} - ${gorev[k]}`);
    const secenekler = [dogru, ...yanlis.slice(0,3)].sort(() => Math.random() - 0.5);
    return {
      konu: "AI Uluslararası Kurumlar",
      soru: `${sec} kurumunun temel fonksiyonu nedir?`,
      secenekler,
      dogru_index: secenekler.indexOf(dogru),
      aciklama: "Kurumsal misyonu doğru eşleştiren seçenek doğrudur.",
    };
  },
  "Çalışma Ekonomisi": () => {
    const kavramlar = [
      { t: "işsizlik türü", cevap: "doğal işsizlik" },
      { t: "sendika", cevap: "toplu pazarlık" },
      { t: "ücret", cevap: "reel ücret" },
    ];
    const sec = pick(kavramlar);
    const dogru = `${sec.t} - ${sec.cevap}`;
    const secenekler = [dogru, "işgücü maliyeti", "asgari ücret", "işgücü devri"];
    secenekler.sort(() => Math.random() - 0.5);
    return {
      konu: "AI Emek Piyasası",
      soru: `${sec.t} kavramı ile en doğru ilişki hangisidir?`,
      secenekler,
      dogru_index: secenekler.indexOf(dogru),
      aciklama: "Temel çalışma ekonomisi kavram eşleştirmesi sorusudur.",
    };
  },
  "Hukuk": () => {
    const dallar = [
      { d: "Anayasa Hukuku", oz: "temel hak ve özgürlükler" },
      { d: "İdare Hukuku", oz: "idarenin işlemleri" },
      { d: "Ceza Hukuku", oz: "suç ve yaptırım" },
    ];
    const sec = pick(dallar);
    const dogru = `${sec.d} - ${sec.oz}`;
    const secenekler = [dogru, ...dallar.filter(x => x.d !== sec.d).map(x => `${sec.d} - ${x.oz}`)];
    secenekler.sort(() => Math.random() - 0.5);
    return {
      konu: "AI Hukuk Dalları",
      soru: `${sec.d} aşağıdakilerden hangisi ile en yakından ilişkilidir?`,
      secenekler,
      dogru_index: secenekler.indexOf(dogru),
      aciklama: "Hukuk dalının konu edindiği temel alan sorgulanır.",
    };
  },
  "İktisat": () => {
    const arz = rand(10,50);
    const talep = rand(20,60);
    const fiyat = rand(5,25);
    const denge = Math.round((arz + talep)/2);
    const secenekler = [denge, denge+5, denge-5, denge+10].map(String).sort(() => Math.random() - 0.5);
    const dogru = secenekler.indexOf(String(denge));
    return {
      konu: "AI Mikro İktisat",
      soru: `Arz ${arz}, talep ${talep} iken denge miktarı yaklaşık kaç olur?`,
      secenekler,
      dogru_index: dogru,
      aciklama: "Basitleştirilmiş arz-talep ortalaması kullanıldı.",
    };
  },
  "Kamu Yönetimi": () => {
    const yaklasimlar = [
      { ad: "Yeni Kamu Yönetimi", vurgu: "piyasa mekanizmaları ve performans" },
      { ad: "Klasik Bürokrasi", vurgu: "hiyerarşi ve kurallar" },
      { ad: "Yönetişim", vurgu: "katılımcılık ve ağlar" },
    ];
    const sec = pick(yaklasimlar);
    const dogru = `${sec.ad} - ${sec.vurgu}`;
    const secenekler = yaklasimlar.map(y => `${y.ad} - ${y.vurgu}`).sort(() => Math.random() - 0.5);
    return {
      konu: "AI Yönetim Yaklaşımları",
      soru: `${sec.ad} yaklaşımının temel vurgusu nedir?`,
      secenekler,
      dogru_index: secenekler.indexOf(dogru),
      aciklama: "Yönetim yaklaşımının öne çıkan ilkesine odaklanır.",
    };
  }
};

function genericAIQuestion(lesson){
  const tema = pick(["temel kavram", "yorum", "eşleştirme", "uygulama"]);
  const dogru = "Analitik düşünme gerektirir";
  const secenekler = [dogru, "Sadece ezbere dayalıdır", "Uygulaması yoktur", "Tesadüfi sonuç verir"].sort(() => Math.random() - 0.5);
  return {
    konu: `AI ${tema}`,
    soru: `${lesson} dersinde ${tema} sorusu için doğru yaklaşım nedir?`,
    secenekler,
    dogru_index: secenekler.indexOf(dogru),
    aciklama: "Ücretsiz yerel üretici, analitik/yorum temelli yaklaşımı vurgular.",
  };
}

function generateAIQuestion(lesson){
  const fn = AI_TEMPLATES[lesson] || genericAIQuestion;
  const q = fn(lesson);
  q.kaynak = "AI (ücretsiz yerel)";
  return normalizeQuestion(q);
}

function injectAIQuestions(lesson, count){
  const list = [];
  for (let i=0; i<count; i++){
    list.push(generateAIQuestion(lesson));
  }
  return appendQuestions(lesson, list, "AI (ücretsiz yerel)");
}

function appendQuestions(lesson, questions, sourceLabel){
  const bank = App.allBanks[lesson] || [];
  const stamped = questions.map((q, idx)=>{
    const base = normalizeQuestion(q);
    base.id = base.id || `${sourceLabel||"AI"}-${lesson}-${Date.now()}-${idx}-${Math.random().toString(36).slice(2,6)}`;
    base.kaynak = sourceLabel || base.kaynak || "AI";
    base.lesson = base.lesson || lesson;
    return base;
  });
  bank.push(...stamped);
  App.allBanks[lesson] = bank;
  renderLessonIcons(App.mode);
  return stamped;
}

function buildAIPrompt(lesson, count){
  const topics = TOPIC_GUIDE[lesson] || ["genel"];
  const hedefler = topics.slice(0, 8).map((t,i)=> `${i+1}. ${t}`).join("\n");
  return `KPSS soru üreticisisin. Ders: ${lesson}. ${count} adet çoktan seçmeli soru üret.
Her kayıt JSON olarak dönsün: {"konu","soru","paragraf"(isteğe bağlı),"secenekler":["A","B","C","D"],"dogru_index":0-3,"aciklama":"kısa çözüm"}.
Kazanımlar (öncelik sırasıyla):\n${hedefler}\n
Kurallar: Türkçe yanıtla, seçenekler 4-5 adet olsun, paragraf alanı varsa string olarak gönder, sadece JSON array döndür.`;
}

function extractJSONSegment(text){
  const match = text.match(/\[[\s\S]*\]/);
  if (match) return match[0];
  const obj = text.match(/\{[\s\S]*\}/);
  if (obj) return `[${obj[0]}]`;
  return null;
}

function parseAITextToQuestions(text, lesson){
  const raw = extractJSONSegment(text) || text;
  let arr = [];
  try {
    const parsed = JSON.parse(raw);
    arr = Array.isArray(parsed) ? parsed : [parsed];
  } catch (e){
    // fallback: tek soru gömülü
    arr = [{
      konu:`AI ${lesson}`,
      soru:text.slice(0,180) + "?",
      secenekler:["Bilgi yok", "Model yanıtı", "Elle düzenle", "Tekrar dene"],
      dogru_index:0,
      aciklama:"Model çıktısı JSON formatında gelmedi; lütfen yeniden üretin.",
    }];
  }
  return arr.map(q=>{
    q.kaynak = q.kaynak || "AI (internet)";
    return q;
  });
}

async function fetchHuggingFaceAI(lesson, count, opts = {}){
  const token = ((opts.tokenOverride !== undefined ? opts.tokenOverride : $("hfToken")?.value) || "").trim();
  const modelRaw = (opts.modelOverride !== undefined ? opts.modelOverride : $("hfModel")?.value) || HF_MODEL_DEFAULT;
  const model = (modelRaw || HF_MODEL_DEFAULT).trim() || HF_MODEL_DEFAULT;
  const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(model)}`;
  const prompt = buildAIPrompt(lesson, count);
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const body = JSON.stringify({
    inputs: prompt,
    parameters: {
      max_new_tokens: Math.min(opts.maxTokens || (520 * count), 4096),
      temperature: opts.temperature ?? 0.65,
      top_p: opts.top_p ?? 0.9,
      return_full_text: false,
    },
    options: { wait_for_model: true },
  });

  const res = await fetch(url, { method:"POST", headers, body });
  if (!res.ok){
    const detail = await res.text();
    throw new Error(`Hugging Face API hatası (${res.status}): ${detail.slice(0,120)}`);
  }

  const data = await res.json();
  const text = Array.isArray(data) ? (data[0]?.generated_text || data[0]?.generated_texts?.[0] || JSON.stringify(data)) : (data.generated_text || JSON.stringify(data));
  const questions = parseAITextToQuestions(text || "", lesson);
  return questions;
}

async function fetchHFBatched(lesson, total){
  const out = [];
  const guard = Math.max(3, Math.ceil(total / 12));
  let tries = 0;
  while (out.length < total && tries < guard){
    tries++;
    const need = Math.min(12, total - out.length);
    try {
      const batch = await fetchHuggingFaceAI(lesson, need, { maxTokens: 600 * need });
      out.push(...batch);
    } catch (e) {
      console.warn("HF batch hatası", e);
      if (tries >= guard) throw e;
    }
    if (out.length < total) await delay(320);
  }
  return out.slice(0, total);
}

function typesetMath(root){
  try{
    if (!window.MathJax || !MathJax.typesetPromise) return;
    const target = root || document.body;
    MathJax.typesetPromise([target]).catch(console.warn);
  }catch(e){ console.warn(e); }
}

function openExamWindowShell(title, subtitle){
  const w = window.open("about:blank", "_blank", "noopener");
  if (!w){
    setNotice("Tarayıcı yeni sekmeyi engelledi. Pop-up izni verip tekrar dene.", "error");
    return null;
  }
  w.document.write(`<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${escapeHTML(title)}</title>
  <style>
    body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;color:#0f172a;margin:0;padding:24px;}
    .box{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:16px;box-shadow:0 12px 30px rgba(15,23,42,0.08);max-width:480px;margin:60px auto;text-align:center;}
    h1{margin:0 0 8px;font-size:20px;font-weight:800;}
    p{margin:0;color:#475569;}
  </style></head><body>
    <div class="box">
      <h1>${escapeHTML(title)}</h1>
      <p>${escapeHTML(subtitle || "Hazırlanıyor…")}</p>
      <p>Yeni sekme açıldıysa lütfen bekleyin.</p>
    </div>
  </body></html>`);
  w.document.close();
  return w;
}

function renderExamWindow(title, questions, subtitle, existingWin){
  const w = existingWin || window.open("", "_blank");
  if (!w){
    setNotice("Tarayıcı yeni sekmeyi engelledi. Pop-up izni verip tekrar dene.", "error");
    return;
  }
  const list = questions.map((q, i)=>{
    const lesson = q.lesson || inferLesson(q);
    const opts = (q.options||[]).map((opt, idx)=>`<li><strong>${String.fromCharCode(65+idx)}.</strong> ${escapeHTML(opt)}</li>`).join("");
    const answer = q.correctIndex ?? 0;
    const exp = escapeHTML(q.explain || "Kısa açıklama eklenecek.");
    const para = q.paragraf ? `<p class="para">${escapeHTML(q.paragraf)}</p>` : "";
    return `<article class="item">
      <div class="meta">${i+1}. ${escapeHTML(lesson)} · ${escapeHTML(q.konu || "Konu")} · Kaynak: ${escapeHTML(q.kaynak||"AI")}</div>
      <h3>${escapeHTML(q.soru)}</h3>
      ${para}
      <ol>${opts}</ol>
      <div class="exp"><strong>Cevap:</strong> ${String.fromCharCode(65+(answer||0))} · ${exp}</div>
    </article>`;
  }).join("");

  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${escapeHTML(title)}</title>
  <style>
    body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;color:#0f172a;margin:0;padding:24px;}
    h1{font-size:24px;margin:0 0 4px;font-weight:800;}
    .sub{color:#475569;margin-bottom:16px;}
    .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));}
    .item{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:16px;box-shadow:0 12px 30px rgba(15,23,42,0.08);}
    .item h3{margin:8px 0 6px;font-size:17px;}
    .para{background:#f8fafc;padding:10px;border-radius:12px;margin:6px 0;font-size:14px;}
    .meta{font-size:13px;color:#475569;margin-bottom:6px;}
    ol{padding-left:16px;margin:8px 0;}
    ol li{margin:4px 0;padding:4px 0;font-size:15px;}
    .exp{margin-top:8px;font-size:14px;color:#0f172a;}
    .bar{height:12px;border-radius:999px;background:linear-gradient(90deg,#0ea5e9,#a855f7);margin:12px 0;}
    .hint{font-size:13px;color:#475569;}
    .row{display:flex;gap:8px;align-items:center;margin:12px 0;flex-wrap:wrap;}
    .pill{padding:4px 10px;border-radius:999px;background:#e0f2fe;color:#0369a1;font-size:13px;border:1px solid #bae6fd;}
    button{background:#0ea5e9;color:white;border:none;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer;box-shadow:0 8px 20px rgba(14,165,233,0.35);} 
    button:hover{transform:translateY(-1px);} button:active{transform:translateY(0);} 
  </style></head><body>
  <h1>${escapeHTML(title)}</h1>
  <div class="sub">${escapeHTML(subtitle || "AI deneme sınavı")}</div>
  <div class="row">
    <div class="pill">${questions.length} soru</div>
    <button onclick="window.print()">🖨️ Yazdır / PDF</button>
  </div>
  <div class="bar"></div>
  <div class="grid">${list}</div>
  <p class="hint">Yeni sekmeye her tıklamada farklı sorular üretilir. Sorular Hugging Face (internet, ücretsiz) yanıtı veya yerel üretici ile tamamlandı.</p>
  </body></html>`;

  w.document.write(html);
  w.document.close();
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
  const aiSel = $("aiLesson");
  if (aiSel) aiSel.value = App.lesson;

  // Ikonları görünür kıl
  renderLessonIcons(mode);
}

function safeText(v){
  return (v===null || v===undefined) ? "" : String(v);
}

function escapeHTML(str){
  return safeText(str).replace(/[&<>"']/g, (ch)=>{
    const map = {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"};
    return map[ch] || ch;
  });
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
  s.ai ??= { provider: "hf", token: "", model: HF_MODEL_DEFAULT };
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

function updateStats(totalProvided){
  const lessonCount = Object.keys(App.allBanks || {}).length || Object.keys(FILES).length;
  const total = totalProvided ?? Object.values(App.allBanks||{}).reduce((a,b)=> a + (b?.length||0), 0);
  const qs = $("statQuestions");
  const ls = $("statLessons");
  const v = $("statVersion");
  if (qs) qs.textContent = total ? `${total}` : "–";
  if (ls) ls.textContent = `${lessonCount}`;
  if (v) v.textContent = APP_VERSION;
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

function syncAIForm(){
  const state = ensureState();
  const provider = state.ai?.provider || "hf";
  const token = state.ai?.token || "";
  const model = state.ai?.model || HF_MODEL_DEFAULT;
  const sel = $("aiProvider");
  if (sel) sel.value = provider;
  const t = $("hfToken");
  if (t) t.value = token;
  const m = $("hfModel");
  if (m) m.value = model;
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
  const aiSel = $("aiLesson");
  [sel, aiSel].forEach(target => {
    if (!target) return;
    target.innerHTML = "";
    Object.keys(FILES).forEach(name=>{
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      target.appendChild(opt);
    });
    target.value = App.lesson;
  });
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
    const emoji = document.createElement("span");
    emoji.className = "emoji";
    emoji.textContent = LESSON_ICONS[lesson] || "📘";

    const meta = document.createElement("div");
    meta.className = "meta";

    const name = document.createElement("span");
    name.className = "name";
    name.textContent = lesson;

    const cnt = document.createElement("span");
    cnt.className = "count";
    cnt.textContent = `${count} soru`;

    meta.appendChild(name);
    meta.appendChild(cnt);
    div.appendChild(emoji);
    div.appendChild(meta);
    div.addEventListener("click", ()=> setLesson(lesson));
    wrap.appendChild(div);
  });

  highlightLessonIcon();
}

// ---------- loading question banks ----------
async function fetchJSON(path){
  const urlObj = new URL(path, location.href);
  urlObj.searchParams.set("v", APP_VERSION);
  const versioned = urlObj.toString();
  const bare = new URL(path, location.href).toString();
  const cacheKey = bare.split("?")[0];

  const tryParse = (txt) => {
    const attempt = (raw) => {
      const clean = raw.replace(/^\uFEFF/, "").trim();
      if (!clean || /^[<]/.test(clean)) return null; // büyük ihtimalle HTML veya boş yanıt
      try { return JSON.parse(clean); } catch { return null; }
    };

    // İlk deneme: doğrudan temiz içerik
    const direct = attempt(txt);
    if (direct) return direct;

    // Kurtarma: metindeki ilk [/{ ile son ]/} arasını dene (HTML veya log enkapsülasyonunda işe yarar)
    const start = txt.search(/[\[{]/);
    const end = Math.max(txt.lastIndexOf("]"), txt.lastIndexOf("}"));
    if (start >= 0 && end > start){
      const sliced = txt.slice(start, end + 1);
      const rescued = attempt(sliced);
      if (rescued) return rescued;
    }
    return null;
  };

  const tryEmbedded = () => {
    const fname = cacheKey.split("/").pop();
    const embedded = window.EMBEDDED_BANKS?.[fname];
    if (Array.isArray(embedded)) {
      console.info(`Gömülü banka kullanılıyor (${fname})`);
      return embedded;
    }
    return null;
  };

  const fetchAndParse = async (reqLabel, reqInit) => {
    const res = await fetch(reqLabel, { cache: "reload", ...reqInit });
    if (!res.ok) throw new Error(`${path} yüklenemedi (${res.status})`);
    const rawText = await res.text();
    const parsed = tryParse(rawText);
    if (parsed) return parsed;
    throw new Error(`JSON parse hatası (${path}): Beklenmeyen içerik (ilk bayt: ${rawText[0]||"?"})`);
  };

  const restoreFromCache = async () => {
    if (typeof caches === "undefined") return null;
    const keys = [versioned, bare, cacheKey];
    for (const key of keys){
      try{
        const cached = await caches.match(key) || await caches.match(new Request(key));
        if (!cached) continue;
        const txt = await cached.text();
        const parsed = tryParse(txt);
        if (Array.isArray(parsed)) {
          console.info(`Cache'ten geri yüklendi (${key})`);
          return parsed;
        }
      }catch(e){ console.warn(`Cache okuma hatası (${key}):`, e); }
    }
    return null;
  };

  // Ana deneme + bare fallback
  try {
    const data = await fetchAndParse(versioned);
    if (!Array.isArray(data)) throw new Error(`${path} geçerli bir dizi değil`);
    return data.map(normalizeQuestion);
  } catch (err) {
    console.warn(`İlk deneme başarısız (${path}):`, err);
    try {
      const data = await fetchAndParse(bare);
      if (!Array.isArray(data)) throw new Error(`${path} geçerli bir dizi değil`);
      return data.map(normalizeQuestion);
    } catch (err2) {
      console.warn(`İkinci deneme başarısız (${path}):`, err2);
      const cached = await restoreFromCache();
      if (cached) return cached.map(normalizeQuestion);
      const embedded = tryEmbedded();
      if (embedded) return embedded.map(normalizeQuestion);
      throw err2;
    }
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

   const total = Object.values(banks).reduce((a,b)=> a + (b?.length||0), 0);
   updateStats(total);

   if (missing.length){
     const names = missing.map(m=>`${m.lesson} (${m.file})`).join(", ");
     setNotice(`Bazı paketler okunamadı: ${names}. Yenileyip tekrar dene.`, "error");
     showAlert("Güncel dosyalar tarayıcıda önbelleğe takılmış olabilir. Sayfayı yenileyip ⚡ Güncellemeleri denetle, ardından 🏠 Ana sayfa ile yeniden başlatmayı dene.");
   } else {
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
    b.textContent = `${String.fromCharCode(65+i)}) ${safeText(text)}`;
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
  return q.lesson || App.currentTest?.lesson || "Ders";
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

function buildExamPlan(type){
  if (type === "gkgy") {
    return { plan: GK_GY_EXAM_DISTRIBUTION, total: 120, label: "GK-GY 120" };
  }
  const plan = {};
  A_GROUP_LESSONS.forEach(l => plan[l] = 40);
  return { plan, total: 200, label: "A Grubu 200" };
}

async function handleAIExam(type){
  const { plan, total, label } = buildExamPlan(type);
  const providerSel = $("aiProvider");
  if (providerSel && providerSel.value !== "hf") {
    providerSel.value = "hf";
    setNotice("AI denemeleri için Hugging Face (ücretsiz, internet) kullanılıyor.", "info");
  }

  // var olan AI ayarlarını formdan çekip sakla
  const state = ensureState();
  state.ai.provider = "hf";
  state.ai.token = $("hfToken")?.value || "";
  state.ai.model = $("hfModel")?.value || HF_MODEL_DEFAULT;
  saveState(state);

  const previewWin = openExamWindowShell(`${label} AI Deneme`, "Sorular hazırlanıyor…");

  if (!Object.keys(App.allBanks||{}).length){
    await loadAllBanks();
  }

  setNotice(`${label} deneme için AI soru üretimi başlatıldı…`, "info");
  const created = [];
  for (const [lesson, n] of Object.entries(plan)){
    let batch = [];
    try {
      batch = await fetchHFBatched(lesson, n);
    } catch (e) {
      console.warn(e);
      setNotice(`${lesson} için Hugging Face üretimi kısmen başarısız: ${e.message}`, "error");
    }
    if (batch.length < n){
      const fallback = injectAIQuestions(lesson, n - batch.length);
      batch.push(...fallback);
    }
    const stamped = appendQuestions(lesson, batch, batch[0]?.kaynak?.includes("Hugging") ? "AI (internet)" : "AI (ücretsiz yerel)");
    stamped.forEach(q=> created.push({ ...q, lesson }));
  }

  if (!created.length){
    if (previewWin){
      previewWin.document.body.innerHTML = `
        <div style="font-family:Inter,-apple-system;max-width:520px;margin:80px auto;text-align:center;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:16px;box-shadow:0 12px 30px rgba(15,23,42,0.08);">
          <h1 style="margin:0 0 6px;font-size:20px;">Deneme üretilemedi</h1>
          <p style="color:#475569;">Bağlantıyı veya modeli kontrol edip tekrar dener misin?</p>
        </div>`;
    }
    setNotice("AI deneme üretilemedi. Bağlantıyı veya modeli kontrol et.", "error");
    return;
  }

  const subtitle = `${label} · ${created.length} soru · ${now()} · Hugging Face (internet) + yerel yedek`;
  renderExamWindow(`${label} AI Deneme`, created, subtitle, previewWin);
  setNotice(`${label} hazır! Yeni sekmede açıldı.`, "info");
}

async function handleAIGenerate(){
  const lesson = $("aiLesson")?.value || App.lesson;
  const count = clamp(parseInt($("aiCount")?.value || "3", 10) || 3, 1, 20);
  const provider = $("aiProvider")?.value || "hf";

  const state = ensureState();
  state.ai.provider = provider;
  state.ai.token = $("hfToken")?.value || "";
  state.ai.model = $("hfModel")?.value || HF_MODEL_DEFAULT;
  saveState(state);

  if (!Object.keys(App.allBanks||{}).length){
    await loadAllBanks();
  }

  let fresh = [];
  if (provider === "hf"){
    try{
      const onlineQs = await fetchHuggingFaceAI(lesson, count);
      fresh = appendQuestions(lesson, onlineQs, "AI (Hugging Face internet)");
    }catch(e){
      console.warn(e);
      setNotice("İnternet AI üretimi başarısız: " + e.message + " · yerel üreticiye düşülüyor", "error");
    }
  }

  if (!fresh.length){
    fresh = injectAIQuestions(lesson, count);
  }

  const total = App.allBanks[lesson]?.length || 0;
  const msg = `🤖 ${lesson}: ${fresh.length} yeni soru eklendi (toplam ${total})`;
  setNotice(msg, "info");
  const status = $("aiStatus");
  if (status) status.textContent = msg + (provider === "hf" && fresh[0]?.kaynak?.includes("Hugging") ? " · Hugging Face (internet)" : " · yerel üretim");
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
  syncAIForm();
  setMode("single");

  document.querySelectorAll('[data-scroll]').forEach(btn => {
    btn.addEventListener('click', ()=>{
      const target = $(btn.dataset.scroll);
      if (target) target.scrollIntoView({ behavior:"smooth", block:"start" });
      document.querySelectorAll('.nav-link').forEach(n => n.classList.toggle('active', n.dataset.scroll === btn.dataset.scroll));
    });
  });

  // mode buttons (yalnızca mod anahtarları)
  document.querySelectorAll(".mode-btn").forEach(b=>{
    b.addEventListener("click", ()=> setMode(b.dataset.mode));
  });

  $("lessonSelect").addEventListener("change", (e)=> setLesson(e.target.value));

  $("btnStart").addEventListener("click", startTest);
  $("btnQuick10").addEventListener("click", quick2hPlan);
  $("btnUpdate").addEventListener("click", checkUpdates);
  $("btnHome").addEventListener("click", goHome);
  $("btnAiGenerate")?.addEventListener("click", ()=> handleAIGenerate());

  $("btnNext").addEventListener("click", next);
  $("btnPrev").addEventListener("click", prev);
  $("btnSkip").addEventListener("click", skip);
  $("btnFinish").addEventListener("click", finish);

  $("btnRestart").addEventListener("click", ()=>{ setView("setup"); });
  $("btnExport").addEventListener("click", exportData);
  $("btnShare").addEventListener("click", share);

  $("btnVoice").addEventListener("click", ()=> startVoice());
  $("btnRead").addEventListener("click", ()=> readCurrent());
  $("btnExamGK")?.addEventListener("click", ()=> handleAIExam("gkgy"));
  $("btnExamA")?.addEventListener("click", ()=> handleAIExam("a"));
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
  updateStats();
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
