import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const ClassAttendance = () => {
  const { classId } = useParams();
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser || (userRole !== 'teacher' && userRole !== 'student')) {
      navigate('/login');
      return;
    }

    const fetchClassAndStudents = async () => {
      try {
        console.log('Fetching class details for classId:', classId);
        if (!classId || classId === 'classId') {
          throw new Error('Invalid classId');
        }
        const classRef = doc(db, 'classes', classId);
        const classDoc = await getDoc(classRef);
        if (!classDoc.exists()) {
          throw new Error('Class not found');
        }
        const classData = { id: classDoc.id, ...classDoc.data() };
        setClassData(classData);

        if (userRole === 'teacher') {
          const q = query(
            collection(db, 'enrollments'),
            where('classId', '==', classId)
          );
          const querySnapshot = await getDocs(q);
          const studentList = [];
          for (const docSnap of querySnapshot.docs) {
            const enrollment = docSnap.data();
            const studentRef = doc(db, 'users', enrollment.studentId);
            const studentDoc = await getDoc(studentRef);
            if (studentDoc.exists()) {
              const studentData = studentDoc.data();
              const attendanceQuery = query(
                collection(db, 'attendances'),
                where('classId', '==', classId),
                where('studentId', '==', enrollment.studentId)
              );
              const attendanceSnapshot = await getDocs(attendanceQuery);
              const attendance = attendanceSnapshot.docs.map(d => d.data());
              studentList.push({
                id: studentDoc.id,
                email: studentData.email,
                attendance: attendance.length > 0 ? attendance[0] : null,
              });
            }
          }
          setStudents(studentList);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching class and students:', err);
        setError('Failed to load class details: ' + err.message);
        setLoading(false);
      }
    };

    fetchClassAndStudents();
  }, [classId, currentUser, userRole, navigate]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{classData?.name || 'Class'}</h1>
      {userRole === 'student' ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Take Attendance</h2>
          <button
            onClick={() => navigate(`/student/class/${classId}/attendance`)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Take Attendance Now
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Student Attendance</h2>
          {students.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {students.map((student) => (
                <div key={student.id} className="border p-4 rounded shadow">
                  <p><strong>Student:</strong> {student.email}</p>
                  <p><strong>Status:</strong> {student.attendance?.status || 'Not yet attended'}</p>
                  {student.attendance?.timestamp && (
                    <p><strong>Date:</strong> {new Date(student.attendance.timestamp.seconds * 1000).toLocaleString()}</p>
                  )}
                  <p><strong>Reason:</strong> {student.attendance?.reason || 'None'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No students enrolled in this class yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassAttendance;