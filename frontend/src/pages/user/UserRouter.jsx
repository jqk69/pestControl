import { Routes, Route, useNavigate ,Navigate} from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useEffect } from 'react';
import UserTemplate from './UserTemplate';
import UserStore from './UserStore';
import UserService from './UserService';
import UserDashboard from './USerDashboard';
import UserServiceDetail from './UserServiceDetail';

export default function UserRouter() {
  const navigate = useNavigate();

    useEffect(()=>{
        const token=sessionStorage.getItem('token')
        if(!token || typeof token !== 'string'){
            sessionStorage.removeItem('token')
            navigate("/login")
        }
        try {
      const decodedToken = jwtDecode(token);
      sessionStorage.setItem('username',decodedToken.name)
      
      if (decodedToken.role !== 'user') {
        sessionStorage.removeItem('token')
        navigate('/login');
      }
    } catch (error) {
      sessionStorage.removeItem('token')
      console.error('Invalid token:', error);
      navigate('/login');
    }
    },[navigate])


  return (
    <Routes>
      <Route path="/" element={<UserTemplate/>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboard/>} />
        <Route path="store" element={<UserStore />} />
        <Route path="services" element={<UserService/>}/>
        <Route path="services/:id" element={<UserServiceDetail/>}/>
      </Route>
    </Routes>
  );
}
