import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import BottomNavigation from '../common/BottomNavigation';

const ClassInfo = () => {
  const { classId } = useParams();
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const classRef = doc(db, 'classes', classId);
        const classDoc = await getDoc(classRef);
        if (!classDoc.exists()) {
          setError('Class not found');
          setLoading(false);
          return;
        }
        setClassData(classDoc.data());
        setLoading(false);
      } catch (err) {
        console.error('Error fetching class data:', err);
        setError('Failed to load class data');
        setLoading(false);
      }
    };
    fetchClassData();
  }, [classId]);

  const formatSchedule = (schedule) => {
    if (!schedule) return 'No schedule set';
    if (schedule.type === 'One Time') {
      return `One Time: ${new Date(schedule.date).toLocaleDateString()}`;
    } else if (schedule.type === 'Weekly') {
      return `Weekly: ${schedule.days.map((day) => `${day.day} (${day.times.join(', ')})`).join('; ')}`;
    } else if (schedule.type === 'Monthly') {
      return `Monthly: Date ${schedule.date}`;
    }
    return 'Unknown schedule';
  };

  if (!currentUser || userRole !== 'student') {
    navigate('/login');
    return null;
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 pb-20 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{classData.name}</h1>
        <p className="text-gray-600">Teacher: {classData.teacherName}</p>
        <p className="text-gray-600">Class Code: {classData.code}</p>
        <p className="text-gray-600">Schedule: {formatSchedule(classData.schedule)}</p>
        {classData.location && (
          <div className="mt-2">
            <p className="text-gray-600">
              Attendance Location: Lat {classData.location.latitude.toFixed(4)}, Lng {classData.location.longitude.toFixed(4)}
            </p>
            <p className="text-gray-600">Radius: {classData.location.radius}m</p>
          </div>
        )}
      </div>
      <BottomNavigation userRole="student" />
    </div>
  );
};

export default ClassInfo;