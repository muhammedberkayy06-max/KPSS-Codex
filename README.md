# KPSS Dijital Koç – Ultimate

Modern, offline çalışabilen KPSS koçunuz: tüm GK-GY ve A Grubu dersleri için soru bankaları, MathJax destekli açıklamalar, renkli doğru/yanlış geri bildirimi, ikonlu ders seçimi ve ücretsiz/yerel öncelikli yapay zekâ ile soru ve deneme üretimi.

## Çalıştırma
- Depoyu klonla ve proje klasörüne geç.
- Yerel bir statik sunucu ile aç (ör. `python -m http.server 8000`).
- Tarayıcıdan `http://localhost:8000` adresine git; PWA kurulum bildirimi gelir.
- İlk açılışta güncel varlıkların alınması için bir kez yenile.

## Test / Kontrol
- Söz dizimi kontrolü: `node --check app.js`
- JSON doğrulama: `python - <<'PY'
import json, glob
for p in glob.glob('*.json'):
    json.load(open(p, encoding='utf-8'))
print('JSON OK')
PY`

## AI Varsayılanı
- Ücretsiz ve yerel öncelikli Ollama entegrasyonu. HF (internet) yalnızca isteğe bağlı.
- Ayrıntılı kurulum: [AI_SETUP.md](AI_SETUP.md)

## Mimari
- Ayrıntılar için [ARCHITECTURE.md](ARCHITECTURE.md)
- PWA önbellek ve versiyonlama notları: [PWA_NOTES.md](PWA_NOTES.md)

## Güncellemeler
- Son değişiklikler: [CHANGELOG.md](CHANGELOG.md)
