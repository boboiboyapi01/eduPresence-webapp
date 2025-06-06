import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AuthProvider } from './contexts/AuthContext';

import FaceVerification from './components/auth/FaceVerification';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import SetupProfile from './components/common/SetupProfile';
import StudentDashboard from './components/student/StudentDashboard';
import JoinClass from './components/student/JoinClass';
import ClassInfo from './components/student/ClassInfo';
import AttendanceButton from './components/student/AttendanceButton';
import StudentHistory from './components/student/StudentHistory';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import ClassAttendance from './components/teacher/ClassAttendance';
import ClassSettings from './components/teacher/ClassSettings';
import CreateClass from './components/teacher/CreateClass';
import StudentManagement from './components/teacher/StudentManagement';
import AttendanceHistory from './components/teacher/AttendanceHistory';
import ClassManagement from './components/teacher/ClassManagement';
import TeacherHistory from './components/teacher/TeacherHistory';
import BottomNavigation from './components/common/BottomNavigation';
import Profile from './components/common/Profile';
import ProtectedRoute from './components/common/ProtectedRoute';

const AppContent = () => {
  const { currentUser, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('AppContent useEffect - currentUser:', currentUser, 'userRole:', userRole, 'loading:', loading, 'location:', location.pathname);
    if (!loading) {
      if (!currentUser && location.pathname !== '/register' && location.pathname !== '/login') {
        console.log('No user, navigating to login');
        navigate('/login');
      } else if (currentUser && !userRole && location.pathname !== '/setup-profile') {
        console.log('User logged in but no role, navigating to setup-profile');
        navigate('/setup-profile');
      } else if (currentUser && userRole && (location.pathname === '/' || location.pathname === '/login')) {
        console.log('User logged in, navigating to face verification');
        navigate('/face-verification');
      }
    }
  }, [currentUser, userRole, loading, navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/face-verification" element={<FaceVerification />} />
        <Route path="/setup-profile" element={<SetupProfile />} />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/join-class"
          element={
            <ProtectedRoute role="student">
              <JoinClass />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/class/:classId"
          element={
            <ProtectedRoute role="student">
              <ClassInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/history"
          element={
            <ProtectedRoute role="student">
              <StudentHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute role="student">
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/class/:classId/settings"
          element={
            <ProtectedRoute role="teacher">
              <ClassSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/create-class"
          element={
            <ProtectedRoute role="teacher">
              <CreateClass />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/history"
          element={
            <ProtectedRoute role="teacher">
              <TeacherHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/profile"
          element={
            <ProtectedRoute role="teacher">
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<div className="p-6">404 - Page Not Found</div>} />
      </Routes>
      {(currentUser && userRole === 'student' && location.pathname.startsWith('/student') && location.pathname !== '/setup-profile') ||
      (currentUser && userRole === 'teacher' && location.pathname.startsWith('/teacher') && location.pathname !== '/setup-profile') ? (
        <BottomNavigation userRole={userRole} />
      ) : null}
    </div>
  );
};

const App = () => {
  console.log('Rendering App component');
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;