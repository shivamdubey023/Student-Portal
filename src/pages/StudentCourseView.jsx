import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'

export default function StudentCourseView(){
  const nav = useNavigate()
  const { id } = useParams()
  const [modules, setModules] = useState([])
  const [selectedLessonId, setSelectedLessonId] = useState(null)
  const [lessonContent, setLessonContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const lessonsFlat = useMemo(() => modules.flatMap(m => m.lessons || []), [modules])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/api/student/course/${id}`)
        setModules(res.data.modules || [])
        if (res.data.lastLessonId) {
          setSelectedLessonId(res.data.lastLessonId)
        } else {
          const first = (res.data.modules || [])[0]?.lessons?.[0]
          if (first) setSelectedLessonId(first._id)
        }
      } catch (e) {
        setMsg({ type: 'error', text: e.response?.data?.message || 'Error loading course' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    const loadContent = async () => {
      if (!selectedLessonId) return
      try {
        setLoading(true)
        const res = await api.get(`/api/student/lesson/${selectedLessonId}/content`)
        setLessonContent(res.data)
      } catch (e) {
        setMsg({ type: 'error', text: e.response?.data?.message || 'Error loading lesson content' })
      } finally {
        setLoading(false)
      }
    }
    loadContent()
  }, [selectedLessonId])

  const markComplete = async () => {
    if (!selectedLessonId) return
    try {
      setLoading(true)
      await api.post(`/api/student/lesson/${selectedLessonId}/complete`)
      setModules(prev => prev.map(m => ({
        ...m,
        lessons: (m.lessons || []).map(l => l._id === selectedLessonId ? { ...l, completed: true } : l)
      })))
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Error completing lesson' })
    } finally {
      setLoading(false)
    }
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
        onNavClick={(navId) => nav(`/student/${navId}`)}
      />

      <div className="container">
        {msg && <div className={`message ${msg.type}`}>{msg.text}</div>}
        <div className="grid-2">
          <div className="card">
            <h3>Modules</h3>
            {modules.map((m) => (
              <div key={m._id} style={{ marginBottom: 12 }}>
                <div className="muted"><strong>{m.title}</strong></div>
                <ul>
                  {(m.lessons || []).map(l => (
                    <li key={l._id} style={{ marginBottom: 6 }}>
                      <button
                        className="btn-sm btn-secondary"
                        onClick={() => setSelectedLessonId(l._id)}
                        disabled={l.locked}
                      >
                        {l.completed ? '✓ ' : ''}{l.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="card">
            <h3>{lessonContent?.title || 'Lesson'}</h3>
            {loading ? (
              <p className="muted">Loading...</p>
            ) : lessonContent ? (
              <>
                {lessonContent.outline && (
                  <>
                    <h4>Outline</h4>
                    <pre>{lessonContent.outline}</pre>
                  </>
                )}
                {lessonContent.rephrased && (
                  <>
                    <h4>Lesson Notes</h4>
                    <pre>{lessonContent.rephrased}</pre>
                  </>
                )}
                {!lessonContent.rephrased && (
                  <p className="muted">No lesson content found.</p>
                )}
                <button className="btn-primary" onClick={markComplete} disabled={loading}>
                  Mark as Complete
                </button>
              </>
            ) : (
              <p className="muted">Select a lesson</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
