import { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles.css';

export default function StudentProfile() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);

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
      setFormData(response.data);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.error || 'Error loading profile');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId');
      const response = await api.put(`/api/students/${userId}`, formData);
      setStudent(response.data);
      setEditMode(false);
      alert('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    }
  };

  if (loading) return <p className="loading">Loading profile...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!student) return <p className="error">Profile not found</p>;

  return (
    <div className="profile-container">
      <h1>My Profile</h1>
      
      {editMode ? (
        <form onSubmit={handleUpdateProfile} className="profile-form">
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              placeholder="Full Name"
            />
          </div>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username || ''}
              disabled
              className="disabled-input"
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              placeholder="Email Address"
            />
          </div>
          <div className="form-group">
            <label>Student ID:</label>
            <input
              type="text"
              value={student.studentId || 'Not assigned'}
              disabled
              className="disabled-input"
            />
          </div>
          <div className="form-group">
            <label>Roll ID:</label>
            <input
              type="text"
              value={student.rollId || 'Not assigned'}
              disabled
              className="disabled-input"
            />
          </div>
          <div className="form-actions">
            <button onClick={() => handleUpdateProfile(e)} className="btn-primary">Save Changes</button>
            <button type="button" onClick={() => setEditMode(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      ) : (
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
              <span className="label">Student ID:</span>
              <span className="value">{student.studentId || 'Not assigned'}</span>
            </div>
            <div className="profile-row">
              <span className="label">Roll ID (Certificate):</span>
              <span className="value">{student.rollId || 'Not assigned'}</span>
            </div>
            <div className="profile-row">
              <span className="label">Account Status:</span>
              <span className={`value ${student.locked ? 'locked' : 'active'}`}>
                {student.locked ? 'Locked' : 'Active'}
              </span>
            </div>
          </div>
          <button onClick={() => setEditMode(true)} className="btn-primary">Edit Profile</button>
        </div>
      )}
    </div>
  );
}
