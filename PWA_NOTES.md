# PWA Notları

- **Versiyonlar**: APP_VERSION `v19`, SW cache anahtarları `kpss-ultimate-static-v19` ve `kpss-ultimate-runtime-v19`.
- **Precache**: Statik HTML/CSS/JS, `banks.js` ve tüm JSON bankaları cacheFirst stratejisiyle saklanıyor.
- **Runtime**: JSON talepleri network-first; CDN bağımlılıkları (Tailwind/MathJax) için stale-while-revalidate.
- **Offline davranışı**: Soru çözme ve deneme penceresi cache'teki bankalarla çalışır; AI yoksa yerel üretici devreye girer.
- **Güncelleme**: Yeni sürüm yayınında eski cache'ler activate aşamasında temizlenir; kullanıcıya tek yenileme önerilir.
