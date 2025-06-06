import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { loadModels, detectFace, compareFaces } from '../../utils/faceRecognition';

const FaceVerification = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('Starting face verification...');
  const [retry, setRetry] = useState(false);

  const initialize = async () => {
    try {
      setError(null);
      setStatus('Starting face verification...');
      setRetry(false);

      if (!currentUser) {
        setError('No user logged in');
        navigate('/login');
        return;
      }

      // Muat model face-api.js
      await loadModels();
      setStatus('Models loaded, accessing webcam...');

      // Mulai webcam
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Ambil data wajah dari database
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists() || !userDoc.data().faceDescriptor) {
        setStatus('No face data found. Redirecting to save face data...');
        setTimeout(() => {
          const profilePath = userRole === 'student' ? '/student/profile' : '/teacher/profile';
          navigate(profilePath);
        }, 2000);
        return;
      }

      const savedDescriptor = new Float32Array(userDoc.data().faceDescriptor);
      setStatus('Face data loaded, verifying...');

      // Verifikasi wajah
      const descriptor = await detectFace(videoRef.current);
      const isMatch = compareFaces(savedDescriptor, descriptor);

      if (isMatch) {
        setStatus('Face verified successfully!');
        setTimeout(() => {
          if (userRole === 'student') navigate('/student/dashboard');
          else if (userRole === 'teacher') navigate('/teacher/dashboard');
        }, 2000);
      } else {
        setError('Face verification failed.');
        setRetry(true);
      }
    } catch (err) {
      console.error('Error during face verification:', err);
      setError('Failed to verify face: ' + err.message);
      setRetry(true);
    }
  };

  useEffect(() => {
    initialize();
  }, [currentUser, userRole, navigate]);

  const handleRetry = () => {
    initialize();
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Face Verification</h1>
      <video ref={videoRef} autoPlay muted className="w-64 h-64 mb-4 border rounded" />
      <p className="text-gray-600 mb-4">{status}</p>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {retry && (
        <button
          onClick={handleRetry}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default FaceVerification;