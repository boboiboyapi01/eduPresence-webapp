import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import BottomNavigation from '../common/BottomNavigation';

const TeacherDashboard = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    console.log('TeacherDashboard useEffect - currentUser:', currentUser, 'userRole:', userRole);
    if (!currentUser || userRole !== 'teacher') {
      console.log('Redirecting to login due to no user or incorrect role');
      navigate('/login');
      return;
    }

    const fetchClasses = async () => {
      try {
        console.log('Fetching classes for teacherId:', currentUser.uid);
        const q = query(
          collection(db, 'classes'),
          where('teacherId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const classList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
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

  const handleSettings = (classId) => {
    console.log('Navigating to settings for class:', classId);
    navigate(`/teacher/class/${classId}/settings`);
  };

  const handleCreateClass = () => {
    console.log('Navigating to create class');
    navigate('/teacher/create-class');
  };

  const formatSchedule = (schedule) => {
    if (schedule.type === 'One Time') {
      return `One Time: ${new Date(schedule.date).toLocaleDateString()}`;
    } else if (schedule.type === 'Weekly') {
      return `Weekly: ${schedule.days.map((day) => `${day.day} (${day.times.join(', ')})`).join('; ')}`;
    } else if (schedule.type === 'Monthly') {
      return `Monthly: Date ${schedule.date}`;
    }
    return 'Unknown schedule';
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
            onClick={handleCreateClass}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Create Class
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
                <p className="text-gray-600">Class Code: {classItem.code || 'No code'}</p>
                <p className="text-gray-600">Teacher Code: {classItem.teacherCode || 'No teacher code'}</p>
                <p className="text-gray-600">Schedule: {formatSchedule(classItem.schedule)}</p>
                <button
                  onClick={() => handleSettings(classItem.id)}
                  className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
                >
                  Settings
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You are not assigned to any classes yet.</p>
        )}
      </div>

      <BottomNavigation userRole="teacher" />
    </div>
  );
};

export default TeacherDashboard;