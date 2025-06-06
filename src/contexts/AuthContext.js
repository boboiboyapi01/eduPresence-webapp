import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../utils/firebase'; // Impor db dari firebase.js
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Impor doc dan getDoc langsung dari firebase/firestore

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user);
      if (user) {
        setCurrentUser(user);
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            setUserRole(null);
          }
        } catch (err) {
          console.error('Error fetching user role:', err);
          setUserRole(null);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
    setUserRole,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;