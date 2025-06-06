import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import BottomNavigation from '../common/BottomNavigation';

const TeacherHistory = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('TeacherHistory useEffect - currentUser:', currentUser, 'userRole:', userRole);
    if (!currentUser || userRole !== 'teacher') {
      console.log('Redirecting to login from TeacherHistory');
      navigate('/login');
      return;
    }

    const fetchAttendanceHistory = async () => {
      try {
        console.log('Fetching classes for teacherId:', currentUser.uid);
        const classesQuery = query(
          collection(db, 'classes'),
          where('teacherId', '==', currentUser.uid)
        );
        const classesSnapshot = await getDocs(classesQuery);
        const classIds = classesSnapshot.docs.map((doc) => doc.id);
        console.log('Classes fetched:', classIds);

        const attendanceList = [];
        for (const classId of classIds) {
          console.log('Fetching attendances for classId:', classId);
          const attendanceQuery = query(
            collection(db, 'attendances'),
            where('classId', '==', classId)
          );
          const attendanceSnapshot = await getDocs(attendanceQuery);
          for (const docSnap of attendanceSnapshot.docs) {
            const attendance = { id: docSnap.id, ...docSnap.data() };
            const classRef = doc(db, 'classes', attendance.classId);
            const classDoc = await getDoc(classRef);
            const studentRef = doc(db, 'users', attendance.studentId);
            const studentDoc = await getDoc(studentRef);
            attendance.className = classDoc.exists() ? classDoc.data().name : 'Unknown Class';
            attendance.studentEmail = studentDoc.exists() ? studentDoc.data().email : 'Unknown Student';
            attendanceList.push(attendance);
          }
        }
        console.log('Attendances loaded:', attendanceList);
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

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 pb-20 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Attendance History</h1>
      <div>
        <h2 className="text-xl font-semibold text-gray-600 mb-4">Attendance Records</h2>
        {attendances.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {attendances.map((attendance) => (
              <div key={attendance.id} className="border p-4 rounded shadow bg-gray-50">
                <p className="text-gray-800"><strong>Class:</strong> {attendance.className}</p>
                <p className="text-gray-600"><strong>Student:</strong> {attendance.studentEmail}</p>
                <p className="text-gray-600"><strong>Date:</strong> {new Date(attendance.timestamp.seconds * 1000).toLocaleString()}</p>
                <p className="text-gray-600"><strong>Status:</strong> {attendance.status}</p>
                <p className="text-gray-600"><strong>Reason:</strong> {attendance.reason || 'None'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No attendance records found.</p>
        )}
      </div>
      <BottomNavigation userRole="teacher" />
    </div>
  );
};

export default TeacherHistory;