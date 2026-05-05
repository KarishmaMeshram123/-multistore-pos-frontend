import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('pos_token');
    const savedUser = localStorage.getItem('pos_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (authResponse) => {
    setToken(authResponse.token);
    setUser({ username: authResponse.username, role: authResponse.role, tenantName: authResponse.tenantName, tenantId: authResponse.tenantId });
    localStorage.setItem('pos_token', authResponse.token);
    localStorage.setItem('pos_user', JSON.stringify({
      username: authResponse.username,
      role: authResponse.role,
      tenantName: authResponse.tenantName,
      tenantId: authResponse.tenantId
    }));
  };
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
