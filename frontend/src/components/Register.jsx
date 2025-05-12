import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import leaf from '../static/leaves.jpeg'

export default function Register() {
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const[phone,setPhone]=useState("")
  const navigate = useNavigate()

  const handleRedirect = (page) => {
    navigate(page)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://127.0.0.1:5000/auth/register', {
        name,
        username,
        email,
        password,
        phone
      })
      console.log(response.data)
      alert('Registered Successfully')
      navigate('/login') // Redirect to login page after successful registration
    } catch (error) {
      console.error('Registration failed:', error)
      if (error.response) {
        alert(error.response.data.message)
      }
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-xl w-11/12 max-w-md rounded-2xl relative">
        <form onSubmit={handleSubmit} className="space-y-6">
          <img
            src={leaf}
            alt="Leaf"
            className="absolute -top-4 -left-4 w-12 h-12 opacity-80 ml-3.5 mt-3.5 rounded-l-2xl"
          />
          <table className="w-full">
            <tbody>
              <tr>
                <td colSpan="2" className="text-center py-4">
                  <h1 className="text-3xl font-bold text-gray-800">Register</h1>
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4">
                  <label htmlFor="name" className="text-gray-700 font-medium">Name:</label>
                </td>
                <td className="py-4 px-4">
                  <input
                    id="name"
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    name="name"
                    value={name}
                    className="p-2 rounded-md w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Full Name"
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4">
                  <label htmlFor="username" className="text-gray-700 font-medium">Username:</label>
                </td>
                <td className="py-4 px-4">
                  <input
                    id="username"
                    onChange={(e) => setUsername(e.target.value)}
                    type="text"
                    name="username"
                    value={username}
                    className="p-2 rounded-md w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Username"
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4">
                  <label htmlFor="email" className="text-gray-700 font-medium">Email:</label>
                </td>
                <td className="py-4 px-4">
                  <input
                    id="email"
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    name="email"
                    value={email}
                    className="p-2 rounded-md w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Email"
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4">
                  <label htmlFor="phone" className="text-gray-700 font-medium">Phone:</label>
                </td>
                <td className="py-4 px-4">
                  <input
                    id="phone"
                    onChange={(e) => setPhone(e.target.value)}
                    type="phone"
                    name="phone"
                    value={phone}
                    className="p-2 rounded-md w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="phone"
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4">
                  <label htmlFor="password" className="text-gray-700 font-medium">Password:</label>
                </td>
                <td className="py-4 px-4">
                  <input
                    id="password"
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    name="password"
                    value={password}
                    className="p-2 rounded-md w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Password"
                    required
                  />
                </td>
              </tr>
              <tr>
                <td colSpan="2" className="text-center pt-10">
                  <input
                    type="submit"
                    value="Register"
                    className="bg-black text-white p-2 rounded-md cursor-pointer w-40 hover:bg-gray-700 transition-colors"
                  />
                </td>
              </tr>
              <tr>
                <td colSpan="2" className="text-center py-4">
                  <span 
                    className="cursor-pointer text-blue-500 hover:underline"
                    onClick={() => handleRedirect('/login')}
                  >
                    Already have an account? Log In
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    </div>
  )
}
