import React, { useState, useMemo } from "react";
import dersResmi from "../../images/ders4.png";

export default function AytKonular() {
  const topics = {
    Matematik: ["Limit", "Türev", "İntegral", "Denklemler"],
    Fizik: ["Kuvvet ve Hareket", "Enerji", "Dalgalar", "Optik"],
    Kimya: ["Atom Yapısı", "Dönüşümler", "Asitler ve Bazlar", "Organik Kimya"],
    Biyoloji: ["Hücre", "Genetik", "Ekosistem", "Bitki ve Hayvanlar"],
  };

  const [completedTopics, setCompletedTopics] = useState({
    Matematik: Array(topics.Matematik.length).fill(false),
    Fizik: Array(topics.Fizik.length).fill(false),
    Kimya: Array(topics.Kimya.length).fill(false),
    Biyoloji: Array(topics.Biyoloji.length).fill(false),
  });

  const progress = useMemo(() => {
    const allTopics = Object.values(completedTopics).flat();
    const completed = allTopics.filter(Boolean).length;
    // Boş durumda NaN olmaması için kontrol ekle
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

      {/* Üst Başlık Alanı */}
      <div className="relative w-full flex flex-col items-center">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-extrabold bg-gradient-to-r from-green-600 to-yellow-600 text-transparent bg-clip-text">
            AYT Konu Takibi
          </h2>
          <p className="text-md md:text-lg text-gray-700 max-w-xl mx-auto bg-purple-50 p-4 rounded-xl border border-purple-200 shadow-inner">
            📚 İlerlemeni adım adım takip et! Düzenli çalış, hedeflerine ulaş.
          </p>
        </div>

        {/* Fotoğrafı sağ üst köşeye beyaz arka planla alıyoruz */}
        {/* Eğer resmin tam yuvarlak olmasını istiyorsanız, dış div'in w/h değerleri ve child img w/h değerleri aynı olmalı ve `object-cover` kullanılmalı */}
        {/* Ayrıca fotoğrafın konumunu tam ayarlamak için top ve right değerlerini düzenleyebilirsiniz. */}
        <div className="mt-6 absolute -top-20 right-5 w-40 h-40 md:w-48 md:h-48 rounded-full bg-white shadow-2xl flex items-center justify-center overflow-hidden"> {/* overflow-hidden ekledik */}
          <img
            src={dersResmi}
            alt="Ders Çalışan Çocuk"
            className="w-full h-full object-cover" // w-full h-full yaptık
          />
        </div>

      </div>

      {/* Progress Circle */}
      <div className="relative">
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

      {/* Konular Listesi */}
      <div className="w-full flex flex-col gap-10">
        {Object.entries(topics).map(([category, topicList]) => (
          <div
            key={category}
            className="bg-purple-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            <h3 className="text-2xl font-semibold text-purple-700 mb-6">{category}</h3>
            <ul className="flex flex-col gap-4">
              {topicList.map((topic, index) => (
                <li
                  key={topic}
                  className="flex items-center justify-between bg-white p-4 rounded-xl shadow hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={completedTopics[category][index]}
                      onChange={() => toggleTopic(category, index)}
                      className="w-5 h-5 accent-purple-500 cursor-pointer"
                    />
                    <span
                      className={`text-base font-medium ${completedTopics[category][index]
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
        ))}
      </div>

    </div>
  );
}