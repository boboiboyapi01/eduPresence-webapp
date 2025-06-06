import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth, db, signOut } from '../../utils/firebase'; // Impor signOut
import { doc, getDoc, setDoc } from 'firebase/firestore';
import BottomNavigation from './BottomNavigation';

const Profile = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!currentUser) {
          navigate('/login');
          return;
        }
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setDisplayName(userDoc.data().displayName || '');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      }
    };
    fetchProfile();
  }, [currentUser, navigate]);

  const handleSave = async () => {
    try {
      setError(null);
      if (!displayName) {
        setError('Display name is required');
        return;
      }
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { displayName }, { merge: true });
      setMessage('Profile updated successfully');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Attempting to sign out...');
      await signOut(auth);
      console.log('Sign out successful, navigating to login');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to logout');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="p-6 pb-20 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {message && <p className="text-green-500 mb-4">{message}</p>}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="text"
            value={currentUser.email}
            disabled
            className="mt-1 block w-full border rounded p-2 bg-gray-100"
          />
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
        >
          Save Changes
        </button>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors mt-4"
        >
          Logout
        </button>
      </div>
      <BottomNavigation userRole={userRole} />
    </div>
  );
};

export default Profile;