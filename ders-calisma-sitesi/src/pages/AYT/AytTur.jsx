import React, { useState, useMemo } from "react";
import dersResmi from "../../images/ders10.png";

export default function AytEdebiyatKonular() {
  const topics = {
    "Şiir Bilgisi": ["Nazım Birimi", "Nazım Şekilleri", "Edebi Sanatlar", "Şiir Türleri"],
    "Tanzimat Edebiyatı": ["Tanzimat 1. Dönem", "Tanzimat 2. Dönem", "Sanatçılar"],
    "Servetifünun ve Fecr-i Ati": ["Servetifünun Şiiri", "Roman ve Hikaye", "Fecr-i Ati Topluluğu"],
    "Milli Edebiyat": ["Milli Edebiyatın Özellikleri", "Önemli Temsilciler"],
    "Cumhuriyet Dönemi": ["1923-1950 Şiiri", "1950 Sonrası Şiir", "Cumhuriyet Romanı"],
    "Dünya Edebiyatı": ["Yunan Mitolojisi", "Dünya Klasikleri", "Modern Dünya Edebiyatı"],
  };

  const [completedTopics, setCompletedTopics] = useState(
    Object.fromEntries(
      Object.keys(topics).map((category) => [category, Array(topics[category].length).fill(false)])
    )
  );

  const progress = useMemo(() => {
    const allTopics = Object.values(completedTopics).flat();
    const completed = allTopics.filter(Boolean).length;
    return Math.round((completed / allTopics.length) * 100);
  }, [completedTopics]);

  const toggleTopic = (category, index) => {
    setCompletedTopics((prev) => ({
      ...prev,
      [category]: prev[category].map((done, i) => (i === index ? !done : done)),
    }));
  };

  return (
    <div className="mt-[100px] px-6 py-10 bg-white rounded-3xl shadow-2xl w-full max-w-7xl mx-auto flex flex-col items-center space-y-20">

      {/* Üst Başlık Alanı */}
      <div className="relative w-full flex flex-col items-center">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-400 text-transparent bg-clip-text">
            AYT Edebiyat Konu Takibi
          </h2>
          <p className="text-md md:text-lg text-gray-700 max-w-xl mx-auto bg-purple-50 p-4 rounded-xl border border-purple-200 shadow-inner">
            ✍️ Edebiyat konularında düzenli ilerle, başarıya ulaş!
          </p>
        </div>

        {/* Fotoğraf Sağ Üstte */}
        <div className="mt-6 absolute -top-20 right-5 w-40 h-40 md:w-48 md:h-48 rounded-full bg-white shadow-2xl flex items-center justify-center">
          <img
            src={dersResmi}
            alt="Edebiyat Çalışması"
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover"
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
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-10">
        {Object.entries(topics).map(([category, topicList]) => (
          <div
            key={category}
            className="bg-purple-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col"
          >
            <h3 className="text-xl font-semibold text-purple-700 mb-4">{category}</h3>
            <ul className="flex flex-col gap-3">
              {topicList.map((topic, index) => (
                <li
                  key={topic}
                  className="flex items-center gap-3 bg-white p-3 rounded-xl shadow hover:bg-purple-100 transition-colors"
                >
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
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

    </div>
  );
}
