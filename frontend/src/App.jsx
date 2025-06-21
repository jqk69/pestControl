import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

import Login from './components/Login';
import Register from './components/Register';
import UserRouter from './pages/user/UserRouter';
import AdminRouter from './pages/admin/AdminRouter';
import Home from './home';
import TechnicianRouter from './pages/technicican/TechnicianRouter'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/user/*" element={<UserRouter />} />
        <Route path="/admin/*" element={<AdminRouter />} />
        <Route path="/yo" element={<Home/>} />
        <Route path="/technician/*" element={<TechnicianRouter />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </BrowserRouter>
  );
}
