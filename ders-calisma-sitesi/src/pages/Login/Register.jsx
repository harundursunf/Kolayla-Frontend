import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../Services/authService";
import { motion } from "framer-motion";
import { FaPencilAlt, FaUserPlus } from 'react-icons/fa';
import { FaSeedling } from 'react-icons/fa'; 

const customFontClass = "font-poppins";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      console.log("Registration successful");
      // Başarılı kayıttan sonra kullanıcıya bilgi göstermek için
      // bir state veya modal kullanabilirsiniz. Şimdilik direkt login'e yönlendiriyorum.
      navigate("/login");
    } catch (err) {
      console.error("Registration Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Kayıt olurken hata oluştu. Lütfen bilgilerinizi kontrol edin.");
    }
  };

  return (
    // Arka plan gradienti ve genel düzen - Flex Container
    <div className={`bg-gradient-to-br from-green-100 via-teal-100 to-blue-100 min-h-screen flex flex-col md:flex-row items-center justify-center p-4 ${customFontClass}`}>
      {/* Sol Bölüm - Kayıt Formu */}
      <motion.div
        className="w-full md:w-1/2 max-w-md p-8 md:p-10 bg-white rounded-2xl shadow-2xl border border-gray-200 md:mr-8 mb-8 md:mb-0" // Sağda boşluk bırak, küçük ekranlarda altta
        initial={{ opacity: 0, x: -50 }} // Soldan gelme animasyonu
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Başlık - Kayıt Ol */}
        <h2
          className={`text-3xl md:text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 flex items-center justify-center mb-4`}
        >
          <FaPencilAlt className="mr-3 text-green-500" /> Kayıt Ol
        </h2>

        {/* Alt çizgi */}
        <div className="h-1.5 w-16 bg-gradient-to-r from-green-500 to-teal-500 mx-auto rounded-full mb-8"></div>

        {/* Hata Mesajı */}
        {error && (
          <motion.p
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center mb-6 shadow-md text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {error}
          </motion.p>
        )}

        {/* Kayıt Formu */}
        <form onSubmit={handleSubmit}>
          {/* Kullanıcı Adı Input */}
          <div className="mb-5">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="username">
              Kullanıcı Adı
            </label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Kullanıcı Adınız"
              value={form.username}
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 ease-in-out placeholder-gray-500 text-gray-800 text-base"
              required
            />
          </div>

          {/* E-posta Input */}
          <div className="mb-5">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
              E-posta Adresi
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="ornek@email.com"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 ease-in-out placeholder-gray-500 text-gray-800 text-base"
              required
            />
          </div>

          {/* Şifre Input */}
          <div className="mb-7">
             <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
               Şifre
             </label>
             <input
               id="password"
               type="password"
               name="password"
               placeholder="Şifreniz"
               value={form.password}
               onChange={handleChange}
               className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 ease-in-out placeholder-gray-500 text-gray-800 text-base"
               required
             />
           </div>

          {/* Kayıt Ol Butonu */}
          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white text-lg font-bold py-3 rounded-lg shadow-lg hover:from-green-600 hover:to-teal-700 hover:shadow-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
             <FaUserPlus className="text-white text-xl" /> <span>Kayıt Ol</span>
          </motion.button>
        </form>

        {/* Giriş Yap Linki */}
        <p className="mt-6 text-sm text-center text-gray-700">
          Zaten bir hesabın var mı?{" "}
          <Link
            to="/login"
            className="text-teal-700 hover:underline hover:text-teal-900 font-semibold transition duration-200 ease-in-out"
          >
            Giriş Yap
          </Link>
        </p>
      </motion.div>

      {/* Sağ Bölüm - Motivasyon Yazısı / Marka Alanı */}
      <motion.div
         className="w-full md:w-1/2 max-w-md md:max-w-none flex flex-col items-center justify-center p-8 md:p-10 bg-white bg-opacity-50 rounded-2xl shadow-2xl text-center border border-gray-200 backdrop-filter backdrop-blur-sm" // Yarı saydam arka plan ve blur efekti
         initial={{ opacity: 0, x: 50 }} // Sağdan gelme animasyonu
         animate={{ opacity: 1, x: 0 }}
         transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }} // Hafif gecikme
      >
         <FaSeedling className="text-6xl md:text-7xl text-green-700 mb-6 drop-shadow-lg" /> {/* Büyüme/Öğrenme ikonu */}
         <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4 drop-shadow-lg"> {/* Başlık */}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-700">Kolayla</span>
         </h2>
         <p className="text-xl md:text-2xl font-semibold text-gray-700 leading-relaxed drop-shadow-md"> {/* Motivasyon Yazısı */}
            Kolayla'ya Katıl,
            <br />
            Öğrenmek Artık Çok Kolay!
         </p>
         <motion.p
            className="mt-6 text-teal-800 text-lg italic" // Ek alt mesaj
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
         >
            Hayallerindeki Başarıya Bir Adım Daha Yakınsın.
         </motion.p>
      </motion.div>
    </div>
  );
}