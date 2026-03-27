import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import '../styles.css';

const emptyStudent = { username: '', name: '', email: '', password: '', assignedCourses: [] };
const emptyCourse = {
  title: '', description: '', overview: '', duration: '1 Month', mode: 'Remote', category: 'Core Training',
  price: 0, salePrice: 0, learningFormat: 'course', enrollmentType: 'paid', certificateFee: 59,
  certification: '', validityMonths: 1, totalWeeks: 4, toolsText: '', learnTopicsText: '', highlightsText: '',
  outcomesText: '', internshipCertificateOnly: false, internshipStipend: '', internshipMentorSupport: '', internshipHiringSupport: ''
};
const emptyAssignment = {
  courseId: '', title: '', description: '', type: 'mini', blogLinksText: '', githubLinksText: '', studyMaterialsText: '',
  dueDate: '', repositoryUrl: '', instructions: '', order: 1, week: 1, releaseDate: ''
};
const emptyExam = {
  courseId: '', title: '', description: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }],
  passingScore: 70, duration: 60, dueDate: '', order: 1, week: 1, releaseDate: ''
};
const defaultSettings = {
  brandName: 'SIH Learn', supportEmail: '', supportPhone: '', whatsappNumber: '', whatsappBotEnabled: true,
  whatsappAutomationNote: '', internshipHeadline: '',
  paymentMethods: [
    { id: 'qr', label: 'QR Payment', type: 'qr', instructions: '', qrCodeUrl: '', paymentLink: '', recipient: '', isEnabled: true },
    { id: 'online', label: 'Online Payment Link', type: 'link', instructions: '', qrCodeUrl: '', paymentLink: '', recipient: '', isEnabled: true },
    { id: 'email', label: 'Email Confirmation', type: 'email', instructions: '', qrCodeUrl: '', paymentLink: '', recipient: '', isEnabled: true }
  ]
};

