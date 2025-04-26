import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-8 mt-8 flex flex-col items-center justify-center rounded-t-3xl shadow-md w-full max-w-[1163px] mx-auto">
            <div className="text-center">
                <h3 className="text-lg font-bold mb-2">Ders Çalışma Platformu</h3>
                <p className="text-sm text-gray-300">
                    Bu platform akademik başarılarınızı desteklemek için tasarlandı.
                </p>
            </div>
            <div className="flex space-x-4 mt-4">
                <a href="/privacy-policy" className="text-gray-400 hover:text-white transition">
                    Gizlilik Politikası
                </a>
                <a href="/terms" className="text-gray-400 hover:text-white transition">
                    Kullanım Şartları
                </a>
                <a href="/contact" className="text-gray-400 hover:text-white transition">
                    İletisim
                </a>
            </div>
            <div className="mt-6 text-xs text-gray-500">
                &copy; {new Date().getFullYear()} Ders Çalışma Platformu. Tüm hakları saklıdır.
            </div>
        </footer>
    );
};

export default Footer;
