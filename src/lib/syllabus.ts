export type TopicWeight = {
  topic: string;
  weight: number;
};

export type SyllabusCourse = {
  ders: string;
  topics: TopicWeight[];
};

export const gkGyCourses: SyllabusCourse[] = [
  {
    ders: 'Türkçe',
    topics: [
      { topic: 'Paragrafta Anlam', weight: 4 },
      { topic: 'Sözcükte Anlam', weight: 2 },
      { topic: 'Cümlede Anlam', weight: 2 },
      { topic: 'Sözel Mantık', weight: 3 },
      { topic: 'Dil Bilgisi', weight: 2 },
      { topic: 'Yazım-Noktalama', weight: 2 }
    ]
  },
  {
    ders: 'Matematik',
    topics: [
      { topic: 'Temel Kavramlar', weight: 2 },
      { topic: 'Sayı Problemleri', weight: 3 },
      { topic: 'Oran-Orantı', weight: 3 },
      { topic: 'Yüzde-Kar-Zarar', weight: 2 },
      { topic: 'İşçi-Havuz Problemleri', weight: 2 },
      { topic: 'Grafik-Tablo', weight: 2 }
    ]
  },
  {
    ders: 'Tarih',
    topics: [
      { topic: 'Osmanlı Kuruluş ve Yükseliş', weight: 3 },
      { topic: 'Osmanlı Dağılma', weight: 3 },
      { topic: 'Milli Mücadele', weight: 3 },
      { topic: 'İnkılap Tarihi', weight: 4 },
      { topic: 'Çağdaş Türk ve Dünya', weight: 2 }
    ]
  },
  {
    ders: 'Coğrafya',
    topics: [
      { topic: 'Türkiye Fiziki Coğrafyası', weight: 4 },
      { topic: 'Türkiye Beşeri Coğrafyası', weight: 3 },
      { topic: 'Türkiye Ekonomik Coğrafyası', weight: 3 },
      { topic: 'Harita Bilgisi', weight: 2 },
      { topic: 'Genel Coğrafya', weight: 2 }
    ]
  },
  {
    ders: 'Vatandaşlık',
    topics: [
      { topic: 'Anayasa Hukuku', weight: 4 },
      { topic: 'Yasama', weight: 2 },
      { topic: 'Yürütme', weight: 2 },
      { topic: 'Yargı', weight: 2 },
      { topic: 'Temel Haklar', weight: 3 }
    ]
  },
  {
    ders: 'Güncel Bilgi',
    topics: [
      { topic: 'Güncel Olaylar', weight: 2 },
      { topic: 'Türkiye Gündemi', weight: 2 },
      { topic: 'Dünya Gündemi', weight: 1 },
      { topic: 'Kültür-Sanat', weight: 1 }
    ]
  }
];

export const gkGyWeights = gkGyCourses.reduce<Record<string, TopicWeight[]>>((acc, course) => {
  acc[course.ders] = course.topics;
  return acc;
}, {});

export const aGrubuCourses: SyllabusCourse[] = [
  {
    ders: 'İktisat',
    topics: [
      { topic: 'Mikro İktisat', weight: 1 },
      { topic: 'Makro İktisat', weight: 1 },
      { topic: 'Para-Banka', weight: 1 },
      { topic: 'Uluslararası İktisat', weight: 1 },
      { topic: 'Kalkınma', weight: 1 }
    ]
  },
  {
    ders: 'Hukuk',
    topics: [
      { topic: 'Anayasa Hukuku', weight: 1 },
      { topic: 'İdare Hukuku', weight: 1 },
      { topic: 'Medeni Hukuk', weight: 1 },
      { topic: 'Borçlar Hukuku', weight: 1 },
      { topic: 'Ceza Hukuku', weight: 1 }
    ]
  },
  {
    ders: 'Çalışma Eko',
    topics: [
      { topic: 'İş Hukuku Temelleri', weight: 1 },
      { topic: 'Sosyal Güvenlik', weight: 1 },
      { topic: 'Çalışma Ekonomisi', weight: 1 },
      { topic: 'Endüstri İlişkileri', weight: 1 },
      { topic: 'İstihdam Politikaları', weight: 1 }
    ]
  },
  {
    ders: 'Kamu Yön',
    topics: [
      { topic: 'Yönetim Bilimi', weight: 1 },
      { topic: 'Siyaset Bilimi', weight: 1 },
      { topic: 'Kamu Politikası', weight: 1 },
      { topic: 'Kamu Yönetimi', weight: 1 },
      { topic: 'Yerel Yönetimler', weight: 1 }
    ]
  },
  {
    ders: 'Uluslararası İlişkiler',
    topics: [
      { topic: 'Uluslararası Hukuk', weight: 1 },
      { topic: 'Türk Dış Politikası', weight: 1 },
      { topic: 'Uluslararası Örgütler', weight: 1 },
      { topic: 'Güvenlik Çalışmaları', weight: 1 },
      { topic: 'Küresel Siyaset', weight: 1 }
    ]
  }
];