const lines = (value) => value.split('\n').map((item) => item.trim()).filter(Boolean);
const money = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newStudent, setNewStudent] = useState(emptyStudent);
  const [newCourse, setNewCourse] = useState(emptyCourse);
  const [newAssignment, setNewAssignment] = useState(emptyAssignment);
  const [newExam, setNewExam] = useState(emptyExam);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadNotes, setLeadNotes] = useState('');

  const stats = useMemo(() => ({
    totalStudents: students.length,
    totalCourses: courses.length,
    totalSubmissions: submissions.length,
    totalLeads: purchaseRequests.length,
    pendingLeads: purchaseRequests.filter((item) => item.status === 'pending').length
  }), [students, courses, submissions, purchaseRequests]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [studentsRes, coursesRes, submissionsRes, leadsRes, settingsRes] = await Promise.all([
        api.get('/api/admin/students'),
        api.get('/api/courses'),
        api.get('/api/submissions'),
        api.get('/api/admin/purchase-requests'),
        api.get('/api/admin/settings')
      ]);
      setStudents(studentsRes.data || []);
      setCourses(coursesRes.data || []);
      setSubmissions(submissionsRes.data || []);
      setPurchaseRequests(leadsRes.data || []);
      setSettings({ ...defaultSettings, ...settingsRes.data, paymentMethods: settingsRes.data?.paymentMethods?.length ? settingsRes.data.paymentMethods : defaultSettings.paymentMethods });
    } catch (error) {
      setMsg({ type: 'error', text: error.response?.data?.message || 'Error loading admin dashboard' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const submitStudent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/api/admin/students', newStudent);
      setMsg({ type: 'success', text: `Student created: ${res.data.student.rollId}` });
      setNewStudent(emptyStudent);
      await loadDashboard();
    } catch (error) {
      setMsg({ type: 'error', text: error.response?.data?.error || 'Error creating student' });
    } finally {
      setLoading(false);
    }
  };

  const submitCourse = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/api/courses', {
        title: newCourse.title,
        description: newCourse.description,
        overview: newCourse.overview,
        duration: newCourse.duration,
        mode: newCourse.mode,
        category: newCourse.category,
        price: Number(newCourse.price || 0),
        salePrice: Number(newCourse.salePrice || 0),
        learningFormat: newCourse.learningFormat,
        enrollmentType: newCourse.enrollmentType,
        certificateFee: Number(newCourse.certificateFee || 0),
        certification: newCourse.certification,
        validityMonths: Number(newCourse.validityMonths || 0),
        totalWeeks: Number(newCourse.totalWeeks || 1),
        tools: lines(newCourse.toolsText),
        learnTopics: lines(newCourse.learnTopicsText),
        highlights: lines(newCourse.highlightsText),
        outcomes: lines(newCourse.outcomesText),
        internshipDetails: {
          certificateOnly: newCourse.internshipCertificateOnly,
          stipend: newCourse.internshipStipend,
          mentorSupport: newCourse.internshipMentorSupport,
          hiringSupport: newCourse.internshipHiringSupport
        }
      });
      setMsg({ type: 'success', text: 'Offer created successfully' });
      setNewCourse(emptyCourse);
      await loadDashboard();
    } catch (error) {
      setMsg({ type: 'error', text: error.response?.data?.error || 'Error creating course' });
    } finally {
      setLoading(false);
    }
  };

  const submitAssignment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post(`/api/admin/courses/${newAssignment.courseId}/assignments`, {
        ...newAssignment,
        order: Number(newAssignment.order || 1),
        week: Number(newAssignment.week || 1),
        blogLinks: lines(newAssignment.blogLinksText),
        githubLinks: lines(newAssignment.githubLinksText),
        studyMaterials: lines(newAssignment.studyMaterialsText)
      });
      setMsg({ type: 'success', text: 'Assignment created successfully' });
      setNewAssignment(emptyAssignment);
    } catch (error) {
      setMsg({ type: 'error', text: error.response?.data?.message || 'Error creating assignment' });
    } finally {
      setLoading(false);
    }
  };

  const submitExam = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post(`/api/admin/courses/${newExam.courseId}/exams`, {
        ...newExam,
        order: Number(newExam.order || 1),
        week: Number(newExam.week || 1),
        passingScore: Number(newExam.passingScore || 70),
        duration: Number(newExam.duration || 60)
      });
      setMsg({ type: 'success', text: 'Exam created successfully' });
      setNewExam(emptyExam);
    } catch (error) {
      setMsg({ type: 'error', text: error.response?.data?.message || 'Error creating exam' });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put('/api/admin/settings', settings);
      setMsg({ type: 'success', text: 'Platform settings updated' });
      await loadDashboard();
    } catch (error) {
      setMsg({ type: 'error', text: error.response?.data?.message || 'Error saving settings' });
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (status) => {
    if (!selectedLead) return;
    try {
      setLoading(true);
      const res = await api.put(`/api/admin/purchase-requests/${selectedLead._id}`, { status, adminNotes: leadNotes });
      setSelectedLead(res.data);
      setLeadNotes(res.data.adminNotes || '');
      setMsg({ type: 'success', text: status === 'approved' ? 'Lead approved and linked students enrolled.' : `Lead marked as ${status}` });
      await loadDashboard();
    } catch (error) {
      setMsg({ type: 'error', text: error.response?.data?.message || 'Error updating lead' });
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = (qIndex, field, value, optionIndex = null) => {
    setNewExam((prev) => {
      const questions = [...prev.questions];
      if (field === 'options') questions[qIndex].options[optionIndex] = value;
      else questions[qIndex][field] = value;
      return { ...prev, questions };
    });
  };

  const logout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div className="admin-container">
      <Header
        userType="admin"
        navigation={[
          { id: 'dashboard', label: 'Dashboard' }, { id: 'students', label: 'Students' }, { id: 'courses', label: 'Courses' },
          { id: 'assignments', label: 'Assignments' }, { id: 'exams', label: 'Exams' }, { id: 'leads', label: 'Sales Leads' },
          { id: 'settings', label: 'Settings' }, { id: 'submissions', label: 'Submissions' }
        ]}
        currentNav={activeTab}
        onNavClick={setActiveTab}
        onLogout={logout}
      />
      <div className="admin-content">
        {msg && <div className={`alert alert-${msg.type}`}>{msg.text}<button onClick={() => setMsg(null)} className="alert-close">x</button></div>}

        {activeTab === 'dashboard' && <div className="dashboard-section">
          <div className="stats-grid">
            <div className="stat-card"><h3>Total Students</h3><p className="stat-number">{stats.totalStudents}</p></div>
            <div className="stat-card"><h3>Total Courses</h3><p className="stat-number">{stats.totalCourses}</p></div>
            <div className="stat-card"><h3>Total Submissions</h3><p className="stat-number">{stats.totalSubmissions}</p></div>
            <div className="stat-card"><h3>Pending Leads</h3><p className="stat-number">{stats.pendingLeads}</p></div>
          </div>
          <div className="section-grid">
            <div className="list-card"><h3>Payment Methods</h3><div className="list-scroll">{settings.paymentMethods.map((method) => <div key={method.id} className="list-item"><div><strong>{method.label}</strong><div className="text-secondary">{method.type}</div></div><span className={`status-badge status-${method.isEnabled ? 'approved' : 'rejected'}`}>{method.isEnabled ? 'Enabled' : 'Disabled'}</span></div>)}</div></div>
            <div className="list-card"><h3>Business Copy</h3><p className="text-secondary">{settings.internshipHeadline || 'Add your internship promise and payment guidance in Settings.'}</p><div className="current-week-info">{settings.whatsappBotEnabled ? 'WhatsApp bot is enabled for payment and enrollment guidance.' : 'WhatsApp bot is disabled.'}</div></div>
          </div>
        </div>}

        {activeTab === 'students' && <div className="admin-section section-grid">
          <div className="form-card"><h3>Create Student</h3><form onSubmit={submitStudent}>
            <div className="form-group"><label>Username</label><input value={newStudent.username} onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })} required /></div>
            <div className="form-group"><label>Full Name</label><input value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} required /></div>
            <div className="form-group"><label>Email</label><input type="email" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} required /></div>
            <div className="form-group"><label>Password</label><input type="password" value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} required /></div>
            <div className="form-group"><label>Assign Courses</label><div className="course-selector">{courses.map((course) => <label key={course._id} className="checkbox-label"><input type="checkbox" checked={newStudent.assignedCourses.includes(course._id)} onChange={(e) => setNewStudent((prev) => ({ ...prev, assignedCourses: e.target.checked ? [...prev.assignedCourses, course._id] : prev.assignedCourses.filter((item) => item !== course._id) }))} />{course.title}</label>)}</div></div>
            <button className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Create Student'}</button>
          </form></div>
          <div className="list-card"><h3>Students ({students.length})</h3><div className="list-scroll">{students.map((student) => <div key={student._id || student.id} className="list-item"><div><strong>{student.name || student.username}</strong><div className="text-secondary">{student.email}</div></div><span className="status-badge status-approved">{student.courses?.length || 0} courses</span></div>)}</div></div>
        </div>}

        {activeTab === 'courses' && <div className="admin-section section-grid">
          <div className="form-card"><h3>Create Course / Internship</h3><form onSubmit={submitCourse}>
            <div className="form-group"><label>Title</label><input value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} required /></div>
            <div className="form-group"><label>Description</label><textarea value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} /></div>
            <div className="form-group"><label>Overview</label><textarea value={newCourse.overview} onChange={(e) => setNewCourse({ ...newCourse, overview: e.target.value })} /></div>
            <div className="form-row"><div className="form-group"><label>Format</label><select value={newCourse.learningFormat} onChange={(e) => setNewCourse({ ...newCourse, learningFormat: e.target.value })}><option value="course">Course</option><option value="internship">Internship</option></select></div><div className="form-group"><label>Enrollment Type</label><select value={newCourse.enrollmentType} onChange={(e) => setNewCourse({ ...newCourse, enrollmentType: e.target.value })}><option value="paid">Paid</option><option value="free">Free</option><option value="certificate-only">Certificate Only</option></select></div></div>
            <div className="form-row"><div className="form-group"><label>Course Price</label><input type="number" min="0" value={newCourse.price} onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })} /></div><div className="form-group"><label>Offer Price</label><input type="number" min="0" value={newCourse.salePrice} onChange={(e) => setNewCourse({ ...newCourse, salePrice: e.target.value })} /></div></div>
            <div className="form-row"><div className="form-group"><label>Certificate Fee</label><input type="number" min="0" value={newCourse.certificateFee} onChange={(e) => setNewCourse({ ...newCourse, certificateFee: e.target.value })} /></div><div className="form-group"><label>Mode</label><select value={newCourse.mode} onChange={(e) => setNewCourse({ ...newCourse, mode: e.target.value })}><option>Remote</option><option>Hybrid</option><option>In-Person</option></select></div></div>
            <div className="form-group"><label>What Students Learn (one per line)</label><textarea value={newCourse.learnTopicsText} onChange={(e) => setNewCourse({ ...newCourse, learnTopicsText: e.target.value })} /></div>
            <div className="form-group"><label>Highlights (one per line)</label><textarea value={newCourse.highlightsText} onChange={(e) => setNewCourse({ ...newCourse, highlightsText: e.target.value })} /></div>
            <div className="form-group"><label>Outcomes (one per line)</label><textarea value={newCourse.outcomesText} onChange={(e) => setNewCourse({ ...newCourse, outcomesText: e.target.value })} /></div>
            <div className="checkbox-row"><label className="checkbox-label"><input type="checkbox" checked={newCourse.internshipCertificateOnly} onChange={(e) => setNewCourse({ ...newCourse, internshipCertificateOnly: e.target.checked })} />Certificate-only internship flow</label></div>
            <button className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Create Offer'}</button>
          </form></div>
          <div className="list-card"><h3>Catalog ({courses.length})</h3><div className="list-scroll">{courses.map((course) => <div key={course._id} className="list-item"><div><strong>{course.title}</strong><div className="text-secondary">{course.learningFormat || 'course'} | {course.enrollmentType || 'paid'}</div><div className="text-secondary small">{money(course.salePrice || course.price)} | certificate {money(course.certificateFee)}</div></div><span className="status-badge status-approved">{course.enrolledCount || 0} enrolled</span></div>)}</div></div>
        </div>}

        {activeTab === 'assignments' && <div className="admin-section"><div className="form-card"><h3>Create Assignment</h3><form onSubmit={submitAssignment}>
          <div className="form-group"><label>Course</label><select value={newAssignment.courseId} onChange={(e) => setNewAssignment({ ...newAssignment, courseId: e.target.value })} required><option value="">Select course</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</select></div>
          <div className="form-group"><label>Title</label><input value={newAssignment.title} onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })} required /></div>
          <div className="form-group"><label>Description</label><textarea value={newAssignment.description} onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })} required /></div>
          <div className="form-row"><div className="form-group"><label>Type</label><select value={newAssignment.type} onChange={(e) => setNewAssignment({ ...newAssignment, type: e.target.value })}><option value="mini">Mini</option><option value="major">Major</option><option value="git">Git</option></select></div><div className="form-group"><label>Due Date</label><input type="datetime-local" value={newAssignment.dueDate} onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} required /></div></div>
          <div className="form-group"><label>Repository URL</label><input value={newAssignment.repositoryUrl} onChange={(e) => setNewAssignment({ ...newAssignment, repositoryUrl: e.target.value })} required /></div>
          <div className="form-group"><label>Instructions</label><textarea value={newAssignment.instructions} onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })} required /></div>
          <button className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Create Assignment'}</button>
        </form></div></div>}

        {activeTab === 'exams' && <div className="admin-section"><div className="form-card"><h3>Create Exam</h3><form onSubmit={submitExam}>
          <div className="form-group"><label>Course</label><select value={newExam.courseId} onChange={(e) => setNewExam({ ...newExam, courseId: e.target.value })} required><option value="">Select course</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</select></div>
          <div className="form-group"><label>Title</label><input value={newExam.title} onChange={(e) => setNewExam({ ...newExam, title: e.target.value })} required /></div>
          {newExam.questions.map((question, qIndex) => <div key={qIndex} className="question-block"><input type="text" placeholder="Question" value={question.question} onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)} required />{question.options.map((option, oIndex) => <div key={oIndex} className="option-block"><input type="radio" name={`correct-${qIndex}`} checked={question.correctAnswer === oIndex} onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)} /><input type="text" value={option} placeholder={`Option ${oIndex + 1}`} onChange={(e) => updateQuestion(qIndex, 'options', e.target.value, oIndex)} required /></div>)}</div>)}
          <button type="button" className="btn-secondary btn-sm" onClick={() => setNewExam((prev) => ({ ...prev, questions: [...prev.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }] }))}>Add Question</button>
          <button className="btn-primary mt-20" disabled={loading}>{loading ? 'Saving...' : 'Create Exam'}</button>
        </form></div></div>}

        {activeTab === 'leads' && <div className="admin-section section-grid">
          <div className="list-card"><h3>Purchase Requests ({purchaseRequests.length})</h3><div className="list-scroll">{purchaseRequests.map((lead) => <div key={lead._id} className="list-item"><div><strong>{lead.fullName}</strong><div className="text-secondary">{lead.courseId?.title || 'Course'}</div><div className="text-secondary small">{lead.email} | {lead.paymentMethodLabel}</div></div><div className="actions"><span className={`status-badge status-${lead.status}`}>{lead.status}</span><button className="btn-sm btn-info" onClick={() => { setSelectedLead(lead); setLeadNotes(lead.adminNotes || ''); }}>Open</button></div></div>)}</div></div>
          <div className="list-card"><h3>Lead Summary</h3><div className="detail-grid"><div><strong>Total</strong><br />{stats.totalLeads}</div><div><strong>Pending</strong><br />{stats.pendingLeads}</div><div><strong>Approved</strong><br />{purchaseRequests.filter((item) => item.status === 'approved').length}</div><div><strong>Rejected</strong><br />{purchaseRequests.filter((item) => item.status === 'rejected').length}</div></div></div>
          {selectedLead && <div className="detail-card"><h3>{selectedLead.fullName}</h3><div className="detail-grid"><div><strong>Course:</strong> {selectedLead.courseId?.title || 'Course'}</div><div><strong>Request Type:</strong> {selectedLead.requestType}</div><div><strong>Phone:</strong> {selectedLead.phone || 'Not shared'}</div><div><strong>Reference:</strong> {selectedLead.paymentReference || 'Pending'}</div><div><strong>Linked User:</strong> {selectedLead.requestedByUserId || 'Public lead'}</div><div><strong>Created:</strong> {new Date(selectedLead.createdAt).toLocaleString()}</div></div><div className="form-group mt-20"><label>Admin Notes</label><textarea value={leadNotes} onChange={(e) => setLeadNotes(e.target.value)} /></div><div className="status-actions"><button className="btn-sm btn-warning" onClick={() => updateLeadStatus('contacted')}>Contacted</button><button className="btn-sm btn-success" onClick={() => updateLeadStatus('approved')}>Approve</button><button className="btn-sm btn-danger" onClick={() => updateLeadStatus('rejected')}>Reject</button></div></div>}
        </div>}

        {activeTab === 'settings' && <div className="admin-section"><div className="form-card"><h3>Platform Settings</h3><form onSubmit={saveSettings}>
          <div className="form-row"><div className="form-group"><label>Brand Name</label><input value={settings.brandName} onChange={(e) => setSettings({ ...settings, brandName: e.target.value })} /></div><div className="form-group"><label>Support Email</label><input type="email" value={settings.supportEmail} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} /></div></div>
          <div className="form-row"><div className="form-group"><label>Support Phone</label><input value={settings.supportPhone} onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })} /></div><div className="form-group"><label>WhatsApp Number</label><input value={settings.whatsappNumber} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} /></div></div>
          <div className="checkbox-row"><label className="checkbox-label"><input type="checkbox" checked={settings.whatsappBotEnabled} onChange={(e) => setSettings({ ...settings, whatsappBotEnabled: e.target.checked })} />Enable WhatsApp bot messaging</label></div>
          <div className="form-group"><label>WhatsApp Automation Copy</label><textarea value={settings.whatsappAutomationNote} onChange={(e) => setSettings({ ...settings, whatsappAutomationNote: e.target.value })} /></div>
          <div className="form-group"><label>Internship Headline</label><textarea value={settings.internshipHeadline} onChange={(e) => setSettings({ ...settings, internshipHeadline: e.target.value })} /></div>
          {settings.paymentMethods.map((method, index) => <div key={method.id} className="payment-method-card"><div className="form-row"><div className="form-group"><label>Label</label><input value={method.label} onChange={(e) => { const paymentMethods = [...settings.paymentMethods]; paymentMethods[index] = { ...paymentMethods[index], label: e.target.value }; setSettings({ ...settings, paymentMethods }); }} /></div><div className="form-group"><label>Type</label><select value={method.type} onChange={(e) => { const paymentMethods = [...settings.paymentMethods]; paymentMethods[index] = { ...paymentMethods[index], type: e.target.value }; setSettings({ ...settings, paymentMethods }); }}><option value="qr">QR</option><option value="link">Link</option><option value="email">Email</option><option value="bank">Bank</option></select></div></div><div className="form-group"><label>Instructions</label><textarea value={method.instructions || ''} onChange={(e) => { const paymentMethods = [...settings.paymentMethods]; paymentMethods[index] = { ...paymentMethods[index], instructions: e.target.value }; setSettings({ ...settings, paymentMethods }); }} /></div><div className="checkbox-row"><label className="checkbox-label"><input type="checkbox" checked={method.isEnabled} onChange={(e) => { const paymentMethods = [...settings.paymentMethods]; paymentMethods[index] = { ...paymentMethods[index], isEnabled: e.target.checked }; setSettings({ ...settings, paymentMethods }); }} />Enable this method</label></div></div>)}
          <button className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Settings'}</button>
        </form></div></div>}

        {activeTab === 'submissions' && <div className="admin-section"><div className="list-card"><h3>Submissions ({submissions.length})</h3><div className="list-scroll">{submissions.map((submission) => <div key={submission._id} className="list-item"><div><strong>{submission.type}</strong><div className="text-secondary">{submission.courseId?.title || 'Course'}</div></div><span className="status-badge status-approved">{submission.assignmentSubmission?.status || submission.certificate?.paymentStatus || (submission.examSubmission?.passed ? 'Passed' : 'Recorded')}</span></div>)}</div></div></div>}
      </div>
    </div>
  );
}
