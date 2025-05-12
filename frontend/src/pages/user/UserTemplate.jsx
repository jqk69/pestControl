import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

export default function UserTemplate() {
    const navigate=useNavigate()
    useEffect(()=>{
        const token=localStorage.getItem('token')
        if(!token || typeof token !== 'string'){
            navigate("/login")
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
    },[navigate])

    const handleLogout=(e)=>{
        localStorage.removeItem('token');

    }
  return (
    <>
        
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white text-black p-6 font-bold">
        <h1 className="font-bold mb-8 mt-5 text-5xl ">Pestilee</h1>
        
        <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
        <nav className="space-y-3">
          <a href="#" className="block py-2 px-3 rounded hover:bg-gray-100 transition">Home</a>
          <a href="#" className="block py-2 px-3 rounded hover:bg-gray-100 transition">Profile</a>
          <a href="#" className="block py-2 px-3 rounded hover:bg-gray-100 transition">Services</a>
          <a href="#" className="block py-2 px-3 rounded hover:bg-gray-100 transition">Store</a>
          <a href="#" className="block py-2 px-3 rounded hover:bg-gray-100 transition"onClick={handleLogout}>Log Out</a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm">
  <div className="flex items-center justify-between px-6 py-4">
    <div className="flex items-center space-x-4 h-15">
      <button className="text-gray-500 focus:outline-none lg:hidden">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
    </div>
    
    <div className="flex items-center space-x-6">
      {/* New Navigation Links */}
      <div className="flex space-x-6 text-gray-700 font-medium">
        <a href="#" className="hover:text-gray-900">Store</a>
        <a href="#" className="hover:text-gray-900">Services</a>
        <a href="#" className="hover:text-gray-900">Profile</a>
      </div>

      {/* Existing Icons */}
      <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>
      
      {/* Profile */}
            <div className="relative">
                <button className="flex items-center focus:outline-none">
                <img 
                    className="h-8 w-8 rounded-full object-cover" 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="User profile"
                />
                <span className="ml-2 text-gray-700">Username</span>
                <svg className="ml-1 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
                </button>
            </div>
            </div>
        </div>
        </header>


       <Outlet/>
        
      </div>
    </div>
    </>
  )
}
