import React, { useEffect } from 'react'
import { Routes,Route, Navigate, replace, useNavigate } from 'react-router-dom'
import AdminTemplate from './TechnicianTemplate'
import { jwtDecode } from 'jwt-decode'
import TechnicianTemplate from './TechnicianTemplate'
import TechnicianDashboard from './TechnicianDashboard'
import TechnicianAssignedServices from './TechnicianAssignedServices'
import TechnicianLeaveManagement from './TechnicianLeaveManagement'
import TechnicianServiceHistory from './TechnicianServiceHistory'
import TechnicianServiceDetail from './TechnicianServiceDetail'


export default function TechnicianRouter() {
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
      if (decodedToken.role !== 'technician') {
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
        <Route path="/" element={<TechnicianTemplate/>}>
            <Route index element={<Navigate to='dashboard' replace/>}></Route>
            <Route path="dashboard" element={<TechnicianDashboard/>}/>
            <Route path="assigned" element={<TechnicianAssignedServices/>}/>
            <Route path="history" element={<TechnicianServiceHistory/>}/>
            <Route path="leave-management" element={<TechnicianLeaveManagement/>}/>
            <Route path="service/:id" element={<TechnicianServiceDetail/>}/>
        </Route>
    </Routes>
    </>
  )
}
