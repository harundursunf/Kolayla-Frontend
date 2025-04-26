import React, { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowDown } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import resim1 from '../images/ders10.png';
import resim2 from '../images/ders11.png';
import resim3 from '../images/ders12.png';
import resim4 from '../images/ders13.png';

const Home = () => {
    const [isAuth, setIsAuth] = useState(false);
    const tokenControl = localStorage.getItem("authToken");
    const navigate = useNavigate();

    useEffect(() => {
        if (tokenControl) {
            setIsAuth(true);
        }
    }, [tokenControl]);

    const handleExploreClick = () => {
        const targetSection = document.getElementById('target-section');
        if (targetSection) {
            window.scrollBy({
                top: 455,
                behavior: 'smooth'
            });
        } else {
            navigate('/explore');
        }
    };

    const { ref: ref2, inView: inView2 } = useInView({ triggerOnce: true });
    const { ref: ref3, inView: inView3 } = useInView({ triggerOnce: true });
    const { ref: ref4, inView: inView4 } = useInView({ triggerOnce: true });

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            {/* Başlangıç - Hero Alanı */}
            <div className="mt-20 relative w-full max-w-[1163px] rounded-3xl shadow-lg bg-white overflow-hidden">

                <div className="absolute inset-0">
                    <svg
                        className="absolute bottom-0 w-full h-full"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1440 320"
                        fill="currentColor"
                        preserveAspectRatio="none"
                    >
                        <path
                            fill="rgba(255, 175, 1, 0.6)"
                            d="M0,320C150,288,300,256,450,256C600,256,750,288,900,288C1050,288,1200,256,1350,224L1440,192V320H1350C1200,320,1050,320,900,320C750,320,600,320,450,320C300,320,150,320,0,320Z"
                        />
                    </svg>
                </div>

                <div className="relative mt-0 p-8 flex flex-col items-center lg:items-start space-y-8 lg:space-y-0 lg:flex-row lg:space-x-8" style={{ height: '420px' }}>
                    <div className="w-full lg:w-1/2 text-center lg:text-left">
                        <h2 className="font-extrabold text-5xl tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 shadow-lg">
                            Gelecek Senin Elinde!
                        </h2>

                        <p className="mt-[40px] text-lg text-gray-800 max-w-lg mx-auto lg:mx-0 bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg shadow-md border border-blue-100">
                            🌟 Bu site, akademik başarılarınızı artırmanıza yardımcı olmak için tasarlandı.
                            Matematik ve Türkçe netlerinizi girerek hedeflerinize daha kolay ulaşabilirsiniz.
                        </p>

                        <div className="mt-[110px] flex justify-center lg:justify-start">
                            <button
                                className="bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 flex items-center justify-center space-x-2"
                                onClick={handleExploreClick}
                            >
                                <span>Keşfet</span>
                                <FaArrowDown className="ml-2 animate-bounce" />
                            </button>
                        </div>

                        <style jsx>{`
                            .animate-bounce {
                              animation: bounce 1.5s infinite;
                            }

                            @keyframes bounce {
                              0%, 100% {
                                transform: translateY(0);
                              }
                              50% {
                                transform: translateY(-5px);
                              }
                            }
                        `}</style>
                    </div>

                    <div className="w-full lg:w-1/2 flex items-center justify-center">
                        <img
                            src={"/public/ogrenci.webp"}
                            alt="Gelecek Resmi"
                            className="rounded-lg w-3/4 h-auto object-cover mt-[-90px]"
                        />
                    </div>
                </div>
            </div>

            {/* 2. Bölüm */}
            <motion.div
                id="target-section"
                ref={ref2}
                initial={{ opacity: 0, y: 50 }}
                animate={inView2 ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1 }}
                className="bg-white p-5 rounded-3xl shadow-md w-full max-w-[1163px] flex items-center space-x-8 mt-8"
                style={{ height: '420px' }}
            >
                <div className="w-1/2 flex flex-col items-center justify-center relative">
                    <img
                        src="/public/pomodoro2.avif"
                        alt="Pomodoro Tekniği"
                        className="rounded-lg w-[450px] h-[400px] object-cover"
                    />
                </div>

                <div className="w-1/2">
                    <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        Hedeflerinizi Şimdi Belirleyin ve Pomodoro Tekniği ile Daha Verimli Çalışın!
                    </h2>

                    <p className="mt-6 text-lg text-gray-800 max-w-lg mx-auto bg-gradient-to-r from-blue-50 to-white p-6 rounded-lg shadow-md border border-blue-100">
                        🌟 Akademik başarılarınızı artırmak için matematik ve Türkçe netlerinizi girin.
                        Pomodoro tekniği ile verimli çalışma alışkanlıkları geliştirin.
                    </p>

                    <div className="mt-8 text-center">
                        <a href="/pomodoro" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105">
                            Pomodoro Tekniği ile Şimdi Başla
                        </a>
                    </div>
                </div>
            </motion.div>

            {/* 3. Bölüm */}
            <motion.div
                id="target-section3"
                ref={ref3}
                initial={{ opacity: 0, y: 50 }}
                animate={inView3 ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1 }}
                className="bg-white p-5 rounded-3xl shadow-md w-full max-w-[1163px] flex items-center space-x-8 mt-8"
                style={{ height: '420px' }}
            >
                <div className="w-1/2">
                    <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-yellow-600">
                        Hedeflerinize Ulaşmak İçin Motivasyon Gücünü Kullanın!
                    </h2>

                    <p className="mt-6 text-lg text-gray-800 max-w-lg mx-auto bg-gradient-to-r from-green-50 to-white p-6 rounded-lg shadow-md border border-green-100">
                        🌟 Yeni hedefler belirleyin ve motivasyon sözleriyle ilerleyin. Akademik başarılarınızı artırmak ve verimli çalışma alışkanlıkları geliştirmek için buraya tıklayın.
                    </p>

                    <div className="mt-8 text-center">
                        <a href="/gunluksoz" className="bg-[#00BFFF] hover:bg-[#0099CC] text-white font-bold py-4 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105">
                            Motivasyon Sözleriyle Başlayın
                        </a>
                    </div>
                </div>

                <div className="w-1/2 flex flex-col items-center justify-center relative">
                    <img
                        src="/public/123.png"
                        alt="Motivasyon Sözleri"
                        className="rounded-lg w-[350px] h-[350px] object-cover"
                    />
                </div>
            </motion.div>

            {/* 4. Bölüm */}
    {/* 4. Bölüm - Geliştirilmiş */}
    <motion.div
    id="target-section4"
    ref={ref4}
    initial={{ opacity: 0, y: 50 }}
    animate={inView4 ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 1 }}
    className="mt-8 bg-white p-8 rounded-3xl shadow-lg w-full max-w-[1163px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8"
    style={{ height: 'auto' }}
