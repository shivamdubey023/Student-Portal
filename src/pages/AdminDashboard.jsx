import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import '../styles.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
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
    title: '', description: '', duration: '1 Month', mode: 'Remote', 
    category: 'Core Training', tools: [], learnTopics: [], certification: '',
    validityMonths: 1, totalWeeks: 4
  });
  const [newAssignment, setNewAssignment] = useState({
    courseId: '', title: '', description: '', type: 'mini', blogLinks: [], githubLinks: [], studyMaterials: [],
    dueDate: '', repositoryUrl: '', instructions: '', order: 1, week: 1, releaseDate: ''
  });
  const [newExam, setNewExam] = useState({
    courseId: '', title: '', description: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }],
    passingScore: 70, duration: 60, dueDate: '', order: 1, week: 1, releaseDate: ''
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
        api.get('/api/admin/students'),
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
      const res = await api.post('/api/admin/students', newStudent);
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
      await api.delete(`/api/admin/students/${studentId}`);
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
      const courseData = {
        ...newCourse
      };
      const res = await api.post('/api/courses', courseData);
      setMsg({ type: 'success', text: `Course created: ${res.data.title}` });
      setNewCourse({ 
        title: '', description: '', duration: '1 Month', mode: 'Remote', 
        category: 'Core Training', tools: [], learnTopics: [], certification: '',
        validityMonths: 1, totalWeeks: 4
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

  const createAssignment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post(`/api/admin/courses/${newAssignment.courseId}/assignments`, newAssignment);
      setMsg({ type: 'success', text: 'Assignment created successfully' });
      setNewAssignment({
        courseId: '', title: '', description: '', type: 'mini', blogLinks: [], githubLinks: [], studyMaterials: [],
        dueDate: '', repositoryUrl: '', instructions: '', order: 1, week: 1, releaseDate: ''
      });
      loadDashboard();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error creating assignment' });
    } finally {
      setLoading(false);
    }
  };

  const createExam = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post(`/api/admin/courses/${newExam.courseId}/exams`, newExam);
      setMsg({ type: 'success', text: 'Exam created successfully' });
      setNewExam({
        courseId: '', title: '', description: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }],
        passingScore: 70, duration: 60, dueDate: '', order: 1
      });
      loadDashboard();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error creating exam' });
    } finally {
      setLoading(false);
    }
  };

  const reviewSubmission = async (submissionId, status, feedback) => {
    try {
      setLoading(true);
      await api.post(`/api/admin/submissions/${submissionId}/review`, { status, feedback });
      setMsg({ type: 'success', text: 'Submission reviewed' });
      loadDashboard();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error reviewing submission' });
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
    navigate('/login');
  };
  return (
    <div className="admin-container">
      <Header
        userType="admin"
        navigation={[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'students', label: 'Students' },
          { id: 'courses', label: 'Courses' },
          {id: 'assignments', label: 'Assignments' },
          {id: 'exams', label: 'Exams' },
          { id: 'submissions', label: 'Submissions' }
        ]}
        currentNav={activeTab}
        onNavClick={setActiveTab}
        onLogout={logout}
      />

      <div className="admin-content">
        {msg && (
          <div className={`alert alert-${msg.type}`}>
            {msg.text}
            <button onClick={() => setMsg(null)} className="alert-close">×</button>
          </div>
        )}

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
                      placeholder="1 Month"
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
                  <div className="form-group">
                    <label>Total Weeks</label>
                    <input
                      type="number"
                      value={newCourse.totalWeeks}
                      onChange={(e) => setNewCourse({ ...newCourse, totalWeeks: parseInt(e.target.value) })}
                      min="1"
                      max="12"
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Validity (Months)</label>
                    <input
                      type="number"
                      min="0"
                      value={newCourse.validityMonths}
                      onChange={(e) => setNewCourse({ ...newCourse, validityMonths: parseInt(e.target.value) })}
                      disabled={loading}
                    />
                    <p className="text-secondary small">Use 0 for lifetime access.</p>
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

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="admin-section">
            <div className="form-card">
              <h3>➕ Create New Assignment</h3>
              <form onSubmit={createAssignment}>
                <div className="form-group">
                  <label>Course</label>
                  <select
                    value={newAssignment.courseId}
                    onChange={(e) => setNewAssignment({ ...newAssignment, courseId: e.target.value })}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>{course.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Assignment Type</label>
                    <select
                      value={newAssignment.type}
                      onChange={(e) => setNewAssignment({ ...newAssignment, type: e.target.value })}
                      disabled={loading}
                    >
                      <option value="mini">Mini Project</option>
                      <option value="major">Major Project</option>
                      <option value="git">Git Task</option>
                    </select>
                  </div>
                <div className="form-group">
                  <label>Blog Links (one per line)</label>
                  <textarea
                    value={newAssignment.blogLinks.join('\n')}
                    onChange={(e) => setNewAssignment({ ...newAssignment, blogLinks: e.target.value.split('\n').filter(link => link.trim()) })}
                    placeholder="https://blog.example.com/post1&#10;https://blog.example.com/post2"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>GitHub Links (one per line)</label>
                  <textarea
                    value={newAssignment.githubLinks.join('\n')}
                    onChange={(e) => setNewAssignment({ ...newAssignment, githubLinks: e.target.value.split('\n').filter(link => link.trim()) })}
                    placeholder="https://github.com/user/repo&#10;https://github.com/user/repo2"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Study Materials (one per line)</label>
                  <textarea
                    value={newAssignment.studyMaterials.join('\n')}
                    onChange={(e) => setNewAssignment({ ...newAssignment, studyMaterials: e.target.value.split('\n').filter(link => link.trim()) })}
                    placeholder="https://docs.example.com/guide&#10;https://tutorial.example.com"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="datetime-local"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Repository URL</label>
                  <input
                    type="url"
                    value={newAssignment.repositoryUrl}
                    onChange={(e) => setNewAssignment({ ...newAssignment, repositoryUrl: e.target.value })}
                    placeholder="https://github.com/org/assignment-repo"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Submission Instructions</label>
                  <textarea
                    value={newAssignment.instructions}
                    onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })}
                    placeholder="Step-by-step instructions for submission..."
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Week</label>
                  <select
                    value={newAssignment.week}
                    onChange={(e) => setNewAssignment({ ...newAssignment, week: parseInt(e.target.value) })}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Week</option>
                    {[1, 2, 3, 4].map(week => (
                      <option key={week} value={week}>Week {week}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Release Date</label>
                  <input
                    type="datetime-local"
                    value={newAssignment.releaseDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, releaseDate: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Assignment'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Exams Tab */}
        {activeTab === 'exams' && (
          <div className="admin-section">
            <div className="form-card">
              <h3>➕ Create New Exam</h3>
              <form onSubmit={createExam}>
                <div className="form-group">
                  <label>Course</label>
                  <select
                    value={newExam.courseId}
                    onChange={(e) => setNewExam({ ...newExam, courseId: e.target.value })}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>{course.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={newExam.title}
                    onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newExam.description}
                    onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label>Questions</label>
                  {newExam.questions.map((q, qIndex) => (
                    <div key={qIndex} className="question-block">
                      <input
                        type="text"
                        placeholder="Question"
                        value={q.question}
                        onChange={(e) => {
                          const questions = [...newExam.questions];
                          questions[qIndex].question = e.target.value;
                          setNewExam({ ...newExam, questions });
                        }}
                        required
                        disabled={loading}
                      />
                      {q.options.map((option, oIndex) => (
                        <div key={oIndex} className="option-block">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={q.correctAnswer === oIndex}
                            onChange={() => {
                              const questions = [...newExam.questions];
                              questions[qIndex].correctAnswer = oIndex;
                              setNewExam({ ...newExam, questions });
                            }}
                            disabled={loading}
                          />
                          <input
                            type="text"
                            placeholder={`Option ${oIndex + 1}`}
                            value={option}
                            onChange={(e) => {
                              const questions = [...newExam.questions];
                              questions[qIndex].options[oIndex] = e.target.value;
                              setNewExam({ ...newExam, questions });
                            }}
                            required
                            disabled={loading}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => setNewExam({
                      ...newExam,
                      questions: [...newExam.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
                    })}
                    disabled={loading}
                  >
                    Add Question
                  </button>
                </div>
                
                <div className="form-group">
                  <label>Passing Score (%)</label>
                  <input
                    type="number"
                    value={newExam.passingScore}
                    onChange={(e) => setNewExam({ ...newExam, passingScore: parseInt(e.target.value) })}
                    min="0"
                    max="100"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    value={newExam.duration}
                    onChange={(e) => setNewExam({ ...newExam, duration: parseInt(e.target.value) })}
                    min="1"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="datetime-local"
                    value={newExam.dueDate}
                    onChange={(e) => setNewExam({ ...newExam, dueDate: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Week</label>
                  <select
                    value={newExam.week}
                    onChange={(e) => setNewExam({ ...newExam, week: parseInt(e.target.value) })}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Week</option>
                    {[1, 2, 3, 4].map(week => (
                      <option key={week} value={week}>Week {week}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Release Date</label>
                  <input
                    type="datetime-local"
                    value={newExam.releaseDate}
                    onChange={(e) => setNewExam({ ...newExam, releaseDate: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Exam'}
                </button>
              </form>
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
                        <strong>{sub.studentId?.userId || sub.studentUserId}</strong>
                        <div className="text-secondary">
                          {sub.type === 'assignment' ? 
                            `Assignment ${sub.assignmentSubmission?.assignmentOrder} - ${sub.courseId?.title}` :
                            sub.type === 'exam' ?
                            `Exam ${sub.examSubmission?.examOrder} - ${sub.courseId?.title}` :
                            sub.type === 'certificate' ?
                            `Certificate - ${sub.courseId?.title}` :
                            `${sub.courseName} - Module ${sub.moduleOrder}`
                          }
                        </div>
                        <div className="text-secondary small">
                          {sub.type === 'assignment' ? new Date(sub.assignmentSubmission?.submittedAt).toLocaleDateString() :
                           sub.type === 'exam' ? new Date(sub.examSubmission?.submittedAt).toLocaleDateString() :
                           sub.type === 'certificate' ? new Date(sub.certificate?.issuedAt).toLocaleDateString() :
                           new Date(sub.timestamp).toLocaleDateString()}
                        </div>
                        <span className={`status-badge status-${(sub.assignmentSubmission?.status || sub.examSubmission?.passed || sub.status || 'submitted')?.toLowerCase()}`}>
                          {sub.type === 'assignment' ? sub.assignmentSubmission?.status :
                           sub.type === 'exam' ? (sub.examSubmission?.passed ? 'Passed' : 'Failed') :
                           sub.type === 'certificate' ? 'Issued' :
                           sub.status}
                        </span>
                      </div>
                      <div className="actions">
                        {sub.type === 'assignment' && sub.assignmentSubmission?.repositoryUrl && (
                          <a href={sub.assignmentSubmission.repositoryUrl} target="_blank" rel="noopener noreferrer" className="btn-sm btn-info">Repo</a>
                        )}
                        {sub.type === 'exam' && (
                          <span className="btn-sm btn-secondary">Score: {sub.examSubmission?.score}%</span>
                        )}
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
                  <div><strong>Student:</strong> {selectedSubmission.studentId?.userId || selectedSubmission.studentUserId}</div>
                  <div><strong>Type:</strong> {selectedSubmission.type}</div>
                  <div><strong>Course:</strong> {selectedSubmission.courseId?.title || selectedSubmission.courseName}</div>
                  
                  {selectedSubmission.type === 'assignment' && (
                    <>
                      <div><strong>Assignment:</strong> {selectedSubmission.assignmentSubmission?.assignmentOrder}</div>
                      <div><strong>Repository:</strong> <a href={selectedSubmission.assignmentSubmission?.repositoryUrl} target="_blank" rel="noopener noreferrer">View</a></div>
                      {selectedSubmission.assignmentSubmission?.pullRequestUrl && (
                        <div><strong>Pull Request:</strong> <a href={selectedSubmission.assignmentSubmission?.pullRequestUrl} target="_blank" rel="noopener noreferrer">View</a></div>
                      )}
                      <div><strong>Status:</strong> {selectedSubmission.assignmentSubmission?.status}</div>
                      <div><strong>Feedback:</strong> {selectedSubmission.assignmentSubmission?.feedback || 'None'}</div>
                    </>
                  )}
                  
                  {selectedSubmission.type === 'exam' && (
                    <>
                      <div><strong>Exam:</strong> {selectedSubmission.examSubmission?.examOrder}</div>
                      <div><strong>Score:</strong> {selectedSubmission.examSubmission?.score}%</div>
                      <div><strong>Passed:</strong> {selectedSubmission.examSubmission?.passed ? 'Yes' : 'No'}</div>
                      <div><strong>Time Taken:</strong> {selectedSubmission.examSubmission?.timeTaken} minutes</div>
                    </>
                  )}
                  
                  {selectedSubmission.type === 'certificate' && (
                    <>
                      <div><strong>Certificate Number:</strong> {selectedSubmission.certificate?.certificateNumber}</div>
                      <div><strong>Payment Status:</strong> {selectedSubmission.certificate?.paymentStatus}</div>
                      <div><strong>Fee:</strong> ₹{selectedSubmission.certificate?.paymentAmount}</div>
                    </>
                  )}
                  
                  <div><strong>Submitted:</strong> {
                    selectedSubmission.type === 'assignment' ? new Date(selectedSubmission.assignmentSubmission?.submittedAt).toLocaleDateString() :
                    selectedSubmission.type === 'exam' ? new Date(selectedSubmission.examSubmission?.submittedAt).toLocaleDateString() :
                    selectedSubmission.type === 'certificate' ? new Date(selectedSubmission.certificate?.issuedAt).toLocaleDateString() :
                    new Date(selectedSubmission.timestamp).toLocaleDateString()
                  }</div>
                </div>
                
                {selectedSubmission.type === 'assignment' && selectedSubmission.assignmentSubmission?.status === 'Submitted' && (
                  <div className="status-actions">
                    <textarea
                      placeholder="Add feedback..."
                      id="feedback-input"
                      className="feedback-input"
                    />
                    <button 
                      onClick={() => {
                        const feedback = document.getElementById('feedback-input').value;
                        reviewSubmission(selectedSubmission._id, 'Approved', feedback);
                      }} 
                      className="btn-sm btn-success"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => {
                        const feedback = document.getElementById('feedback-input').value;
                        reviewSubmission(selectedSubmission._id, 'Rejected', feedback);
                      }} 
                      className="btn-sm btn-danger"
                    >
                      Reject
                    </button>
                  </div>
                )}
                
                <button onClick={() => setSelectedSubmission(null)} className="btn-secondary mt-20">Close</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
