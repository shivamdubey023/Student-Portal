import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import api from '../services/api'

export default function StudentAssignments(){
  const nav = useNavigate()
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/student/courses')
        setCourses(res.data.courses || [])
      } catch (e) {
        setMsg({ type: 'error', text: e.response?.data?.message || 'Error loading courses' })
      }
    }
    load()
  }, [])

  useEffect(() => {
    const loadAssignments = async () => {
      if (!selectedCourse) return
      try {
        const res = await api.get(`/api/student/course/${selectedCourse}/assignments`)
        setAssignments(res.data || [])
      } catch (e) {
        setMsg({ type: 'error', text: e.response?.data?.message || 'Error loading assignments' })
      }
    }
    loadAssignments()
  }, [selectedCourse])

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
        currentNav="assignments"
        onNavClick={(id) => nav(`/student/${id}`)}
      />
      <div className="container">
        <div className="dashboard-header">
          <h1>Assignments</h1>
          <p className="muted">MCQs, mini projects, and major project submissions</p>
        </div>
        {msg && <div className={`message ${msg.type}`}>{msg.text}</div>}
        <div className="card">
          <label>Course</label>
          <select value={selectedCourse || ''} onChange={(e) => setSelectedCourse(e.target.value)}>
            <option value="">Select course</option>
            {courses.map(c => (
              <option key={c.courseId} value={c.courseId}>{c.title}</option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <div className="card">
            <h3>Projects</h3>
            {assignments.length === 0 ? (
              <p className="muted">No assignments available.</p>
            ) : (
              <ul>
                {assignments.map((a) => (
                  <li key={a.order}>
                    <strong>{a.title}</strong> ({a.type || 'mini'}) — {a.submitted ? 'Submitted' : 'Pending'} — {a.marks || 0} marks
                  </li>
                ))}
              </ul>
            )}
            <h3>MCQs</h3>
            <p className="muted">MCQs are available inside the course view under Exams.</p>
          </div>
        )}
      </div>
    </div>
  )
}
