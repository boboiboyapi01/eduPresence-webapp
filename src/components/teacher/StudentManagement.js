import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { Trash } from 'lucide-react';

const StudentManagement = ({ classData }) => {
  const [newStudentId, setNewStudentId] = useState('');

  const addStudent = async () => {
    if (!newStudentId) return;
    const docRef = doc(db, 'classes', classData.id);
    await updateDoc(docRef, { studentIds: arrayUnion(newStudentId) });
    setNewStudentId('');
  };

  const removeStudent = async (studentId) => {
    const docRef = doc(db, 'classes', classData.id);
    await updateDoc(docRef, { studentIds: arrayRemove(studentId) });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Students</h2>
      {classData.studentIds.map((studentId) => (
        <div key={studentId} className="flex justify-between items-center p-2 bg-gray-100 rounded mb-2">
          <span>{studentId}</span>
          <button onClick={() => removeStudent(studentId)} className="bg-red-500 text-white px-2 py-1 rounded">
            <Trash />
          </button>
        </div>
      ))}
      <input
        type="text"
        value={newStudentId}
        onChange={(e) => setNewStudentId(e.target.value)}
        placeholder="Student ID"
        className="p-2 border rounded w-full mb-2"
      />
      <button onClick={addStudent} className="bg-green-500 text-white px-4 py-2 rounded">
        Add Student
      </button>
    </div>
  );
};

export default StudentManagement;