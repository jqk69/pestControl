import {BrowserRouter ,Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
// import Register from './Register';
import UserRouter from './pages/user/UserRouter';
import AdminRouter from './pages/admin/AdminRouter';
// import TechnicianRouter from './pages/Technician/TechnicianRouter';

export default function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace/>} />
      <Route path="/login" element={<Login />} />
      {/* <Route path="/register" element={<Register />} /> */}

      <Route path="/user/*" element={<UserRouter />} />
      <Route path="/admin/*" element={<AdminRouter />} />
      {/* <Route path="/technician/*" element={<TechnicianRouter />} /> */}
    </Routes>
    </BrowserRouter>
    
  );
}