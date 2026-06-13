import React, { useState } from 'react';
import api from '../services/api';

function LoginModal({ onClose }) {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const fazerLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const response = await api.post('/auth/login', {
        login,
        senha,
      });

      if (response.data) {
        localStorage.setItem('adminLogado', 'true');
        onClose();
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setErro('Login ou senha inválidos.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Login Administrativo</h2>

        <form onSubmit={fazerLogin}>
          <div className="form-group">
            <label>Login</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Digite seu login"
              required
            />
          </div>

          <div className="form-group" style={{ marginTop: '14px' }}>
            <label>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </div>

          {erro && (
            <p style={{ color: '#dc3545', marginTop: '14px', fontWeight: '600' }}>
              {erro}
            </p>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>

            <button type="submit" className="btn-primary" disabled={carregando}>
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;