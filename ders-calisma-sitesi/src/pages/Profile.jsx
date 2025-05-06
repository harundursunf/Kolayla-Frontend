import React, { useState, useEffect } from 'react';
import { FaBookOpen, FaClock, FaStickyNote, FaBullseye } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [totalStudyTime, setTotalStudyTime] = useState("0 saat 0 dk"); 
  const [totalCompletedTopics, setTotalCompletedTopics] = useState(0);
  const [totalNotes, setTotalNotes] = useState(0);
  const [totalGoals, setTotalGoals] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Stored Token:", token); 
    const getUserIdFromToken = (jwtToken) => {
      if (!jwtToken) return null;
      try {
        const payloadBase64 = jwtToken.split(".")[1];
        if (!payloadBase64) {
          console.error("Token'da payload kısmı eksik.");
          return null;
        }
        
        const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const payloadJson = atob(base64);
        const decodedPayload = JSON.parse(payloadJson);
        console.log("Decoded Token Payload:", decodedPayload); 

 
        const userIdClaimKey = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
        const userId = decodedPayload[userIdClaimKey] || decodedPayload.sub || decodedPayload.id || null;
        console.log("Extracted User ID:", userId); 

        return userId;
      } catch (error) {
        console.error("Token decode hatası:", error);
        return null;
      }
    };

    const fetchUserProfileAndStats = async (userId) => {
      setLoading(true);
      setError(null);
      const currentToken = localStorage.getItem("token");
      if (!currentToken) {
        setError("Yetkilendirme token'ı bulunamadı.");
        setLoading(false);
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${currentToken}` };
        console.log("Fetching data with headers:", headers); 

        
        const userRes = await axios.get(`https://localhost:5001/api/Users/${userId}`, { headers });
        setUser(userRes.data);
        console.log("User data fetched:", userRes.data); 

       
        const [topicsRes, goalsRes, notesRes, recordsRes] = await Promise.all([
         
         
          axios.get(`https://localhost:5001/api/Topic/`, { headers }),
          axios.get(`https://localhost:5001/api/DailyGoal/user/${userId}`, { headers }),
          axios.get(`https://localhost:5001/api/Note/user/${userId}`, { headers }),
          axios.get(`https://localhost:5001/api/StudyRecord/user/${userId}`, { headers }),
        ]);

        console.log("Topics response:", topicsRes.data); 
        console.log("Goals response:", goalsRes.data);   
        console.log("Notes response:", notesRes.data);   
        console.log("Study Records response:", recordsRes.data); 

        
        setTotalGoals(goalsRes.data.length);
        setTotalNotes(notesRes.data.length);

        // Geçerli sayıları toplayarak toplam dakikayı hesapla
        const totalMinutes = recordsRes.data.reduce((sum, record) => {
          // **Düzeltme:** 'minutes' yerine 'workMinutes' alanını kullan
          console.log("Processing record:", record, "Record workMinutes value:", record.workMinutes);
          const minutes = parseInt(record.workMinutes, 10); // workMinutes değerini sayıya dönüştür
           console.log("Parsed minutes:", minutes, "isNaN(minutes):", isNaN(minutes));

          return isNaN(minutes) ? sum : sum + minutes; // Geçerli sayıları topla, NaN olanları atla
        }, 0);

        console.log("Calculated Total Minutes (raw):", totalMinutes); 

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const formattedTime = `${hours} saat ${minutes} dk`;
        console.log("Formatted Study Time:", formattedTime); 

        setTotalStudyTime(formattedTime);

      } catch (err) {
        console.error("API Hatası:", err); // Detaylı hata logu
        setError(`Bilgiler alınamadı: ${err.message || err.toString()}`); 
        
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
  }, []); //
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: "easeInOut" } },
  };

  const itemVariants = {
    initial: { opacity: 0, x: -15 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const iconStyle = { fontSize: '1.6rem', marginRight: '1rem' };

  if (loading) {
    return (
      <motion.div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-indigo-200 p-6" variants={containerVariants} initial="initial" animate="animate" exit="exit">
        <div className="w-12 h-12 border-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
        <p className="text-blue-700 font-semibold text-lg">Profil Yükleniyor...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div className="min-h-screen flex flex-col justify-center items-center text-center bg-gradient-to-br from-red-100 to-orange-100 p-6" variants={containerVariants} initial="initial" animate="animate" exit="exit">
        <p className="text-red-700 font-semibold text-xl mb-6">{error}</p>
   
        {error.includes("giriş yapın") && (
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300" onClick={() => {
             console.log("Giriş sayfasına yönlendiriliyor...");
           
            
          }}>Giriş Yap</button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div className="mt-9 min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 py-16 px-4 flex justify-center items-center" variants={containerVariants} initial="initial" animate="animate" exit="exit">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-xl p-8">
        <div className="text-center mb-10">
          {/* Kullanıcının adının ilk harfi veya Placeholder */}
          <div className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center text-4xl font-bold mb-4">
            {user?.name ? user.name.charAt(0).toUpperCase() : '?' }
          </div>
          <h2 className="text-3xl font-bold text-gray-800">{user?.name || 'Kullanıcı'}</h2>
          {user?.email && <p className="text-gray-600 text-md mt-1">{user.email}</p>}
        </div>

        <div className="mb-10">
          <h3 className="text-2xl font-bold text-indigo-600 border-b-2 border-indigo-200 pb-2 mb-6">İstatistiklerim</h3>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={{ animate: { transition: { staggerChildren: 0.1 } } }}>

            {/* Tamamlanan Konu */}
            <motion.div className="flex items-center bg-blue-50 p-4 rounded-lg shadow-sm" variants={itemVariants}>
              <FaBookOpen style={iconStyle} className="text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Tamamlanan Konu</p>
                <span className="text-xl font-bold text-blue-800">{totalCompletedTopics}</span>
              </div>
            </motion.div>

            {/* Toplam Çalışma Süresi */}
            <motion.div className="flex items-center bg-green-50 p-4 rounded-lg shadow-sm" variants={itemVariants}>
              <FaClock style={iconStyle} className="text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Toplam Çalışma Süresi</p>
                <span className="text-xl font-bold text-green-800">{totalStudyTime}</span>
              </div>
            </motion.div>

            {/* Not Sayısı */}
            <motion.div className="flex items-center bg-yellow-50 p-4 rounded-lg shadow-sm" variants={itemVariants}>
              <FaStickyNote style={iconStyle} className="text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Not Sayısı</p>
                <span className="text-xl font-bold text-yellow-800">{totalNotes}</span>
              </div>
            </motion.div>

            {/* Hedef Sayısı */}
            <motion.div className="flex items-center bg-purple-50 p-4 rounded-lg shadow-sm" variants={itemVariants}>
              <FaBullseye style={iconStyle} className="text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Hedef Sayısı</p>
                <span className="text-xl font-bold text-purple-800">{totalGoals}</span>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;