import { Routes, Route, useNavigate ,Navigate} from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useEffect } from 'react';
import UserTemplate from './UserTemplate';
import UserStore from './UserStore';
import UserService from './UserService';
import UserDashboard from './USerDashboard';
import UserServiceDetail from './UserServiceDetail';
import UserSeviceCart from './UserSeviceCart';
import UserPayment from './UserPayment';
import UserCartPage from './UserCartPage';
import UserCheckoutPage from './UserCheckoutPage';
import UserOrders from './UserOrders';
import UserOtherOptions from './UserOtherOptions';
import UserBlog from './UserBlog';
import UserViewBlog from './UserViewBlog';

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
        <Route path="service/payment/:id" element={<UserPayment/>}/>###
        <Route path="service-history" element={<UserSeviceCart/>}/>
        <Route path="cart" element={<UserCartPage/>}/>
        <Route path="cart/checkout" element={<UserCheckoutPage/>}/>
        <Route path="orders" element={<UserOrders/>}/>
        <Route path="other" element={<UserOtherOptions/>}/>
        <Route path="blogs" element={<UserBlog/>}/>
        <Route path="blogs/:id" element={<UserViewBlog/>}/>
      </Route>
    </Routes>
  );
}
