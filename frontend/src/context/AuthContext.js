import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import axios from 'axios'; // Kita butuh axios untuk setup 'interceptor'

// 1. Buat Context
const AuthContext = createContext();

// Helper: Fungsi untuk setup header default di axios
const setAuthToken = (token) => {
  if (token) {
    // Terapkan token ke SETIAP request
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // Hapus header-nya
    delete axios.defaults.headers.common['Authorization'];
  }
};

// 2. Buat Provider (komponen yang 'membungkus' App)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token')); // Ambil token dari localStorage
  const [loading, setLoading] = useState(true); // State loading untuk cek token

  // 3. Cek token saat aplikasi pertama kali dimuat
  useEffect(() => {
    console.log('AuthContext: checking token on mount');
    let isMounted = true; // Untuk mencegah update state setelah unmount
    
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (token && isMounted) {
          setToken(token);
          setAuthToken(token); // Set header axios
          
          // Load user dari localStorage
          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser);
              setUser(userData);
              console.log('✅ User loaded from localStorage:', userData);
            } catch (parseErr) {
              console.error('❌ Error parsing user data:', parseErr);
              // Jika parse error, logout user
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
            }
          } else {
            console.warn('⚠️ Token exists but no user data in localStorage');
            // Jika ada token tapi tidak ada user data, logout
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('AuthContext: Error checking token', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    checkAuth();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // 4. Fungsi Login (yang akan dipanggil LoginPage)
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { token, user } = response.data;
      
      // Simpan di state & localStorage
      setToken(token);
      localStorage.setItem('token', token);
      
      // Simpan user data dengan full_name
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        console.log('✅ User saved to localStorage:', user);
      }
      
      // Set header axios
      setAuthToken(token);
      
      return response; // Kembalikan respon sukses
    } catch (err) {
      // Jika error, lempar agar form bisa menangkapnya
      throw err;
    }
  };
    

  // 5. Fungsi Logout
  const logout = () => {
    // Hapus semua
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Hapus user dari localStorage
    setAuthToken(null); // Hapus header axios
  };

  // 6. Kirim 'value' ini ke semua 'children' (anak komponen)
  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 7. Ekspor Context
export default AuthContext;