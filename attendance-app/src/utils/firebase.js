import { initializeApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Tambahkan doc dan getDoc
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCUvNBAHHkVv0mJ0mpRQNMBQYBpSOjGzQA",
  authDomain: "edupresence-4d9fd.firebaseapp.com",
  projectId: "edupresence-4d9fd",
  databaseURL: "https://edupresence-4d9fd-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "edupresence-4d9fd.firebasestorage.app",
  messagingSenderId: "1087988034819",
  appId: "1:1087988034819:web:4dba1734c75f3e6a1e4d36"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Ekspor signOut bersama dengan auth, db, storage, doc, dan getDoc
export { auth, db, storage, signOut, doc, getDoc };