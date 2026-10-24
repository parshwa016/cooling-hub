import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA9o4Bzh0ztNqMvwb83AkKCDcdqbVOPc1k",
  authDomain: "cooling-hub.firebaseapp.com",
  projectId: "cooling-hub",
  storageBucket: "cooling-hub.firebasestorage.app",
  messagingSenderId: "420585150923",
  appId: "1:420585150923:web:6ba26a509f43d5e1497e4e",
  measurementId: "G-BKLY0ZNNT8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Helper to trigger Google Popup sign-in
export const signInWithGooglePopup = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      name: user.displayName || user.email.split('@')[0],
      email: user.email,
      photo_url: user.photoURL || null,
      uid: user.uid
    };
  } catch (error) {
    console.error("Firebase Google Sign-in Error:", error);
    // User closed popup or cancelled
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("Sign-in cancelled. You closed the Google sign-in window.");
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error("Another sign-in attempt was already in progress.");
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error("Popup blocked by browser. Please allow popups for this site.");
    }
    throw error;
  }
};

export const firebaseLogout = () => signOut(auth);

export default app;
