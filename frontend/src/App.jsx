import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Groups from './pages/Groups';

// Wrapper for Auth & Admin Routing
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();
  const token = localStorage.getItem('sangeet_token');
  const userJson = localStorage.getItem('sangeet_user');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly) {
    const user = JSON.parse(userJson || '{}');
    if (user.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login"             element={<Login />} />
        <Route path="/signup"            element={<Signup />} />

        {/* Public View Routes */}
        <Route path="/"                  element={<Home />} />
        <Route path="/products"          element={<Products />} />
        <Route path="/groups"            element={<Groups />} />

        {/* Protected Admin Routes */}
        <Route path="/add-product"       element={<ProtectedRoute adminOnly><AddProduct /></ProtectedRoute>} />
        <Route path="/edit-product/:id"  element={<ProtectedRoute adminOnly><EditProduct /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*"                  element={<Navigate to="/" replace />} />
      </Routes>

      {/* Branded Toasts */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "'Raleway', sans-serif",
            fontSize: '0.85rem',
            borderRadius: '10px',
            background: '#163B2B',
            color: '#FAF6EE',
            border: '1px solid rgba(201,168,76,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#C9A84C', secondary: '#163B2B' },
          },
          error: {
            style: {
              background: '#6B1111',
              color: '#FFE8E8',
              border: '1px solid rgba(255,100,100,0.2)',
            },
            iconTheme: { primary: '#E74C3C', secondary: '#FFE8E8' },
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
