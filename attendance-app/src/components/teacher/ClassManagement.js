import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { Users, Calendar, MapPin, Trash } from 'lucide-react';
import Header from '../common/Header';
import ClassSettings from './ClassSettings';
import StudentManagement from './StudentManagement';
import AttendanceHistory from './AttendanceHistory';

const ClassManagement = () => {
  const { classId } = useParams();
  const [classData, setClassData] = useState(null);
  const [activeTab, setActiveTab] = useState('settings');
  const navigate = useNavigate();

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    const docRef = doc(db, 'classes', classId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setClassData(docSnap.data());
    }
  };

  if (!classData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title={classData.name} />
      <div className="p-6">
        <div className="flex mb-4">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 mr-2 ${activeTab === 'settings' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 mr-2 ${activeTab === 'students' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Students
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 ${activeTab === 'history' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Attendance History
          </button>
        </div>

        {activeTab === 'settings' && <ClassSettings classData={classData} />}
        {activeTab === 'students' && <StudentManagement classData={classData} />}
        {activeTab === 'history' && <AttendanceHistory classId={classId} />}
      </div>
    </div>
  );
};

export default ClassManagement;