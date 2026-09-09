import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Default user state: Customer
  const [currentUser, setCurrentUser] = useState({
    id: 4,
    name: "John Doe",
    email: "john@example.com",
    phone: "+91 9988776655",
    role: "customer",
    address: "Flat 402, Green Valley Apartments, Connaught Place, New Delhi - 110001"
  });

  const switchRole = async (role) => {
    let email = "john@example.com";
    if (role === "technician") email = "tech@coolinghub.com";
    if (role === "admin") email = "admin@coolinghub.com";

    try {
      const user = await api.login(email);
      setCurrentUser(user);
    } catch (e) {
      console.error("Failed to switch user role", e);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
