import React, { useState, useEffect } from 'react';
import { FaBookOpen, FaHeart } from 'react-icons/fa';

const Profile = () => {
    // Bu veriler backend'den gelmeli (şimdilik statik)
    const [completedTopicsCount, setCompletedTopicsCount] = useState(15);
    const [favoriteMotivation, setFavoriteMotivation] = useState("Başarıya giden yolda en önemli adım başlamaktır.");
    const [user, setUser] = useState(null);
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        const getUserIdFromToken = (token) => {
            if (!token) return null;
            try {
                const payload = atob(token.split(".")[1]);
                const decoded = JSON.parse(payload);
                return decoded.userId;
            } catch (error) {
                console.error("Token decode edilemedi:", error);
                return null;
            }
        };

        const userId = getUserIdFromToken(token);

        const fetchUserProfile = async (userId) => {
            if (!userId) return;
            try {
                const res = await fetch(`http://localhost:5000/api/users/getUserInfo/${userId}`);
                if (!res.ok) {
                    throw new Error(`Veri alınamadı: ${res.statusText}`);
                }
                const data = await res.json();
                setUser(data);
                // Backend'den gelen tamamlama sayısı ve favori sözü ile state'i güncelleyebilirsiniz.
                // Örneğin:
                // setCompletedTopicsCount(data.completedTopics || 0);
                // setFavoriteMotivation(data.favoriteMotivation || "");
            } catch (error) {
                console.error("Profil bilgileri alınamadı:", error);
            }
        };

        if (userId) {
            fetchUserProfile(userId);
        }
    }, [token]);

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
                <div className="md:flex">
                    <div className="p-8">
                        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Profilim</div>
                        {user && (
                            <h2 className="block mt-1 text-lg leading-tight font-medium text-black">{user.username}</h2>
                        )}
                        {!user && (
                            <p className="mt-2 text-gray-500">Kullanıcı bilgileri yükleniyor...</p>
                        )}

                        <div className="mt-4">
                            <h3 className="text-xl font-semibold text-gray-700">İstatistikler</h3>
                            <div className="mt-2 space-y-3">
                                <div className="flex items-center gap-2">
                                    <FaBookOpen className="text-blue-500" />
                                    <span>Tamamlanan Konu Sayısı: <span className="font-semibold">{completedTopicsCount}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaHeart className="text-red-500" />
                                    <span>Favori Motivasyon Sözü: <span className="italic text-gray-600">"{favoriteMotivation}"</span></span>
                                </div>
                                {/* İleride eklenebilecek diğer istatistikler buraya eklenebilir */}
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                type="button"
                                onClick={() => {
                                    localStorage.removeItem("authToken");
                                    window.location.reload(); // Basit bir yeniden yükleme
                                }}
                            >
                                Çıkış Yap
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;