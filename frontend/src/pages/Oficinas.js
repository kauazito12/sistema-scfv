import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Oficinas() {
  const [oficinas, setOficinas] = useState([]);

  useEffect(() => {
    buscarOficinas();
  }, []);

  const buscarOficinas = async () => {
    try {
      const response = await api.get('/oficinas');
      setOficinas(response.data);
    } catch (error) {
      console.error('Erro ao buscar oficinas:', error);
      alert('Erro ao buscar oficinas.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Oficinas Disponíveis</h2>
        <p>Confira abaixo as oficinas cadastradas no sistema.</p>
      </div>

      <div className="oficinas-grid">
        {oficinas.length > 0 ? (
          oficinas.map((oficina) => (
            <div key={oficina.id} className="oficina-card">
              <h3>{oficina.nome}</h3>
              <p>{oficina.descricao}</p>

              <div className="oficina-info">
                <strong>Responsável:</strong> {oficina.responsavel}
              </div>

              <div className="oficina-info">
                <strong>Dia:</strong> {oficina.dia_semana}
              </div>

              <div className="oficina-info">
                <strong>Horário:</strong> {oficina.horario}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-card-message">Nenhuma oficina cadastrada.</div>
        )}
      </div>
    </div>
  );
}

export default Oficinas;