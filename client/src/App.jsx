import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import VisitorsPage   from './pages/VisitorsPage';
import AddVisitorPage from './pages/AddVisitorPage';
import LoginPage      from './pages/LoginPage';
import { getMe, logout } from './api/auth';

export default function App() {
  const [authed, setAuthed]   = useState(null); // null = loading
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getMe()
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false))
      .finally(() => setChecking(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    setAuthed(false);
  };

  if (checking) return null; // brief blank while checking session

  if (!authed) return <LoginPage onLogin={() => setAuthed(true)} />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"    element={<VisitorsPage onLogout={handleLogout} />} />
        <Route path="/add" element={<AddVisitorPage />} />
        <Route path="*"    element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
