import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
// npm install jwt-decode

const Fact = () => {
    const [facts, setFacts] = useState([]);
    const [guncelFact, setGuncelFact] = useState("");
    const [favoriler, setFavoriler] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    // Token'dan kullanıcı ID'sini al
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserId(parseInt(decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]));

            } catch (err) {
                console.error("Token çözümlenemedi:", err);
            }
        }
    }, []);

    // Fact verilerini çek
    useEffect(() => {
        const fetchFacts = async () => {
            try {
                const response = await fetch("https://localhost:5001/api/Fact");
                const data = await response.json();
                setFacts(data);
                if (data.length > 0) {
                    setGuncelFact(data[Math.floor(Math.random() * data.length)]);
                } else {
                    setGuncelFact({ text: "Yüklenecek bilgi bulunamadı." });
                }
                setLoading(false);
            } catch (err) {
                console.error("Fact verileri yüklenemedi:", err);
                setLoading(false);
            }
        };

        fetchFacts();
    }, []);

    // Favorileri çek
    useEffect(() => {
        const fetchFavorites = async () => {
            if (!userId) return;
            try {
                const res = await fetch(`https://localhost:5001/api/FavoriteFact/user/${userId}`);
                const favData = await res.json();
                setFavoriler(favData);
            } catch (err) {
                console.error("Favoriler yüklenemedi:", err);
            }
        };

        fetchFavorites();
    }, [userId]);

    const rastgeleFactSec = () => {
        const random = facts[Math.floor(Math.random() * facts.length)];
        setGuncelFact(random);
    };

    const favoriFactEkle = async () => {
        if (!userId || !guncelFact.id) return;

        if (!favoriler.some(f => f.factId === guncelFact.id)) {
            try {
                const response = await fetch("https://localhost:5001/api/FavoriteFact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: userId,
                        factId: guncelFact.id
                    })
                });

                if (response.ok) {
                    setFavoriler([...favoriler, { userId, factId: guncelFact.id }]);
                } else {
                    console.error("Favori eklenemedi.");
                }
            } catch (err) {
                console.error("Favori eklenirken hata:", err);
            }
        }
    };

    const favoriFactSil = async (factId) => {
        const token = localStorage.getItem("token");
        if (!userId || !token) {
            console.error("Kullanıcı ID veya Token bulunamadı.");
            return;
        }
    
        try {
            const response = await fetch(`https://localhost:5001/api/FavoriteFact/${userId}/${factId}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
    
            if (response.ok) {
                // Favoriler listesinden silinen öğeyi çıkar
                setFavoriler((prevFavoriler) => prevFavoriler.filter(f => f.factId !== factId));
                console.log(`Favori bilgi (ID: ${factId}) başarıyla silindi.`);
            } else {
                const errorMessage = await response.text();
                console.error(`Favori silinemedi. Status: ${response.status} | Mesaj: ${errorMessage}`);
            }
        } catch (err) {
            console.error("Silme işlemi sırasında bir hata oluştu:", err);
        }
    };
    
    


    return (
        <div className="mt-[100px] bg-white p-5 rounded-3xl shadow-md w-full max-w-[1163px] flex flex-col items-center space-y-8 mx-auto">
            <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Fact
            </h2>
            <div className="text-xl italic text-gray-800 mb-6 text-center">
                {loading ? "Bilgiler yükleniyor..." : guncelFact?.text || "Bilgi yok"}
            </div>
            <div className="flex justify-center space-x-4">
                <button
                    onClick={rastgeleFactSec}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                >
                    Değiştir
                </button>
                <button
                    onClick={favoriFactEkle}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                >
                    Favorilere Ekle
                </button>
            </div>

            <div className="w-full flex flex-col space-y-4 mt-8">
                <h3 className="text-lg font-bold text-gray-700">Favori Bilgileriniz</h3>
                <div className="w-full max-h-[350px] overflow-y-auto bg-gray-100 p-4 rounded-lg shadow-md">
                    {favoriler.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {favoriler.map((fav, index) => {
                                const matchedFact = facts.find(f => f.id === fav.factId);
                                return (
                                    <div key={index} className="p-4 rounded-xl shadow-lg bg-white flex flex-col justify-between">
                                        <span className="text-gray-800 text-sm">{matchedFact?.text}</span>
                                        <button
                                            onClick={() => favoriFactSil(fav.factId)}
                                            className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow transition-transform transform hover:scale-105"
                                        >
                                            Sil
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">Henüz bir favori bilgi eklenmedi.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Fact;
