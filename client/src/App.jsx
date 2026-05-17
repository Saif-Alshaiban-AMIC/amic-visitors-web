import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import VisitorsPage   from './pages/VisitorsPage';
import AddVisitorPage from './pages/AddVisitorPage';
import LoginPage      from './pages/LoginPage';
import { getMe, logout } from './api/auth';

// Public guest form — no auth needed
function GuestRoute() {
  return <AddVisitorPage />;
}

// Protected admin dashboard — checks session on mount
function AdminRoute() {
  const [authed,   setAuthed]   = useState(null);

  useEffect(() => {
    getMe()
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) return null; // brief blank while checking

  if (!authed) return <LoginPage onLogin={() => setAuthed(true)} />;

  return (
    <VisitorsPage
      onLogout={async () => { await logout(); setAuthed(false); }}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"      element={<GuestRoute />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="*"      element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
