import React, { useState, useEffect } from "react";

const Bilgiler = () => {
    const [sozler, setSozler] = useState([]);
    const [guncelSoz, setGuncelSoz] = useState(null);
    const [favoriler, setFavoriler] = useState([]);
    const [loading, setLoading] = useState(true);

    // User ID'yi token'dan ya da örnek olarak hardcoded alabiliriz
    const userId = 4;

    useEffect(() => {
        const fetchSozler = async () => {
            try {
                const response = await fetch("https://localhost:5001/api/Fact");
                if (!response.ok) throw new Error("Veri alınamadı.");
                const data = await response.json();
                setSozler(data);
                if (data.length > 0) {
                    const rastgele = data[Math.floor(Math.random() * data.length)];
                    setGuncelSoz(rastgele);
                } else {
                    setGuncelSoz({ content: "Gösterilecek bilgi yok." });
                }
            } catch (err) {
                console.error("Hata:", err);
                setGuncelSoz({ content: "Bilgi alınırken hata oluştu." });
            } finally {
                setLoading(false);
            }
        };

        fetchSozler();
    }, []);

    const rastgeleSozSec = () => {
        if (sozler.length === 0) return;
        let rastgele = sozler[Math.floor(Math.random() * sozler.length)];
        while (guncelSoz && rastgele.id === guncelSoz.id && sozler.length > 1) {
            rastgele = sozler[Math.floor(Math.random() * sozler.length)];
        }
        setGuncelSoz(rastgele);
    };

    const favoriSozEkle = async () => {
        if (!guncelSoz || favoriler.find(fav => fav.id === guncelSoz.id)) return;

        try {
            const response = await fetch("https://localhost:5001/api/FavoriteFact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId,
                    factId: guncelSoz.id
                })
            });

            if (!response.ok) throw new Error("Favori eklenemedi.");
            setFavoriler([...favoriler, guncelSoz]);
        } catch (err) {
            console.error("Favori ekleme hatası:", err);
        }
    };

    const favoriSozSil = (index) => {
        setFavoriler(favoriler.filter((_, i) => i !== index));
    };

    return (
        <div className="mt-[100px] bg-white p-5 rounded-3xl shadow-md w-full max-w-[1163px] flex flex-col items-center space-y-8 mx-auto">
            <div className="w-full flex flex-col items-center space-y-4">
                <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-yellow-600">
                    Günün İlginç Bilgisi!
                </h2>
                <p className="mt-2 text-lg text-gray-800 max-w-lg mx-auto bg-gradient-to-r from-green-50 to-white p-6 rounded-lg shadow-md border border-green-100">
                    🌟 Her gün yeni bir ilham kaynağı!
                </p>
                <div className="text-xl italic text-gray-800 mb-8 text-center">
                    {loading ? "Bilgiler yükleniyor..." : guncelSoz?.content || "Bilgi yok"}
                </div>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={rastgeleSozSec}
                        className="bg-[#00BFFF] hover:bg-[#0099CC] text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                    >
                        Değiştir
                    </button>
                    <button
                        onClick={favoriSozEkle}
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
                                {favoriler.map((soz, index) => (
                                    <div
                                        key={index}
                                        className="p-4 rounded-lg shadow-md bg-white border border-gray-300 flex flex-col justify-between space-y-3"
                                    >
                                        <span className="text-gray-800">{soz.content}</span>
                                        <button
                                            onClick={() => favoriSozSil(index)}
                                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-lg transition-transform transform hover:scale-105 w-full"
                                        >
                                            Sil
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center">Henüz bir favori bilgi eklenmedi.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Bilgiler;
