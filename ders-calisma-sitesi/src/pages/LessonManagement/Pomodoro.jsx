import React, { useState, useEffect, useRef } from 'react';

const Pomodoro = () => {
    const [workDuration, setWorkDuration] = useState(25 * 60);
    const [breakDuration, setBreakDuration] = useState(5 * 60); 

    const [timeLeft, setTimeLeft] = useState(workDuration);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState('work'); 

    const [totalWorkTime, setTotalWorkTime] = useState(0);
    const [totalBreakTime, setTotalBreakTime] = useState(0);

    const audioRef = useRef(null); 

  
    const [previousMode, setPreviousMode] = useState('work');


    useEffect(() => {
        let timer;
        if (isRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);

       
            if (mode === 'work') {
                setTotalWorkTime(prevTotal => prevTotal + workDuration);
            } else {
                setTotalBreakTime(prevTotal => prevTotal + breakDuration);
            }

        
            if (audioRef.current) {
                 audioRef.current.currentTime = 0; // Başa sar
                 audioRef.current.play().catch(error => console.log("Ses çalma hatası:", error));
            }

          
            setPreviousMode(mode); 
            const nextMode = mode === 'work' ? 'break' : 'work';
            setMode(nextMode);
            setTimeLeft(nextMode === 'work' ? workDuration : breakDuration);
        }
        return () => clearInterval(timer);
    }, [isRunning, timeLeft, mode, workDuration, breakDuration]); 

  
    const changeMode = (newMode) => {

        if (mode === newMode) {
            return;
        }

        
        if (!isRunning && timeLeft > 0) {
             const spentTime = (mode === 'work' ? workDuration : breakDuration) - timeLeft;
             if (mode === 'work') {
                 setTotalWorkTime(prevTotal => prevTotal + spentTime);
             } else {
                 setTotalBreakTime(prevTotal => prevTotal + spentTime);
             }
        }
      
        else if (isRunning) {
            const spentTime = (mode === 'work' ? workDuration : breakDuration) - timeLeft;
             if (mode === 'work') {
                 setTotalWorkTime(prevTotal => prevTotal + spentTime);
             } else {
                 setTotalBreakTime(prevTotal => prevTotal + spentTime);
             }
        }


        setIsRunning(false);
        setPreviousMode(mode); 
        setMode(newMode);
        setTimeLeft(newMode === 'work' ? workDuration : breakDuration);

         if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const toggleTimer = () => {
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
      
        if (!isRunning && timeLeft > 0) {
             const spentTime = (mode === 'work' ? workDuration : breakDuration) - timeLeft;
             if (mode === 'work') {
                 setTotalWorkTime(prevTotal => prevTotal + spentTime);
             } else {
                 setTotalBreakTime(prevTotal => prevTotal + spentTime);
             }
        }
         // Eğer sayaç çalışıyorsa, durdur ve geçen süreyi ekle
        else if (isRunning) {
            const spentTime = (mode === 'work' ? workDuration : breakDuration) - timeLeft;
             if (mode === 'work') {
                 setTotalWorkTime(prevTotal => prevTotal + spentTime);
             } else {
                 setTotalBreakTime(prevTotal => prevTotal + spentTime);
             }
        }


        setIsRunning(false);
        // Süreyi mevcut moda göre ayarla
        setTimeLeft(mode === 'work' ? workDuration : breakDuration);
        // Toplam süreleri de sıfırla
        setTotalWorkTime(0);
        setTotalBreakTime(0);
        // Sesi durdur ve başa al
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
            .toString()
            .padStart(2, '0')}`;
    };

     const formatTotalTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            return `${hours}s ${minutes}d ${remainingSeconds}sn`;
        } else if (minutes > 0) {
            return `${minutes}d ${remainingSeconds}sn`;
        } else {
             // Sadece saniye varsa, "0sn" göstermemek için kontrol ekleyelim
            return seconds > 0 ? `${remainingSeconds}sn` : '0sn';
        }
    };


    return (
        <div className="mt-[100px] mb-[73px] bg-white p-8 rounded-3xl shadow-xl w-full max-w-[1163px] flex flex-col items-center space-y-10 mx-auto">
            <div className="w-full flex flex-col items-center space-y-6">
                <h2 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-yellow-600">
                    Pomodoro Zamanlayıcı
                </h2>
                <p className="text-lg text-gray-700 max-w-xl text-center">
                    🕑 Odaklanma ve mola sürelerini yöneterek verimliliğini en üst düzeye çıkar.
                </p>

                 {/* Mod Değiştirme Butonları */}
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={() => changeMode('work')}
                        className={`py-2 px-6 rounded-full font-semibold transition-colors ${mode === 'work' ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Çalışma ({workDuration / 60} dk)
                    </button>
                    <button
                         onClick={() => changeMode('break')}
                        className={`py-2 px-6 rounded-full font-semibold transition-colors ${mode === 'break' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Mola ({breakDuration / 60} dk)
                    </button>
                </div>


          
                <div className={`relative flex items-center justify-center w-64 h-64 rounded-full shadow-inner ${mode === 'work' ? 'bg-green-100' : 'bg-blue-100'}`}>
       
                    <div className={`absolute inset-0 rounded-full ${mode === 'work' ? 'bg-green-200 opacity-75' : 'bg-blue-200 opacity-75'}`}></div>

                    <div className="relative z-10 text-7xl font-mono font-bold text-gray-800">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="flex justify-center space-x-6 mt-6">
                    <button
                        onClick={toggleTimer}
                        className={`py-3 px-8 rounded-full font-bold text-white shadow-lg transition-transform transform hover:scale-105 ${isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
                    >
                        {isRunning ? 'Duraklat' : 'Başlat'}
                    </button>
                    <button
                        onClick={resetTimer}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105"
                    >
                        Sıfırla
                    </button>
                </div>


                <div className="mt-8 w-full max-w-md bg-gray-50 p-6 rounded-lg shadow-md border border-gray-100">
                    <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">Toplam Süreler</h3>
                    <div className="flex justify-around text-lg">
                        <div className="text-center">
                            <p className="font-semibold text-green-700">Çalışma:</p>
                            <p className="text-gray-800">{formatTotalTime(totalWorkTime)}</p>
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-blue-700">Mola:</p>
                            <p className="text-gray-800">{formatTotalTime(totalBreakTime)}</p>
                        </div>
                    </div>
                </div>

            </div>
 
            <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto"></audio>
        </div>
    );
};

export default Pomodoro;