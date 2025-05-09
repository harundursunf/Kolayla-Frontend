import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBookOpen, FaClock, FaStickyNote, FaBullseye, FaBook } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format } from 'date-fns';

import defaultProfileImage from '../images/ders4.png';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [totalStudyTime, setTotalStudyTime] = useState("0 saat 0 dk");
    const [totalCompletedTopics, setTotalCompletedTopics] = useState(0);
    const [totalTopics, setTotalTopics] = useState(0);
    const [totalNotes, setTotalNotes] = useState(0);
    const [totalGoals, setTotalGoals] = useState(0);

    const [studyDataForGraph, setStudyDataForGraph] = useState([]);
    const [topicsDataForGraph, setTopicsDataForGraph] = useState([]);

    const PIE_COLORS = ['#2563eb', '#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#06b6d4', '#f97316'];


    useEffect(() => {
        const token = localStorage.getItem("token");

        const getUserIdFromToken = (jwtToken) => {
            if (!jwtToken) return null;
            try {
                const payloadBase64 = jwtToken.split(".")[1];
                if (!payloadBase64) {
                    console.error("Token payload is missing.");
                    return null;
                }

                const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
                const payloadJson = atob(base64);
                const decodedPayload = JSON.parse(payloadJson);

                const userIdClaimKey = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
                const userId = decodedPayload[userIdClaimKey] || decodedPayload.sub || decodedPayload.id || null;

                return userId;
            } catch (error) {
                console.error("Token decode error:", error);
                return null;
            }
        };

        const fetchUserProfileAndStats = async (userId) => {
            setLoading(true);
            setError(null);
            const currentToken = localStorage.getItem("token");
            if (!currentToken) {
                setError("Yetkilendirme token'ı bulunamadı. Lütfen giriş yapın.");
                setLoading(false);
                return;
            }

            try {
                const headers = { Authorization: `Bearer ${currentToken}` };

                const userRes = await axios.get(`https://localhost:5001/api/Users/${userId}`, { headers });
                setUser(userRes.data);

                const [allTopicsRes, goalsRes, notesRes, recordsRes] = await Promise.all([
                    axios.get(`https://localhost:5001/api/Topic/`, { headers }).catch(err => { console.warn("Tüm konular getirilemedi:", err); return { data: [] }; }),
                    axios.get(`https://localhost:5001/api/DailyGoal/user/${userId}`, { headers }).catch(err => { console.warn("Hedefler getirilemedi:", err); return { data: [] }; }),
                    axios.get(`https://localhost:5001/api/Note/user/${userId}`, { headers }).catch(err => { console.warn("Notlar getirilemedi:", err); return { data: [] }; }),
                    axios.get(`https://localhost:5001/api/StudyRecord/user/${userId}`, { headers }).catch(err => { console.warn("Çalışma kayıtları getirilemedi:", err); return { data: [] }; }),
                ]);

                setTotalGoals(goalsRes.data.length);
                setTotalNotes(notesRes.data.length);
                const allTopicsCount = allTopicsRes.data.length;
                setTotalTopics(allTopicsCount);

                let completedCount = 0;
                if (allTopicsRes.data && allTopicsRes.data.length > 0 && userId) {
                    const topicsToCheck = allTopicsRes.data;

                    const completedCheckPromises = topicsToCheck.map(topic => {
                        const topicIdToCheck = topic.id || topic.topicId;
                        if (!topicIdToCheck) {
                            console.warn("Konu nesnesinde 'id' veya 'topicId' eksik:", topic);
                            return Promise.resolve(0);
                        }
                        return axios.get(`https://localhost:5001/api/CompletedTopic/getbyuserandtopic?userId=${userId}&topicId=${topicIdToCheck}`, { headers })
                            .then(response => {
                                if (response.data && response.status === 200) {
                                    return 1;
                                }
                                return 0;
                            })
                            .catch(err => {
                                if (err.response && err.response.status === 404) {
                                    return 0;
                                }
                                console.warn(`Kullanıcı ${userId} için konu ${topicIdToCheck} tamamlanma durumu kontrol edilirken hata:`, err.message);
                                return 0;
                            });
                    });

                    const results = await Promise.all(completedCheckPromises);
                    completedCount = results.reduce((sum, current) => sum + current, 0);
                }
                setTotalCompletedTopics(completedCount);

                const remainingTopics = allTopicsCount - completedCount;
                setTopicsDataForGraph([
                    { name: 'Tamamlanan', value: completedCount },
                    { name: 'Kalan', value: remainingTopics },
                ]);

                const totalMinutes = recordsRes.data.reduce((sum, record) => {
                    const minutes = parseInt(record.workMinutes, 10);
                    return isNaN(minutes) ? sum : sum + minutes;
                }, 0);

                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                const formattedTime = `${hours} saat ${minutes} dk`;
                setTotalStudyTime(formattedTime);

                const dailyStudyMap = new Map();
                recordsRes.data.forEach(record => {
                    try {
                        const dateKey = format(new Date(record.recordDate), 'yyyy-MM-dd');
                        const recordMinutes = parseInt(record.workMinutes, 10);

                        if (!isNaN(recordMinutes)) {
                            dailyStudyMap.set(dateKey, (dailyStudyMap.get(dateKey) || 0) + recordMinutes);
                        }
                    } catch (e) {
                        console.error("Grafik için çalışma kaydı işlenirken hata:", record, e);
                    }
                });

                const graphData = [];
                const today = new Date();

                for (let i = 6; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(today.getDate() - i);

                    const formattedDateKey = format(date, 'yyyy-MM-dd');
                    const displayDate = format(date, 'MMM d'); // e.g., 'May 8'

                    const dailyMinutes = dailyStudyMap.get(formattedDateKey) || 0;
                    const dailyHours = parseFloat((dailyMinutes / 60).toFixed(1)); // Convert minutes to hours, rounded to 1 decimal place

                    graphData.push({
                        date: displayDate,
                        hours: dailyHours, // Use 'hours' key for graph data
                    });
                }

                setStudyDataForGraph(graphData);

            } catch (err) {
                console.error("API Hatası:", err.response ? err.response.data : err.message);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    setError("Yetkiniz yok veya oturumunuz sona erdi. Lütfen tekrar giriş yapın.");
                } else if (err.response && err.response.status === 404) {
                    if (err.config && err.config.url && err.config.url.includes(`/api/Users/${userId}`)) {
                        setError("Kullanıcı bilgileri bulunamadı.");
                    }
                    else {
                       console.warn("Bir alt kaynak 404 döndürdü:", err.config ? err.config.url : 'Bilinmeyen URL');
                       if (!user) { // Only set error if user info couldn't be fetched
                            setError(`Bilgiler alınamadı: ${err.message || err.toString()}`);
                       }
                    }
                }
                else {
                    setError(`Bilgiler alınamadı: ${err.message || err.toString()}`);
                }
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            const userId = getUserIdFromToken(token);
            if (userId) {
                fetchUserProfileAndStats(userId);
            } else {
                setError("Geçersiz veya eksik token bilgisi.");
                setLoading(false);
            }
        } else {
            setError("Profilinizi görmek için lütfen giriş yapın.");
            setLoading(false);
        }
    }, []);

    const sectionVariants = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: "easeIn" } },
    };

    const pageVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } },
        exit: { opacity: 0 },
    };

    const iconStyle = { fontSize: '1.8rem', marginRight: '1.2rem' };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                >
                    <div className="w-16 h-16 border-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
                    <p className="text-blue-700 font-semibold text-xl">Profil Yükleniyor...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            {error ? (
                    <motion.div
                        key="error-state"
                        className="absolute inset-0 flex flex-col justify-center items-center text-center bg-gradient-to-br from-red-100 to-orange-100 p-6 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                       <p className="text-red-800 font-semibold text-xl mb-6">{error}</p>
                       {error.includes("giriş yapın") && (
                            <button
                                onClick={() => window.location.href = '/login'}
                                className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold shadow-md hover:bg-red-700 transition duration-300"
                            >
                                Giriş Yap
                            </button>
                       )}
                    </motion.div>
            ) : (
                <motion.div
                    key="profile-content"
                    className="mt-14 min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 py-8 px-4 flex justify-center"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">

                        <motion.div
                            className="bg-gray-50 p-6 rounded-xl shadow-xl flex flex-col space-y-8"
                            variants={sectionVariants}
                        >
                            <div className="flex flex-col">
                                <h3 className="text-xl font-bold text-indigo-700 border-b-2 border-indigo-300 pb-3 mb-4 flex items-center justify-center text-center">
                                    <FaClock className="mr-3 text-indigo-600 text-lg" />Son 7 Gün Çalışma Süresi (saat)
                                </h3>
                                <div className="w-full h-60">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={studyDataForGraph}
                                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                                        >
                                            {/* MODIFICATION: Added SVG defs for gradient */}
                                            <defs>
                                                <linearGradient id="studyGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/> {/* Indigo-500 */}
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.9}/> {/* Blue-500 */}
                                                </linearGradient>
                                            </defs>
                                            {/* MODIFICATION: Lighter horizontal grid */}
                                            <CartesianGrid strokeDashArray="3 3" stroke="#f3f4f6" vertical={false} />
                                            {/* MODIFICATION: Slightly lighter axis text color */}
                                            <XAxis dataKey="date" stroke="#6b7280" axisLine={false} tickLine={false} />
                                            {/* MODIFICATION: Slightly lighter axis text color */}
                                            <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
                                            <ChartTooltip
                                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                                labelFormatter={(label) => `Tarih: ${label}`}
                                                formatter={(value) => [`${value.toFixed(1)} saat`, 'Çalışma Süresi']}
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '0.375rem',
                                                    padding: '0.75rem',
                                                    fontSize: '0.9rem',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)' // Added subtle shadow to tooltip
                                                }}
                                                labelStyle={{ fontWeight: 'bold', marginBottom: '0.5rem' }}
                                            />
                                            {/* Using the gradient fill */}
                                            <Bar dataKey="hours" fill="url(#studyGradient)" barSize={20} animationBegin={0} animationDuration={800} radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="flex flex-col items-center">
                                <h3 className="text-xl font-bold text-indigo-700 border-b-2 border-indigo-300 pb-3 mb-4 flex items-center justify-center text-center">
                                    <FaBook className="mr-3 text-indigo-600 text-lg" />Konu Tamamlama Durumu
                                </h3>
                                {totalTopics > 0 && topicsDataForGraph.length > 0 ? (
                                        <div className="w-full h-60 flex justify-center items-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                                    <Pie
                                                        data={topicsDataForGraph}
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={80}
                                                        innerRadius={60}
                                                        paddingAngle={3}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                        label={(entry) => `${entry.name}: ${entry.value}`}
                                                        animationBegin={0} animationDuration={800}
                                                    >
                                                        {topicsDataForGraph.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <ChartTooltip
                                                        formatter={(value, name) => [`${value}`, name]}
                                                        contentStyle={{
                                                             backgroundColor: '#fff',
                                                             border: '1px solid #d1d5db',
                                                             borderRadius: '0.375rem',
                                                             padding: '0.75rem',
                                                             fontSize: '0.9rem',
                                                             boxShadow: '0 2px 8px rgba(0,0,0,0.1)' // Added subtle shadow to tooltip
                                                         }}
                                                        labelStyle={{ fontWeight: 'bold', marginBottom: '0.5rem' }}
                                                    />
                                                    <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                ) : totalTopics > 0 && !loading && !error ? (
                                     <p className="text-gray-600 text-center">Konu tamamlama verileri yüklenemedi.</p>
                                ) : !loading && !error && (
                                     <p className="text-gray-600 text-center">Henüz hiç konu eklenmemiş.</p>
                                )}
                            </div>

                        </motion.div>

                        <div className="flex flex-col gap-8">

                            <motion.div
                                className="bg-white rounded-xl shadow-xl overflow-hidden w-full p-6 flex items-center flex-grow transition-all duration-300 hover:shadow-2xl"
                                variants={sectionVariants}
                            >
                                <img
                                    src={defaultProfileImage}
                                    alt="Profil Resmi"
                                    className="w-32 h-32 rounded-full mr-6 object-cover border-4 border-blue-400 shadow-md"
                                />

                                <div className="flex flex-col justify-center flex-grow">
                                    <p className="text-xl font-semibold text-blue-700 mb-1">Hoşgeldin!</p>
                                    <h1 className="text-3xl font-extrabold text-gray-800 mb-2 break-words">
                                        {user?.name?.toUpperCase() || 'KULLANICI'} 👋
                                    </h1>
                                    {user?.email && <p className="text-gray-600 text-lg">{user.email}</p>}
                                </div>
                            </motion.div>

                            <motion.div
                                className="bg-indigo-50 p-6 rounded-xl shadow-xl flex flex-col flex-grow"
                                variants={sectionVariants}
                            >
                                <h3 className="text-2xl font-bold text-indigo-700 border-b-2 border-indigo-300 pb-3 mb-6">Genel İstatistikler</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                                    <motion.div className="flex items-center bg-blue-100 p-5 rounded-lg shadow-md transition-transform hover:scale-105 hover:ring-2 hover:ring-blue-400 duration-300" variants={sectionVariants}>
                                        <FaBook style={iconStyle} className="text-blue-700 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-700 font-medium">Toplam Konu</p>
                                            <span className="text-2xl font-bold text-blue-900">{totalTopics}</span>
                                        </div>
                                    </motion.div>


                                    <motion.div className="flex items-center bg-blue-50 p-5 rounded-lg shadow-md transition-transform hover:scale-105 hover:ring-2 hover:ring-blue-300 duration-300" variants={sectionVariants}>

                                        <FaBookOpen style={iconStyle} className="text-blue-600 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-600 font-medium">Tamamlanan Konu</p>
                                            <span className="text-2xl font-bold text-blue-800">{totalCompletedTopics}</span>
                                        </div>
                                    </motion.div>


                                    <motion.div className="flex items-center bg-green-50 p-5 rounded-lg shadow-md transition-transform hover:scale-105 hover:ring-2 hover:ring-green-300 duration-300" variants={sectionVariants}>
                                        <FaClock style={iconStyle} className="text-green-600 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-600 font-medium">Toplam Çalışma Süresi</p>
                                            <span className="text-2xl font-bold text-green-800">{totalStudyTime}</span>
                                        </div>
                                    </motion.div>


                                    <motion.div className="flex items-center bg-yellow-50 p-5 rounded-lg shadow-md transition-transform hover:scale-105 hover:ring-2 hover:ring-yellow-300 duration-300" variants={sectionVariants}>
                                        <FaStickyNote style={iconStyle} className="text-yellow-600 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-600 font-medium">Not Sayısı</p>
                                            <span className="text-2xl font-bold text-yellow-800">{totalNotes}</span>
                                        </div>
                                    </motion.div>


                                    <motion.div className="flex items-center bg-purple-50 p-5 rounded-lg shadow-md transition-transform hover:scale-105 hover:ring-2 hover:ring-purple-300 duration-300" variants={sectionVariants}>
                                        <FaBullseye style={iconStyle} className="text-purple-600 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-600 font-medium">Hedef Sayısı</p>
                                            <span className="text-2xl font-bold text-purple-800">{totalGoals}</span>
                                        </div>
                                    </motion.div>


                                </div>


                            </motion.div>

                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Profile;