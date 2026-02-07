import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'
import StudentProfile from './StudentProfile'
import ExploreCourses from './ExploreCourses'
import '../styles.css'

export default function StudentDashboard(){
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState('dashboard')
  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [examData, setExamData] = useState(null)
  const [examAnswers, setExamAnswers] = useState([])
  const [examStartTime, setExamStartTime] = useState(null)
  const [submitRepoUrl, setSubmitRepoUrl] = useState('')
  const [submitPRUrl, setSubmitPRUrl] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const currentCourse = selectedCourse ? courses.find(c => c.courseId === selectedCourse) : null

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try{
      setLoading(true)
      const userId = localStorage.getItem('userId')
      if (!userId) {
        setMsg({ type: 'error', text: 'Please log in first' })
        return
      }

      const res = await api.get('/api/student/courses')
      setCourses(res.data.courses || [])
    }catch(e){
      setMsg({ type: 'error', text: e.response?.data?.message || 'Error loading courses' })
    } finally {
      setLoading(false)
    }
  }

  const selectCourse = async (courseId) => {
    try{
      setLoading(true)
      const res = await api.get(`/api/student/course/${courseId}/assignments`)
      setAssignments(res.data)
      setSelectedCourse(courseId)
    }catch(e){
      setMsg({ type: 'error', text: e.response?.data?.message || 'Error loading assignments' })
    } finally {
      setLoading(false)
    }
  }

  const selectAssignment = (assignment) => {
    setSelectedAssignment(assignment)
  }

  const startExam = async (courseId, examOrder) => {
    try {
      setLoading(true)
      const res = await api.get(`/api/student/course/${courseId}/exam/${examOrder}`)
      setExamData({ ...res.data, courseId, examOrder })
      setExamAnswers(new Array(res.data.questions.length).fill(null))
      setExamStartTime(Date.now())
    } catch(e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Error loading exam' })
    } finally {
      setLoading(false)
    }
  }

  const submitExam = async () => {
    try {
      setLoading(true)
      const timeTaken = Math.round((Date.now() - examStartTime) / 60000) // minutes
      const res = await api.post(`/api/student/course/${examData.courseId}/exam/${examData.examOrder}/submit`, {
        answers: examAnswers,
        timeTaken
      })
      setMsg({ type: 'success', text: `Exam submitted! Score: ${res.data.score}% (${res.data.passed ? 'Passed' : 'Failed'})` })
      setExamData(null)
      setExamAnswers([])
      setExamStartTime(null)
      loadCourses() // Refresh course progress
    } catch(e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Error submitting exam' })
    } finally {
      setLoading(false)
    }
  }

  const submitAssignment = async () => {
    try {
      setLoading(true)
      await api.post(`/api/student/course/${selectedCourse}/assignment/${selectedAssignment.order}/submit`, {
        repositoryUrl: submitRepoUrl,
        pullRequestUrl: submitPRUrl
      })
      setMsg({ type: 'success', text: 'Assignment submitted successfully!' })
      setSubmitRepoUrl('')
      setSubmitPRUrl('')
      setSelectedAssignment(null)
      loadCourses() // Refresh progress
    } catch(e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Error submitting assignment' })
    } finally {
      setLoading(false)
    }
  }

  const purchaseCertificate = () => {
    if (!currentCourse) return
    setMsg({ type: 'info', text: 'Certificate purchase is not enabled yet. Please contact your admin.' })
  }

  const logout = ()=>{ localStorage.clear(); navigate('/login') }

  // Render profile or explore pages
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
          onLogout={logout}
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
          onLogout={logout}
        />
        <ExploreCourses />
      </>
    );
  }

  // Exam view
  if (examData) {
    return (
      <div>
        <Header userType="student" navigation={[]} currentNav="" onNavClick={() => {}} onLogout={logout} />
        <div className="container">
          <div className="card">
            <h2>{examData.title}</h2>
            <p className="muted">{examData.description}</p>
            <div className="exam-timer">
              Time Remaining: {examData.duration} minutes
            </div>

            {examData.questions.map((q, index) => (
              <div key={index} className="exam-question">
                <h4>Question {index + 1}: {q.question}</h4>
                {q.options.map((option, optIndex) => (
                  <label key={optIndex} className="exam-option">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={optIndex}
                      checked={examAnswers[index] === optIndex}
                      onChange={() => {
                        const newAnswers = [...examAnswers];
                        newAnswers[index] = optIndex;
                        setExamAnswers(newAnswers);
                      }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            ))}

            <button
              className="btn-primary"
              onClick={submitExam}
              disabled={examAnswers.includes(null)}
            >
              Submit Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Assignment submission view
  if (selectedAssignment) {
    return (
      <div>
        <Header userType="student" navigation={[]} currentNav="" onNavClick={() => {}} onLogout={logout} />
        <div className="container">
          <div className="card">
            <h2>{selectedAssignment.title}</h2>
            <p>{selectedAssignment.description}</p>

            <h3>Study Materials</h3>
            {(selectedAssignment.blogLinks || []).length > 0 && (
              <div>
                <h4>Blog Links:</h4>
                <ul>
                  {(selectedAssignment.blogLinks || []).map((link, i) => (
                    <li key={i}><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></li>
                  ))}
                </ul>
              </div>
            )}

            {(selectedAssignment.githubLinks || []).length > 0 && (
              <div>
                <h4>GitHub Reference Links:</h4>
                <ul>
                  {(selectedAssignment.githubLinks || []).map((link, i) => (
                    <li key={i}><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></li>
                  ))}
                </ul>
              </div>
            )}

            {(selectedAssignment.studyMaterials || []).length > 0 && (
              <div>
                <h4>Study Materials:</h4>
                <ul>
                  {(selectedAssignment.studyMaterials || []).map((link, i) => (
                    <li key={i}><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></li>
                  ))}
                </ul>
              </div>
            )}

            <h3>Submission Instructions</h3>
            <div className="assignment-instructions">
              <p><strong>Repository:</strong> <a href={selectedAssignment.repositoryUrl} target="_blank" rel="noopener noreferrer">{selectedAssignment.repositoryUrl}</a></p>
              <pre>{selectedAssignment.instructions}</pre>
            </div>

            {!selectedAssignment.submitted ? (
              <div className="form-group">
                <label>Your GitHub Repository URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/yourusername/repo-name"
                  value={submitRepoUrl}
                  onChange={e => setSubmitRepoUrl(e.target.value)}
                />
                <label>Pull Request URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://github.com/org/repo/pull/123"
                  value={submitPRUrl}
                  onChange={e => setSubmitPRUrl(e.target.value)}
                />
                <button className="btn-primary" onClick={submitAssignment}>Submit Assignment</button>
              </div>
            ) : (
              <div className="success-message">
                ✅ Assignment Submitted
                {selectedAssignment.completed && <span> and Approved</span>}
              </div>
            )}

            <button className="btn-secondary" onClick={() => setSelectedAssignment(null)}>Back to Assignments</button>
          </div>
        </div>
      </div>
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
        onLogout={logout}
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
              <p className="muted">Track your progress and complete assignments</p>
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

                      {/* Assignment Progress */}
                      <div className="progress-section">
                        <h4>📚 Assignments</h4>
                        <div className="stats-grid">
                          <div className="stat">Total: {c.assignments.total}</div>
                          <div className="stat">Completed: {c.assignments.completed}</div>
                          <div className="stat">Active: {c.assignments.active}</div>
                          <div className="stat">Upcoming: {c.assignments.upcoming}</div>
                          <div className="stat">Missed: {c.assignments.missed}</div>
                        </div>
                        {/* Current Week Indicator */}
                        {(() => {
                          const now = new Date();
                          const courseStart = c.startDate ? new Date(c.startDate) : new Date(c.createdAt);
                          const weeksElapsed = Math.floor((now - courseStart) / (7 * 24 * 60 * 60 * 1000)) + 1;
                          const currentWeek = Math.min(Math.max(weeksElapsed, 1), 4);
                          return (
                            <div className="current-week-info">
                              <span>Current Week: {currentWeek}</span>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Exam Progress */}
                      <div className="progress-section">
                        <h4>Exams</h4>
                        <div className="stats-grid">
                          <div className="stat">Total: {c.exams.total}</div>
                          <div className="stat">Passed: {c.exams.passed}</div>
                          <div className="stat">Active: {c.exams.active}</div>
                          <div className="stat">Upcoming: {c.exams.upcoming}</div>
                          <div className="stat">Missed: {c.exams.missed}</div>
                        </div>
                      </div>

                      {/* Certificate Status */}
                      {c.eligibleForCertificate && (
                        <div className="certificate-status">
                          {c.certificateIssued ?
                            '🎉 Certificate Issued' :
                            `💰 Certificate Available (₹${c.certificateFee})`
                          }
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{marginBottom: 20}}>
              <button className="btn-secondary btn-sm" onClick={() => { setSelectedCourse(null); setAssignments([]); }}>← Back to Courses</button>
            </div>

            <div className="dashboard-header">
              <h1>Course Assignments & Exams</h1>
              <p className="muted">Complete assignments and take exams to earn your certificate</p>
            </div>

            {assignments && assignments.length > 0 ? (
              <div className="assignments-exams-container">
                <div className="assignments-section">
                  <h2>📚 Assignments</h2>
                  <div className="assignments-container">
                    {/* Group assignments by week */}
                    {Array.from({ length: 4 }, (_, weekIndex) => {
                      const weekNum = weekIndex + 1;
                      const weekAssignments = assignments.filter(a => a.week === weekNum);

                      if (weekAssignments.length === 0) return null;

                      const now = new Date();
                      const isCurrentWeek = weekAssignments.some(a => new Date(a.dueDate) >= now);

                      return (
                        <div key={weekNum} className={`week-section ${isCurrentWeek ? 'current-week' : ''}`}>
                          <h3 className="week-title">
                            Week {weekNum}
                            {isCurrentWeek && <span className="current-badge">Current Week</span>}
                          </h3>

                          <ul className="week-assignments">
                            {weekAssignments.map((a, i) => (
                              <li key={i} className={`assignment-item ${a.submitted ? 'submitted' : ''} ${a.completed ? 'completed' : ''}`}>
                                <div className="assignment-header">
                                  <div className="assignment-order">{a.order}</div>
                                  <div className="assignment-content">
                                    <div className="assignment-title">{a.title}</div>
                                    <div className="assignment-due">
                                      Due: {new Date(a.dueDate).toLocaleDateString()}
                                      {new Date(a.dueDate) < now && !a.submitted && <span className="overdue"> (Overdue)</span>}
                                    </div>
                                  </div>
                                </div>
                                <div className="assignment-status">
                                  {a.completed ? '✅ Approved' : a.submitted ? '⏳ Submitted' : '📝 Not Submitted'}
                                </div>
                                <button
                                  className="btn-sm btn-primary"
                                  onClick={(e) => { e.stopPropagation(); selectAssignment(a); }}
                                >
                                  View Details
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="exams-section">
                  <div className="card">
                    <h3>📝 Exams</h3>
                    <div className="exam-list">
                      {currentCourse?.exams.total > 0 ? (
                        Array.from({ length: currentCourse.exams.total }, (_, i) => i + 1).map(order => {
                          const isCompleted = currentCourse.exams.completed.includes(order);
                          const isPassed = currentCourse.exams.passed.includes(order);

                          return (
                            <div key={order} className={`exam-item ${isPassed ? 'passed' : isCompleted ? 'failed' : 'available'}`}>
                              <div className="exam-info">
                                <span>Exam {order}</span>
                                <span className="exam-status">
                                  {isPassed ? '✅ Passed' : isCompleted ? '❌ Failed' : '📝 Available'}
                                </span>
                              </div>
                              {!isCompleted && (
                                <button
                                  className="btn-sm btn-primary"
                                  onClick={() => startExam(selectedCourse, order)}
                                >
                                  Start Exam
                                </button>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="muted">No exams available</p>
                      )}
                    </div>
                  </div>

                  {/* Certificate Section */}
                  {currentCourse?.eligibleForCertificate && (
                    <div className="card">
                      <h3>🎉 Certificate</h3>
                      <p>You have completed all requirements for this course!</p>
                      <div className="certificate-info">
                        <p><strong>Fee:</strong> ₹{currentCourse.certificateFee}</p>
                        <p><em>This fee covers server and infrastructure costs only.</em></p>
                      </div>
                      {currentCourse.certificateIssued ? (
                        <div className="success-message">Certificate has been issued!</div>
                      ) : (
                        <button className="btn-primary" onClick={purchaseCertificate} disabled={loading}>
                          Purchase Certificate
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card text-center">
                <p className="muted">Loading assignments...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
