import React, { useState } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'


export default function Login() {
  const [username,setUsername]=useState("")
  const [password,setPassword]=useState("")
  const navigate=useNavigate()
  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post('http://127.0.0.1:5000/auth/login', {
      username,
      password,
    });
    console.log(response.data.token);
    const token = response.data.token;
    localStorage.setItem('token', token);

    const decodedToken = jwtDecode(token);
    const role = decodedToken.role;
    if (role === 'admin') {
      navigate('/admin/');
    } else if (role === 'technician') {
      navigate('/technician/');
    } else {
      navigate('/user/');
    }
  } catch (error) {
    console.error('Login failed:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }
  }
};

    return (
    <>
        <div>
        <form onSubmit={handleSubmit}>
            <input onChange={(e)=>{setUsername(e.target.value)}} type="text" name="username" value={username} />
            <input onChange={(e)=>{setPassword(e.target.value)}}type="text" name="password" value={password} />
            <input type="submit" value="Submit" />
        </form>
        </div>
    </>
  )
}
