import React, {useState, useEffect} from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  // Reset form when component mounts (after logout)
  useEffect(() => {
    setUsernameOrEmail('')
    setPassword('')
    setMsg(null)
    setLoading(false)
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try{
      const body = { usernameOrEmail, password }
      const res = await api.post('/api/auth/login', body)
      const { token, role: returnedRole, userId } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('role', returnedRole)
      if (userId) localStorage.setItem('userId', userId)
      setMsg(null)
      if (returnedRole === 'admin') nav('/admin')
      else nav('/student/dashboard')
    }catch(e){
      setMsg({ type: 'error', text: e.response?.data?.message || 'Login failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-left">
        <h1>Learn & Grow</h1>
        <p>Master new skills with our comprehensive training platform. Access courses designed for professional development.</p>
      </div>
      
      <div className="login-right">
        <div className="login-form">
          <h2>Login</h2>

          {msg && (
            <div className={`message ${msg.type}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={submit}>
            <div className="form-group">
              <label>Username or Email</label>
              <input 
                type="text"
                placeholder="username or email"
                value={usernameOrEmail} 
                onChange={e=>setUsernameOrEmail(e.target.value)}
                disabled={loading}
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input 
                type="password"
                placeholder="Enter password"
                value={password} 
                onChange={e=>setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading || !usernameOrEmail || !password}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}

