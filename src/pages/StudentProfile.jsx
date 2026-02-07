import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import '../styles.css';

export default function StudentProfile() {
  const nav = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdMsg, setPwdMsg] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('Please log in first');
        setLoading(false);
        return;
      }
      const response = await api.get(`/api/students/${userId}`);
      setStudent(response.data);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.error || 'Error loading profile');
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg(null);
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New password and confirm password do not match' });
      return;
    }
    try {
      const userId = localStorage.getItem('userId');
      await api.post(`/api/students/${userId}/change-password`, {
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword
      });
      setPwdMsg({ type: 'success', text: 'Password updated successfully' });
      setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update password' });
    }
  };

  if (loading) return <p className="loading">Loading profile...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!student) return <p className="error">Profile not found</p>;

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
        currentNav="profile"
        onNavClick={(id) => nav(`/student/${id}`)}
      />
      <div className="profile-container">
        <h1>My Profile</h1>

        <div className="profile-view">
          <div className="profile-card">
            <div className="profile-row">
              <span className="label">Name:</span>
              <span className="value">{student.name || 'Not set'}</span>
            </div>
            <div className="profile-row">
              <span className="label">Username:</span>
              <span className="value">{student.username}</span>
            </div>
            <div className="profile-row">
              <span className="label">Email:</span>
              <span className="value">{student.email || 'Not set'}</span>
            </div>
            <div className="profile-row">
              <span className="label">Account Status:</span>
              <span className={`value ${student.locked ? 'locked' : 'active'}`}>
                {student.locked ? 'Locked' : 'Active'}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-card" style={{ marginTop: 20 }}>
          <h3>Change Password</h3>
          {pwdMsg && <div className={`message ${pwdMsg.type}`}>{pwdMsg.text}</div>}
          <form onSubmit={handleChangePassword} className="profile-form">
            <div className="form-group">
              <label>Old Password</label>
              <input
                type="password"
                value={pwdForm.oldPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, oldPassword: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={pwdForm.newPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={pwdForm.confirmPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Update Password</button>
          </form>
        </div>
      </div>
    </div>
  );
}
