import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Cards } from './pages/Cards';
import { Movements } from './pages/Movements';
import { getUsers } from './services/data';
import { Usuario } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tarjetas' | 'movimientos'>('dashboard');
  const [users, setUsers] = useState<Usuario[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then(data => {
        setUsers(data);
        if (data.length > 0) setCurrentUserId(data[0].id_usuario);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const currentUser = users.find(u => u.id_usuario === currentUserId) || users[0];

  if (loading) return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  if (!currentUser) return <div className="flex h-screen items-center justify-center">No hay usuarios disponibles</div>;

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && (
        <Dashboard
          currentUser={currentUser}
          users={users}
          onUserChange={setCurrentUserId}
        />
      )}
      {activeTab === 'tarjetas' && (
        <Cards currentUser={currentUser} />
      )}
      {activeTab === 'movimientos' && (
        <Movements currentUser={currentUser} />
      )}
    </Layout>
  );
}

export default App;
