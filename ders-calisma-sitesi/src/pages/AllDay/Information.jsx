import React, { useState, useEffect } from "react";

const Bilgiler = () => {
    const [sozler, setSozler] = useState([]);
    const [guncelSoz, setGuncelSoz] = useState("");
    const [favoriler, setFavoriler] = useState([]);
    const [loading, setLoading] = useState(true);

    // bilgiler.txt dosyasını yükle
    useEffect(() => {
        const fetchSozler = async () => {
            try {
                // public klasörüne doğrudan erişim genellikle root üzerinden yapılır.
                const response = await fetch("/bilgiler.txt"); // '/public/' yerine '/' deneyin
                if (!response.ok) throw new Error("Veri yüklenirken bir hata oluştu!");
                const data = await response.text();
                const sozListesi = data.split("\n").map((soz) => soz.trim()).filter(soz => soz.length > 0); // Boş satırları filtrele
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

        // Local Storage'dan favorileri yükle (isteğe bağlı ama kullanıcı deneyimi için güzel)
        const savedFavoriler = localStorage.getItem("favoriBilgiler");
        if (savedFavoriler) {
            setFavoriler(JSON.parse(savedFavoriler));
        }

    }, []);

    // Favoriler değiştiğinde Local Storage'a kaydet
    useEffect(() => {
        if (favoriler.length > 0) {
            localStorage.setItem("favoriBilgiler", JSON.stringify(favoriler));
        } else {
            localStorage.removeItem("favoriBilgiler"); // Favori yoksa storage'ı temizle
        }
    }, [favoriler]);


    const rastgeleSozSec = () => {
        if (sozler.length === 0) return; // Boşsa bir şey yapma
        let rastgeleIndex = Math.floor(Math.random() * sozler.length);
        // Aynı sözün tekrar gelmemesi için (isteğe bağlı)
        while (sozler[rastgeleIndex] === guncelSoz && sozler.length > 1) {
            rastgeleIndex = Math.floor(Math.random() * sozler.length);
        }
        setGuncelSoz(sozler[rastgeleIndex]);
    };

    const favoriSozEkle = () => {
        if (guncelSoz && !favoriler.includes(guncelSoz) && guncelSoz !== "Bilgiler yükleniyor..." && guncelSoz !== "Bilgi yok" && guncelSoz !== "Bilgiler yüklenirken hata oluştu.") {
            setFavoriler([...favoriler, guncelSoz]);
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
                    {loading ? "Bilgiler yükleniyor..." : guncelSoz || "Bilgi yok"}
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
                                        className="p-4 rounded-lg shadow-md bg-white border border-gray-300 flex flex-col justify-between space-y-3" // Flex direction column ve boşluk ekledik
                                    >
                                        <span className="text-gray-800">{soz}</span> {/* Text artık tüm alanı kaplayabilir */}
                                        <button
                                            onClick={() => favoriSozSil(index)}
                                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-lg transition-transform transform hover:scale-105 w-full" // w-full ekledik
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