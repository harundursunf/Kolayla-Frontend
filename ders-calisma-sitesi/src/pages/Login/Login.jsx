import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleLogin = (e) => {
    e.preventDefault();

  };

  const onFinish = async (values) => {
    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        body: JSON.stringify(values),
        headers: { "Content-type": "application/json; charset=UTF-8" },
      });
      const data = await res.json();
      if (res.status === 200 || res.status === 201) {
        const token = data.token;
        localStorage.setItem("authToken", token);
        navigate("/");
      }
      else {
        alert("Kullanıcı adi veya şifre hatalı!");
      }
    } catch (error) {
      console.log(error);
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Giriş Yap</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="E-posta adresinizi girin"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Şifrenizi girin"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-700 text-white py-2 rounded-md hover:bg-red-600 transition"
            onClick={() => onFinish({ email, password })}
          >
            Giriş Yap
          </button>
          <p className="mt-4 text-center">
            Zaten hesabınız mı var?{' '}
            <a href="/signup" className="text-red-500 hover:underline">
              Kayıt Ol
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
