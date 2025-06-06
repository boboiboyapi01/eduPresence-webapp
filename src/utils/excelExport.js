import * as XLSX from 'xlsx';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export const exportAllClassesAttendance = async (teacherId) => {
  const classesRef = collection(db, 'classes');
  const q = query(classesRef, where('teacherId', '==', teacherId));
  const querySnapshot = await getDocs(q);
  
  const attendanceData = [];
  for (const classDoc of querySnapshot.docs) {
    const classData = classDoc.data();
    const attendanceRef = collection(db, `classes/${classDoc.id}/attendance`);
    const attendanceSnapshot = await getDocs(attendanceRef);
    
    attendanceSnapshot.forEach((doc) => {
      const data = doc.data();
      attendanceData.push({
        'Class Name': classData.name,
        'Student ID': data.studentId,
        'Date': new Date(data.timestamp).toLocaleDateString(),
        'Time': new Date(data.timestamp).toLocaleTimeString(),
        'Status': data.status
      });
    });
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(attendanceData);
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
  XLSX.writeFile(wb, 'attendance_export.xlsx');
};