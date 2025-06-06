import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth, db } from '../../utils/firebase';
import { createUserWithEmailAndPassword, setDoc, doc } from 'firebase/auth';
import { doc as firestoreDoc, setDoc as firestoreSetDoc } from 'firebase/firestore';

const Register = () => {
  const { setUserRole } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const validateInputs = () => {
    if (!email || !password) {
      setError('Email and password are required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      console.log('Starting registration with email:', email);

      if (!validateInputs()) return;

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created successfully:', userCredential.user.uid);

      const user = userCredential.user;
      await firestoreSetDoc(firestoreDoc(db, 'users', user.uid), {
        email: user.email,
        role: 'student', // Role otomatis menjadi "student"
        displayName: '',
        faceDescriptor: null,
      });
      console.log('User document created in Firestore for UID:', user.uid);

      setUserRole('student'); // Set role ke "student" di AuthContext
      navigate('/setup-profile', { state: { fromRegister: true } });
      console.log('Navigating to setup-profile');
    } catch (err) {
      console.error('Registration error:', err);
      setError(`Failed to register: ${err.message}`);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleRegister} className="space-y-4 w-full max-w-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
        >
          Register
        </button>
      </form>
      <p className="mt-4 text-gray-600">
        Already have an account?{' '}
        <button
          onClick={() => navigate('/login')}
          className="text-blue-500 hover:underline"
        >
          Login
        </button>
      </p>
    </div>
  );
};

export default Register;