>
    {/* 1. Kart */}
    <div className="flex flex-col items-center justify-center text-center bg-gradient-to-r from-teal-400 to-blue-500 text-white p-6 rounded-lg shadow-xl transform hover:scale-105 hover:shadow-2xl transition duration-300">
        <img src={resim1} alt="Azim" className="rounded-lg w-3/4 h-auto object-cover mb-4 transform transition duration-500 hover:scale-105" />
        <h2 className="text-2xl font-bold mb-2">Azim</h2>
        <p className="text-lg">Hedeflerine ulaşmak için kararlılıkla ilerle.</p>
    </div>

    {/* 2. Kart */}
    <div className="flex flex-col items-center justify-center text-center bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-lg shadow-xl transform hover:scale-105 hover:shadow-2xl transition duration-300">
        <img src={resim2} alt="İnanç" className="rounded-lg w-3/4 h-auto object-cover mb-4 transform transition duration-500 hover:scale-105" />
        <h2 className="text-2xl font-bold mb-2">İnanç</h2>
        <p className="text-lg">Kendine olan inancın, en büyük gücündür.</p>
    </div>

    {/* 3. Kart */}
    <div className="flex flex-col items-center justify-center text-center bg-gradient-to-r from-orange-400 to-red-500 text-white p-6 rounded-lg shadow-xl transform hover:scale-105 hover:shadow-2xl transition duration-300">
        <img src={resim3} alt="Çaba" className="rounded-lg w-3/4 h-auto object-cover mb-4 transform transition duration-500 hover:scale-105" />
        <h2 className="text-2xl font-bold mb-2">Çaba</h2>
        <p className="text-lg">Emek olmadan başarı gelmez. Her adım değerli.</p>
    </div>

    {/* 4. Kart */}
    <div className="flex flex-col items-center justify-center text-center bg-gradient-to-r from-yellow-500 to-red-600 text-white p-6 rounded-lg shadow-xl transform hover:scale-105 hover:shadow-2xl transition duration-300">
        <img src={resim4} alt="Başarı" className="rounded-lg w-3/4 h-auto object-cover mb-4 transform transition duration-500 hover:scale-105" />
        <h2 className="text-2xl font-bold mb-2">Başarı</h2>
        <p className="text-lg">Azim, inanç ve çabanın ödülüdür.</p>
    </div>
</motion.div>


        </div>
    );
};

export default Home;
