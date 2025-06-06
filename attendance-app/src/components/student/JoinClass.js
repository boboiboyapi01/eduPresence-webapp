import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import BottomNavigation from '../common/BottomNavigation';

const JoinClass = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const [classCode, setClassCode] = useState('');
  const [error, setError] = useState(null);

  const handleJoinClass = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      if (!classCode) {
        setError('Class code is required');
        return;
      }
      const q = query(collection(db, 'classes'), where('code', '==', classCode.toUpperCase()));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setError('Class not found');
        return;
      }
      const classDoc = querySnapshot.docs[0];
      const classData = classDoc.data();
      const enrollmentRef = collection(db, 'enrollments');
      const enrollmentQuery = query(
        enrollmentRef,
        where('studentId', '==', currentUser.uid),
        where('classId', '==', classDoc.id)
      );
      const enrollmentSnapshot = await getDocs(enrollmentQuery);
      if (!enrollmentSnapshot.empty) {
        setError('You are already enrolled in this class');
        return;
      }
      await addDoc(enrollmentRef, {
        studentId: currentUser.uid,
        classId: classDoc.id,
        joinedAt: new Date(),
      });
      navigate(`/student/class/${classDoc.id}`);
    } catch (err) {
      console.error('Error joining class:', err);
      setError('Failed to join class');
    }
  };

  if (!currentUser || userRole !== 'student') {
    navigate('/login');
    return null;
  }

  return (
    <div className="p-6 pb-20 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="text-gray-600 hover:text-gray-800 mr-4"
          aria-label="Back"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Join a Class</h1>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleJoinClass} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Class Code</label>
          <input
            type="text"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            className="mt-1 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter class code"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
        >
          Join Class
        </button>
      </form>
      <BottomNavigation userRole="student" />
    </div>
  );
};

export default JoinClass;