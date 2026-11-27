import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminCourts from './pages/AdminCourts/AdminCourts';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/courts" replace />} />
        <Route path="/admin/courts" element={<AdminCourts />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;