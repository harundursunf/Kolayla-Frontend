import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

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
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isWorking, setIsWorking] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [statusMessage, setStatusMessage] = useState('Çalışma Zamanı');
  const [currentUser, setCurrentUser] = useState(null);

  const [pastRecords, setPastRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState(null);

  const intervalRef = useRef(null);
  const API_URL = 'https://localhost:5001/api/StudyRecord';

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const id = decodeUserIdFromToken(token);
    if (id !== null) {
      setCurrentUser(id);
      fetchStudyRecords(id);
    } else {
      console.error("Kullanıcı ID alınamadı. Lütfen giriş yapın.");
    }
  }, []);

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(intervalRef.current);
    } else if (timeRemaining === 0 && isActive) {
      handleTimeUp();
    }
  }, [isActive, timeRemaining, isWorking, workDuration, breakDuration, currentUser]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const switchMode = (isWorkMode) => {
    setIsWorking(isWorkMode);
    setStatusMessage(isWorkMode ? 'Çalışma Zamanı' : 'Mola Zamanı');
    setTimeRemaining(isWorkMode ? workDuration * 60 : breakDuration * 60);
  };

  const saveStudyRecord = async () => {
    if (currentUser === null) {
      console.error("saveStudyRecord: Kullanıcı kimliği mevcut değil, kayıt yapılamadı.");
      return;
    }
    const recordData = {
      userId: currentUser,
      workMinutes: workDuration,
      breakMinutes: breakDuration,
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
      fetchStudyRecords(currentUser);
    } catch (error) {
      console.error('Çalışma kaydı eklenirken hata oluştu:', error.response?.data || error.message);
      if (error.response && error.response.status === 401) {
        console.warn("saveStudyRecord: Yetkisiz işlem, lütfen tekrar giriş yapın.");
        setRecordsError("Kayıt eklenirken yetki sorunu. Lütfen tekrar giriş yapın.");
      }
    }
  };

  const handleTimeUp = () => {
    clearInterval(intervalRef.current);
    if (isWorking) {
      saveStudyRecord();
      switchMode(false);
    } else {
      switchMode(true);
    }
  };

  const startTimer = () => {
    if (currentUser === null) {
      console.warn("startTimer: Kullanıcı kimliği olmadan sayaç başlatılamaz.");
      setRecordsError("Sayacı başlatmak için lütfen giriş yapın.");
      return;
    }
    setRecordsError(null);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 selection:bg-teal-500 selection:text-white mt-">
      {currentUser === null && !recordsLoading && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-700/60 backdrop-blur-sm border border-red-600 text-red-100 px-6 py-3.5 rounded-xl shadow-2xl mb-8 w-auto max-w-md sm:max-w-lg text-center z-50">
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">Kullanıcı bilgilerine ulaşılamıyor. Lütfen giriş yaptığınızdan emin olun.</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-10 gap-8 lg:gap-12 mt-16 lg:mt-0">
        <div className="lg:col-span-6 bg-slate-800/70 backdrop-blur-lg p-6 sm:p-10 rounded-3xl shadow-2xl border border-slate-700/50">
          <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-end">
            <div className="flex flex-col items-center">
              <label className="block text-slate-300 text-base font-medium mb-2.5" htmlFor="workDuration">
                Çalışma Süresi (dakika)
              </label>
              <input
                id="workDuration"
                type="number"
                value={workDuration}
                onChange={handleWorkDurationChange}
                disabled={isActive}
                className="shadow-xl appearance-none border-2 border-slate-600/80 rounded-xl w-full sm:w-40 py-3.5 px-4 text-slate-50 leading-tight focus:outline-none focus:ring-3 focus:ring-teal-500/70 focus:border-teal-500 text-center bg-slate-700/90 disabled:opacity-60 disabled:cursor-not-allowed text-xl font-semibold transition-all duration-200"
                min="1"
              />
            </div>
            <div className="flex flex-col items-center">
              <label className="block text-slate-300 text-base font-medium mb-2.5" htmlFor="breakDuration">
                Mola Süresi (dakika)
              </label>
              <input
                id="breakDuration"
                type="number"
                value={breakDuration}
                onChange={handleBreakDurationChange}
                disabled={isActive}
                className="shadow-xl appearance-none border-2 border-slate-600/80 rounded-xl w-full sm:w-40 py-3.5 px-4 text-slate-50 leading-tight focus:outline-none focus:ring-3 focus:ring-sky-500/70 focus:border-sky-500 text-center bg-slate-700/90 disabled:opacity-60 disabled:cursor-not-allowed text-xl font-semibold transition-all duration-200"
                min="1"
              />
            </div>
          </div>

          <p className={`text-4xl mb-6 font-bold text-center transition-colors duration-300 ${isWorking ? 'text-teal-400' : 'text-sky-400'}`}>
            {statusMessage}
          </p>

          <div className={`text-8xl sm:text-9xl lg:text-[10rem] font-mono font-extrabold mb-10 tabular-nums text-center transition-colors duration-300 tracking-wider ${isWorking ? 'text-teal-300' : 'text-sky-300'}`}>
            {formatTime(timeRemaining)}
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-5">
            {!isActive ? (
              <button
                onClick={startTimer}
                disabled={currentUser === null}
                className={`font-bold py-4 px-8 sm:px-10 rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 ease-in-out w-full sm:w-auto text-lg shadow-xl hover:shadow-2xl flex items-center justify-center
                  ${currentUser === null
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed ring-slate-700/50'
                    : 'bg-gradient-to-br from-teal-500 via-green-500 to-emerald-600 hover:from-teal-600 hover:via-green-600 hover:to-emerald-700 text-white focus:ring-teal-400/60 transform hover:scale-105'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.118v3.764a1 1 0 001.555.832l3.197-1.882a1 1 0 000-1.664l-3.197-1.882z" clipRule="evenodd" />
                </svg>
                Başlat
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white font-bold py-4 px-8 sm:px-10 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-400/60 shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out w-full sm:w-auto text-lg flex items-center justify-center transform hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h1a1 1 0 001-1V8a1 1 0 00-1-1H8zm4 0a1 1 0 00-1 1v4a1 1 0 001 1h1a1 1 0 001-1V8a1 1 0 00-1-1h-1z" clipRule="evenodd" />
                </svg>
                Duraklat
              </button>
            )}
            <button
              onClick={resetTimer}
              className="bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 hover:from-rose-600 hover:via-pink-600 hover:to-fuchsia-700 text-white font-bold py-4 px-8 sm:px-10 rounded-xl focus:outline-none focus:ring-4 focus:ring-rose-400/60 shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out w-full sm:w-auto text-lg flex items-center justify-center transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0015.357 2m0 0H15" />
              </svg>
              Sıfırla
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 bg-slate-800/70 backdrop-blur-lg p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-700/50 flex flex-col max-h-[90vh] lg:max-h-[calc(100vh-4rem)]">
          <h3 className="text-3xl font-bold text-slate-100 mb-6 text-center border-b-2 border-slate-600/80 pb-4">
            Geçmiş Seanslar
          </h3>

          <div className="flex-grow overflow-y-auto pr-2 -mr-2 custom-scrollbar">
            {recordsLoading && (
              <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
                <svg className="animate-spin h-12 w-12 text-teal-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-slate-300 text-xl">Kayıtlar yükleniyor...</p>
              </div>
            )}
            {recordsError && !recordsLoading && (
              <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
                <div className="bg-rose-700/40 border border-rose-600/70 text-rose-200 px-6 py-5 rounded-xl shadow-lg max-w-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-semibold text-xl mb-1">Bir Hata Oluştu!</p>
                  <p className="text-sm text-rose-300">{recordsError}</p>
                </div>
              </div>
            )}

            {!recordsLoading && !recordsError && pastRecords.length === 0 && currentUser !== null && (
              <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 py-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-slate-600/80 mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xl font-medium">Henüz tamamlanmış bir Pomodoro seansınız yok.</p>
                <p className="mt-1.5 text-slate-400">Başlamak için zamanlayıcıyı çalıştırın!</p>
              </div>
            )}

            {!recordsLoading && !recordsError && pastRecords.length === 0 && currentUser === null && (
              <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 py-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-slate-600/80 mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-xl font-medium">Geçmiş seansları görmek için lütfen giriş yapın.</p>
              </div>
            )}

            {!recordsLoading && !recordsError && pastRecords.length > 0 && (
              <ul className="space-y-5">
                {pastRecords.map(record => (
                  <li key={record.id} className="bg-slate-700/70 p-5 rounded-xl shadow-lg hover:bg-slate-700/95 transition-all duration-200 ease-in-out transform hover:scale-[1.01] hover:shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div className="mb-2 sm:mb-0">
                        <p className="text-lg font-semibold text-teal-400 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2.5 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Çalışma: <span className="text-slate-100 ml-1.5 font-bold">{record.workMinutes} dk</span>
                        </p>
                        {record.breakMinutes > 0 && (
                          <p className="text-lg font-semibold text-sky-400 mt-1.5 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2.5 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="MM12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                            </svg>
                            Mola: <span className="text-slate-100 ml-1.5 font-bold">{record.breakMinutes} dk</span>
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-slate-400/90 mt-1 sm:mt-0 text-left sm:text-right whitespace-nowrap self-start sm:self-center pt-1">
                        {formatRecordDate(record.recordDate)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>


    </div>
  );
};

export default Pomodoro;
