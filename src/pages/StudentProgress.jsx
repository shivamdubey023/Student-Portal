import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import api from '../services/api'

export default function StudentProgress(){
  const nav = useNavigate()
  const [courses, setCourses] = useState([])
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/student/courses')
        setCourses(res.data.courses || [])
      } catch (e) {
        setMsg({ type: 'error', text: e.response?.data?.message || 'Error loading progress' })
      }
    }
    load()
  }, [])

  const overall = courses.length
    ? Math.round(courses.reduce((acc, c) => acc + (c.progressPct || 0), 0) / courses.length)
    : 0

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
        currentNav="progress"
        onNavClick={(id) => nav(`/student/${id}`)}
      />
      <div className="container">
        <div className="dashboard-header">
          <h1>Progress</h1>
          <p className="muted">Read-only progress summary</p>
        </div>
        {msg && <div className={`message ${msg.type}`}>{msg.text}</div>}
        <div className="card">
          <p><strong>Overall Progress:</strong> {overall}%</p>
        </div>
        <div className="card">
          <h3>Course-wise Progress</h3>
          {courses.length === 0 ? (
            <p className="muted">No courses assigned.</p>
          ) : (
            <ul>
              {courses.map(c => (
                <li key={c.courseId}>
                  {c.title}: {c.progressPct || 0}% — Assignments {c.assignments.completed}/{c.assignments.total}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
