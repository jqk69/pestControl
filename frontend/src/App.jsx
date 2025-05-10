import {BrowserRouter ,Routes, Route } from 'react-router-dom';
import Login from './components/Login';
// import Register from './Register';
import UserRouter from './pages/User/UserRouter';
// import AdminRouter from './pages/Admin/AdminRouter';
// import TechnicianRouter from './pages/Technician/TechnicianRouter';

export default function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      {/* <Route path="/register" element={<Register />} /> */}

      <Route path="/user/*" element={<UserRouter />} />
      {/* <Route path="/admin/*" element={<AdminRouter />} />
      <Route path="/technician/*" element={<TechnicianRouter />} /> */}
    </Routes>
    </BrowserRouter>
    
  );
}