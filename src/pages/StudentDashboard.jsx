import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'

export default function StudentDashboard(){
  const nav = useNavigate()
  const [courses, setCourses] = useState([])
  const [studentName, setStudentName] = useState('')
  const [currentLesson, setCurrentLesson] = useState('')
  const [currentModule, setCurrentModule] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const load = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/student/courses')
      setCourses(res.data.courses || [])
      setStudentName(res.data.name || '')
      setMsg(null)
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Error loading courses' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const currentCourse = courses[0]

  useEffect(() => {
    const loadCurrentLesson = async () => {
      if (!currentCourse) return
      try {
        const res = await api.get(`/api/student/course/${currentCourse.courseId}`)
        const modules = res.data.modules || []
        const lastLessonId = res.data.lastLessonId
        let foundLesson = null
        let foundModule = null
        for (const m of modules) {
          const l = (m.lessons || []).find(x => x._id === lastLessonId) || (m.lessons || [])[0]
          if (l) {
            foundLesson = l
            foundModule = m
            break
          }
        }
        setCurrentLesson(foundLesson?.title || '')
        setCurrentModule(foundModule?.title || '')
      } catch {
        setCurrentLesson('')
        setCurrentModule('')
      }
    }
    loadCurrentLesson()
  }, [currentCourse?.courseId])
  const continueLearning = () => {
    if (!currentCourse) return
    nav(`/student/course/${currentCourse.courseId}`)
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
        currentNav="dashboard"
        onNavClick={(id) => {
          if (id === 'dashboard') return
          nav(`/student/${id}`)
        }}
      />

      <div className="container">
        {msg && <div className={`message ${msg.type}`}>{msg.text}</div>}
        <div className="dashboard-header">
          <h1>Welcome{studentName ? `, ${studentName}` : ''}</h1>
          <p className="muted">Pick up where you left off</p>
        </div>

        {loading ? (
          <div className="card"><p className="muted">Loading...</p></div>
        ) : !currentCourse ? (
          <div className="card"><p className="muted">No courses assigned yet.</p></div>
        ) : (
          <div className="card">
            <h3>{currentCourse.title}</h3>
            <p className="muted">Progress: {currentCourse.progressPct || 0}%</p>
            <p className="muted">Current Module: {currentModule || 'Not started'}</p>
            <p className="muted">Current Lesson: {currentLesson || 'Not started'}</p>
            <button className="btn-primary" onClick={continueLearning}>Continue Learning</button>
          </div>
        )}
      </div>
    </div>
  )
}
