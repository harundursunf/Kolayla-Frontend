import React, { useState, useEffect } from "react";
import axios from "axios";
// Ionicons ikon kütüphanesi
import { IoTrashBin, IoCheckmarkCircle, IoRadioButtonOff, IoStar, IoStarOutline, IoAddCircleOutline, IoSearchOutline, IoRocketOutline } from "react-icons/io5";

const Personal = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [isPriority, setIsPriority] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true); // Yüklenme durumu
  const [error, setError] = useState(null); // Hata durumu
  const [addingGoal, setAddingGoal] = useState(false); // Hedef ekleme durumu

  // Basit JWT payload çözme fonksiyonu
  const getUserIdFromToken = (token) => {
    if (!token) return null;
    try {
      const payload = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payload));
      // Kullanılan claim tipine göre burası değişebilir
      return decodedPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decodedPayload.sub; // Yaygın claim tipleri
    } catch (error) {
      console.error("Token decode edilemedi:", error);
      // Hata durumunda kullanıcıyı bilgilendirebilirsiniz veya logout yönlendirmesi yapabilirsiniz
      return null;
    }
  };

  const userId = getUserIdFromToken(localStorage.getItem('token'));

  const API_URL = 'https://localhost:5001/api/note'; // API URL

  useEffect(() => {
    if (userId) {
      fetchGoals();
    } else {
      setLoading(false);
      setError("Oturum açılması gerekiyor. Lütfen giriş yapın.");
    }
  }, [userId]);

  const fetchGoals = async () => {
    const token = localStorage.getItem("token");
    if (!token || !userId) {
      setLoading(false);
      setError("Kimlik doğrulama hatası. Lütfen tekrar giriş yapın.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Tarihe göre azalan sıralama
      const sortedGoals = response.data.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
      setGoals(sortedGoals);
    } catch (error) {
      console.error('Hedefler alınamadı:', error.response?.data || error.message);
      setError('Hedefler yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.');
      if (error.response?.status === 401) {
        setError("Oturum süresi doldu veya yetkiniz yok. Lütfen tekrar giriş yapın.");
        // TODO: Kullanıcıyı login sayfasına yönlendirme logic'i buraya gelebilir.
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    const token = localStorage.getItem("token");

    if (!newGoal.trim()) {
      setError('Lütfen hedef metnini boş bırakmayın.');
      return;
    }
    if (!token || !userId) {
      setError("Kimlik doğrulama hatası. Lütfen tekrar giriş yapın.");
      return;
    }

    setAddingGoal(true); // Sadece ekleme butonu için loading
    setError(null);

    const goal = {
      userId,
      text: newGoal.trim(),
      isPriority,
      isCompleted: false,
      createdDate: new Date().toISOString()
    };

    try {
      await axios.post(`${API_URL}/add`, goal, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchGoals();
      setNewGoal('');
      setIsPriority(false);
    } catch (error) {
      console.error('Hedef eklenemedi:', error.response?.data || error.message);
      setError('Hedefiniz eklenirken bir sorun yaşandı.');
    } finally {
      setAddingGoal(false);
    }
  };

  const handleDeleteGoal = async (id) => {
    const token = localStorage.getItem("token");
    if (!token || !userId) {
      setError("Kimlik doğrulama hatası. Lütfen tekrar giriş yapın.");
      return;
    }

    if (window.confirm('Bu hedefi kalıcı olarak silmek istediğinizden emin misiniz?')) {
      setLoading(true); // Genel loading
      setError(null);
      try {
        await axios.delete(`${API_URL}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // State'ten silmek UI'ı daha hızlı günceller
        setGoals(goals.filter(goal => goal.id !== id));
        // Alternatif: fetchGoals();
      } catch (error) {
        console.error('Hedef silinemedi:', error.response?.data || error.message);
        setError('Hedef silinirken bir sorun yaşandı.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkComplete = async (goal) => {
    const token = localStorage.getItem("token");
    if (!token || !userId) {
      setError("Kimlik doğrulama hatası. Lütfen tekrar giriş yapın.");
      return;
    }
     //setLoading(true); // Anlık UI güncellemesi için genel loading'i kullanmayalım
    setError(null);
    try {
      await axios.patch(`${API_URL}/${goal.id}`, { isCompleted: !goal.isCompleted }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      // State'i anında güncelleyerek UI'ı yansıt
      setGoals(goals.map(item =>
        item.id === goal.id ? { ...item, isCompleted: !item.isCompleted } : item
      ));
    } catch (error) {
      console.error('Hedef tamamlama durumu güncellenemedi:', error.response?.data || error.message);
      setError('Hedefin tamamlanma durumu güncellenirken bir sorun oluştu.');
    } finally {
      //setLoading(false);
    }
  };

  const handleTogglePriority = async (goal) => {
    const token = localStorage.getItem("token");
    if (!token || !userId) {
      setError("Kimlik doğrulama hatası. Lütfen tekrar giriş yapın.");
      return;
    }
     //setLoading(true); // Anlık UI güncellemesi için genel loading'i kullanmayalım
    setError(null);
    try {
      await axios.patch(`${API_URL}/${goal.id}`, { isPriority: !goal.isPriority }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      // State'i anında güncelleyerek UI'ı yansıt
      setGoals(goals.map(item =>
        item.id === goal.id ? { ...item, isPriority: !item.isPriority } : item
      ));
    } catch (error) {
      console.error('Hedef öncelik durumu güncellenemedi:', error.response?.data || error.message);
      setError('Hedefin öncelik durumu güncellenirken bir sorun oluştu.');
    } finally {
       //setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredAndSortedGoals = goals
    .filter(goal =>
      goal.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Sıralama fetch sırasında yapıldı

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8"> {/* Arkaplan gradient ve basit animasyon */}
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-3xl space-y-10 border border-gray-100"> {/* Daha büyük max-width, yuvarlak köşeler, belirgin gölge */}

        {/* Header */}
        <div className="text-center">
          <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700 drop-shadow-md"> {/* Daha büyük, daha koyu gradient */}
            Hayatınızın Hedefleri 🎯
          </h2>
          <p className="mt-4 text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
            Hayallerinize giden yolu planlayın, adımlarınızı kaydedin ve her ilerlemenizi takip edin. Başarıya giden yolculuğunuz burada başlıyor! ✨
          </p>
        </div>

        {/* Add New Goal Section */}
        <div className="border-t-2 border-blue-200 pt-8 bg-blue-50/30 p-6 rounded-lg shadow-inner"> {/* Belirgin border, hafif arkaplan, iç gölge */}
          <h3 className="text-2xl font-semibold text-blue-800 mb-6 text-center">Yeni Bir Hedef Belirle</h3>
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full">
            <div className="flex-grow w-full">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Büyük hayalinizi veya küçük adımınızı yazın..."
                className="w-full p-3 rounded-lg border border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out text-gray-800"
              />
            </div>
            <label className="flex items-center cursor-pointer space-x-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-red-400 transition duration-200 ease-in-out"> {/* Checkbox etrafına hoş bir kapsül */}
              <input
                type="checkbox"
                checked={isPriority}
                onChange={(e) => setIsPriority(e.target.checked)}
                className="form-checkbox h-5 w-5 text-red-600 rounded focus:ring-red-500 cursor-pointer"
              />
              <span className={`text-sm font-medium ${isPriority ? 'text-red-600' : 'text-gray-700'}`}>Öncelikli</span>
            </label>
            <button
              onClick={handleAddGoal}
              className="w-full md:w-auto bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl duration-300 ease-in-out flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={addingGoal} // Sadece ekleme sırasında disabled
            >
              {addingGoal ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <IoAddCircleOutline className="h-6 w-6" /> {/* İkon eklendi */}
                  <span>Hedef Ekle</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center font-semibold shadow-md transition duration-300 ease-in-out">
            {error}
          </div>
        )}

        {/* Search Section */}
        <div className="border-t-2 border-gray-200 pt-8 bg-gray-50/50 p-6 rounded-lg shadow-inner"> {/* Belirgin border, hafif arkaplan, iç gölge */}
          <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Hedefler Arasında Ara</h3>
          <div className="flex items-center space-x-3"> {/* İkon için boşluk */}
             <IoSearchOutline className="h-6 w-6 text-gray-500" /> {/* Arama ikonu */}
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Başarmak istediklerinizi arayın..."
              className="flex-grow p-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition duration-200 ease-in-out text-gray-800"
            />
          </div>
        </div>


        {/* Goals List Section */}
        <div className="border-t-2 border-purple-200 pt-8"> {/* Belirgin border */}
          <h3 className="text-2xl font-semibold text-purple-800 mb-6 text-center">Mevcut Hedefleriniz</h3>

          {loading && !addingGoal && ( // Sadece başlangıç yüklemesi veya genel işlem yüklemesi için göster
            <div className="flex justify-center items-center py-8">
              <svg className="animate-spin h-10 w-10 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="ml-4 text-lg text-gray-700 font-medium">Hedefler yükleniyor...</p>
            </div>
          )}

          {!loading && filteredAndSortedGoals.length === 0 ? (
            <div className="text-center py-10 text-gray-600 italic text-xl">
                 <IoRocketOutline className="h-12 w-12 mx-auto text-purple-500 mb-4" /> {/* Boş durum ikonu */}
              <p>
                {searchTerm
                  ? `"${searchTerm}" aramasıyla eşleşen bir hedef bulunamadı.`
                  : 'Harika! Henüz hiçbir hedef eklemediniz. İlk hedefinizi ekleyerek yolculuğa başlayın!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Daha büyük ekranlar için 3 sütun */}
              {filteredAndSortedGoals.map((goal) => (
                <div
                  key={goal.id}
                  // Card Stilleri: Tamamlandıysa yeşil/gri, Öncelikliyse kırmızı/turuncu, Değilse beyaz
                  className={`relative p-6 rounded-xl shadow-md flex flex-col space-y-4 border-l-4 transition-all duration-300 ease-in-out
                             ${goal.isCompleted
                                ? 'bg-green-50 border-green-500 opacity-90'
                                : (goal.isPriority
                                    ? 'bg-red-50 border-red-500'
                                    : 'bg-white border-blue-500')}
                             transform hover:scale-[1.03] hover:shadow-xl`} // Daha belirgin hover efekti
                >
                   {/* Öncelik İkonu - Üst Köşede */}
                   <button
                        onClick={() => handleTogglePriority(goal)}
                        className={`absolute top-3 right-3 p-1 rounded-full transition duration-200 ease-in-out z-10
                                   ${goal.isPriority ? 'text-red-600 bg-white shadow-sm' : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'}
                                   focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50`}
                         title={goal.isPriority ? "Önceliği Kaldır" : "Öncelikli Yap"}
                         disabled={loading} // Genel loading veya spesifik item loading (daha kompleks olur)
                    >
                       {goal.isPriority ? <IoStar className="h-6 w-6" /> : <IoStarOutline className="h-6 w-6" />}
                   </button>


                  {/* Hedef Metni */}
                  <span className={`text-gray-800 text-lg font-medium pr-8 ${goal.isCompleted ? 'line-through text-gray-600 italic' : ''}`}>
                    {goal.text}
                  </span>

                  {/* Tarih */}
                  <div className="text-sm text-gray-500">
                    Oluşturuldu: {new Date(goal.createdDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })} {/* Tarih formatı güzelleştirildi */}
                  </div>

                  {/* Aksiyon Butonları */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    {/* Tamamlama Butonu */}
                    <button
                      onClick={() => handleMarkComplete(goal)}
                      className={`flex items-center space-x-2 text-sm font-medium transition duration-200 ease-in-out
                                 ${goal.isCompleted
                                    ? 'text-green-600 hover:text-green-700'
                                    : 'text-gray-600 hover:text-gray-800'}
                                 hover:underline focus:outline-none`}
                      title={goal.isCompleted ? "Tamamlanmadı Olarak İşaretle" : "Tamamlandı Olarak İşaretle"}
                       disabled={loading} // Genel loading veya spesifik item loading
                    >
                      {goal.isCompleted ? (
                        <IoCheckmarkCircle className="h-5 w-5" />
                      ) : (
                        <IoRadioButtonOff className="h-5 w-5" />
                      )}
                      <span>{goal.isCompleted ? 'Tamamlandı' : 'Tamamlandı'}</span> {/* Metni sabit tuttuk */}
                    </button>

                    {/* Sil Butonu */}
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-red-500 hover:text-red-700 font-medium py-1 px-3 rounded-full transition duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                       title="Hedefi Kalıcı Olarak Sil"
                        disabled={loading} // Genel loading veya spesifik item loading
                    >
                       <IoTrashBin className="h-5 w-5 inline-block mr-1" /> {/* İkon eklendi */}
                       Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Personal;