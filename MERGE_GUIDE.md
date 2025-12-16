# Çakışma Çözüm Rehberi

`Accept both changes` seçeneği iki tarafın satırlarını da art arda bıraktığı için ekranda çift başlıklar veya tekrar eden bloklar görebilirsin. Eğer PR'daki yeni düzeni tutmak istiyorsan **`Accept incoming change`**, yerelindeki mevcut görünümü korumak istiyorsan **`Accept current change`** seç.

Genelde bu repo için öneri:
- PR'ı güncel ve uyumlu tutmak adına **incoming change** (PR içeriği) tercih edilir.
- Çakışmayı çözdükten sonra dosyayı kısaca gözden geçirip, yinelenmiş UI elemanları kalmadığından emin ol.
- Ardından `git add <dosya>` ve `git commit` ile çözümü kaydet.

Eğer her iki taraftan da belirli satırları elle birleştirmen gerekiyorsa `Accept both` yerine ilgili kısımları manuel düzenleyip, gereksiz tekrarları silmek daha sağlıklıdır.
