import React, { useState, useEffect } from 'react'
import api from '../services/api'
import Header from '../components/Header'
import StudentProfile from './StudentProfile'
import ExploreCourses from './ExploreCourses'
import '../styles.css'

export default function StudentDashboard(){
  const [activeView, setActiveView] = useState('dashboard')
  const [courses, setCourses] = useState([])
  const [modules, setModules] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [submitLink, setSubmitLink] = useState('')
  const [submitOrder, setSubmitOrder] = useState('1')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try{
      setLoading(true)
      // Get student profile to see assigned courses
      const userId = localStorage.getItem('userId')
      if (!userId) {
        setMsg({ type: 'error', text: 'Please log in first' })
        return
      }
      
      const studentRes = await api.get(`/api/students/${userId}`)
      const studentCourses = studentRes.data.courses || []
      
      // Fetch course details for each assigned course
      const courseDetails = await Promise.all(
        studentCourses.map(async (assignment) => {
          try {
            const res = await api.get(`/api/courses/${assignment.courseId}`)
            return {
              ...res.data,
              assignedAt: assignment.assignedAt,
              expiresAt: assignment.expiresAt,
              modulesCompleted: assignment.modulesCompleted || []
            }
          } catch (err) {
            console.error('Error loading course:', err)
            return null
          }
        })
      )
      
      // Filter out any null values
      setCourses(courseDetails.filter(c => c !== null))
    }catch(e){ 
      setMsg({ type: 'error', text: e.response?.data?.message || 'Error loading courses' })
    } finally {
      setLoading(false)
    }
  }

  const selectCourse = async (courseId) => {
    try{
      setLoading(true)
      const res = await api.get(`/api/student/course/${courseId}/modules`)
      setModules(res.data)
      setSelectedCourse(courseId)
    }catch(e){ 
      setMsg({ type: 'error', text: e.response?.data?.message || 'Error loading modules' })
    } finally {
      setLoading(false)
    }
  }

  const complete = async (order) => {
    try{
      await api.post(`/api/student/course/${selectedCourse}/module/${order}/complete`)
      setMsg({ type: 'success', text: 'Module marked complete!' })
      selectCourse(selectedCourse)
    }catch(e){ 
      setMsg({ type: 'error', text: e.response?.data?.message || 'Error' })
    }
  }

  const submitLink_click = async () => {
    try{
      await api.post(`/api/student/course/${selectedCourse}/module/${submitOrder}/submit`, { link: submitLink })
      setMsg({ type: 'success', text: 'Submission received!' })
      setSubmitLink('')
    }catch(e){ 
      setMsg({ type: 'error', text: e.response?.data?.message || 'Error' })
    }
  }

  const logout = ()=>{ localStorage.clear(); window.location.href = '/login' }

  // Render profile or explore pages with header
  if (activeView === 'profile') {
    return (
      <>
        <Header
          userType="student"
          navigation={[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'explore', label: 'Explore Courses' },
            { id: 'profile', label: 'My Profile' }
          ]}
          currentNav={activeView}
          onNavClick={setActiveView}
        />
        <StudentProfile />
      </>
    );
  }

  if (activeView === 'explore') {
    return (
      <>
        <Header
          userType="student"
          navigation={[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'explore', label: 'Explore Courses' },
            { id: 'profile', label: 'My Profile' }
          ]}
          currentNav={activeView}
          onNavClick={setActiveView}
        />
        <ExploreCourses />
      </>
    );
  }

  // Dashboard view

  return (
    <div>
      <Header
        userType="student"
        navigation={[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'explore', label: 'Explore Courses' },
          { id: 'profile', label: 'My Profile' }
        ]}
        currentNav={activeView}
        onNavClick={(navId) => {
          setActiveView(navId);
          setSelectedCourse(null);
        }}
      />

      <div className="container">
        {msg && (
          <div className={`message ${msg.type}`}>
            {msg.text}
          </div>
        )}

        {!selectedCourse ? (
          <>
            <div className="dashboard-header">
              <h1>My Courses</h1>
              <p className="muted">Continue learning with your assigned courses</p>
            </div>

            {courses.length === 0 ? (
              <div className="card text-center">
                <p className="muted">No courses assigned yet. Contact your admin.</p>
              </div>
            ) : (
              <div className="grid-3">
                {courses.map((c, i) => (
                  <div key={i} className="course-card" onClick={() => selectCourse(c.courseId)}>
                    <div className="course-card-image">📚</div>
                    <div className="course-card-content">
                      <div className="course-card-title">{c.title}</div>
                      <div className="course-card-meta">
                        <span>📅 {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Lifetime'}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width: `${Math.round((c.modulesCompleted.length / 5) * 100)}%`}}></div>
                      </div>
                      <div style={{fontSize: 12, color: 'var(--text-muted)', marginTop: 8}}>
                        {c.modulesCompleted.length} modules completed
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{marginBottom: 20}}>
              <button className="btn-secondary btn-sm" onClick={() => { setSelectedCourse(null); setModules(null); }}>← Back to Courses</button>
            </div>

            <div className="dashboard-header">
              <h1>Course Modules</h1>
              <p className="muted">Complete modules in order to progress through the course</p>
            </div>

            {modules && modules.length > 0 ? (
              <div className="grid-2">
                <div>
                  <div className="card">
                    <h3>Modules</h3>
                    <ul className="module-list">
                      {modules.map((m, i) => (
                        <li key={i} className={`module-item ${m.unlocked ? 'unlocked' : 'locked'}`}>
                          <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
                            <div className="module-order">{m.order}</div>
                            <div className="module-item-content">
                              <div className="module-title">{m.title}</div>
                              <div className="module-meta">{m.task ? 'Has assignment' : 'Learning module'}</div>
                            </div>
                          </div>
                          <div className="module-status completed">Unlocked</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Submit Project</h3>
                    <div className="form-group">
                      <label>Module Order</label>
                      <input type="number" value={submitOrder} onChange={e=>setSubmitOrder(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Submission Link (GitHub/Drive)</label>
                      <input placeholder="https://github.com/..." value={submitLink} onChange={e=>setSubmitLink(e.target.value)} />
                    </div>
                    <button className="btn-primary" onClick={submitLink_click}>Submit</button>
                  </div>

                  <div className="card">
                    <h3>Quick Actions</h3>
                    <div className="form-group">
                      <label>Mark Module Complete</label>
                      <input type="number" value={submitOrder} onChange={e=>setSubmitOrder(e.target.value)} />
                    </div>
                    <button className="btn-primary" onClick={()=>complete(submitOrder)}>Mark Complete</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card text-center">
                <p className="muted">Loading modules...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

