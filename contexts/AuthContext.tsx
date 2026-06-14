import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define a simple User type to replace the one from Supabase
export interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  currentUser: User | null;
  // login is now just a placeholder to keep the UI flow
  login: (email: string) => Promise<{ error: { message: string } | null }>;
  // verifyLoginOtp is the actual "login" function now
  verifyLoginOtp: (email: string, token: string) => Promise<{ error: { message: string } | null }>;
  logout: () => Promise<void>;
  signInWithGoogle: (response: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LS_USER_KEY = 'soulverse_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // On initial load, check localStorage for a saved user session
    try {
      const storedUserJson = localStorage.getItem(LS_USER_KEY);
      if (storedUserJson) {
        return JSON.parse(storedUserJson);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(LS_USER_KEY);
    }
    return null;
  });

  // This function is now a no-op, but we keep it to avoid changing LoginScreen.tsx
  // It just signals the UI to move to the next step (CheckMail).
  const login = async (email: string) => {
    return { error: null };
  };

  // This function now handles the actual login logic by creating a local session.
  // The 'token' is ignored.
  const verifyLoginOtp = async (email: string, token: string) => {
    const user: User = { id: email, email: email };
    try {
        localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
        setCurrentUser(user);
    } catch (error) {
        console.error("Failed to save user to localStorage", error);
    }
    return { error: null };
  };

  const signInWithGoogle = (response: any) => { // response is CredentialResponse
    try {
        const jwt = response.credential;
        // Basic JWT decode, no signature verification needed for client-side identity
        const payload = JSON.parse(atob(jwt.split('.')[1]));
        const email = payload.email;
        if (!email) {
            console.error("No email found in Google credential.");
            // Handle error state in UI
            return;
        }

        const user: User = { id: email, email: email };
        localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
        setCurrentUser(user);
        // Navigation will be handled by App.tsx's useEffect watching currentUser
    } catch (error) {
        console.error("Error processing Google sign-in:", error);
    }
  };

  const logout = async () => {
    try {
        localStorage.removeItem(LS_USER_KEY);
        setCurrentUser(null);
    } catch (error) {
        console.error("Failed to remove user from localStorage", error);
    }
  };

  const value = { currentUser, login, verifyLoginOtp, logout, signInWithGoogle };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};