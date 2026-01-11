import { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles.css';

export default function ExploreCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/api/courses');
      setCourses(response.data);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.response?.data?.error || 'Error loading courses');
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('Please log in to enroll in a course');
        return;
      }
      alert(`Successfully enrolled in course! (Feature in progress)`);
      // TODO: Add enrollment API call
    } catch (err) {
      console.error('Error enrolling in course:', err);
      alert('Failed to enroll in course');
    }
  };

  if (loading) return <p className="loading">Loading courses...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="explore-container">
      <h1>Explore Courses</h1>
      
      {selectedCourse ? (
        <div className="course-detail">
          <button onClick={() => setSelectedCourse(null)} className="btn-back">← Back to Courses</button>
          
          <div className="course-header">
            <h2>{selectedCourse.title}</h2>
            <div className="course-meta">
              <span className="duration">📅 {selectedCourse.duration}</span>
              <span className="mode">🌐 {selectedCourse.mode}</span>
              <span className="category">🟢 {selectedCourse.category}</span>
            </div>
          </div>

          {selectedCourse.overview && (
            <div className="course-section">
              <h3>Program Overview</h3>
              <p>{selectedCourse.overview}</p>
            </div>
          )}

          {selectedCourse.learnTopics && selectedCourse.learnTopics.length > 0 && (
            <div className="course-section">
              <h3>What You'll Learn</h3>
              <ul>
                {selectedCourse.learnTopics.map((topic, idx) => (
                  <li key={idx}>{topic}</li>
                ))}
              </ul>
            </div>
          )}

          {selectedCourse.tools && selectedCourse.tools.length > 0 && (
            <div className="course-section">
              <h3>Tools & Technologies</h3>
              <ul>
                {selectedCourse.tools.map((tool, idx) => (
                  <li key={idx}>{tool}</li>
                ))}
              </ul>
            </div>
          )}

          {selectedCourse.projects && (
            <div className="course-section">
              <h3>Project Structure</h3>
              {selectedCourse.projects.minor && selectedCourse.projects.minor.length > 0 && (
                <div>
                  <h4>Minor Projects:</h4>
                  <ul>
                    {selectedCourse.projects.minor.map((proj, idx) => (
                      <li key={idx}>{proj}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedCourse.projects.major && (
                <div>
                  <h4>Major Capstone Project:</h4>
                  <p>{selectedCourse.projects.major}</p>
                </div>
              )}
            </div>
          )}

          {selectedCourse.certification && (
            <div className="course-section">
              <h3>Certification</h3>
              <p>{selectedCourse.certification}</p>
            </div>
          )}

          <button 
            onClick={() => handleEnroll(selectedCourse._id)} 
            className="btn-enroll"
          >
            Enroll in {selectedCourse.title}
          </button>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map(course => (
            <div key={course._id} className="course-card">
              <h3>{course.title}</h3>
              <div className="course-info">
                <p><strong>Duration:</strong> {course.duration}</p>
                <p><strong>Mode:</strong> {course.mode}</p>
                <p><strong>Category:</strong> {course.category}</p>
                <p><strong>Enrolled:</strong> {course.enrolledCount || 0} students</p>
              </div>
              {course.description && (
                <p className="description">{course.description}</p>
              )}
              <button 
                onClick={() => setSelectedCourse(course)} 
                className="btn-view"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
