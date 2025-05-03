import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../Services/authService";

const customFontClass = "font-poppins";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form);
      console.log("Login Response:", res);

      // Token'ı localStorage'a kaydet
      localStorage.setItem("token", res.accessToken);

      // Token'ı kontrol et
      const token = localStorage.getItem("token");
      console.log("Token:", token);

      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Giriş başarısız.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg"
      >
        <h2
          className={`text-3xl font-extrabold text-center text-gray-800 ${customFontClass}`}
        >
          Giriş Yap
        </h2>

        <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full mt-2 mb-10"></div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-6">{error}</p>
        )}

        <input
          type="email"
          name="email"
          placeholder="E-posta"
          value={form.email}
          onChange={handleChange}
          className="w-full p-4 bg-gray-50 border-b-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-600 transition duration-200 mb-6 placeholder-gray-500"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Şifre"
          value={form.password}
          onChange={handleChange}
          className="w-full p-4 bg-gray-50 border-b-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-600 transition duration-200 mb-8 placeholder-gray-500"
          required
        />

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-semibold py-4 rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:-translate-y-1 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Giriş Yap
        </button>

        <p className="mt-10 text-sm text-center text-gray-700">
          Hesabın yok mu?{" "}
          <Link
            to="/register"
            className="text-blue-800 hover:underline hover:text-blue-900 transition duration-200"
          >
            Kayıt Ol
          </Link>
        </p>
      </form>
    </div>
  );
}
