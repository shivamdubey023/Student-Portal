import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles.css';

const emptyLead = {
  fullName: '',
  email: '',
  phone: '',
  city: '',
  learnerGoal: '',
  note: '',
  paymentMethodId: '',
  paymentReference: '',
  wantsWhatsAppUpdates: true
};

const money = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

export default function ExploreCourses() {
  const [courses, setCourses] = useState([]);
  const [settings, setSettings] = useState({ paymentMethods: [], brandName: 'SIH Learn', internshipHeadline: '' });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [leadForm, setLeadForm] = useState(emptyLead);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const enabledPaymentMethods = useMemo(
    () => (settings.paymentMethods || []).filter((item) => item.isEnabled),
    [settings.paymentMethods]
  );

  useEffect(() => {
    const load = async () => {
      try {
        const [coursesRes, settingsRes] = await Promise.all([
          api.get('/api/courses'),
          api.get('/api/platform/settings')
        ]);
        setCourses(coursesRes.data || []);
        setSettings(settingsRes.data || { paymentMethods: [] });
        setLeadForm((prev) => ({ ...prev, paymentMethodId: settingsRes.data?.paymentMethods?.find((item) => item.isEnabled)?.id || '' }));
      } catch (error) {
        setMsg({ type: 'error', text: error.response?.data?.message || 'Unable to load courses right now.' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const requestTypeFor = (course) => {
    if (course?.enrollmentType === 'certificate-only') return 'certificate';
    if (course?.learningFormat === 'internship') return 'internship';
    return 'course';
  };

  const primaryPrice = (course) => {
    if (course?.enrollmentType === 'certificate-only') return course?.certificateFee || 0;
    return course?.salePrice || course?.price || 0;
  };

  const submitLead = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      setSubmitting(true);
      const userId = localStorage.getItem('userId') || '';
      const res = await api.post('/api/platform/purchase-requests', {
        courseId: selectedCourse._id,
        requestedByUserId: userId,
        requestType: requestTypeFor(selectedCourse),
        ...leadForm
      });
      setMsg({ type: 'success', text: `${res.data.message}. ${res.data.paymentInstructions || ''}`.trim() });
      setLeadForm({
        ...emptyLead,
        paymentMethodId: enabledPaymentMethods[0]?.id || ''
      });
    } catch (error) {
      setMsg({ type: 'error', text: error.response?.data?.message || 'Unable to send your request.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="loading">Loading offers...</p>;

  return (
    <div className="explore-page">
      <section className="hero-shell">
        <div className="hero-copy">
          <div className="hero-pill">Course sales, internship tracks, exams, and certificates in one flow</div>
          <h1>{settings.brandName || 'SIH Learn'} helps students join the right program and finish with proof of skill.</h1>
          <p>
            Explore paid courses, certificate-only internships, and guided learning paths with exams, projects, and completion support.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn-secondary hero-link">Student / Admin Login</Link>
            <button className="btn-primary hero-link" onClick={() => setSelectedCourse(courses[0] || null)}>Start Enrollment</button>
          </div>
        </div>
        <div className="hero-panel">
          <h3>Why this works</h3>
          <ul className="hero-list">
            <li>Students can buy a course or request an internship seat from the same portal.</li>
            <li>Admins choose whether payment happens by QR, online link, or manual contact.</li>
            <li>Courses include structure, assignments, exams, and certificate eligibility.</li>
          </ul>
          <p className="hero-note">{settings.internshipHeadline}</p>
        </div>
      </section>

      {msg && <div className={`message ${msg.type}`}>{msg.text}</div>}

      {selectedCourse ? (
        <section className="course-detail-shell">
          <button onClick={() => setSelectedCourse(null)} className="btn-back">Back to all offers</button>
          <div className="section-grid course-detail-layout">
            <div className="course-detail">
              <div className="offer-badges">
                <span className="status-badge status-approved">{selectedCourse.learningFormat || 'course'}</span>
                <span className="status-badge status-reviewed">{selectedCourse.enrollmentType || 'paid'}</span>
              </div>
              <h2>{selectedCourse.title}</h2>
              <p className="description">{selectedCourse.description || selectedCourse.overview}</p>
              <div className="price-banner">
                <div>
                  <strong>{money(primaryPrice(selectedCourse))}</strong>
                  {selectedCourse.salePrice > 0 && selectedCourse.price > selectedCourse.salePrice && (
                    <span className="text-secondary old-price">{money(selectedCourse.price)}</span>
                  )}
                </div>
                <div className="text-secondary">
                  Certificate fee: {money(selectedCourse.certificateFee || 0)}
                </div>
              </div>
              <div className="detail-grid">
                <div><strong>Duration:</strong> {selectedCourse.duration}</div>
                <div><strong>Mode:</strong> {selectedCourse.mode}</div>
                <div><strong>Category:</strong> {selectedCourse.category}</div>
                <div><strong>Enrolled:</strong> {selectedCourse.enrolledCount || 0}</div>
              </div>

              {!!selectedCourse.learnTopics?.length && (
                <div className="course-section">
                  <h3>What students learn</h3>
                  <ul>{selectedCourse.learnTopics.map((item, index) => <li key={index}>{item}</li>)}</ul>
                </div>
              )}

              {!!selectedCourse.highlights?.length && (
                <div className="course-section">
                  <h3>Why students choose it</h3>
                  <ul>{selectedCourse.highlights.map((item, index) => <li key={index}>{item}</li>)}</ul>
                </div>
              )}

              {!!selectedCourse.outcomes?.length && (
                <div className="course-section">
                  <h3>Outcomes</h3>
                  <ul>{selectedCourse.outcomes.map((item, index) => <li key={index}>{item}</li>)}</ul>
                </div>
              )}

              {selectedCourse.certification && (
                <div className="course-section">
                  <h3>Certificate path</h3>
                  <p>{selectedCourse.certification}</p>
                </div>
              )}
            </div>

            <div className="form-card">
              <h3>Request enrollment</h3>
              <form onSubmit={submitLead}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input value={leadForm.fullName} onChange={(e) => setLeadForm({ ...leadForm, fullName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input value={leadForm.city} onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Goal</label>
                  <input value={leadForm.learnerGoal} onChange={(e) => setLeadForm({ ...leadForm, learnerGoal: e.target.value })} placeholder="Job switch, internship, placement, portfolio..." />
                </div>
                <div className="form-group">
                  <label>Payment Option</label>
                  <select value={leadForm.paymentMethodId} onChange={(e) => setLeadForm({ ...leadForm, paymentMethodId: e.target.value })} required>
                    <option value="">Select payment method</option>
                    {enabledPaymentMethods.map((method) => <option key={method.id} value={method.id}>{method.label}</option>)}
                  </select>
                </div>
                {leadForm.paymentMethodId && (
                  <div className="course-section compact">
                    <h3>Payment instructions</h3>
                    <p>{enabledPaymentMethods.find((item) => item.id === leadForm.paymentMethodId)?.instructions || 'Admin will contact you.'}</p>
                  </div>
                )}
                <div className="form-group">
                  <label>Payment Reference</label>
                  <input value={leadForm.paymentReference} onChange={(e) => setLeadForm({ ...leadForm, paymentReference: e.target.value })} placeholder="Transaction ID / screenshot note" />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea value={leadForm.note} onChange={(e) => setLeadForm({ ...leadForm, note: e.target.value })} placeholder="Preferred batch, internship questions, timing..." />
                </div>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={leadForm.wantsWhatsAppUpdates}
                    onChange={(e) => setLeadForm({ ...leadForm, wantsWhatsAppUpdates: e.target.checked })}
                  />
                  Send updates on WhatsApp when available
                </label>
                <button className="btn-enroll" disabled={submitting}>{submitting ? 'Submitting...' : 'Send Enrollment Request'}</button>
              </form>
            </div>
          </div>
        </section>
      ) : (
        <section className="catalog-shell">
          <div className="catalog-head">
            <h2>Choose your next program</h2>
            <p>Courses can be full-price, discounted, or internship tracks where students only pay for the certificate.</p>
          </div>
          <div className="courses-grid">
            {courses.map((course) => (
              <article key={course._id} className="course-card catalog-card" onClick={() => setSelectedCourse(course)}>
                <div className="offer-badges">
                  <span className="status-badge status-approved">{course.learningFormat || 'course'}</span>
                  <span className="status-badge status-reviewed">{course.enrollmentType || 'paid'}</span>
                </div>
                <h3>{course.title}</h3>
                <p className="description">{course.description || 'Structured training with guided learning and certification.'}</p>
                <div className="catalog-price">
                  <strong>{money(primaryPrice(course))}</strong>
                  {course.enrollmentType === 'certificate-only' && <span className="text-secondary">certificate fee</span>}
                </div>
                <div className="course-info">
                  <p><strong>Mode:</strong> {course.mode}</p>
                  <p><strong>Duration:</strong> {course.duration}</p>
                  <p><strong>Exams & Certificate:</strong> Included workflow</p>
                </div>
                <button className="btn-view">View Details</button>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
