import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth, db } from '../../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { loadModels, detectFace } from '../../utils/faceRecognition';

const SetupProfile = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isFaceDataSaved, setIsFaceDataSaved] = useState(false);
  const fromRegister = location.state?.fromRegister || false;

  useEffect(() => {
    const initialize = async () => {
      try {
        if (!currentUser) {
          navigate('/login');
          return;
        }
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setDisplayName(data.displayName || '');
          setIsFaceDataSaved(!!data.faceDescriptor);
        }
        await loadModels();
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error initializing setup:', err);
        setError('Failed to initialize setup');
      }
    };
    initialize();
  }, [currentUser, navigate]);

  const handleSave = async () => {
    try {
      setError(null);
      if (!displayName) {
        setError('Display name is required');
        return;
      }
      if (!isFaceDataSaved) {
        setError('Please save your face data');
        return;
      }
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { displayName }, { merge: true });
      navigate(userRole === 'student' ? '/student/dashboard' : '/teacher/dashboard');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
    }
  };

  const handleSaveFaceData = async () => {
    try {
      setError(null);
      setMessage(null);
      const descriptor = await detectFace(videoRef.current);
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { faceDescriptor: Array.from(descriptor) }, { merge: true });
      setIsFaceDataSaved(true);
      setMessage('Face data saved successfully');
    } catch (err) {
      console.error('Error saving face data:', err);
      setError('Failed to save face data');
    }
  };

  // Blokir navigasi keluar jika dari registrasi
  useEffect(() => {
    if (fromRegister) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = 'You must complete your profile setup before leaving.';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [fromRegister]);

  if (!currentUser) return null;

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Setup Your Profile</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {message && <p className="text-green-500 mb-4">{message}</p>}
      <div className="w-full max-w-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Face Data</label>
          <div className="relative w-64 h-64 mx-auto rounded-lg overflow-hidden mt-2">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
          </div>
          <button
            onClick={handleSaveFaceData}
            disabled={isFaceDataSaved}
            className={`w-full mt-2 p-2 rounded text-white transition-colors ${
              isFaceDataSaved ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'
            }`}
          >
            {isFaceDataSaved ? 'Face Data Saved' : 'Save Face Data'}
          </button>
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
        >
          Save Profile
        </button>
      </div>
    </div>
  );
};

export default SetupProfile;