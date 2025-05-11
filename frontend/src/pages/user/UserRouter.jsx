import { Routes, Route, useNavigate } from 'react-router-dom';
import UserDashboard from './UserDashboard';
import { jwtDecode } from 'jwt-decode';
import { useEffect } from 'react';

export default function UserRouter() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      console.log(decodedToken);

      if (decodedToken.role !== 'user') {
        navigate('/login');
      }
    } catch (error) {
      console.error('Invalid token:', error);
      navigate('/login');
    }
  }, [token, navigate]);

  return (
    <Routes>
      <Route path="/" element={<UserDashboard />} />
    </Routes>
  );
}
