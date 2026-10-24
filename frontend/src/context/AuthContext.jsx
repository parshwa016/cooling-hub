import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { signInWithGooglePopup, firebaseLogout } from '../services/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Initialize from localStorage; default to null (Guest) if not logged in
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('coolinghub_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('prompt'); // 'prompt' | 'login' | 'signup'
  const [pendingAction, setPendingAction] = useState(null);

  const login = async (email, password = '') => {
    try {
      const user = await api.login(email, password);
      setCurrentUser(user);
      localStorage.setItem('coolinghub_user', JSON.stringify(user));
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
      setAuthModalOpen(false);
      return user;
    } catch (e) {
      console.error("Login failed:", e);
      throw e;
    }
  };

  const register = async (userData) => {
    try {
      const user = await api.register(userData);
      setCurrentUser(user);
      localStorage.setItem('coolinghub_user', JSON.stringify(user));
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
      setAuthModalOpen(false);
      return user;
    } catch (e) {
      console.error("Registration failed:", e);
      throw e;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const googleUser = await signInWithGooglePopup();
      const user = await api.googleLogin({
        name: googleUser.name,
        email: googleUser.email,
        photo_url: googleUser.photo_url,
        uid: googleUser.uid
      });
      const completeUser = {
        ...user,
        photo_url: googleUser.photo_url
      };
      setCurrentUser(completeUser);
      localStorage.setItem('coolinghub_user', JSON.stringify(completeUser));
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
      setAuthModalOpen(false);
      return completeUser;
    } catch (e) {
      console.error("Google sign-in failed:", e);
      throw e;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('coolinghub_user');
    setPendingAction(null);
    try {
      firebaseLogout();
    } catch (e) {
      // ignore
    }
  };

  const switchRole = async (role) => {
    let email = "kavan@example.com";
    if (role === "technician") email = "tech@coolinghub.com";
    if (role === "admin") email = "admin@coolinghub.com";

    try {
      const user = await api.login(email);
      setCurrentUser(user);
      localStorage.setItem('coolinghub_user', JSON.stringify(user));
    } catch (e) {
      console.error("Failed to switch user role", e);
    }
  };

  const openAuthModal = (mode = 'prompt') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setPendingAction(null);
  };

  // Intercept protected actions for guests
  const requireAuth = (actionCallback) => {
    if (currentUser) {
      actionCallback();
    } else {
      setPendingAction(() => actionCallback);
      openAuthModal('prompt');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      setCurrentUser, 
      login, 
      register, 
      loginWithGoogle,
      logout, 
      switchRole,
      authModalOpen,
      authModalMode,
      setAuthModalMode,
      openAuthModal,
      closeAuthModal,
      requireAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
