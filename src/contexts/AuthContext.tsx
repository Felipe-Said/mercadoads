import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'user' | 'seller' | 'admin' | null;

interface AuthContextType {
  role: Role;
  login: (newRole: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(null);

  useEffect(() => {
    // Check local storage on mount
    const savedRole = localStorage.getItem('mercadoAdsRole') as Role;
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  const login = (newRole: Role) => {
    setRole(newRole);
    if (newRole) {
      localStorage.setItem('mercadoAdsRole', newRole);
    }
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem('mercadoAdsRole');
  };

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
