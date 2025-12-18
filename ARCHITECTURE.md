# Mimarinin Özeti

## Katmanlar
- **UI**: `index.html`, `styles.css` — Tailwind/MathJax CDN (gelecekte lokal bundle), Apple tarzı kartlar.
- **İstemci mantığı**: `app.js` — soru bankası yükleyici, quiz motoru, AI üretici, deneme akışı, teşhis paneli.
- **Veri**: Ders başına JSON dosyaları + gömülü yedek `banks.js`.
- **PWA**: `sw.js`, `manifest.webmanifest`, `icons/` — offline cache v19.

## Deneme Akışı (tek sekme)
1. Kullanıcı deneme butonuna basar → `handleAIExam` jobId üretir.
2. `openExamWindowShell` senkron tek sekme açar, loader + iş dinleyicisi yazar ve job'ı storage'a kaydeder.
3. AI/yerel üretim soruları üretir → `renderExamWindow` job'ı `broadcastExamJob` ile hem postMessage hem localStorage'a yazar, aynı sekmeye HTML enjekte eder.
4. Sekme kapanırsa ikinci sekme açılmaz; pop-up engeli varsa kullanıcı bilgilendirilir.

## Benzersizlik Hattı
- Normalizasyon + fingerprint + trigram benzerlik (>0.86 reddedilir).
- Kalıcı korpus: localStorage (son ~8000 fingerprint / ~1200 kanonik metin).
- Batch üretim + filler sorular; near-dup tespiti sonrası yeniden üretim.

## AI Sağlayıcı Abstraksiyonu
- `produceAIQuestions` → provider seçimi (ollama varsayılan, HF opt-in, aksi halde boş) → batch çağrıları → `appendQuestions` ile benzersizlik kontrolü.
- Yerel üretici her zaman mevcut, hata durumunda fallback.

## PWA ve Cache
- `STATIC_CACHE`/`RUNTIME_CACHE` v19; statik asset + JSON'lar cacheFirst/networkFirst stratejisi.
- CDN allowlist için stale-while-revalidate; gelecekte lokal bundle ile güçlendirilebilir.

## Teşhis ve Hata Yönetimi
- `Diagnostics` panosu: hata kayıtları, export/clear düğmeleri.
- `setNotice` ve deneme loader'ı kullanıcıya net geri bildirim verir.
