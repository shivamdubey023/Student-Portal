import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'

export default function StudentCourses(){
  const nav = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await api.get('/api/student/courses')
        setCourses(res.data.courses || [])
      } catch (e) {
        setMsg({ type: 'error', text: e.response?.data?.message || 'Error loading courses' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statusFor = (c) => {
    if ((c.progressPct || 0) === 0) return 'Not Started'
    if ((c.progressPct || 0) >= 100) return 'Completed'
    return 'In Progress'
  }

  return (
    <div>
      <Header
        userType="student"
        navigation={[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'courses', label: 'My Courses' },
          { id: 'assignments', label: 'Assignments' },
          { id: 'progress', label: 'Progress' },
          { id: 'profile', label: 'Profile' }
        ]}
        currentNav="courses"
        onNavClick={(id) => nav(`/student/${id}`)}
      />
      <div className="container">
        <div className="dashboard-header">
          <h1>My Courses</h1>
          <p className="muted">Your enrolled courses</p>
        </div>
        {msg && <div className={`message ${msg.type}`}>{msg.text}</div>}
        {loading ? (
          <div className="card"><p className="muted">Loading...</p></div>
        ) : courses.length === 0 ? (
          <div className="card"><p className="muted">No courses assigned.</p></div>
        ) : (
          <div className="grid-3">
            {courses.map((c) => (
              <div key={c.courseId} className="course-card" onClick={() => nav(`/student/course/${c.courseId}`)}>
                <div className="course-card-content">
                  <div className="course-card-title">{c.title}</div>
                  <div className="course-card-meta">
                    <span>Status: {statusFor(c)}</span>
                  </div>
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${c.progressPct || 0}%` }} />
                    </div>
                    <div className="stat">Progress: {c.progressPct || 0}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
