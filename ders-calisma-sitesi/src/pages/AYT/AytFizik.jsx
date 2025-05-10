import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import dersResmi from "../../images/ders4.png"; // Bu resim AYT Fizik için uygun olmayabilir, dilerseniz güncelleyebilirsiniz.

export default function AytMatematikKonular() { // Component ismi hala Matematik olsa da, içeriği Fizik
  const [topics, setTopics] = useState([]);
  const [completedTopics, setCompletedTopics] = useState([]);
  const [favoriteTopics, setFavoriteTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // JWT'den kullanıcı ID'sini al
  useEffect(() => {
    const token = localStorage.getItem("token"); // doğru token ismi

    if (token) {
      try {
        // JWT'yi base64 URL güvenli hale getir
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

        // Payload'ı JSON'a çevir
        const payload = JSON.parse(atob(base64));

        // User ID'yi payload'dan al
        const id = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        setUserId(parseInt(id)); // id string olabilir, sayıya çevir
      } catch (err) {
        console.error("JWT çözümleme hatası:", err);
      }
    } else {
      console.warn("JWT bulunamadı.");
    }
  }, []);


  // Konuları ve tamamlananları getir
  useEffect(() => {
    const fetchTopics = async () => {
      if (!userId) return;

      try {
        // Tüm konuları getir
        const topicResponse = await axios.get("https://localhost:5001/api/Topic");
        const allTopics = topicResponse.data;

        // Sadece AYT Fizik konularını filtrele (Kodunuzdaki değişikliğe göre)
        const aytFizikTopics = allTopics.filter(
          (topic) => topic.lessonType === "AYT" && topic.category === "Fizik"
        );

        setTopics(aytFizikTopics); // Sayfada gösterilecek konuları ayarla

        // Kullanıcının tamamladığı tüm konuları getir
        const completedResponse = await axios.get(
          `https://localhost:5001/api/CompletedTopic/getbyuser/${userId}`
        );
        // Sadece tamamlanan konuların ID'lerini al
        const completedTopicIds = completedResponse.data.map((item) => item.topicId);
        setCompletedTopics(completedTopicIds); // Kullanıcının tamamladığı tüm topic ID'lerini ayarla

        // Kullanıcının favori konularını getir
        const favoriteResponse = await axios.get(
          `https://localhost:5001/api/FavoriteTopic/getbyuser/${userId}`
        );
        // Sadece favori konuların ID'lerini al
        const favoriteTopicIds = favoriteResponse.data.map((item) => item.topicId);
        setFavoriteTopics(favoriteTopicIds); // Kullanıcının favori tüm topic ID'lerini ayarla

      } catch (error) {
        console.error("Veri çekme hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [userId]); // userId değiştiğinde tekrar çalıştır

  // Sadece bu sayfadaki (AYT Fizik) konular için tamamlanma yüzdesini hesapla
  const progress = useMemo(() => {
    // topics state'indeki konulardan kaç tanesinin completedTopics state'inde olduğunu say
    const completedCountForThisPage = topics.filter(topic =>
      completedTopics.includes(topic.id)
    ).length;

    return topics.length === 0
      ? 0
      : Math.round((completedCountForThisPage / topics.length) * 100);
  }, [completedTopics, topics]); // completedTopics veya topics değiştiğinde tekrar hesapla


  // Konu tamamlama durumunu değiştirme fonksiyonu
  const toggleTopicCompletion = async (topicId) => {
    const isCompleted = completedTopics.includes(topicId);

    if (isCompleted) {
      // UI'ı hemen güncelle (tamamlananlardan kaldır)
      setCompletedTopics((prev) => prev.filter((id) => id !== topicId));

      try {
        // API'den silinecek kaydı bul
        const response = await axios.get(
          `https://localhost:5001/api/CompletedTopic/getbyuserandtopic?userId=${userId}&topicId=${topicId}`
        );

        if (response.data?.id) {
          // API'den sil
          await axios.delete(
            `https://localhost:5001/api/CompletedTopic/delete/${response.data.id}`
          );
          console.log(`Konu ${topicId} tamamlananlardan silindi.`);
        }
      } catch (error) {
        console.error(`Konu tamamlama durumu silinirken hata oluştu (Topic ID: ${topicId}):`, error);
        // Hata durumunda UI'ı geri alabilirsiniz (isteğe bağlı)
        // setCompletedTopics((prev) => [...prev, topicId]);
      }
    } else {
      // UI'ı hemen güncelle (tamamlananlara ekle)
      setCompletedTopics((prev) => [...prev, topicId]);

      try {
        // API'ye ekle
        await axios.post("https://localhost:5001/api/CompletedTopic/add", {
          userId,
          topicId,
          completedDate: new Date().toISOString(),
        });
        console.log(`Konu ${topicId} tamamlandı olarak işaretlendi.`);
      } catch (error) {
        console.error(`Konu tamamlama durumu eklenirken hata oluştu (Topic ID: ${topicId}):`, error);
        // Hata durumunda UI'ı geri alabilirsiniz (isteğe bağlı)
        // setCompletedTopics((prev) => prev.filter((id) => id !== topicId));
      }
    }
  };

  // Favori durumunu değiştirme fonksiyonu
  const toggleFavorite = async (topicId) => {
    const isFavorite = favoriteTopics.includes(topicId);

    if (isFavorite) {
      // UI'ı hemen güncelle (favorilerden kaldır)
      setFavoriteTopics((prev) => prev.filter((id) => id !== topicId));

      try {
        // Silinecek favori kaydını API'den bulmak için user ve topic ID kullanılmalı
        // Mevcut API endpoint'iniz doğrudan topicId ile siliyorsa (ki bu doğru olmayabilir,
        // favori kaydının kendi ID'si olmalı), alttaki satırı API'nize göre düzeltin.
        // Eğer API'niz sadece topicId ile silme yapıyorsa ve kullanıcının o topikteki favorisini
        // bulup siliyorsa alttaki satır çalışabilir. Ancak genellikle favori kaydının kendi ID'si kullanılır.
        // Doğru yaklaşım: Önce silinecek favori kaydının ID'sini user ve topic ID ile alıp,
        // sonra o ID üzerinden silme yapmaktır.

        const response = await axios.get(
          `https://localhost:5001/api/FavoriteTopic/getbyuserandtopic?userId=${userId}&topicId=${topicId}`
        );

        if (response.data?.id) {
          await axios.delete(`https://localhost:5001/api/FavoriteTopic/delete/${response.data.id}`);
          console.log(`Konu ${topicId} favorilerden silindi.`);
        } else {
          // Eğer kaydı bulamazsak, belki de zaten yoktur veya API farklı çalışıyordur
          console.warn(`Favori kayıt bulunamadı veya silinemedi (Topic ID: ${topicId}).`);
        }

      } catch (error) {
        console.error(`Favori durumu silinirken hata oluştu (Topic ID: ${topicId}):`, error);
        // Hata durumunda UI'ı geri alabilirsiniz (isteğe bağlı)
        // setFavoriteTopics((prev) => [...prev, topicId]);
      }
    } else {
      // UI'ı hemen güncelle (favorilere ekle)
      setFavoriteTopics((prev) => [...prev, topicId]);

      try {
        // API'ye ekle
        await axios.post("https://localhost:5001/api/FavoriteTopic/add", {
          userId,
          topicId,
        });
        console.log(`Konu ${topicId} favorilere eklendi.`);
      } catch (error) {
        console.error(`Favori durumu eklenirken hata oluştu (Topic ID: ${topicId}):`, error);
        // Hata durumunda UI'ı geri alabilirsiniz (isteğe bağlı)
        // setFavoriteTopics((prev) => prev.filter((id) => id !== topicId));
      }
    }
  };


  if (loading || userId === null) {
    return (
      <div className="mt-32 text-center text-xl text-purple-600 font-semibold">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="mt-[100px] px-6 py-10 bg-white rounded-3xl shadow-2xl w-full max-w-6xl mx-auto flex flex-col items-center space-y-20">
      <div className="w-full flex flex-col md:flex-row justify-between items-center relative">
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

        <div className="flex flex-col items-center space-y-4 text-center mt-8 md:mt-0">
          <h2 className="text-5xl font-extrabold bg-gradient-to-r from-green-600 to-yellow-600 text-transparent bg-clip-text">
            AYT Fizik Konu Takibi {/* Başlık metni güncellendi */}
          </h2>
          <p className="text-md md:text-lg text-gray-700 max-w-xl mx-auto bg-purple-50 p-4 rounded-xl border border-purple-200 shadow-inner">
            ⚛️ Fizikteki ilerlemeni adım adım takip et! Düzenli çalış, hedeflerine ulaş. {/* Açıklama metni ve emoji güncellendi */}
          </p>
        </div>

        <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full bg-white shadow-2xl flex items-center justify-center overflow-hidden mt-8 md:mt-0">
          <img src={dersResmi} alt="Ders Çalışan Çocuk" className="w-full h-full object-cover" /> {/* Resim hala aynı */}
        </div>
      </div>

      <div className="w-full flex flex-col gap-10">
        <div className="bg-purple-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
          <h3 className="text-2xl font-semibold text-purple-700 mb-6">Fizik</h3> {/* Kategori başlığı güncellendi */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <li
                key={topic.id}
                className="flex items-center justify-between bg-white p-4 rounded-xl shadow hover:shadow-md hover:bg-purple-100 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={completedTopics.includes(topic.id)}
                    onChange={() => toggleTopicCompletion(topic.id)}
                    className="w-5 h-5 accent-purple-500 cursor-pointer"
                  />
                  <span
                    className={`text-base font-medium ${completedTopics.includes(topic.id)
                      ? "line-through text-purple-400"
                      : "text-purple-700"
                      }`}
                  >
                    {topic.name}
                  </span>
                </div>
                {/* Favori butonu */}
                <button
                  onClick={() => toggleFavorite(topic.id)}
                  className={`text-lg transition-colors duration-200 ${favoriteTopics.includes(topic.id)
                    ? "text-yellow-500 hover:text-yellow-600"
                    : "text-gray-400 hover:text-gray-500"
                    }`}
                >
                  
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}