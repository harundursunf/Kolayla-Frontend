import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../Services/authService";

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
    try {
      await register(form);
      navigate("/login"); // Kayıt sonrası giriş ekranına yönlendirme
    } catch (err) {
      setError(err.response?.data?.message || "Kayıt olurken hata oluştu.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg"
      >
        <h2
          className={`text-3xl font-extrabold text-center text-green-900 ${customFontClass}`}
        >
          Kayıt Ol
        </h2>

        <div className="h-1.5 w-20 bg-green-600 mx-auto rounded-full mt-2 mb-10"></div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-6">{error}</p>
        )}

        <input
          type="text"
          name="username"
          placeholder="Kullanıcı Adı"
          value={form.username}
          onChange={handleChange}
          className="w-full p-4 bg-gray-50 border-b-2 border-gray-300 rounded-md focus:outline-none focus:border-green-600 transition duration-200 mb-6 placeholder-gray-500"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="E-posta"
          value={form.email}
          onChange={handleChange}
          className="w-full p-4 bg-gray-50 border-b-2 border-gray-300 rounded-md focus:outline-none focus:border-green-600 transition duration-200 mb-6 placeholder-gray-500"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Şifre"
          value={form.password}
          onChange={handleChange}
          className="w-full p-4 bg-gray-50 border-b-2 border-gray-300 rounded-md focus:outline-none focus:border-green-600 transition duration-200 mb-8 placeholder-gray-500"
          required
        />

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white text-xl font-semibold py-4 rounded-lg shadow-lg hover:from-green-700 hover:to-green-800 hover:shadow-xl hover:-translate-y-1 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Kayıt Ol
        </button>

        <p className="mt-10 text-sm text-center text-gray-700">
          Zaten bir hesabın var mı?{" "}
          <Link
            to="/login"
            className="text-green-800 hover:underline hover:text-green-900 transition duration-200"
          >
            Giriş Yap
          </Link>
        </p>
      </form>
    </div>
  );
}
