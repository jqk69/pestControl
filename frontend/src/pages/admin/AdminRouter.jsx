import React from 'react'
import { Routes,Route } from 'react-router-dom'
import AdminDashboard from './AdminDashboard'
import AdminProfile from './AdminProfile'

export default function AdminRouter() {
  return (
    <>
    <Routes>
        <Route path="/" element={<AdminDashboard/>}></Route>
        <Route path="adminprofile" element={<AdminProfile/>}></Route>
    </Routes>
    </>
  )
}
