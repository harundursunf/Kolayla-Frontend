import React, { useState, useEffect } from 'react';
import { FaBookOpen, FaHeart, FaClock, FaStickyNote, FaBullseye } from 'react-icons/fa'; // İkonlar
import { motion } from 'framer-motion';
import axios from 'axios'; // Axios importu

const Profile = () => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [totalStudyTime, setTotalStudyTime] = useState("0 saat");
    const [totalCompletedTopics, setTotalCompletedTopics] = useState(0);
    const [totalNotes, setTotalNotes] = useState(0);
    const [totalGoals, setTotalGoals] = useState(0);

    const [favoriteMotivation, setFavoriteMotivation] = useState("Başarıya giden yolda en önemli adım başlamaktır.");

    useEffect(() => {
        const token = localStorage.getItem("token");
        
        const getUserIdFromToken = (jwtToken) => {
            if (!jwtToken) return null;
            try {
                const payloadBase64 = jwtToken.split(".")[1];
                if (!payloadBase64) return null;
                const payloadJson = atob(payloadBase64);
                const decodedPayload = JSON.parse(payloadJson);
                const userIdClaimKey = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
                const userId = decodedPayload[userIdClaimKey] || decodedPayload.sub || decodedPayload.id;
                if (userId !== undefined) {
                    return String(userId);
                }
                console.error("User ID claim not found in token payload.");
                return null;
            } catch (error) {
                console.error("Token decode hatası:", error);
                return null;
            }
        };

        const fetchUserProfileAndStats = async (userIdToFetch) => {
            setLoading(true);
            setError(null);
            const currentToken = localStorage.getItem("token");
            if (!currentToken) {
                setError("Yetkilendirme token'ı bulunamadı.");
                setLoading(false);
                return;
            }

            try {
                // --- Fetch User Basic Info ---
                const userResponse = await fetch(`https://localhost:5001/api/Users/${userIdToFetch}`, {
                    headers: { 'Authorization': `Bearer ${currentToken}` }
                });

                if (!userResponse.ok) {
                    let errorMessage = "Profil verisi alınamadı.";
                    if (userResponse.status === 401) errorMessage = "Oturumunuz sonlanmış olabilir.";
                    if (userResponse.status === 404) errorMessage = `Kullanıcı ID (${userIdToFetch}) bulunamadı.`;
                    throw new Error(errorMessage);
                }
                const userData = await userResponse.json();
                setUser(userData);

                // Fetch completed topics count
                const topicResponse = await axios.get("https://localhost:5001/api/Topic", {
                    headers: { 'Authorization': `Bearer ${currentToken}` }
                });
                if (topicResponse.data) {
                    setTotalCompletedTopics(topicResponse.data.length); // Assuming response is an array
                }

                if (userData.totalStudyTime !== undefined) setTotalStudyTime(userData.totalStudyTime);
                if (userData.totalNotes !== undefined) setTotalNotes(userData.totalNotes);
                if (userData.totalGoals !== undefined) setTotalGoals(userData.totalGoals);

                // Fetch DailyGoal count
                const dailyGoalResponse = await axios.get("https://localhost:5001/api/DailyGoal", {
                    headers: { 'Authorization': `Bearer ${currentToken}` }
                });
                if (dailyGoalResponse.data) {
                    setTotalGoals(dailyGoalResponse.data.length); // Assuming response is an array
                }

            } catch (error) {
                console.error("Profil veya istatistik bilgileri alınırken hata:", error);
                setError(`Bilgiler alınamadı: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            const userId = getUserIdFromToken(token);
            if (userId) {
                fetchUserProfileAndStats(userId);
            } else {
                setError("Geçersiz veya eksik token.");
                setLoading(false);
            }
        } else {
            setError("Profilinizi görmek için lütfen giriş yapın.");
            setLoading(false);
        }
    }, []);

    const containerVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: "easeInOut" } },
    };

    const profileCardVariants = {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: "easeInOut", delay: 0.3 } },
    };

    const itemVariants = {
        initial: { opacity: 0, x: -15 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    };

    const iconStyle = { fontSize: '1.6rem', marginRight: '1rem' };

    if (loading) {
        return (
            <motion.div
                className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-indigo-200 p-6"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                <div className="w-12 h-12 border-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
                <motion.p className="text-blue-700 font-semibold text-lg">Profil Yükleniyor...</motion.p>
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
                <motion.p className="text-red-700 font-semibold text-xl mb-6">{error}</motion.p>
                {error.includes("giriş yapın") && (
                    <motion.button
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { /* Redirect to login page */ console.log("Yönlendirme yapılacak"); }}
                    >
                        Giriş Yap
                    </motion.button>
                )}
            </motion.div>
        );
    }

    if (!user) {
        return (
            <motion.div
                className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                <motion.p className="text-gray-600 text-lg mb-4">Kullanıcı bilgisi bulunamadı.</motion.p>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="mt-9 min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 py-16 px-4 flex justify-center items-center"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <motion.div
                className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-md md:max-w-lg lg:max-w-xl p-8"
                variants={profileCardVariants}
            >
                {/* Profile Header */}
                <div className="text-center mb-10">
                    <div className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center text-4xl font-bold mb-4">
                        {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">{user?.name || 'Kullanıcı'}</h2>
                    {user?.email && <p className="text-gray-600 text-md mt-1">{user.email}</p>}
                </div>

                {/* Statistics Section */}
                <div className="mb-10">
                    <h3 className="text-2xl font-bold text-indigo-600 border-b-2 border-indigo-200 pb-2 mb-6">İstatistiklerim</h3>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        variants={{
                           animate: { transition: { staggerChildren: 0.1 } },
                        }}
                    >
                        {/* Completed Topics */}
                        <motion.div className="flex items-center bg-blue-50 p-4 rounded-lg shadow-sm" variants={itemVariants}>
                            <FaBookOpen style={iconStyle} className="text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-600">Tamamlanan Konu Sayısı</p>
                                <span className="text-xl font-bold text-blue-800">{totalCompletedTopics}</span>
                            </div>
                        </motion.div>

                        {/* Total Study Time */}
                        <motion.div className="flex items-center bg-green-50 p-4 rounded-lg shadow-sm" variants={itemVariants}>
                            <FaClock style={iconStyle} className="text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Toplam Çalışma Süresi</p>
                                <span className="text-xl font-bold text-green-800">{totalStudyTime}</span>
                            </div>
                        </motion.div>

                        {/* Total Notes */}
                        <motion.div className="flex items-center bg-yellow-50 p-4 rounded-lg shadow-sm" variants={itemVariants}>
                            <FaStickyNote style={iconStyle} className="text-yellow-600" />
                            <div>
                                <p className="text-sm text-gray-600">Toplam Not Sayısı</p>
                                <span className="text-xl font-bold text-yellow-800">{totalNotes}</span>
                            </div>
                        </motion.div>

                        {/* Total Goals */}
                        <motion.div className="flex items-center bg-purple-50 p-4 rounded-lg shadow-sm" variants={itemVariants}>
                            <FaBullseye style={iconStyle} className="text-purple-600" />
                            <div>
                                <p className="text-sm text-gray-600">Toplam Hedef Sayısı</p>
                                <span className="text-xl font-bold text-purple-800">{totalGoals}</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Profile;
