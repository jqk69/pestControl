import React, { useEffect } from 'react'
import { Routes,Route, Navigate, replace, useNavigate } from 'react-router-dom'
import AdminDashboard from './AdminDashboard'
import AdminTemplate from './AdminTemplate'
import { jwtDecode } from 'jwt-decode'


export default function AdminRouter() {
  const navigate=useNavigate()
    useEffect(()=>{
        const token=localStorage.getItem('token')
        if(!token || typeof token !== 'string'){
            navigate("/login")
        }
        try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.role !== 'admin') {
        navigate('/login');
      }
    } catch (error) {
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
        </Route>
    </Routes>
    </>
  )
}
