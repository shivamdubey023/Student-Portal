import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import StudentDashboard from './pages/StudentDashboard.jsx'
import StudentCourses from './pages/StudentCourses.jsx'
import StudentCourseView from './pages/StudentCourseView.jsx'
import StudentAssignments from './pages/StudentAssignments.jsx'
import StudentProgress from './pages/StudentProgress.jsx'
import StudentProfile from './pages/StudentProfile.jsx'

const getRole = () => localStorage.getItem('role')

const Protected = ({role, children}) => {
  const r = getRole()
  if (!localStorage.getItem('token')) return <Navigate to="/login" />
  if (role && r !== role) return <Navigate to="/login" />
  return children
}

export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/admin" element={<Protected role="admin"><AdminDashboard/></Protected>} />
      <Route path="/admin/dashboard" element={<Protected role="admin"><AdminDashboard/></Protected>} />
      <Route path="/student" element={<Protected role="student"><StudentDashboard/></Protected>} />
      <Route path="/student/dashboard" element={<Protected role="student"><StudentDashboard/></Protected>} />
      <Route path="/student/courses" element={<Protected role="student"><StudentCourses/></Protected>} />
      <Route path="/student/course/:id" element={<Protected role="student"><StudentCourseView/></Protected>} />
      <Route path="/student/assignments" element={<Protected role="student"><StudentAssignments/></Protected>} />
      <Route path="/student/progress" element={<Protected role="student"><StudentProgress/></Protected>} />
      <Route path="/student/profile" element={<Protected role="student"><StudentProfile/></Protected>} />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  )
}
