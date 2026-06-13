import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/main.css';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Oficinas from './pages/Oficinas';
import AdminDashboard from './pages/AdminDashboard';
import Alunos from './pages/Alunos';
import Frequencia from './pages/Frequencia';
import RelatorioFrequencia from './pages/RelatorioFrequencia';

const TEMPO_INATIVIDADE = 15 * 60 * 1000; // 15 minutos

function RotaProtegida({ children }) {
  const adminLogado = localStorage.getItem('adminLogado');

  if (!adminLogado) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  useEffect(() => {
    let timeout;

    const deslogarPorInatividade = () => {
      localStorage.removeItem('adminLogado');
      alert('Sessão encerrada por inatividade.');
      window.location.href = '/';
    };

    const resetarTimer = () => {
      clearTimeout(timeout);

      const adminLogado = localStorage.getItem('adminLogado');

      if (adminLogado) {
        timeout = setTimeout(deslogarPorInatividade, TEMPO_INATIVIDADE);
      }
    };

    const eventos = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];

    eventos.forEach((evento) => {
      window.addEventListener(evento, resetarTimer);
    });

    resetarTimer();

    return () => {
      clearTimeout(timeout);

      eventos.forEach((evento) => {
        window.removeEventListener(evento, resetarTimer);
      });
    };
  }, []);

  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/oficinas" element={<Oficinas />} />

        <Route
          path="/admin"
          element={
            <RotaProtegida>
              <AdminDashboard />
            </RotaProtegida>
          }
        />

        <Route
          path="/admin/alunos"
          element={
            <RotaProtegida>
              <Alunos />
            </RotaProtegida>
          }
        />

        <Route
          path="/frequencia"
          element={
            <RotaProtegida>
              <Frequencia />
            </RotaProtegida>
          }
        />

        <Route
          path="/relatorio-frequencia"
          element={
            <RotaProtegida>
              <RelatorioFrequencia />
            </RotaProtegida>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;