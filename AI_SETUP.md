# AI Kurulumu (Ücretsiz / Yerel Öncelikli)

## Varsayılan: Ollama (yerel, ücretsiz)
1. [https://ollama.ai](https://ollama.ai) adresinden Ollama'yı indir ve kur.
2. Komut satırında bir model indir (örnek):
   ```bash
   ollama pull mistral
   ```
3. Servisi başlat (genelde otomatik):
   ```bash
   ollama serve
   ```
4. Uygulamada AI ayarlarına `http://localhost:11434` ve model adına `mistral` (veya tercih ettiğin model) değerini gir.

## Opsiyonel: Hugging Face (internet, opt-in)
- Ücretsiz/anon model kullanılabiliyorsa token şartı yoktur; aksi halde kişisel token'ını **tarayıcıya kalıcı kaydetme**.
- HF kullanımı varsayılan **DEĞİL**; Ayarlar panelinden sağlayıcı olarak HF seçilmedikçe çalışmaz.

## Yapılandırma Anahtarları
- AI_PROVIDER: `ollama` (varsayılan) | `hf` (opt-in) | `none`
- OLLAMA_BASE_URL: varsayılan `http://localhost:11434`
- MODEL_NAME / OLLAMA_MODEL: ör. `mistral`, `zephyr`
- TIMEOUT_MS / TEMPERATURE / TOP_P: UI üzerinden ayarlanabilir; güvenli sınırlar uygulanır.

## Güvenlik Notları
- Gizli anahtarları repo'ya veya log'lara yazma.
- HF token'ı gerekiyorsa yalnızca oturum sırasında kullan; tarayıcı depolamasını temizleyebilirsin.

## Hata Durumunda
- AI üretimi başarısız olursa sistem otomatik olarak yerel üretici fallback'ine düşer.
- Deneme sekmesinde ve teşhis panelinde hata mesajı görünür.
