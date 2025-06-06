import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/firebase';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import BottomNavigation from '../common/BottomNavigation';

const StudentDashboard = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    console.log('StudentDashboard useEffect - currentUser:', currentUser, 'userRole:', userRole);
    if (!currentUser || userRole !== 'student') {
      console.log('Redirecting to login due to no user or incorrect role');
      navigate('/login');
      return;
    }

    const fetchClasses = async () => {
      try {
        console.log('Fetching enrollments for studentId:', currentUser.uid);
        const q = query(
          collection(db, 'enrollments'),
          where('studentId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        console.log('Enrollments fetched:', querySnapshot.docs.length);
        const classList = [];
        for (const docSnap of querySnapshot.docs) {
          const enrollment = docSnap.data();
          if (!enrollment.classId || enrollment.classId === 'classId') continue;
          const classRef = doc(db, 'classes', enrollment.classId);
          const classDoc = await getDoc(classRef);
          if (classDoc.exists()) {
            classList.push({ id: classDoc.id, ...classDoc.data() });
          }
        }
        console.log('Classes loaded:', classList);
        setClasses(classList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to load classes');
        setLoading(false);
      }
    };

    const fetchProfile = async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setDisplayName(userDoc.data().displayName || '');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchClasses();
    fetchProfile();
  }, [currentUser, userRole, navigate]);

  const handleViewClass = (classId) => {
    console.log('Navigating to view class:', classId);
    navigate(`/student/class/${classId}`);
  };

  const handleJoinClass = () => {
    console.log('Navigating to join class');
    navigate('/student/join-class');
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 pb-20 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Classes</h1>
        <h2 className="text-xl font-semibold text-gray-600 mb-4">Welcome, {displayName || currentUser?.email || 'Guest'}!</h2>
        <div className="flex space-x-4">
          <button
            onClick={handleJoinClass}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Join Class
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-600 mb-4">Your Classes</h2>
        {classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((classItem) => (
              <div key={classItem.id} className="border p-4 rounded shadow bg-gray-50">
                <h3 className="text-lg font-medium text-gray-800">{classItem.name}</h3>
                <p className="text-gray-600">Teacher: {classItem.teacherName || 'Unknown'}</p>
                <p className="text-gray-600">Schedule: {classItem.schedule}</p>
                <button
                  onClick={() => handleViewClass(classItem.id)}
                  className="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                >
                  View Class
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You are not enrolled in any classes yet.</p>
        )}
      </div>

      <BottomNavigation userRole="student" />
    </div>
  );
};

export default StudentDashboard;