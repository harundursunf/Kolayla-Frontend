import React, { useState, useMemo } from "react";
import dersResmi from "../../images/ders9.png";

export default function AytFizikKonular() {
  const topics = [
    "Vektörler",
    "Kuvvet ve Hareket",
    "Newton’un Hareket Yasaları",
    "İş, Güç ve Enerji",
    "İtme ve Momentum",
    "Tork ve Denge",
    "Kütle Merkezi",
    "Basit Makineler",
    "Elektrik ve Manyetizma",
    "Manyetik Alan ve Manyetik Kuvvet",
    "Alternatif Akım",
    "Dalga Mekaniği",
    "Optik",
    "Atom Modelleri",
    "Modern Fizik ve Uygulamaları",
  ];

  const [completedTopics, setCompletedTopics] = useState(
    Array(topics.length).fill(false)
  );

  const progress = useMemo(() => {
    const completed = completedTopics.filter(Boolean).length;
    return Math.round((completed / topics.length) * 100);
  }, [completedTopics]);

  const toggleTopic = (index) => {
    setCompletedTopics((prev) =>
      prev.map((done, i) => (i === index ? !done : done))
    );
  };

  return (
    <div className="mt-[100px] px-6 py-10 bg-white rounded-3xl shadow-2xl w-full max-w-6xl mx-auto flex flex-col items-center space-y-20">
      
      {/* Üst Başlık Alanı */}
      <div className="relative w-full flex flex-col items-center">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-400 text-transparent bg-clip-text">
            AYT Fizik Konu Takibi
          </h2>
          <p className="text-md md:text-lg text-gray-700 max-w-xl mx-auto bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-inner">
            ⚡ Fizik konularında ilerlemeni kolayca takip et!
          </p>
        </div>

        {/* Fotoğraf Sağ Üstte */}
        <div className="mt-6 absolute -top-20 right-5 w-40 h-40 md:w-48 md:h-48 rounded-full bg-white shadow-2xl flex items-center justify-center">
          <img
            src={dersResmi}
            alt="Fizik Çalışması"
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover"
          />
        </div>
      </div>

      {/* Progress Circle */}
      <div className="relative">
        <div
          className="w-52 h-52 rounded-full flex items-center justify-center font-bold text-4xl shadow-lg relative bg-white"
          style={{
            background: `conic-gradient(#3b82f6 ${progress}%, #e5e7eb ${progress}%)`,
          }}
        >
          <span className="z-10 text-blue-700">{progress}%</span>
          <div className="absolute inset-4 rounded-full bg-white"></div>
        </div>
      </div>

      {/* Konular Listesi */}
      <div className="w-full">
        <h3 className="text-2xl font-semibold text-blue-700 mb-8">Fizik Konuları</h3>

        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {topics.map((topic, index) => (
            <li
              key={topic}
              className="flex items-center gap-4 bg-blue-50 p-4 rounded-2xl shadow hover:shadow-md hover:bg-blue-100 transition-all duration-300"
            >
              <input
                type="checkbox"
                checked={completedTopics[index]}
                onChange={() => toggleTopic(index)}
                className="w-5 h-5 accent-blue-500 cursor-pointer"
              />
              <span
                className={`text-base font-medium ${
                  completedTopics[index]
                    ? "line-through text-blue-400"
                    : "text-blue-700"
                }`}
              >
                {topic}
              </span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
