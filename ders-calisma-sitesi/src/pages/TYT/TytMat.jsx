import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import dersResmi from "../../images/ders4.png";

export default function AytMatematikKonular() {
  const [topics, setTopics] = useState([]);
  const [completedTopics, setCompletedTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // API'den Matematik konularını çek
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axios.get("https://localhost:5001/api/Topic");
        const topicList = response.data;

        const filteredTopics = topicList.filter(
          (topic) =>
            topic.lessonType === "TYT" && topic.category === "Kimya"
        );

        setTopics(filteredTopics);
        setCompletedTopics(Array(filteredTopics.length).fill(false));
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const progress = useMemo(() => {
    const completed = completedTopics.filter(Boolean).length;
    return completedTopics.length === 0
      ? 0
      : Math.round((completed / completedTopics.length) * 100);
  }, [completedTopics]);

  const toggleTopic = (index) => {
    setCompletedTopics((prev) =>
      prev.map((done, i) => (i === index ? !done : done))
    );
  };

  if (loading) {
    return (
      <div className="mt-32 text-center text-xl text-purple-600 font-semibold">
        Yükleniyor...
      </div>
    );
  }

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

      {/* Konu Listesi */}
      <div className="w-full flex flex-col gap-10">
        <div className="bg-purple-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
          <h3 className="text-2xl font-semibold text-purple-700 mb-6">Matematik</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {topics.map((topic, index) => (
              <li
                key={topic.id || index}
                className="flex items-center justify-between bg-white p-4 rounded-xl shadow hover:shadow-md hover:bg-purple-100 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={completedTopics[index]}
                    onChange={() => toggleTopic(index)}
                    className="w-5 h-5 accent-purple-500 cursor-pointer"
                  />
                  <span
                    className={`text-base font-medium ${completedTopics[index]
                        ? "line-through text-purple-400"
                        : "text-purple-700"
                      }`}
                  >
                    {topic.name || topic}
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
