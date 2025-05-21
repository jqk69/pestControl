import React, { useEffect } from 'react'
import { Routes,Route, Navigate, replace, useNavigate } from 'react-router-dom'
import AdminDashboard from './AdminDashboard'
import AdminTemplate from './AdminTemplate'
import { jwtDecode } from 'jwt-decode'
import AdminStore from './AdminStore'
import AdminServices from './AdminServices'
import AdminProfile from './AdminProfile'
import AdminUserProfile from './AdminUserProfile'
import AdminEditProduct from './AdminEditProduct'
import AdminAddProduct from './AdminAddProduct'
import AdminAddService from './AdminAddService'
import AdminEditService from './AdminEditService'


export default function AdminRouter() {
  const navigate=useNavigate()
    useEffect(()=>{
        const token=sessionStorage.getItem('token')
        if(!token || typeof token !== 'string'){
          sessionStorage.removeItem('token')
            navigate("/login")
        }
        try {
      const decodedToken = jwtDecode(token);
      sessionStorage.setItem('username',decodedToken.name)
      if (decodedToken.role !== 'admin') {
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
    <>
    <Routes>
        <Route path="/" element={<AdminTemplate/>}>
          <Route index element={<Navigate to='dashboard' replace/>}></Route>
          <Route path='dashboard' element={<AdminDashboard/>}></Route>
          <Route path='store' element={<AdminStore/>}></Route>
          <Route path='services' element={<AdminServices/>}></Route>
          <Route path='services/add_service' element={<AdminAddService/>}></Route>
          <Route path='profile' element={<AdminProfile/>}></Route>
          <Route path="dashboard/users/:userId" element={<AdminUserProfile/>} />
          <Route path="store/edit_product/:productId" element={<AdminEditProduct/>} />
          <Route path="store/add_product" element={<AdminAddProduct/>} />
          <Route path="services/edit_service/:id" element={<AdminEditService/>}/>
        </Route>
    </Routes>
    </>
  )
}
