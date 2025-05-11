import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
    const navigate=useNavigate()
    const handleRedirect=(e,path)=>{
        e.preventDefault()
        navigate(path)
    }
  return (
    <div>
        <form>
            <button type="submit" onClick={(e)=>handleRedirect(e,'adminprofile')}>Redirect to Another Page</button>
        </form>
    </div>
  )
}
