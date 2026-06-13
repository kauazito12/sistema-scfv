import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';

function Navbar() {
  const [adminLogado, setAdminLogado] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [abrirMenuFrequencia, setAbrirMenuFrequencia] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const admin = localStorage.getItem('adminLogado');
    setAdminLogado(!!admin);
  }, []);

  const abrirModal = () => {
    setMostrarModal(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);

    const admin = localStorage.getItem('adminLogado');
    const logado = !!admin;

    setAdminLogado(logado);

    if (logado) {
      navigate('/admin');
    }
  };

  const sair = () => {
    localStorage.removeItem('adminLogado');
    setAdminLogado(false);
    setAbrirMenuFrequencia(false);
    navigate('/');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">SCFV</div>

        <div className="navbar-links">
          <Link to="/">Início</Link>
          <Link to="/oficinas">Oficinas</Link>

          {!adminLogado ? (
            <button type="button" className="nav-admin-btn" onClick={abrirModal}>
              Login
            </button>
          ) : (
            <>
              <Link to="/admin">Painel Admin</Link>
              <Link to="/admin/alunos">Participantes</Link>

              <div className="navbar-dropdown">
                <button
                  type="button"
                  className="navbar-dropdown-btn"
                  onClick={() => setAbrirMenuFrequencia(!abrirMenuFrequencia)}
                >
                  Frequência ▾
                </button>

                {abrirMenuFrequencia && (
                  <div className="navbar-dropdown-menu">
                    <Link
                      to="/frequencia"
                      onClick={() => setAbrirMenuFrequencia(false)}
                    >
                      Lançar Frequência
                    </Link>

                    <Link
                      to="/relatorio-frequencia"
                      onClick={() => setAbrirMenuFrequencia(false)}
                    >
                      Relatório
                    </Link>
                  </div>
                )}
              </div>

              <button type="button" className="nav-sair-btn" onClick={sair}>
                Sair
              </button>
            </>
          )}
        </div>
      </nav>

      {mostrarModal && <LoginModal onClose={fecharModal} />}
    </>
  );
}

export default Navbar;