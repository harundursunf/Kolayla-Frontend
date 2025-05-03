    import React, { useState, useEffect } from 'react';
    import { FaBookOpen, FaHeart } from 'react-icons/fa';
    import { motion } from 'framer-motion';

    const Profile = () => {
        const [completedTopicsCount, setCompletedTopicsCount] = useState(15);
        const [favoriteMotivation, setFavoriteMotivation] = useState("Başarıya giden yolda en önemli adım başlamaktır.");
        const [user, setUser] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
            const token = localStorage.getItem("token");
            const getUserIdFromToken = (jwtToken) => {
                if (!jwtToken) return null;
                try {
                    const payloadBase64 = jwtToken.split(".")[1];
                    if (!payloadBase64) return null;
                    const payloadJson = atob(payloadBase64);
                    const decodedPayload = JSON.parse(payloadJson);
                    const userIdKey = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
                    return String(decodedPayload[userIdKey]);
                } catch (error) {
                    console.error("Token decode hatası:", error);
                    return null;
                }
            };

            const fetchUserProfile = async (userIdToFetch) => {
                setLoading(true);
                setError(null);
                const currentToken = localStorage.getItem("token");
                if (!currentToken) {
                    setError("Yetkilendirme token'ı bulunamadı.");
                    setLoading(false);
                    return;
                }

                try {
                    const response = await fetch(`https://localhost:5001/api/Users/${userIdToFetch}`, {
                        headers: { 'Authorization': `Bearer ${currentToken}` }
                    });
                    if (!response.ok) {
                        let errorMessage = "Profil verisi alınamadı.";
                        if (response.status === 401) errorMessage = "Oturumunuz sonlanmış olabilir.";
                        if (response.status === 404) errorMessage = `Kullanıcı ID (${userIdToFetch}) bulunamadı.`;
                        setError(errorMessage);
                        setLoading(false);
                        return;
                    }
                    const data = await response.json();
                    setUser(data);
                } catch (error) {
                    console.error("Profil bilgileri alınırken hata:", error);
                    setError(`Profil bilgileri alınamadı: ${error.message}`);
                } finally {
                    setLoading(false);
                }
            };

            if (token) {
                const userId = getUserIdFromToken(token);
                if (userId) {
                    fetchUserProfile(userId);
                } else {
                    setError("Geçersiz token.");
                    setLoading(false);
                }
            } else {
                setError("Profilinizi görmek için lütfen giriş yapın.");
                setLoading(false);
            }
        }, []);

        const containerVariants = {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
            exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeInOut" } },
        };

        const profileCardVariants = {
            initial: { scale: 0.95, opacity: 0 },
            animate: { scale: 1, opacity: 1, transition: { duration: 0.4, ease: "easeInOut", delay: 0.2 } },
        };

        const infoItemVariants = {
            initial: { opacity: 0, x: -10 },
            animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeInOut", delay: 0.4 } },
        };

        const iconStyle = { fontSize: '1.5rem', marginRight: '0.75rem' };

        if (loading) {
            return (
                <motion.div
                    className="min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-100 to-blue-200"
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    <motion.p className="text-blue-600 font-semibold text-lg">Profil Yükleniyor...</motion.p>
                </motion.div>
            );
        }

        if (error) {
            return (
                <motion.div
                    className="min-h-screen flex flex-col justify-center items-center text-center bg-gradient-to-br from-red-100 to-orange-100 p-6"
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    <motion.p className="text-red-600 font-semibold text-lg mb-4">{error}</motion.p>
                    {/* Giriş yap butonu buraya eklenebilir */}
                </motion.div>
            );
        }

        if (!user) {
            return (
                <motion.div
                    className="min-h-screen flex justify-center items-center bg-gray-100"
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    <motion.p className="text-gray-600">Kullanıcı bilgisi bulunamadı.</motion.p>
                    {/* Giriş yap butonu buraya eklenebilir */}
                </motion.div>
            );
        }

        return (
            <motion.div
                className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200 py-16 flex justify-center items-center"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                <motion.div
                    className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md md:max-w-lg"
                    variants={profileCardVariants}
                >
                    <div className="p-8">
                        <div className="text-center mb-6">
                            <svg
                                className="mx-auto h-24 w-24 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="mt-4 text-xl font-semibold text-gray-800">{user?.name || 'Kullanıcı'}</h2>
                            {user?.email && <p className="text-gray-600 text-sm">{user.email}</p>}
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-indigo-600 mb-3">İstatistikler</h3>
                            <motion.div className="space-y-2 text-gray-700" variants={infoItemVariants}>
                                <div className="flex items-center">
                                    <FaBookOpen style={iconStyle} className="text-blue-500" />
                                    <span>Tamamlanan Konu Sayısı: <span className="font-semibold text-indigo-800">{completedTopicsCount}</span></span>
                                </div>
                                <div className="flex items-center">
                                    <FaHeart style={iconStyle} className="text-red-500" />
                                    <span>Favori Motivasyon: <span className="italic text-gray-600">"{favoriteMotivation}"</span></span>
                                </div>
                                {/* Diğer istatistikler buraya eklenebilir */}
                            </motion.div>
                        </div>

                        {/* İsteğe bağlı: Kullanıcıya özel diğer bilgiler */}
                        {user?.bio && (
                            <div>
                                <h3 className="text-lg font-semibold text-indigo-600 mb-3">Hakkımda</h3>
                                <p className="text-gray-700">{user.bio}</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    export default Profile;