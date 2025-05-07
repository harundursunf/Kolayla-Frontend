import React, { useState, useEffect } from 'react';
import { FaBookOpen, FaClock, FaStickyNote, FaBullseye, FaChartBar } from 'react-icons/fa'; // Added FaChartBar icon
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Import Recharts components
import { format } from 'date-fns'; // Using date-fns for date formatting

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [totalStudyTime, setTotalStudyTime] = useState("0 saat 0 dk");
  // Keep totalCompletedTopics, but acknowledge it needs backend support to be accurate
  const [totalCompletedTopics, setTotalCompletedTopics] = useState(0);
  const [totalNotes, setTotalNotes] = useState(0);
  const [totalGoals, setTotalGoals] = useState(0);
  const [studyDataForGraph, setStudyDataForGraph] = useState([]); // State for graph data

  useEffect(() => {
    const token = localStorage.getItem("token");
    // console.log("Stored Token:", token); // Keep console logs during development, remove in production

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
        // console.log("Decoded Token Payload:", decodedPayload); // Keep console logs during development

        // Try common claims for user ID
        const userIdClaimKey = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"; // Standard .NET claim
        const userId = decodedPayload[userIdClaimKey] || decodedPayload.sub || decodedPayload.id || null;
        // console.log("Extracted User ID:", userId); // Keep console logs during development

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
        // console.log("Fetching data with headers:", headers); // Keep console logs during development

        // Fetch User Profile
        const userRes = await axios.get(`https://localhost:5001/api/Users/${userId}`, { headers });
        setUser(userRes.data);
        // console.log("User data fetched:", userRes.data); // Keep console logs during development

        // Fetch Stats Data concurrently
        const [topicsRes, goalsRes, notesRes, recordsRes] = await Promise.all([
          // Note: topicsRes currently fetches ALL topics. To get completed topics for a user,
          // you'd need a specific API endpoint like /api/UserTopics/completed/{userId}
          // or fetch UserTopics and filter. For now, totalCompletedTopics remains 0.
          axios.get(`https://localhost:5001/api/Topic/`, { headers }).catch(err => { console.warn("Failed to fetch topics:", err); return { data: [] }; }), // Handle potential topic fetch errors gracefully
          axios.get(`https://localhost:5001/api/DailyGoal/user/${userId}`, { headers }).catch(err => { console.warn("Failed to fetch goals:", err); return { data: [] }; }), // Handle potential goal fetch errors
          axios.get(`https://localhost:5001/api/Note/user/${userId}`, { headers }).catch(err => { console.warn("Failed to fetch notes:", err); return { data: [] }; }), // Handle potential note fetch errors
          axios.get(`https://localhost:5001/api/StudyRecord/user/${userId}`, { headers }).catch(err => { console.warn("Failed to fetch study records:", err); return { data: [] }; }), // Handle potential study record fetch errors
        ]);

        // console.log("Topics response:", topicsRes.data); // Keep console logs during development
        // console.log("Goals response:", goalsRes.data);   // Keep console logs during development
        // console.log("Notes response:", notesRes.data);   // Keep console logs during development
        // console.log("Study Records response:", recordsRes.data); // Keep console logs during development

        // Set basic stats
        setTotalGoals(goalsRes.data.length);
        setTotalNotes(notesRes.data.length);
        // setTotalCompletedTopics based on how your API returns this data

        // Calculate Total Study Time
        const totalMinutes = recordsRes.data.reduce((sum, record) => {
          // Ensure workMinutes is a number and add it
          const minutes = parseInt(record.workMinutes, 10);
          return isNaN(minutes) ? sum : sum + minutes;
        }, 0);

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const formattedTime = `${hours} saat ${minutes} dk`;
        // console.log("Formatted Study Time:", formattedTime); // Keep console logs during development
        setTotalStudyTime(formattedTime);

        // Prepare data for the graph (e.g., daily study time for the last 7 days)
        const dailyStudyMap = new Map();
        recordsRes.data.forEach(record => {
          try {
            // Assuming record.date is a valid date string (ISO 8601 or similar)
            const date = format(new Date(record.date), 'yyyy-MM-dd'); // Format to get the date part
            const minutes = parseInt(record.workMinutes, 10);

            if (!isNaN(minutes)) {
              dailyStudyMap.set(date, (dailyStudyMap.get(date) || 0) + minutes);
            }
          } catch (e) {
            console.error("Error processing study record date or minutes:", record, e);
          }
        });

        // Get last 7 days for the graph (including today if there's data)
        const graphData = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) { // Go back 6 days from today (total 7 days)
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const formattedDate = format(date, 'yyyy-MM-dd');
          const displayDate = format(date, 'MMM d'); // e.g., 'May 7'

          graphData.push({
            date: displayDate,
            minutes: dailyStudyMap.get(formattedDate) || 0, // Get total minutes for the day, default to 0
          });
        }

        setStudyDataForGraph(graphData);
        // console.log("Graph data prepared:", graphData); // Keep console logs during development


      } catch (err) {
        console.error("API Error:", err.response ? err.response.data : err.message); // More detailed error log
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setError("Yetkiniz yok veya oturumunuz sona erdi. Lütfen tekrar giriş yapın.");
          // Optionally clear token here or redirect to login
        } else if (err.response && err.response.status === 404) {
             setError("Kullanıcı bilgileri bulunamadı.");
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
  }, []); // Empty dependency array ensures this runs only once on mount

  // Animation variants for framer-motion
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut", staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5, ease: "easeIn" } },
  };

  const itemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const iconStyle = { fontSize: '1.8rem', marginRight: '1.2rem' }; // Slightly larger icons

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

  // Add AnimatePresence for exit animations
  return (
    <AnimatePresence>
      <motion.div
        className="mt-9 min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 py-16 px-4 flex justify-center items-start" // Align items-start for better top spacing
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-3xl p-8 space-y-10"> {/* Increased max-w and added spacing */}

          {/* User Info Section */}
          <motion.div className="text-center pb-6 border-b border-gray-200" variants={itemVariants}> {/* Added border bottom */}
            {/* Kullanıcının adının ilk harfi veya Placeholder */}
            <div className="mx-auto h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-5xl font-bold mb-4 shadow-lg"> {/* Larger and stronger gradient/shadow */}
              {user?.name ? user.name.charAt(0).toUpperCase() : '?' }
            </div>
            <h1 className="text-4xl font-extrabold text-gray-800 mb-1">{user?.name || 'Kullanıcı'}</h1> {/* Larger and bolder name */}
            {user?.email && <p className="text-gray-600 text-lg">{user.email}</p>} {/* Slightly larger email */}
          </motion.div>

          {/* Statistics Section */}
          <motion.div variants={containerVariants} initial="initial" animate="animate"> {/* Stagger children within stats */}
            <h3 className="text-2xl font-bold text-indigo-700 border-b-2 border-indigo-300 pb-3 mb-6">Genel İstatistikler</h3> {/* Improved title styling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6"> {/* Added sm breakpoint for 2 columns */}

              {/* Tamamlanan Konu */}
              {/* Note: This stat is hardcoded to 0 as the API call doesn't provide the necessary data */}
              <motion.div className="flex items-center bg-blue-50 p-5 rounded-lg shadow-md transition-transform hover:scale-105 duration-300" variants={itemVariants}> {/* Improved padding, shadow, added hover effect */}
                <FaBookOpen style={iconStyle} className="text-blue-600 flex-shrink-0" /> {/* flex-shrink to prevent icon squishing */}
                <div>
                  <p className="text-sm text-gray-600 font-medium">Tamamlanan Konu</p> {/* Font medium */}
                  <span className="text-2xl font-bold text-blue-800">{totalCompletedTopics}</span> {/* Larger stat number */}
                </div>
              </motion.div>

              {/* Toplam Çalışma Süresi */}
              <motion.div className="flex items-center bg-green-50 p-5 rounded-lg shadow-md transition-transform hover:scale-105 duration-300" variants={itemVariants}>
                <FaClock style={iconStyle} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">Toplam Çalışma Süresi</p>
                  <span className="text-2xl font-bold text-green-800">{totalStudyTime}</span>
                </div>
              </motion.div>

              {/* Not Sayısı */}
              <motion.div className="flex items-center bg-yellow-50 p-5 rounded-lg shadow-md transition-transform hover:scale-105 duration-300" variants={itemVariants}>
                <FaStickyNote style={iconStyle} className="text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">Not Sayısı</p>
                  <span className="text-2xl font-bold text-yellow-800">{totalNotes}</span>
                </div>
              </motion.div>

              {/* Hedef Sayısı */}
              <motion.div className="flex items-center bg-purple-50 p-5 rounded-lg shadow-md transition-transform hover:scale-105 duration-300" variants={itemVariants}>
                <FaBullseye style={iconStyle} className="text-purple-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">Hedef Sayısı</p>
                  <span className="text-2xl font-bold text-purple-800">{totalGoals}</span>
                </div>
              </motion.div>

          </div>
          </motion.div>

          {/* Study Time Graph Section */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-indigo-700 border-b-2 border-indigo-300 pb-3 mb-6 flex items-center">
              <FaChartBar className="mr-3 text-indigo-600" />Son 7 Gün Çalışma Süresi (dk)
            </h3>
            <div className="w-full h-80"> {/* Fixed height for the chart container */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={studyDataForGraph}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /> {/* Lighter grid lines */}
                  <XAxis dataKey="date" stroke="#4b5563" axisLine={false} tickLine={false} /> {/* Styled axes */}
                  <YAxis stroke="#4b5563" axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }} // Subtle hover effect
                    labelFormatter={(label) => `Tarih: ${label}`} // Tooltip label format
                    formatter={(value) => [`${value} dk`, 'Çalışma Süresi']} // Tooltip value format
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      padding: '0.75rem',
                      fontSize: '0.9rem'
                    }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '0.5rem' }}
                  />
                  {/* Bar color and animation */}
                  <Bar dataKey="minutes" fill="#6366f1" barSize={20} animationBegin={0} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>


         {/* Optional: Add more sections like Recent Activity, etc. */}

        </div>
         {/* Error Handling (moved outside main container for clarity) */}
         {error && (
          <motion.div
            className="absolute inset-0 flex flex-col justify-center items-center text-center bg-gradient-to-br from-red-100 to-orange-100 p-6 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-red-800 font-semibold text-xl mb-6">{error}</p>
            {/* Placeholder for actual navigation */}
            {error.includes("giriş yapın") && (
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300" onClick={() => {
                 console.log("Redirect to login page..."); // Implement actual navigation here (e.g., using react-router-dom's useHistory or useNavigate)
                 // Example: navigate('/login');
              }}>Giriş Yap</button>
            )}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default Profile;