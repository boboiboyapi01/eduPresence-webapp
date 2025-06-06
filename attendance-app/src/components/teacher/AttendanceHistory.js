import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const AttendanceHistory = ({ classId }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, [classId]);

  const fetchHistory = async () => {
    const attendanceRef = collection(db, `classes/${classId}/attendance`);
    const snapshot = await getDocs(attendanceRef);
    const historyData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setHistory(historyData);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Attendance History</h2>
      {history.map((record) => (
        <div key={record.id} className="p-2 bg-gray-100 rounded mb-2">
          <p>Student: {record.studentId}</p>
          <p>Date: {new Date(record.timestamp).toLocaleDateString()}</p>
          <p>Status: {record.status}</p>
        </div>
      ))}
    </div>
  );
};

export default AttendanceHistory;