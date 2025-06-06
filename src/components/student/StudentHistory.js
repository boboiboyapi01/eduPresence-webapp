import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import BottomNavigation from '../common/BottomNavigation';

const StudentHistory = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reasonInputs, setReasonInputs] = useState({});

  useEffect(() => {
    console.log('StudentHistory useEffect - currentUser:', currentUser, 'userRole:', userRole);
    if (!currentUser || userRole !== 'student') {
      console.log('Redirecting to login from StudentHistory');
      navigate('/login');
      return;
    }

    const fetchAttendanceHistory = async () => {
      try {
        console.log('Fetching attendance history for studentId:', currentUser.uid);
        const q = query(
          collection(db, 'attendances'),
          where('studentId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        console.log('Attendance docs fetched:', querySnapshot.docs.length);
        const attendanceList = [];
        for (const docSnap of querySnapshot.docs) {
          const attendance = { id: docSnap.id, ...docSnap.data() };
          const classRef = doc(db, 'classes', attendance.classId);
          const classDoc = await getDoc(classRef);
          if (classDoc.exists()) {
            attendance.className = classDoc.data().name;
          } else {
            attendance.className = 'Unknown Class';
          }
          attendanceList.push(attendance);
        }
        setAttendances(attendanceList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching attendance history:', err);
        setError('Failed to load attendance history.');
        setLoading(false);
      }
    };

    fetchAttendanceHistory();
  }, [currentUser, userRole, navigate]);

  const handleReasonChange = (attendanceId, value) => {
    setReasonInputs((prev) => ({ ...prev, [attendanceId]: value }));
  };

  const handleSubmitReason = async (attendanceId) => {
    try {
      const reason = reasonInputs[attendanceId];
      if (!reason) return;
      const attendanceRef = doc(db, 'attendances', attendanceId);
      await updateDoc(attendanceRef, { reason });
      setAttendances((prev) =>
        prev.map((att) =>
          att.id === attendanceId ? { ...att, reason } : att
        )
      );
    } catch (err) {
      console.error('Error submitting reason:', err);
      setError('Failed to submit reason');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 pb-20 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Attendance History</h1>
      <div>
        <h2 className="text-xl font-semibold text-gray-600 mb-4">Your Attendance Records</h2>
        {attendances.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {attendances.map((attendance) => (
              <div key={attendance.id} className="border p-4 rounded shadow bg-gray-50">
                <p className="text-gray-800"><strong>Class:</strong> {attendance.className}</p>
                <p className="text-gray-600"><strong>Date:</strong> {new Date(attendance.timestamp.seconds * 1000).toLocaleString()}</p>
                <p className="text-gray-600"><strong>Status:</strong> {attendance.status}</p>
                <p className="text-gray-600"><strong>Reason:</strong> {attendance.reason || 'None'}</p>
                {attendance.status === 'late' && !attendance.reason && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={reasonInputs[attendance.id] || ''}
                      onChange={(e) => handleReasonChange(attendance.id, e.target.value)}
                      className="border p-1 rounded mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter reason (e.g., sick, permission)"
                    />
                    <button
                      onClick={() => handleSubmitReason(attendance.id)}
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                    >
                      Submit Reason
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You have not taken attendance yet.</p>
        )}
      </div>
      <BottomNavigation userRole="student" />
    </div>
  );
};

export default StudentHistory;