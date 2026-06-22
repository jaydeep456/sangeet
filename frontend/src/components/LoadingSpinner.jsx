import React from 'react';
const LoadingSpinner = ({ message = 'Curating Collection...' }) => (
  <div className="loading-wrap">
    <div className="spinner-royal" role="status" aria-label="Loading" />
    <p className="spinner-label">{message}</p>
  </div>
);
export default LoadingSpinner;
