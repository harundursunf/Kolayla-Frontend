import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const Goal = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");
  const [isPriority] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  const API_URL = "https://localhost:5001/api/DailyGoal";

  const fetchGoals = async (currentUserId) => {
    if (currentUserId === null) {
      setGoals([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/user/${currentUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log("Kullanıcı için hedef bulunamadı.");
          setGoals([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGoals(data);

    } catch (err) {
      console.error("Hedefler yüklenemedi:", err);
      setError("Hedefleriniz yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const id = parseInt(
          decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ]
        );
        setUserId(id);
        setError(null);


        fetchGoals(id);

      } catch (err) {
        console.error("Token çözümlenemedi:", err);
        setError("Kullanıcı kimliği doğrulanamadı. Lütfen tekrar giriş yapın.");
        setUserId(null);
        setLoading(false);
      }
    } else {
      console.log("Kullanıcı giriş yapmamış.");
      setUserId(null);
      setLoading(false);
    }
  }, []);


  const handleAddGoal = async () => {
    if (userId === null) {
      alert("Hedef eklemek için giriş yapmalısınız.");
      return;
    }
    if (!newGoal.trim()) {
      alert("Hedef boş olamaz.");
      return;
    }

    setError(null);

    const goal = {
      userId: userId,
      text: newGoal.trim(),
      isPriority: isPriority,
      createdDate: new Date().toISOString(),
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(goal),
      });

      if (response.ok) {
        console.log("Hedef başarıyla eklendi.");
        fetchGoals(userId);
        setNewGoal("");
      } else {
        const errorText = await response.text();
        console.error("Hedef eklenemedi:", response.status, errorText);
        setError("Hedef eklenirken bir hata oluştu.");
      }
    } catch (err) {
      console.error("Hedef eklenirken hata:", err);
      setError("Hedef eklenirken ağ hatası oluştu.");
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (userId === null) {
      console.error("Kullanıcı ID veya Token bulunamadı.");
      setError("Hedef silmek için giriş yapmalısınız.");
      return;
    }
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/${goalId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        console.log(`Hedef ID ${goalId} başarıyla silindi.`);
        setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== goalId));
      } else {
        const errorMessage = await response.text();
        console.error(
          `Hedef silinemedi. Status: ${response.status} | Mesaj: ${errorMessage}`
        );
        setError("Hedef silinirken bir hata oluştu.");
      }
    } catch (err) {
      console.error("Silme işlemi sırasında bir hata oluştu:", err);
      setError("Hedef silinirken ağ hatası oluştu.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Tarih Yok";
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('tr-TR', options);
    } catch (e) {
      console.error("Tarih formatlama hatası:", e);
      return "Geçersiz Tarih";
    }
  };


  return (
    <div className="mt-[160px] bg-gradient-to-br from-green-50 to-yellow-100 p-8 rounded-2xl shadow-3xl w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 animate-fade-in">
      <div className="flex-1 flex flex-col items-center space-y-8 p-6 bg-white rounded-xl shadow-lg border border-green-200">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-yellow-700 drop-shadow-md">
          Hedeflerinizi Belirleyin
        </h2>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative w-full"
            role="alert"
          >
            <strong className="font-bold">Hata:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="relative w-full flex flex-col items-center space-y-6 bg-gray-50 p-8 rounded-lg shadow-inner border-l-4 border-green-400">
          <p className="text-gray-800 text-xl italic text-center leading-relaxed">
            🎯 Yeni hedeflerinizi buraya ekleyin!
          </p>
          {userId === null ? (
            <p className="text-gray-500 italic text-center">Hedef eklemek için lütfen giriş yapın.</p>
          ) : (
            <>
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Yeni hedefinizi yazın..."
                className="w-full p-4 rounded-lg border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 ease-in-out"
              />
              <button
                onClick={handleAddGoal}
                className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newGoal.trim() || userId === null}
              >
                Hedef Ekle
              </button>
            </>
          )}
        </div>
      </div>

      <div className="lg:w-1/3 flex flex-col space-y-4 p-6 bg-white rounded-xl shadow-lg border border-green-200">
        <h3 className="text-2xl font-bold text-gray-700 border-b-2 border-green-300 pb-3">
          Mevcut Hedefleriniz
        </h3>
        <div className="w-full max-h-96 overflow-y-auto custom-scrollbar">
          {userId === null ? (
            <p className="text-gray-500 text-center italic p-4">
              Hedeflerinizi görmek için lütfen giriş yapın.
            </p>
          ) : loading ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-green-400 border-dashed rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 italic text-lg">Hedefler yükleniyor...</p>
            </div>
          ) : goals.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-4 rounded-lg shadow-sm bg-green-50 flex flex-col justify-between border border-green-200 hover:shadow-md transition-shadow duration-200"
                >
                  <div>
                    {goal.isPriority && (
                      <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                    )}
                    <p className="text-gray-800 text-sm mb-2 leading-relaxed inline">{goal.text}</p>
                    <div className="text-xs text-gray-600 mt-1">
                      Tarih: {formatDate(goal.createdDate)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="self-end bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-4 rounded-md shadow transition-transform transform hover:scale-105 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
          ) : (
            !loading && (
              <p className="text-gray-500 text-center italic p-4">
                Henüz bir hedef eklenmedi.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Goal;