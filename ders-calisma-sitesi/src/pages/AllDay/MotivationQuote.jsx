import React, { useState, useEffect } from "react";

const GunlukSoz = () => {
    const [sozler, setSozler] = useState([]);
    const [guncelSoz, setGuncelSoz] = useState("");
    const [favoriler, setFavoriler] = useState([]);
    const [loading, setLoading] = useState(true);

   
    useEffect(() => {
           const fetchSozler = async () => {
               try {
                   const response = await fetch("https://localhost:5001/api/Q");
                   if (!response.ok) throw new Error("Veri yüklenirken bir hata oluştu!");
   
                   const data = await response.json(); // JSON olarak alıyoruz
                   const sozListesi = data.map(item => item.text).filter(soz => soz.length > 0);
   
                   setSozler(sozListesi);
                   if (sozListesi.length > 0) {
                       setGuncelSoz(sozListesi[Math.floor(Math.random() * sozListesi.length)]);
                   } else {
                       setGuncelSoz("Yüklenecek bilgi bulunamadı.");
                   }
                   setLoading(false);
               } catch (error) {
                   console.error("Bilgiler yüklenirken bir hata oluştu:", error);
                   setGuncelSoz("Bilgiler yüklenirken hata oluştu.");
                   setLoading(false);
               }
           };

        fetchSozler();
    }, []);

    // Rastgele söz seçme
    const rastgeleSozSec = () => {
        const rastgeleIndex = Math.floor(Math.random() * sozler.length);
        setGuncelSoz(sozler[rastgeleIndex]);
    };

    // Favori söz ekleme ve API'ye gönderme
    const favoriSozEkle = async () => {
        if (guncelSoz && !favoriler.includes(guncelSoz)) {
            setFavoriler([...favoriler, guncelSoz]);

            // Backend'e POST isteği gönder
            try {
                const sozIndex = sozler.indexOf(guncelSoz) + 1; // API'deki id'yi bulmak için
                const response = await fetch("https://localhost:5001/api/FavoriteQuote", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        accept: "*/*"
                    },
                    body: JSON.stringify({
                        userId: 4, // Kullanıcı ID'si, dinamik hale getirilebilir
                        quoteId: sozIndex // Favori ekleyeceğimiz sözün ID'si
                    })
                });

                if (!response.ok) {
                    throw new Error("Favori söz eklenemedi.");
                }
            } catch (err) {
                console.error("Favori söz eklenirken hata:", err);
            }
        }
    };

    // Favori söz silme
    const favoriSozSil = async (index) => {
        const sozToRemove = favoriler[index];

        // Favoriyi veritabanından sil
        try {
            const sozIndex = sozler.indexOf(sozToRemove) + 1; // API'deki id'yi bulmak için
            const response = await fetch(`https://localhost:5001/api/FavoriteQuote/${sozIndex}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Favori söz silinemedi.");
            }

            // Silme işlemi başarılıysa, frontend'den de sil
            setFavoriler(favoriler.filter((_, i) => i !== index));
        } catch (err) {
            console.error("Favori söz silinirken hata:", err);
        }
    };

    return (
        <div className="mt-[100px] bg-white p-5 rounded-3xl shadow-md w-full max-w-[1163px] flex flex-col items-center space-y-8 mx-auto">
            <div className="w-full flex flex-col items-center space-y-4">
                <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-yellow-600">
                    Günün Sözü!
                </h2>
                <p className="mt-2 text-lg text-gray-800 max-w-lg mx-auto bg-gradient-to-r from-green-50 to-white p-6 rounded-lg shadow-md border border-green-100">
                    🌟 Her gün yeni bir ilham kaynağı!
                </p>
                <div className="text-xl italic text-gray-800 mb-8 text-center">
                    {loading ? "Sözler yükleniyor..." : guncelSoz || "Söz yok"}
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
                    <h3 className="text-lg font-bold text-gray-700">Favori Sözleriniz</h3>
                    <div className="w-full max-h-[350px] overflow-y-auto bg-gray-100 p-4 rounded-lg shadow-md">
                        {favoriler.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {favoriler.map((soz, index) => (
                                    <div
                                        key={index}
                                        className="p-4 rounded-xl shadow-lg bg-white flex flex-col justify-between"
                                    >
                                        <span className="text-gray-800 text-sm">{soz}</span>
                                        <button
                                            onClick={() => favoriSozSil(index)}
                                            className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow transition-transform transform hover:scale-105"
                                        >
                                            Sil
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center">Henüz bir favori söz eklenmedi.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GunlukSoz;
