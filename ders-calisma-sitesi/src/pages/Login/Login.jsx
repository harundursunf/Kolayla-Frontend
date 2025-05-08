import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../Services/authService";
import { motion } from "framer-motion";
import { FaBookReader, FaArrowRight } from 'react-icons/fa';

const customFontClass = "font-poppins";
const logoPath = "/logo3.png";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login(form);
      localStorage.setItem("token", res.accessToken);
      navigate("/profile");
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
    }
  };

  return (
    <div className={`bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 min-h-screen flex flex-col md:flex-row items-center justify-center p-4 ${customFontClass}`}>

      {/* Sol Bölüm - Giriş Formu */}
      <motion.div
        className="w-full md:w-1/2 max-w-md p-8 md:p-10 bg-white rounded-2xl shadow-2xl border border-gray-200 md:mr-8 mb-8 md:mb-0"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mb-4">
           Giriş Yap
        </h2>

        <div className="h-1.5 w-16 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-8"></div>

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

        <form onSubmit={handleSubmit}>
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
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out placeholder-gray-500 text-gray-800 text-base"
              required
            />
          </div>

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
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out placeholder-gray-500 text-gray-800 text-base"
              required
            />
          </div>

          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold py-3 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 hover:shadow-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaBookReader className="text-white text-xl" /> <span>Giriş Yap</span>
          </motion.button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-700">
          Hesabın yok mu?{" "}
          <Link
            to="/register"
            className="text-purple-700 hover:underline hover:text-purple-900 font-semibold transition duration-200 ease-in-out"
          >
            Kayıt Ol
          </Link>
        </p>
      </motion.div>

      {/* Sağ Bölüm - Motivasyon Alanı */}
      <motion.div
        className="w-full md:w-1/2 max-w-md md:max-w-none flex flex-col items-center justify-center p-8 md:p-10 bg-white bg-opacity-50 rounded-2xl shadow-2xl text-center border border-gray-200 backdrop-filter backdrop-blur-sm"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      >
        {/* Logo Resmi */}
        <motion.img
          src={logoPath}
          alt="Kolayla Logo"
          className="w-32 h-32 md:w-40 md:h-40 mb-6 drop-shadow-lg rounded-full border-4 border-purple-400 hover:scale-105 transition-transform duration-300 object-contain"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        {/* Kolayla Marka Başlığı */}
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-3 drop-shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Kolayla</span>
        </motion.h2>

        {/* Ana Motivasyon Yazısı */}
        <motion.p
          className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight mb-3 drop-shadow-md text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Öğrenmek Artık Çok Kolay!
        </motion.p>

        {/* Ek Alt Mesaj */}
        <motion.p
          className="text-base md:text-lg font-semibold text-gray-700 leading-relaxed drop-shadow-sm italic"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          Başarıya Giden Yolda İlk Adımını At.
        </motion.p>

        {/* Hareketli Ok */}
        <motion.div
          className="mt-8 text-purple-800 text-4xl"
          animate={{ x: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <FaArrowRight />
        </motion.div>
      </motion.div>
    </div>
  );
}