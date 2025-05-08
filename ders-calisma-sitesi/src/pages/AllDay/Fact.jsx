import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const Fact = () => {
  const [facts, setFacts] = useState([]);
  const [guncelFact, setGuncelFact] = useState(null);
  const [favoriler, setFavoriler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(
          parseInt(
            decoded[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            ]
          )
        );
      } catch (err) {
        console.error("Token çözümlenemedi:", err);
        setError("Kullanıcı kimliği doğrulanamadı. Lütfen tekrar giriş yapın.");
        setUserId(null);
      }
    } else {
      console.log("Kullanıcı giriş yapmamış.");
      setUserId(null);
    }
  }, []);

  useEffect(() => {
    const fetchFacts = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://localhost:5001/api/Fact");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFacts(data);
        if (data.length > 0) {
          setGuncelFact(data[Math.floor(Math.random() * data.length)]);
        } else {
          setGuncelFact({ text: "Yüklenecek bilgi bulunamadı." });
        }
        setError(null);
      } catch (err) {
        console.error("Fact verileri yüklenemedi:", err);
        setError("Bilgiler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
        setGuncelFact({ text: "Bilgiler yüklenemedi." });
        setFacts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFacts();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (userId === null) {
        setFavoriler([]);
        return;
      }
      try {
        const res = await fetch(
          `https://localhost:5001/api/FavoriteFact/user/${userId}`
        );
        if (res.ok) {
          const favData = await res.json();
          setFavoriler(favData);
        } else {
          console.warn(
            "Favoriler yüklenirken sunucu yanıtı:",
            res.status,
            res.statusText
          );
          if (res.status === 404) {
              setFavoriler([]);
          } else {
              setError("Favorileriniz yüklenirken bir sorun oluştu.");
              setFavoriler([]);
          }
        }
        setError(null);
      } catch (err) {
        console.error("Favoriler yüklenemedi:", err);
        setError("Favorileriniz yüklenirken bir hata oluştu.");
        setFavoriler([]);
      }
    };

    fetchFavorites();
  }, [userId]);

  const rastgeleFactSec = () => {
    if (facts.length > 0) {
      const random = facts[Math.floor(Math.random() * facts.length)];
      setGuncelFact(random);
    } else {
      setGuncelFact({ text: "Daha fazla bilgi bulunamadı." });
    }
  };

  const favoriFactEkle = async () => {
    if (userId === null) {
      alert("Favori eklemek için giriş yapmalısınız.");
      return;
    }
    if (!guncelFact || !guncelFact.id) {
      console.warn("Favorilere eklenecek geçerli bir fact yok.");
      return;
    }

    if (favoriler.some((f) => f.factId === guncelFact.id)) {
      console.log("Bu fact zaten favorilerinizde.");
      alert("Bu bilgi zaten favorilerinizde!");
      return;
    }

    try {
      const response = await fetch("https://localhost:5001/api/FavoriteFact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          factId: guncelFact.id,
        }),
      });

      if (response.ok) {
        setFavoriler([...favoriler, { userId, factId: guncelFact.id }]);
        console.log("Favori başarıyla eklendi.");
        alert("Favorilere eklendi!");
      } else {
        const errorText = await response.text();
        console.error("Favori eklenemedi:", response.status, errorText);
        setError("Favori eklenirken bir hata oluştu.");
      }
    } catch (err) {
      console.error("Favori eklenirken hata:", err);
      setError("Favori eklenirken ağ hatası oluştu.");
    }
  };

  const favoriFactSil = async (factId) => {
    console.log("Silme işlemi başlatıldı.");
    console.log("Kullanıcı ID:", userId);
    console.log("Silinecek Fact ID:", factId);

    const token = localStorage.getItem("token");
    if (userId === null || !token) {
      console.error("Kullanıcı ID veya Token bulunamadı.");
      setError("Favori silmek için giriş yapmalısınız.");
      return;
    }

    try {
      const url = `https://localhost:5001/api/FavoriteFact/${userId}/${factId}`;
      console.log("Silme isteği URL:", url);

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("Sunucudan gelen yanıt status:", response.status);

      if (response.ok) {
        console.log(`Fact ID ${factId} başarıyla silindi.`);
        setFavoriler((prevFavoriler) =>
          prevFavoriler.filter((f) => f.factId !== factId)
        );
        alert("Favori başarıyla silindi.");
        setError(null);
      } else {
        const errorMessage = await response.text();
        console.error(
          `Favori silinemedi. Status: ${response.status} | Mesaj: ${errorMessage}`
        );
        setError("Favori silinirken bir hata oluştu.");
      }
    } catch (err) {
      console.error("Silme işlemi sırasında bir hata oluştu:", err);
      setError("Favori silinirken ağ hatası oluştu.");
    }
  };

  const getFactDetails = (factId) => {
      return facts.find(f => f.id === factId);
  }


  return (
    <div className="mt-[160px] bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl shadow-3xl w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 animate-fade-in ">
      {/* Main Fact Display and Controls */}
      <div className="flex-1 flex flex-col items-center space-y-8 p-6 bg-white rounded-xl shadow-lg border border-blue-200">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-700 drop-shadow-md">
          Günün Bilgisi
        </h2>

        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative w-full" role="alert">
              <strong className="font-bold">Hata:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
        )}


        <div className="relative w-full min-h-[150px] flex items-center justify-center bg-gray-50 p-8 rounded-lg shadow-inner border-l-4 border-blue-400">
          {loading ? (
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-400 border-dashed rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 italic text-lg">Bilgiler yükleniyor...</p>
            </div>
          ) : (
            <p className="text-gray-800 text-xl italic text-center leading-relaxed">
              {guncelFact?.text || "Bilgi yok"}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 w-full max-w-md">
          <button
            onClick={rastgeleFactSec}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 animate-bounce-once"
            disabled={loading || facts.length === 0}
          >
            Başka Bir Bilgi Gör
          </button>
          <button
            onClick={favoriFactEkle}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={userId === null || !guncelFact || favoriler.some(f => f.factId === guncelFact?.id)}
          >
            Favorilere Ekle
          </button>
        </div>
      </div>

      {/* Favorites List */}
      <div className="lg:w-1/3 flex flex-col space-y-4 p-6 bg-white rounded-xl shadow-lg border border-blue-200">
        <h3 className="text-2xl font-bold text-gray-700 border-b-2 border-blue-300 pb-3">
          Favori Bilgileriniz
        </h3>
        <div className="w-full max-h-96 overflow-y-auto custom-scrollbar">
          {userId === null ? (
            <p className="text-gray-500 text-center italic p-4">
              Favori bilgilerinizi görmek için lütfen giriş yapın.
            </p>
          ) : favoriler.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {favoriler.map((fav) => {
                const matchedFact = getFactDetails(fav.factId);
                if (!matchedFact) {
                    console.warn(`Fact details not found for favorite with factId: ${fav.factId}`);
                    return null;
                }
                return (
                  <div
                    key={fav.factId}
                    className="p-4 rounded-lg shadow-sm bg-blue-50 flex flex-col justify-between border border-blue-200 hover:shadow-md transition-shadow duration-200"
                  >
                    <p className="text-gray-800 text-sm mb-4 leading-relaxed">
                      {matchedFact.text}
                    </p>
                    <button
                      onClick={() => favoriFactSil(fav.factId)}
                      className="self-end bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-4 rounded-md shadow transition-transform transform hover:scale-105 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                    >
                      Sil
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            !loading && (
                <p className="text-gray-500 text-center italic p-4">
                  Henüz bir favori bilgi eklenmedi.
                </p>
            )
          )}
            {userId !== null && loading && favoriler.length === 0 && (
                <p className="text-gray-500 text-center italic p-4">Favoriler yükleniyor...</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default Fact;