import React, {useState, useEffect} from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  // Reset form when component mounts (after logout)
  useEffect(() => {
    setUsername('')
    setPassword('')
    setMsg(null)
    setLoading(false)
  }, [])

  const toggleRole = () => setRole(r => r === 'student' ? 'admin' : 'student')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try{
      const body = { username, password, role }
      const res = await api.post('/api/auth/login', body)
      const { token, role: returnedRole } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('role', returnedRole)
      setMsg(null)
      if (returnedRole === 'admin') nav('/admin/dashboard')
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
          <h2>{role === 'student' ? 'Student' : 'Admin'} Login</h2>
          
          <div className="login-mode">
            <span className="muted">Mode:</span>
            <button type="button" className="btn-secondary btn-sm" onClick={toggleRole}>
              {role === 'student' ? '→ Admin Mode' : '→ Student Mode'}
            </button>
          </div>

          {msg && (
            <div className={`message ${msg.type}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={submit} key={`login-form-${role}`}>
            <div className="form-group">
              <label>Username</label>
              <input 
                type="text"
                placeholder={role === 'student' ? 'e.g., Sreya' : 'e.g., Ankit'}
                value={username} 
                onChange={e=>setUsername(e.target.value)}
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

            <button type="submit" className="btn-primary" disabled={loading || !username || !password}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="muted text-center mt-20" style={{fontSize: 12}}>
            Demo credentials: {role === 'student' ? 'Sreya / 0806' : 'Ankit / 0806'}
          </p>
        </div>
      </div>
    </div>
  )
}

