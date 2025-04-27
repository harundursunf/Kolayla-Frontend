import React, { useState, useMemo } from "react";
import dersResmi from "../../images/ders4.png";

export default function AytKonular() {
  const topics = {
    Matematik: [
      "Temel Kavramlar",
      "Sayılar ve Özellikleri",
      "Bölme ve Bölünebilme",
      "Asal Çarpanlar ve Tam Bölen Sayısı",
      "EBOB - EKOK",
      "Rasyonel Sayılar",
      "Ondalık Sayılar",
      "Sıralama ve Seçme",
      "Mutlak Değer",
      "Üslü Sayılar",
      "Köklü Sayılar",
      "Çarpanlara Ayırma",
      "Oran-Orantı",
      "Denklem Çözme",
      "Problemler",
      "Kümeler",
      "Fonksiyonlar",
      "Permütasyon, Kombinasyon, Binom ve Olasılık",
      "İstatistik ve Grafikler",
      "Polinomlar",
      "2. Dereceden Denklemler",
      "Parabol",
      "Karmaşık Sayılar",
      "Logaritma",
      "Diziler",
      "Limit",
      "Süreklilik",
      "Türev",
      "Türev Uygulamaları",
      "İntegral",
      "İntegral Uygulamaları"
    ],
  };

  const [completedTopics, setCompletedTopics] = useState({
    Matematik: Array(topics.Matematik.length).fill(false),
  });

  const progress = useMemo(() => {
    const allTopics = Object.values(completedTopics).flat();
    const completed = allTopics.filter(Boolean).length;
    if (allTopics.length === 0) return 0;
    return Math.round((completed / allTopics.length) * 100);
  }, [completedTopics]);

  const toggleTopic = (category, index) => {
    setCompletedTopics((prev) => ({
      ...prev,
      [category]: prev[category].map((done, i) => (i === index ? !done : done)),
    }));
  };

  return (
    <div className="mt-[100px] px-6 py-10 bg-white rounded-3xl shadow-2xl w-full max-w-6xl mx-auto flex flex-col items-center space-y-20">

      {/* Üst Alan */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center relative">

        {/* Sol: Progress Circle */}
        <div className="relative w-60 h-60 flex items-center justify-center">
          <div
            className="w-52 h-52 rounded-full flex items-center justify-center font-bold text-4xl shadow-lg relative bg-white"
            style={{
              background: `conic-gradient(#a855f7 ${progress}%, #e5e7eb ${progress}%)`,
            }}
          >
            <span className="z-10 text-purple-700">{progress}%</span>
            <div className="absolute inset-4 rounded-full bg-white"></div>
          </div>
        </div>

        {/* Orta: Başlık ve Açıklama */}
        <div className="flex flex-col items-center space-y-4 text-center mt-8 md:mt-0">
          <h2 className="text-5xl font-extrabold bg-gradient-to-r from-green-600 to-yellow-600 text-transparent bg-clip-text">
            AYT Matematik Konu Takibi
          </h2>
          <p className="text-md md:text-lg text-gray-700 max-w-xl mx-auto bg-purple-50 p-4 rounded-xl border border-purple-200 shadow-inner">
            📚 İlerlemeni adım adım takip et! Düzenli çalış, hedeflerine ulaş.
          </p>
        </div>

        {/* Sağ: Resim */}
        <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full bg-white shadow-2xl flex items-center justify-center overflow-hidden mt-8 md:mt-0">
          <img
            src={dersResmi}
            alt="Ders Çalışan Çocuk"
            className="w-full h-full object-cover"
          />
        </div>

      </div>

      {/* Konular Listesi */}
      <div className="w-full flex flex-col gap-10">
        <div className="bg-purple-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
          <h3 className="text-2xl font-semibold text-purple-700 mb-6">Matematik</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {topics.Matematik.map((topic, index) => (
              <li
                key={topic}
                className="flex items-center justify-between bg-white p-4 rounded-xl shadow hover:shadow-md hover:bg-purple-100 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={completedTopics.Matematik[index]}
                    onChange={() => toggleTopic("Matematik", index)}
                    className="w-5 h-5 accent-purple-500 cursor-pointer"
                  />
                  <span
                    className={`text-base font-medium ${
                      completedTopics.Matematik[index]
                        ? "line-through text-purple-400"
                        : "text-purple-700"
                    }`}
                  >
                    {topic}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
}
