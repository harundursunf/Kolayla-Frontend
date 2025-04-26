import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';

import Pomodoro from './pages/LessonManagement/Pomodoro';
import Personal from './pages/AllDay/Targets';
import Notlarım from './pages/LessonManagement/Note';

import GunlukSoz from './pages/AllDay/MotivationQuote';
import Tyt from './pages/TYT/Tyt';
import TytMat from './pages/TYT/TytMat';
import TytTurkce from './pages/TYT/TytTurkce';
import AytMat from './pages/AYT/AytMat';
import AytTur from './pages/AYT/AytTur';
import Login from './pages/Login/Login'; // Login sayfası
import SignUp from './pages/Login/SignUp'; // Signup sayfası  
import Netlerim from './pages/LessonManagement/ScoreCalculator'; // Uni sayfası buraya import edildi
import Bilgiler from './pages/AllDay/Information';
import AytKonular from './pages/AYT/Ayt';
import './index.css';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />


        <Route
          path="/pomodoro"
          element={
            <MainLayout>
              <Pomodoro />
            </MainLayout>
          }
        />
        <Route
          path="/personal"
          element={
            <MainLayout>
              <Personal />
            </MainLayout>
          }
        />

        <Route
          path="/gunlukSoz"
          element={
            <MainLayout>
              <GunlukSoz />
            </MainLayout>
          }
        />
        <Route
          path="/bilgiler"
          element={
            <MainLayout>
              <Bilgiler />
            </MainLayout>
          }
        />
        <Route
          path="/tyt"
          element={
            <MainLayout>
              <Tyt />
            </MainLayout>
          }
        />
        <Route
          path="/tytMat"
          element={
            <MainLayout>
              <TytMat />
            </MainLayout>
          }
        />
        <Route
          path="/tytTurkce"
          element={
            <MainLayout>
              <TytTurkce />
            </MainLayout>
          }
        />
        <Route
          path="/ayt"
          element={
            <MainLayout>
              <AytKonular />
            </MainLayout>
          }
        />
        <Route
          path="/AytMat"
          element={
            <MainLayout>
              <AytMat />
            </MainLayout>
          }
        />
        <Route
          path="/AytTur"
          element={
            <MainLayout>
              <AytTur />
            </MainLayout>
          }
        />

        {/* Hayallerim altında Uni seçeneği */}

        <Route
          path="/hayallerim/notlarım"
          element={
            <MainLayout>
              <Notlarım />
            </MainLayout>
          }
        />
        <Route
          path="/hayallerim/netlerim"
          element={
            <MainLayout>
              <Netlerim />
            </MainLayout>
          }
        />

        {/* Layout Olmayan Sayfalar */}
        <Route path="pages/Login/login" element={<Login />} />
        <Route path="pages/Login/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
};

export default App;
