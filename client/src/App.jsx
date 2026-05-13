import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import VisitorsPage  from './pages/VisitorsPage';
import AddVisitorPage from './pages/AddVisitorPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"    element={<VisitorsPage />} />
        <Route path="/add" element={<AddVisitorPage />} />
        <Route path="*"    element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
