import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // ✅ Navigate eklendi
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import Pomodoro from './pages/LessonManagement/Pomodoro';
import Personal from './pages/AllDay/Targets';
import Notlarım from './pages/LessonManagement/Note';
import GunlukSoz from './pages/AllDay/Quote';
import Tyt from './pages/TYT/Tyt';
import TytMat from './pages/TYT/TytMat';
import TytTurkce from './pages/TYT/TytTurkce';
import AytMat from './pages/AYT/AytFizik';
import AytTur from './pages/AYT/AytTur';
import Login from './pages/Login/Login';
import SignUp from './pages/Login/Register';
import Netlerim from './pages/LessonManagement/ScoreCalculator';
import Bilgiler from './pages/AllDay/Fact';
import AytKonular from './pages/AYT/Ayt';
import Profile from './pages/Profile';
import './index.css';
import Register from './pages/Login/Register';

const App = () => {
    return (
        <Router>
            <Routes>

                {/* ✅ Sayfa açıldığında login sayfasına yönlendir */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route
                    path="/home"
                    element={
                        <MainLayout>
                            <Home />
                        </MainLayout>
                    }
                />
                <Route path="/pomodoro" element={<MainLayout><Pomodoro /></MainLayout>} />
                <Route path="/hedef" element={<MainLayout><Personal /></MainLayout>} />
                <Route path="/gunlukSoz" element={<MainLayout><GunlukSoz /></MainLayout>} />
                <Route path="/bilgiler" element={<MainLayout><Bilgiler /></MainLayout>} />
                <Route path="/tyt" element={<MainLayout><Tyt /></MainLayout>} />
                <Route path="/tytMat" element={<MainLayout><TytMat /></MainLayout>} />
                <Route path="/tytTurkce" element={<MainLayout><TytTurkce /></MainLayout>} />
                <Route path="/ayt" element={<MainLayout><AytKonular /></MainLayout>} />
                <Route path="/AytMat" element={<MainLayout><AytMat /></MainLayout>} />
                <Route path="/AytTur" element={<MainLayout><AytTur /></MainLayout>} />
                <Route path="/Notlar" element={<MainLayout><Notlarım /></MainLayout>} />
                <Route path="/hayallerim/netlerim" element={<MainLayout><Netlerim /></MainLayout>} />
                <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />

                {/* ✅ Login ve Signup sayfaları */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

            </Routes>
        </Router>
    );
};

export default App;
