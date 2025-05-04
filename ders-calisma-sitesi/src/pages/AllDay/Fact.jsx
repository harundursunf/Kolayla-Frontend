import React, { useState, useEffect } from "react";

const Bilgiler = () => {
    const [sozler, setSozler] = useState([]);
    const [guncelSoz, setGuncelSoz] = useState(null);
    const [favoriler, setFavoriler] = useState([]);
    const [loading, setLoading] = useState(true);

    const userId = 4; // Örnek kullanıcı ID

    useEffect(() => {
        const fetchVeriler = async () => {
            try {
                const responseSoz = await fetch("http://localhost:5001/api/Fact");
                const dataSoz = await responseSoz.json();
                setSozler(dataSoz);

                if (dataSoz.length > 0) {
                    const rastgele = dataSoz[Math.floor(Math.random() * dataSoz.length)];
                    setGuncelSoz(rastgele);
                } else {
                    setGuncelSoz({ content: "Gösterilecek bilgi yok." });
                }

                const responseFav = await fetch(`http://localhost:5001/api/FavoriteFact/${userId}`);
                const dataFav = await responseFav.json();
                setFavoriler(dataFav.map(f => f.fact)); 

            } catch (err) {
                console.error("Veri çekme hatası:", err);
                setGuncelSoz({ content: "Bilgi alınırken hata oluştu." });
            } finally {
                setLoading(false);
            }
        };

        fetchVeriler();
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
        if (!guncelSoz) return;

        const zatenFavori = favoriler.some(fav => fav.id === guncelSoz.id);
        if (zatenFavori) return;

        const payload = { userId: userId, factId: guncelSoz.id };

        try {
            const response = await fetch("http://localhost:5001/api/FavoriteFact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Favori eklenemedi.");

            setFavoriler(prev => [...prev, guncelSoz]);
        } catch (err) {
            console.error("Favori ekleme hatası:", err.message);
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
