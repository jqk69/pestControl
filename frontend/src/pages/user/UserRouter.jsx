import { Routes, Route, useNavigate ,Navigate} from 'react-router-dom';
import UserDashboard from './UserDashboard';
import { jwtDecode } from 'jwt-decode';
import { useEffect } from 'react';
import UserTemplate from './UserTemplate';
import UserStore from './UserStore';

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
      <Route path="/" element={<UserTemplate/>}>
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="store" element={<UserStore />} />
      </Route>
    </Routes>
  );
}
