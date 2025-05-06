import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const Quote = () => {
    const [quotes, setQuotes] = useState([]);
    const [currentQuote, setCurrentQuote] = useState("");
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

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

    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                const response = await fetch("https://localhost:5001/api/Quote");
                const data = await response.json();
                setQuotes(data);
                if (data.length > 0) {
                    setCurrentQuote(data[Math.floor(Math.random() * data.length)]);
                } else {
                    setCurrentQuote({ text: "Yüklenecek alıntı bulunamadı." });
                }
                setLoading(false);
            } catch (err) {
                console.error("Quote verileri yüklenemedi:", err);
                setLoading(false);
            }
        };

        fetchQuotes();
    }, []);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!userId) return;
            try {
                const res = await fetch(`https://localhost:5001/api/FavoriteQuote/user/${userId}`);
                const favData = await res.json();
                setFavorites(favData);
            } catch (err) {
                console.error("Favori alıntılar yüklenemedi:", err);
            }
        };

        fetchFavorites();
    }, [userId]);

    const randomQuote = () => {
        const random = quotes[Math.floor(Math.random() * quotes.length)];
        setCurrentQuote(random);
    };

    const addFavoriteQuote = async () => {
        if (!userId || !currentQuote.id) return;

        if (!favorites.some(f => f.quoteId === currentQuote.id)) {
            try {
                const response = await fetch("https://localhost:5001/api/FavoriteQuote", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: userId,
                        quoteId: currentQuote.id
                    })
                });

                if (response.ok) {
                    setFavorites([...favorites, { userId, quoteId: currentQuote.id }]);
                } else {
                    console.error("Favori alıntı eklenemedi.");
                }
            } catch (err) {
                console.error("Favori alıntı eklenirken hata:", err);
            }
        }
    };

    const removeFavoriteQuote = async (quoteId) => {
        try {
            const response = await fetch(`https://localhost:5001/api/FavoriteQuote/${userId}/${quoteId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                setFavorites(favorites.filter(f => f.quoteId !== quoteId));
            } else {
                console.error("Favori alıntı silinemedi.");
            }
        } catch (err) {
            console.error("Favori alıntı silinirken hata:", err);
        }
    };

    return (
        <div className="mt-[100px] bg-white p-5 rounded-3xl shadow-md w-full max-w-[1163px] flex flex-col items-center space-y-8 mx-auto">
            <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                Quote
            </h2>
            <div className="text-xl italic text-gray-800 mb-6 text-center">
                {loading ? "Alıntılar yükleniyor..." : currentQuote?.text || "Alıntı yok"}
            </div>
            <div className="flex justify-center space-x-4">
                <button
                    onClick={randomQuote}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                >
                    Değiştir
                </button>
                <button
                    onClick={addFavoriteQuote}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                >
                    Favorilere Ekle
                </button>
            </div>

            <div className="w-full flex flex-col space-y-4 mt-8">
                <h3 className="text-lg font-bold text-gray-700">Favori Alıntılarınız</h3>
                <div className="w-full max-h-[350px] overflow-y-auto bg-gray-100 p-4 rounded-lg shadow-md">
                    {favorites.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {favorites.map((fav, index) => {
                                const matchedQuote = quotes.find(q => q.id === fav.quoteId);
                                return (
                                    <div key={index} className="p-4 rounded-xl shadow-lg bg-white flex flex-col justify-between">
                                        <span className="text-gray-800 text-sm">{matchedQuote?.text}</span>
                                        <button
                                            onClick={() => removeFavoriteQuote(fav.quoteId)}
                                            className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow transition-transform transform hover:scale-105"
                                        >
                                            Sil
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">Henüz bir favori alıntı eklenmedi.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Quote;
