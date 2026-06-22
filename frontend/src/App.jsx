import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"                  element={<Home />} />
        <Route path="/products"          element={<Products />} />
        <Route path="/add-product"       element={<AddProduct />} />
        <Route path="/edit-product/:id"  element={<EditProduct />} />
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
