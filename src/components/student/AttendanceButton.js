import React, { useState, useEffect } from 'react';
import { db } from '../../utils/firebase';
import { collection, addDoc } from 'firebase/firestore';

const AttendanceButton = ({ classId, studentId, schedule, onAttendanceMarked }) => {
  const [isAttendanceActive, setIsAttendanceActive] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const validateAttendanceWindow = () => {
      const now = new Date();
      const [day, time] = schedule.split(', '); // Contoh: "Mon, 10:00 AM"

      // Konversi jadwal ke Date object
      const [hour, minute, period] = time.split(/[: ]/);
      let scheduledHour = parseInt(hour);
      if (period === 'PM' && scheduledHour !== 12) scheduledHour += 12;
      if (period === 'AM' && scheduledHour === 12) scheduledHour = 0;

      const scheduledTime = new Date();
      scheduledTime.setHours(scheduledHour, parseInt(minute), 0, 0);

      // Hari saat ini (misalnya, "Mon")
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = days[now.getDay()];
      if (!day.includes(today)) {
        setIsAttendanceActive(false);
        return;
      }

      // Jendela absensi: 5 menit sebelum hingga 10 menit setelah
      const startTime = new Date(scheduledTime.getTime() - 5 * 60 * 1000); // 5 menit sebelum
      const endTime = new Date(scheduledTime.getTime() + 10 * 60 * 1000); // 10 menit setelah

      setIsAttendanceActive(now >= startTime && now <= endTime);
      if (now > endTime && now <= new Date(endTime.getTime() + 15 * 60 * 1000)) {
        setAttendanceStatus('late');
      }
    };

    validateAttendanceWindow();
    const interval = setInterval(validateAttendanceWindow, 60000); // Periksa setiap menit
    return () => clearInterval(interval);
  }, [schedule]);

  const handleMarkAttendance = async () => {
    if (!isAttendanceActive && attendanceStatus !== 'late') {
      setError('Attendance window is closed.');
      return;
    }

    try {
      const status = isAttendanceActive ? 'present' : 'late';
      await addDoc(collection(db, 'attendances'), {
        classId,
        studentId,
        timestamp: new Date(),
        status,
        reason: null, // Alasan akan diisi di riwayat jika terlambat/sakit/izin
      });
      onAttendanceMarked(status);
      setAttendanceStatus(status);
      setError(null);
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError('Failed to mark attendance');
    }
  };

  return (
    <div>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <button
        onClick={handleMarkAttendance}
        disabled={attendanceStatus}
        className={`px-4 py-2 rounded ${
          attendanceStatus
            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
            : isAttendanceActive || attendanceStatus === 'late'
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-400 text-gray-700 cursor-not-allowed'
        }`}
      >
        {attendanceStatus
          ? `Attendance Marked (${attendanceStatus})`
          : 'Take Attendance Now'}
      </button>
    </div>
  );
};

export default AttendanceButton;