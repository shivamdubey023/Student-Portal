import { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import '../styles.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, totalCourses: 0, totalSubmissions: 0 });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Form states
  const [newStudent, setNewStudent] = useState({ username: '', name: '', email: '', password: '', assignedCourses: [] });
  const [newCourse, setNewCourse] = useState({ 
    title: '', description: '', duration: '2 Months', mode: 'Remote', 
    category: 'Core Training', tools: [], learnTopics: [], certification: '' 
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [studentsRes, coursesRes, submissionsRes] = await Promise.all([
        api.get('/api/students'),
        api.get('/api/courses'),
        api.get('/api/submissions')
      ]);
      
      setStudents(studentsRes.data);
      setCourses(coursesRes.data);
      setSubmissions(submissionsRes.data);
      setStats({
        totalStudents: studentsRes.data.length,
        totalCourses: coursesRes.data.length,
        totalSubmissions: submissionsRes.data.length
      });
    } catch (err) {
      setMsg({ type: 'error', text: 'Error loading dashboard data' });
    } finally {
      setLoading(false);
    }
  };

  const createStudent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/api/students', newStudent);
      setMsg({ type: 'success', text: `Student created: ${res.data.student.rollId}` });
      setNewStudent({ username: '', name: '', email: '', password: '', assignedCourses: [] });
      loadDashboard();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Error creating student' });
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      setLoading(true);
      await api.delete(`/api/students/${studentId}`);
      setMsg({ type: 'success', text: 'Student deleted' });
      loadDashboard();
    } catch (err) {
      setMsg({ type: 'error', text: 'Error deleting student' });
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/api/courses', newCourse);
      setMsg({ type: 'success', text: `Course created: ${res.data.title}` });
      setNewCourse({ 
        title: '', description: '', duration: '2 Months', mode: 'Remote', 
        category: 'Core Training', tools: [], learnTopics: [], certification: '' 
      });
      loadDashboard();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Error creating course' });
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      setLoading(true);
      await api.delete(`/api/courses/${courseId}`);
      setMsg({ type: 'success', text: 'Course deleted' });
      loadDashboard();
    } catch (err) {
      setMsg({ type: 'error', text: 'Error deleting course' });
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (submissionId, status) => {
    try {
      setLoading(true);
      await api.put(`/api/submissions/${submissionId}`, { status });
      setMsg({ type: 'success', text: `Submission marked as ${status}` });
      loadDashboard();
    } catch (err) {
      setMsg({ type: 'error', text: 'Error updating submission' });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };
  return (
    <div className="admin-container">
      <Header
        userType="admin"
        navigation={[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'students', label: 'Students' },
          { id: 'courses', label: 'Courses' },
          { id: 'submissions', label: 'Submissions' }
        ]}
        currentNav={activeTab}
        onNavClick={setActiveTab}
      />

      <div className="admin-content">
        {msg && (
          <div className={`alert alert-${msg.type}`}>
            {msg.text}
            <button onClick={() => setMsg(null)} className="alert-close">×</button>
          </div>
        )}

        {/* Tabs */}
        <div className="admin-tabs">
          {['dashboard', 'students', 'courses', 'submissions'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              style={{ display: 'none' }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-section">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>👥 Total Students</h3>
                <p className="stat-number">{stats.totalStudents}</p>
              </div>
              <div className="stat-card">
                <h3>📚 Total Courses</h3>
                <p className="stat-number">{stats.totalCourses}</p>
              </div>
              <div className="stat-card">
                <h3>📤 Total Submissions</h3>
                <p className="stat-number">{stats.totalSubmissions}</p>
              </div>
            </div>
            <h2>Dashboard Overview</h2>
            <p>Welcome to the Admin Portal. Use the navigation above to manage students, courses, and submissions.</p>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="admin-section">
            <div className="section-grid">
              <div className="form-card">
                <h3>➕ Create New Student</h3>
                <form onSubmit={createStudent}>
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      value={newStudent.username}
                      onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
                      placeholder="john_doe"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                      placeholder="John Doe"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                      placeholder="john@example.com"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={newStudent.password}
                      onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                      placeholder="Strong password"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Assign Courses</label>
                    <div className="course-selector">
                      {courses.length === 0 ? (
                        <p className="text-secondary">No courses available. Create courses first.</p>
                      ) : (
                        courses.map((course) => (
                          <label key={course._id} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={newStudent.assignedCourses.includes(course._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewStudent({
                                    ...newStudent,
                                    assignedCourses: [...newStudent.assignedCourses, course._id]
                                  });
                                } else {
                                  setNewStudent({
                                    ...newStudent,
                                    assignedCourses: newStudent.assignedCourses.filter(id => id !== course._id)
                                  });
                                }
                              }}
                              disabled={loading}
                            />
                            {course.title}
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Student'}
                  </button>
                </form>
              </div>

              <div className="list-card">
                <h3>📋 Students List ({students.length})</h3>
                <div className="list-scroll">
                  {students.length === 0 ? (
                    <p className="empty">No students found</p>
                  ) : (
                    students.map((student) => (
                      <div key={student._id} className="list-item">
                        <div>
                          <strong>{student.name || student.username}</strong>
                          <div className="text-secondary">{student.rollId || 'No Roll ID'}</div>
                          <div className="text-secondary small">{student.email}</div>
                        </div>
                        <div className="actions">
                          <button onClick={() => setSelectedStudent(student)} className="btn-sm btn-info">View</button>
                          <button onClick={() => deleteStudent(student._id)} className="btn-sm btn-danger">Delete</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {selectedStudent && (
              <div className="detail-card">
                <h3>Student Details</h3>
                <div className="detail-grid">
                  <div><strong>Name:</strong> {selectedStudent.name}</div>
                  <div><strong>Username:</strong> {selectedStudent.username}</div>
                  <div><strong>Email:</strong> {selectedStudent.email}</div>
                  <div><strong>Roll ID:</strong> {selectedStudent.rollId}</div>
                  <div><strong>Student ID:</strong> {selectedStudent.studentId}</div>
                  <div><strong>Status:</strong> {selectedStudent.locked ? 'Locked' : 'Active'}</div>
                  <div><strong>Courses Enrolled:</strong> {selectedStudent.courses?.length || 0}</div>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="btn-secondary mt-20">Close</button>
              </div>
            )}
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="admin-section">
            <div className="section-grid">
              <div className="form-card">
                <h3>➕ Create New Course</h3>
                <form onSubmit={createCourse}>
                  <div className="form-group">
                    <label>Course Title</label>
                    <input
                      type="text"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      placeholder="Python Development"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                      placeholder="Course description"
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input
                      type="text"
                      value={newCourse.duration}
                      onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mode</label>
                    <select
                      value={newCourse.mode}
                      onChange={(e) => setNewCourse({ ...newCourse, mode: e.target.value })}
                      disabled={loading}
                    >
                      <option>Remote</option>
                      <option>In-Person</option>
                      <option>Hybrid</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Course'}
                  </button>
                </form>
              </div>

              <div className="list-card">
                <h3>📚 Courses List ({courses.length})</h3>
                <div className="list-scroll">
                  {courses.length === 0 ? (
                    <p className="empty">No courses found</p>
                  ) : (
                    courses.map((course) => (
                      <div key={course._id} className="list-item">
                        <div>
                          <strong>{course.title}</strong>
                          <div className="text-secondary">{course.duration} • {course.mode}</div>
                          <div className="text-secondary small">Enrolled: {course.enrolledCount} students</div>
                        </div>
                        <div className="actions">
                          <button onClick={() => deleteCourse(course._id)} className="btn-sm btn-danger">Delete</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="admin-section">
            <h3>📤 Submissions ({submissions.length})</h3>
            <div className="list-card">
              {submissions.length === 0 ? (
                <p className="empty">No submissions found</p>
              ) : (
                <div className="list-scroll">
                  {submissions.map((sub) => (
                    <div key={sub._id} className="list-item">
                      <div>
                        <strong>{sub.studentUserId}</strong>
                        <div className="text-secondary">{sub.courseName} - Module {sub.moduleOrder}</div>
                        <div className="text-secondary small">{new Date(sub.timestamp).toLocaleDateString()}</div>
                        <span className={`status-badge status-${sub.status?.toLowerCase()}`}>{sub.status}</span>
                      </div>
                      <div className="actions">
                        <a href={sub.link} target="_blank" rel="noopener noreferrer" className="btn-sm btn-info">Link</a>
                        <button onClick={() => setSelectedSubmission(sub)} className="btn-sm btn-primary">Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedSubmission && (
              <div className="detail-card">
                <h3>Submission Details</h3>
                <div className="detail-grid">
                  <div><strong>Student:</strong> {selectedSubmission.studentUserId}</div>
                  <div><strong>Roll ID:</strong> {selectedSubmission.studentRollId}</div>
                  <div><strong>Course:</strong> {selectedSubmission.courseName}</div>
                  <div><strong>Module:</strong> {selectedSubmission.moduleOrder}</div>
                  <div><strong>Status:</strong> {selectedSubmission.status}</div>
                  <div><strong>Submitted:</strong> {new Date(selectedSubmission.timestamp).toLocaleDateString()}</div>
                  <div><strong>Link:</strong> <a href={selectedSubmission.link} target="_blank" rel="noopener noreferrer">View</a></div>
                </div>
                <div className="status-actions">
                  <button onClick={() => updateSubmissionStatus(selectedSubmission._id, 'Reviewed')} className="btn-sm btn-warning">Mark Reviewed</button>
                  <button onClick={() => updateSubmissionStatus(selectedSubmission._id, 'Approved')} className="btn-sm btn-success">Approve</button>
                  <button onClick={() => updateSubmissionStatus(selectedSubmission._id, 'Rejected')} className="btn-sm btn-danger">Reject</button>
                </div>
                <button onClick={() => setSelectedSubmission(null)} className="btn-secondary mt-20">Close</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
