  import React, { useState, useEffect, useRef } from 'react';
  import axios from 'axios';
  import { format, isToday, isYesterday } from 'date-fns';
  import { tr } from 'date-fns/locale/tr';

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

  const formatGroupDate = (dateString) => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
          return 'Geçersiz Tarih';
      }

      if (isToday(date)) {
          return 'Bugün';
      } else if (isYesterday(date)) {
          return 'Dün';
      } else {
          return format(date, 'd MMMM', { locale: tr });
      }
  };

  const formatRecordTimestamp = (isoString) => {
      if (!isoString) return 'Geçersiz Tarih';
      try {
          const date = new Date(isoString);
          if (isNaN(date.getTime())) {
              return 'Geçersiz Tarih Formatı';
          }
          const timeOptions = { hour: '2-digit', minute: '2-digit' };
          return date.toLocaleTimeString('tr-TR', timeOptions);
      } catch (e) {
          console.error("Tarih formatlanamadı:", e);
          return 'Tarih Format Hatası';
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

      const [isDarkMode, setIsDarkMode] = useState(() => {
          const savedTheme = localStorage.getItem('theme');
          if (savedTheme) {
              return savedTheme === 'dark';
          }
          return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      });

      const intervalRef = useRef(null);
      const API_URL = 'https://localhost:5001/api/StudyRecord';

      useEffect(() => {
          if (isDarkMode) {
              document.documentElement.classList.add('dark');
              localStorage.setItem('theme', 'dark');
          } else {
              document.documentElement.classList.remove('dark');
              localStorage.setItem('theme', 'light');
          }
      }, [isDarkMode]);

      const toggleTheme = () => {
          setIsDarkMode(!isDarkMode);
      };

      const fetchStudyRecords = async (userIdToFetch) => {
          if (!userIdToFetch) {
              setPastRecords([]);
              return;
          }
          const token = localStorage.getItem('token');
          if (!token) {
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

              const groupedRecords = sortedRecords.reduce((acc, record) => {
                  const recordDate = new Date(record.recordDate);
                  const dateHeader = formatGroupDate(recordDate);

                  const lastGroup = acc[acc.length - 1];

                  if (lastGroup && lastGroup.date === dateHeader) {
                      lastGroup.records.push(record);
                  } else {
                      acc.push({ date: dateHeader, records: [record] });
                  }

                  return acc;
              }, []);

              setPastRecords(groupedRecords);

          } catch (error) {
              console.error("Çalışma kayıtları yüklenirken hata:", error.response ? error.response.data : error.message);
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
          if (id !== null && !isNaN(id)) {
              setCurrentUser(id);
              fetchStudyRecords(id);
          } else {
              setCurrentUser(null);
              setPastRecords([]);
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
      }, [isActive, timeRemaining, isWorking]);

      const formatTime = (time) => {
          const minutes = Math.floor(time / 60);
          const seconds = time % 60;
          return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      };

      const switchMode = (isWorkMode) => {
          setIsWorking(isWorkMode);
          setStatusMessage(isWorkMode ? 'Çalışma Zamanı' : 'Mola Zamanı');
          setTimeRemaining(isWorkMode ? workDuration * 60 : breakDuration * 60);
          setIsActive(false);
      };

      const saveStudyRecord = async () => {
          if (!isWorking || currentUser === null) return;

          const recordData = {
              userId: currentUser,
              workMinutes: workDuration,
              breakMinutes: breakDuration,
              recordDate: new Date().toISOString(),
          };

          const token = localStorage.getItem('token');
          if (!token) {
              setRecordsError("Kayıt eklenirken oturum bilgisi eksik.");
              return;
          }
          try {
              await axios.post(API_URL, recordData, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
              fetchStudyRecords(currentUser);
          } catch (error) {
              console.error("Çalışma kaydı eklenirken hata:", error.response ? error.response.data : error.message);
              if (error.response && error.response.status === 401) {
                  setRecordsError("Kayıt eklenirken yetki sorunu. Lütfen tekrar giriş yapın.");
              } else {
                  setRecordsError("Çalışma kaydı eklenirken bir sorun oluştu.");
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
              setRecordsError("Sayacı başlatmak için lütfen giriş yapın.");
              return;
          }
          setRecordsError(null);
          if (timeRemaining === 0) {
              setTimeRemaining(isWorking ? workDuration * 60 : breakDuration * 60);
          }
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
          setRecordsError(null);
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

      useEffect(() => {
          if (isActive) {
              document.title = `${formatTime(timeRemaining)} - ${statusMessage}`;
          } else if (currentUser === null) {
              document.title = "Pomodoro Zamanlayıcı - Giriş Yapın";
          }
          else {
              document.title = "Pomodoro Zamanlayıcı";
          }
          return () => { document.title = "Pomodoro Zamanlayıcı"; }
      }, [isActive, timeRemaining, statusMessage, currentUser]);

      return (
          <div className="min-h-screen bg-gradient-to-br from-sky-100 via-cyan-50 to-emerald-50 text-slate-800 dark:bg-black dark:text-gray-200 flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 selection:bg-sky-500 selection:text-white dark:selection:bg-sky-700 dark:selection:text-white transition-colors duration-300 ">

              {currentUser === null && !recordsLoading && (
                  <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-amber-100 backdrop-blur-sm border border-amber-300 text-amber-700 dark:bg-gray-800/80 dark:border-gray-700 dark:text-gray-200 px-6 py-3.5 rounded-xl shadow-lg dark:shadow-gray-900/40 mb-8 w-auto max-w-md sm:max-w-lg text-center z-40 transition-colors duration-300">
                      <div className="flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-amber-500 dark:text-gray-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span className="font-medium">Kullanıcı bilgilerine ulaşılamıyor. Lütfen giriş yaptığınızdan emin olun.</span>
                      </div>
                  </div>
              )}

              <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-10 gap-8 lg:gap-12 mt-12 lg:mt-0 pt-10 sm:pt-0 pb-20">
                  <div className="mt-[80px] mb-[80px] lg:col-span-6 bg-white/80 dark:bg-gray-900/70 backdrop-blur-md p-6 sm:p-10 rounded-3xl shadow-2xl dark:shadow-black/30 border border-slate-200/80 dark:border-gray-700/50 transition-colors duration-300">
                      <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-end mt-[70px]">
                          <div className="flex flex-col items-center">
                              <label className="block text-slate-600 dark:text-gray-300 text-base font-medium mb-2.5 transition-colors duration-300" htmlFor="workDuration">
                                  Çalışma Süresi (dakika)
                              </label>
                              <input
                                  id="workDuration"
                                  type="number"
                                  value={workDuration}
                                  onChange={handleWorkDurationChange}
                                  disabled={isActive}
                                  className="shadow-lg appearance-none border-2 border-slate-300 dark:border-gray-700 rounded-xl w-full sm:w-44 py-3.5 px-4 text-slate-700 dark:text-gray-100 leading-tight focus:outline-none focus:ring-3 focus:ring-sky-500/70 focus:border-sky-500 dark:focus:ring-sky-600/70 dark:focus:border-sky-600 text-center bg-slate-50/70 dark:bg-gray-800/90 disabled:opacity-60 disabled:cursor-not-allowed text-xl font-semibold transition-all duration-200"
                                  min="1"
                              />
                          </div>
                          <div className="flex flex-col items-center">
                              <label className="block text-slate-600 dark:text-gray-300 text-base font-medium mb-2.5 transition-colors duration-300" htmlFor="breakDuration">
                                  Mola Süresi (dakika)
                              </label>
                              <input
                                  id="breakDuration"
                                  type="number"
                                  value={breakDuration}
                                  onChange={handleBreakDurationChange}
                                  disabled={isActive}
                                  className="shadow-lg appearance-none border-2 border-slate-300 dark:border-gray-700 rounded-xl w-full sm:w-44 py-3.5 px-4 text-slate-700 dark:text-gray-100 leading-tight focus:outline-none focus:ring-3 focus:ring-teal-500/70 focus:border-teal-500 dark:focus:ring-teal-600/70 dark:focus:border-teal-600 text-center bg-slate-50/70 dark:bg-gray-800/90 disabled:opacity-60 disabled:cursor-not-allowed text-xl font-semibold transition-all duration-200"
                                  min="1"
                              />
                          </div>
                      </div>

                      <p className={`text-4xl sm:text-5xl mb-6 font-bold text-center transition-colors duration-300 ${isWorking ? 'text-sky-600 dark:text-sky-400' : 'text-teal-600 dark:text-teal-400'}`}>
                          {statusMessage}
                      </p>

                      <div className={`text-8xl sm:text-9xl lg:text-[10rem] font-mono font-extrabold mb-10 tabular-nums text-center transition-colors duration-300 tracking-wider ${isWorking ? 'text-sky-500 dark:text-sky-300' : 'text-teal-500 dark:text-teal-300'}`}>
                          {formatTime(timeRemaining)}
                      </div>

                      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-5">
                          {!isActive ? (
                              <button
                                  onClick={startTimer}
                                  disabled={currentUser === null}
                                  className={`font-bold py-4 px-8 sm:px-10 rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 ease-in-out w-full sm:w-auto text-lg shadow-xl hover:shadow-2xl flex items-center justify-center
                                          ${currentUser === null
                                              ? 'bg-slate-300 text-slate-500 cursor-not-allowed ring-slate-400/50 dark:bg-gray-700 dark:text-gray-500 dark:ring-gray-800/50'
                                              : 'bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-500 hover:from-sky-600 hover:via-cyan-600 hover:to-blue-600 text-white focus:ring-sky-300/70 dark:from-sky-600 dark:via-cyan-600 dark:to-blue-700 dark:hover:from-sky-700 dark:hover:via-cyan-700 dark:hover:to-blue-800 dark:focus:ring-sky-400/60 transform hover:scale-105'}`}
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.118v3.764a1 1 0 001.555.832l3.197-1.882a1 1 0 000-1.664l-3.197-1.882z" clipRule="evenodd" />
                                  </svg>
                                  Başlat
                              </button>
                          ) : (
                              <button
                                  onClick={pauseTimer}
                                  className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white dark:text-gray-100 font-bold py-4 px-8 sm:px-10 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-300/60 dark:focus:ring-amber-400/60 shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out w-full sm:w-auto text-lg flex items-center justify-center transform hover:scale-105"
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h1a1 1 0 001-1V8a1 1 0 00-1-1H8zm4 0a1 1 0 00-1 1v4a1 1 0 001 1h1a1 1 0 001-1V8a1 1 0 00-1-1h-1z" clipRule="evenodd" />
                                  </svg>
                                  Duraklat
                              </button>
                          )}
                          <button
                              onClick={resetTimer}
                              className="bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 hover:from-rose-600 hover:via-pink-600 hover:to-fuchsia-600 text-white dark:text-gray-100 font-bold py-4 px-8 sm:px-10 rounded-xl focus:outline-none focus:ring-4 focus:ring-rose-300/60 dark:focus:ring-rose-400/60 shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out w-full sm:w-auto text-lg flex items-center justify-center transform hover:scale-105"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0015.357 2m0 0H15" />
                              </svg>
                              Sıfırla
                          </button>
                      </div>
                  </div>

                  <div className="mt-[80px] mb-[80px] lg:col-span-4 bg-white/80 dark:bg-gray-900/70 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl dark:shadow-black/30 border border-slate-200/80 dark:border-gray-700/50 flex flex-col max-h-[90vh] lg:max-h-[calc(100vh-5rem)] transition-colors duration-300">
                      <h3 className="text-3xl font-bold text-slate-700 dark:text-gray-100 mb-6 text-center border-b-2 border-sky-500/70 dark:border-sky-700/70 pb-4 transition-colors duration-300">
                          Geçmiş Seanslar
                      </h3>

                      <style>{`
                          .custom-scrollbar::-webkit-scrollbar {
                              width: 8px;
                          }
                          .custom-scrollbar::-webkit-scrollbar-track {
                              background: transparent;
                              border-radius: 10px;
                          }
                          .custom-scrollbar::-webkit-scrollbar-thumb {
                              background: #cbd5e1;
                              border-radius: 10px;
                          }
                          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                            background: #4b5563;
                          }
                          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                              background: #94a3b8;
                          }
                          .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: #6b7280;
                          }
                      `}</style>

                      <div className="flex-grow overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                          {recordsLoading && (
                              <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
                                  <svg className="animate-spin h-12 w-12 text-sky-500 dark:text-sky-400 mb-4 transition-colors duration-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <p className="text-slate-600 dark:text-gray-300 text-xl transition-colors duration-300">Kayıtlar yükleniyor...</p>
                              </div>
                          )}
                          {recordsError && !recordsLoading && (
                              <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
                                  <div className="bg-red-100 border border-red-300 text-red-700 dark:bg-red-900/60 dark:border-red-700/80 dark:text-red-200 px-6 py-5 rounded-xl shadow-lg max-w-sm transition-colors duration-300">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-red-500 dark:text-red-300 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <p className="font-semibold text-xl mb-1">Bir Hata Oluştu!</p>
                                      <p className="text-sm text-red-600 dark:text-red-300 transition-colors duration-300">{recordsError}</p>
                                  </div>
                              </div>
                          )}

                          {!recordsLoading && !recordsError && currentUser === null && (
                              <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 dark:text-gray-500 py-10 transition-colors duration-300">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-slate-400 dark:text-gray-600 mb-5 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  <p className="text-xl font-medium">Geçmiş seansları görmek için lütfen giriş yapın.</p>
                              </div>
                          )}

                          {!recordsLoading && !recordsError && pastRecords.length === 0 && currentUser !== null && (
                              <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 dark:text-gray-500 py-10 transition-colors duration-300">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-slate-400 dark:text-gray-600 mb-5 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <p className="text-xl font-medium">Henüz tamamlanmış bir Pomodoro seansınız yok.</p>
                                  <p className="mt-1.5 text-slate-400 dark:text-gray-400 transition-colors duration-300">Başlamak için zamanlayıcıyı çalıştırın!</p>
                              </div>
                          )}

                          {!recordsLoading && !recordsError && pastRecords.length > 0 && (
                              <div className="space-y-6">
                                  {pastRecords.map(group => (
                                      <div key={group.date} className="bg-slate-100/50 dark:bg-gray-800/50 rounded-xl p-3 shadow-inner dark:shadow-black/20 border border-slate-200/70 dark:border-gray-700/60 transition-colors duration-300">
                                          <h4 className="text-lg font-bold text-slate-700 dark:text-gray-200 mb-3 pb-2 border-b border-slate-300 dark:border-gray-600 transition-colors duration-300">
                                              {group.date}
                                          </h4>
                                          <ul className="space-y-3">
                                              {group.records.map(record => (
                                                  <li key={record.id} className="bg-white/90 dark:bg-gray-800/90 p-3 rounded-lg shadow-md hover:bg-white dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 hover:border-sky-400/70 dark:hover:border-sky-600/60 transition-all duration-200 ease-in-out transform hover:scale-[1.01] hover:shadow-lg">
                                                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                                          <div className="mb-1.5 sm:mb-0">
                                                              <p className="text-base font-semibold text-sky-700 dark:text-sky-300 flex items-center transition-colors duration-300">
                                                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                  </svg>
                                                                  Çalışma: <span className="text-slate-800 dark:text-gray-100 ml-1 font-bold transition-colors duration-300">{record.workMinutes} dk</span>
                                                              </p>
                                                              {record.breakMinutes > 0 && (
                                                                    <p className="text-base font-semibold text-teal-700 dark:text-teal-300 mt-1 flex items-center transition-colors duration-300">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                                        </svg>
                                                                        Mola: <span className="text-slate-800 dark:text-gray-100 ml-1 font-bold transition-colors duration-300">{record.breakMinutes} dk</span>
                                                                    </p>
                                                              )}
                                                          </div>
                                                          <div className="text-sm text-slate-500 dark:text-gray-400 transition-colors duration-300 flex items-center">
                                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                              </svg>
                                                              {formatRecordTimestamp(record.recordDate)}
                                                          </div>
                                                      </div>
                                                  </li>
                                              ))}
                                          </ul>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>
              </div>

              <button
                  onClick={toggleTheme}
                  className="fixed bottom-5 right-5 p-3 rounded-full bg-slate-200/70 dark:bg-gray-700/70 text-slate-700 dark:text-gray-200 shadow-lg hover:scale-110 focus:outline-none focus:ring-4 focus:ring-sky-300/50 dark:focus:ring-gray-600/50 transition-all duration-300 z-50 backdrop-blur-sm"
                  aria-label={isDarkMode ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
              >
                  {isDarkMode ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                  ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                  )}
              </button>

          </div>
      );
  };

  export default Pomodoro;