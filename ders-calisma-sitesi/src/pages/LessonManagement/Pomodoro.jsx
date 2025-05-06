import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// JWT payload çözme ve userId alma mantığı (Değişiklik yok)
const decodeUserIdFromToken = (token) => {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payload));
    const userId = decodedPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decodedPayload.sub;

    if (userId) {
      return parseInt(userId, 10);
    } else {
      console.warn("JWT payload çözüldü ancak 'nameidentifier' veya 'sub' claim'i bulunamadı.");
      return null;
    }
  } catch (error) {
    console.error("Token decode edilirken hata oluştu:", error);
    return null;
  }
};

const Pomodoro = () => {
  // Mevcut Sayaç State'leri (Değişiklik yok)
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isWorking, setIsWorking] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [statusMessage, setStatusMessage] = useState('Çalışma Zamanı');
  const [currentUser, setCurrentUser] = useState(null);

  // Yeni State: Geçmiş Kayıtlar (Değişiklik yok)
  const [pastRecords, setPastRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState(null);

  const intervalRef = useRef(null);
  const API_URL = 'https://localhost:5001/api/StudyRecord';

  // Tarih formatlama yardımcı fonksiyonu (Değişiklik yok)
  const formatRecordDate = (isoString) => {
    if (!isoString) return 'Geçersiz Tarih';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        return 'Geçersiz Tarih Formatı';
      }
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return date.toLocaleDateString('tr-TR', options);
    } catch (e) {
      console.error("Tarih formatlanamadı:", e);
      return 'Tarih Format Hatası';
    }
  };

  // Geçmiş çalışma kayıtlarını backend'den çekme fonksiyonu (Değişiklik yok)
  const fetchStudyRecords = async (userIdToFetch) => {
    if (!userIdToFetch) {
      console.warn("Kullanıcı ID'si olmadan çalışma kayıtları çekilemez.");
      setPastRecords([]);
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("Token mevcut değil, çalışma kayıtları çekilemez.");
      setRecordsError("Oturum bilgisi eksik. Lütfen tekrar giriş yapın.");
      setPastRecords([]);
      return;
    }
    setRecordsLoading(true);
    setRecordsError(null);
    try {
      const response = await axios.get(`${API_URL}/user/${userIdToFetch}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const sortedRecords = response.data.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));
      setPastRecords(sortedRecords);
      console.log("Çalışma kayıtları başarıyla çekildi:", sortedRecords);
    } catch (error) {
      console.error('Çalışma kayıtları çekilirken hata oluştu:', error.response?.data || error.message);
      setRecordsError('Çalışma kayıtları yüklenirken bir sorun oluştu.');
      if (error.response && error.response.status === 401) {
        setRecordsError("Oturum süresi doldu veya yetkiniz yok. Lütfen tekrar giriş yapın.");
      }
      setPastRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  };

  // Component yüklendiğinde JWT'den kullanıcı ID'sini alalım ve kayıtları çekelim (Değişiklik yok)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const id = decodeUserIdFromToken(token);
    if (id !== null) {
      setCurrentUser(id);
      fetchStudyRecords(id);
    } else {
      console.error("Kullanıcı ID alınamadı. Lütfen giriş yapın.");
      setRecordsError("Kullanıcı bilgilerine ulaşılamadı. Lütfen giriş yaptığınızdan emin olun.");
    }
  }, []);

  // Sayaç mantığı için useEffect hook'u (Değişiklik yok)
  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(intervalRef.current);
    } else if (timeRemaining === 0 && isActive) {
      handleTimeUp();
    }
  }, [isActive, timeRemaining, isWorking, workDuration, breakDuration, currentUser]); // currentUser bağımlılığı eklendi, çünkü saveStudyRecord içinde kullanılıyor.

  // Süreyi formatlama (MM:SS) (Değişiklik yok)
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Mod değiştirme (Çalışma <-> Mola) (Değişiklik yok)
  const switchMode = (isWorkMode) => {
    setIsWorking(isWorkMode);
    setStatusMessage(isWorkMode ? 'Çalışma Zamanı' : 'Mola Zamanı');
    setTimeRemaining(isWorkMode ? workDuration * 60 : breakDuration * 60);
  };

  // Çalışma kaydını backend'e gönderme fonksiyonu (Değişiklik yok)
  const saveStudyRecord = async () => {
    if (currentUser === null) {
      console.error("saveStudyRecord: Kullanıcı kimliği mevcut değil, kayıt yapılamadı.");
      return;
    }
    const recordData = {
      userId: currentUser,
      workMinutes: workDuration,
      breakMinutes: breakDuration, // Eğer mola süreleri de kaydediliyorsa
      recordDate: new Date().toISOString(),
    };
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("saveStudyRecord: Token mevcut değil, kayıt yapılamaz.");
      return;
    }
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    try {
      await axios.post(API_URL, recordData, { headers: headers });
      console.log('Çalışma kaydı başarıyla eklendi.');
      fetchStudyRecords(currentUser); // Kayıt sonrası listeyi güncelle
    } catch (error) {
      console.error('Çalışma kaydı eklenirken hata oluştu:', error.response?.data || error.message);
      if (error.response && error.response.status === 401) {
        console.warn("saveStudyRecord: Yetkisiz işlem, lütfen tekrar giriş yapın.");
        setRecordsError("Kayıt eklenirken yetki sorunu. Lütfen tekrar giriş yapın.");
      }
    }
  };

  // Sayaç süresi bittiğinde çalışacak fonksiyon (Değişiklik yok)
  const handleTimeUp = () => {
    clearInterval(intervalRef.current);
    if (isWorking) {
      saveStudyRecord();
      switchMode(false); // Molaya geç
    } else {
      switchMode(true); // Çalışmaya geç
    }
  };

  // Buton fonksiyonları (Değişiklik yok)
  const startTimer = () => {
    if (currentUser === null) {
      console.warn("startTimer: Kullanıcı kimliği olmadan sayaç başlatılamaz.");
      setRecordsError("Sayacı başlatmak için lütfen giriş yapın."); // Kullanıcıya geri bildirim
      return;
    }
    setRecordsError(null); // Hata mesajını temizle
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
    clearInterval(intervalRef.current);
  };

  const resetTimer = () => {
    setIsActive(false);
    clearInterval(intervalRef.current);
    setIsWorking(true);
    setTimeRemaining(workDuration * 60);
    setStatusMessage('Çalışma Zamanı');
  };

  // Süre ayarlama inputları için handler (Değişiklik yok)
  const handleWorkDurationChange = (e) => {
    const minutes = parseInt(e.target.value, 10);
    if (!isNaN(minutes) && minutes > 0) {
      setWorkDuration(minutes);
      if (isWorking && !isActive) {
        setTimeRemaining(minutes * 60);
      }
    }
  };

  const handleBreakDurationChange = (e) => {
    const minutes = parseInt(e.target.value, 10);
    if (!isNaN(minutes) && minutes > 0) {
      setBreakDuration(minutes);
      if (!isWorking && !isActive) {
        setTimeRemaining(minutes * 60);
      }
    }
  };

  return (
    <div className=" min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6 md:p-8 selection:bg-cyan-500 selection:text-white">
      {/* Kullanıcı ID yüklenemediğinde veya token yoksa genel uyarı */}
      {currentUser === null && !recordsLoading && ( // Yükleme sırasında bu mesajı gösterme
        <div className="bg-rose-500/20 border border-rose-500 text-rose-300 px-4 py-3 rounded-lg shadow-md mb-6 w-full max-w-md text-center">
          Kullanıcı bilgilerine ulaşılamıyor. Lütfen giriş yaptığınızdan emin olun.
        </div>
      )}

      {/* Ana Pomodoro Zamanlayıcı Kartı */}
      <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl text-center mb-8 w-full max-w-md">
        {/* Süre Ayarları */}
        <div className="mb-8 flex justify-center items-end space-x-4">
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-1" htmlFor="workDuration">
              Çalışma (dk)
            </label>
            <input
              id="workDuration"
              type="number"
              value={workDuration}
              onChange={handleWorkDurationChange}
              disabled={isActive}
              className="shadow-sm appearance-none border border-slate-600 rounded-lg w-24 py-2 px-3 text-slate-100 leading-tight focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-center bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
              min="1"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-1" htmlFor="breakDuration">
              Mola (dk)
            </label>
            <input
              id="breakDuration"
              type="number"
              value={breakDuration}
              onChange={handleBreakDurationChange}
              disabled={isActive}
              className="shadow-sm appearance-none border border-slate-600 rounded-lg w-24 py-2 px-3 text-slate-100 leading-tight focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-center bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
              min="1"
            />
          </div>
        </div>

        <p className={`text-2xl mb-3 font-medium ${isWorking ? 'text-emerald-400' : 'text-sky-400'}`}>
          {statusMessage}
        </p>

        <div className={`text-7xl sm:text-8xl font-bold mb-8 tabular-nums ${isWorking ? 'text-emerald-400' : 'text-sky-400'}`}>
          {formatTime(timeRemaining)}
        </div>

        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          {!isActive ? (
            <button
              onClick={startTimer}
              disabled={currentUser === null}
              className={`font-semibold py-3 px-8 rounded-lg focus:outline-none focus:ring-4 transition-all duration-200 ease-in-out w-full sm:w-auto
                ${currentUser === null 
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed ring-slate-700' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-emerald-400/50 shadow-lg hover:shadow-emerald-500/40'}`}
            >
              Başlat
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-8 rounded-lg focus:outline-none focus:ring-4 focus:ring-amber-400/50 shadow-lg hover:shadow-amber-500/40 transition-all duration-200 ease-in-out w-full sm:w-auto"
            >
              Duraklat
            </button>
          )}
          <button
            onClick={resetTimer}
            className="bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-8 rounded-lg focus:outline-none focus:ring-4 focus:ring-rose-400/50 shadow-lg hover:shadow-rose-500/40 transition-all duration-200 ease-in-out w-full sm:w-auto"
          >
            Sıfırla
          </button>
        </div>
      </div>

      {/* Geçmiş Çalışma Kayıtları Bölümü */}
      <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h3 className="text-2xl font-semibold text-slate-100 mb-6 text-center border-b border-slate-700 pb-4">
          Geçmiş Seanslar
        </h3>

        {recordsLoading && <p className="text-slate-400 text-center py-4">Kayıtlar yükleniyor...</p>}
        {recordsError && !recordsLoading && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-lg text-center">
                {recordsError}
            </div>
        )}

        {!recordsLoading && !recordsError && pastRecords.length === 0 && currentUser !== null && (
          <p className="text-slate-500 text-center py-4">
            Henüz tamamlanmış bir Pomodoro seansınız yok. <br/> Başlamak için sayacı çalıştırın!
          </p>
        )}
        
        {!recordsLoading && !recordsError && pastRecords.length === 0 && currentUser === null && (
             <p className="text-slate-500 text-center py-4">
                Geçmiş seansları görmek için lütfen giriş yapın.
             </p>
        )}


        {!recordsLoading && !recordsError && pastRecords.length > 0 && (
          <ul className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {pastRecords.map(record => (
              <li key={record.id} className="bg-slate-700/70 p-4 rounded-lg shadow-md hover:bg-slate-700 transition-colors duration-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-md font-medium text-emerald-400">
                      Çalışma: <span className="text-slate-100 font-semibold">{record.workMinutes} dk</span>
                    </p>
                    {record.breakMinutes > 0 && ( // Mola süresi varsa göster
                         <p className="text-md font-medium text-sky-400">
                         Mola: <span className="text-slate-100 font-semibold">{record.breakMinutes} dk</span>
                       </p>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 text-right">
                    {formatRecordDate(record.recordDate)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Pomodoro;