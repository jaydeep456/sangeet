import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { deleteProduct } from '../services/api';

const ProductCard = ({ product, onDeleted }) => {
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  // Read auth state
  const userJson = localStorage.getItem('sangeet_user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdmin = user && user.role === 'admin';

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProduct(product._id);
      toast.success(`"${product.name}" removed`);
      onDeleted(product._id);
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setDeleting(false);
      setShowModal(false);
    }
  };

  const fmt = (p) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  return (
    <>
      <div className="product-card page-enter">
        {/* Image */}
        <div className="product-img-wrap">
          {product.image && !imgErr ? (
            <img
              className="product-img"
              src={product.image}
              alt={product.name}
              loading="lazy"
              onError={() => setImgErr(true)}
            />
          ) : (
            <div className="product-img-placeholder">
              <span className="ph-icon">🪷</span>
              <span className="ph-text">No Image</span>
            </div>
          )}
          <span className="cat-badge">{product.category || 'Ethnic'}</span>
        </div>

        {/* Body */}
        <div className="product-body">
          <h3 className="product-name">{product.name}</h3>
          {product.description && (
            <p className="product-desc">{product.description}</p>
          )}
          <div className="product-meta">
            <span className="product-price">{fmt(product.price)}</span>
            <span className="product-size">{product.size}</span>
          </div>
        </div>

        {/* Actions */}
        {isAdmin && (
          <div className="product-actions">
            <Link
              to={`/edit-product/${product._id}`}
              className="btn-edit"
              id={`edit-${product._id}`}
            >
              <i className="bi bi-pencil-square" /> Update
            </Link>
            <button
              className="btn-del"
              id={`delete-${product._id}`}
              onClick={() => setShowModal(true)}
            >
              <i className="bi bi-trash3" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-box">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗑️</div>
            <h4>Delete Product?</h4>
            <p>You are about to permanently remove</p>
            <p className="modal-product-name">"{product.name}"</p>
            <p>This cannot be undone.</p>
            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button
                id="cancel-delete"
                className="btn-modal-cancel"
                onClick={() => setShowModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                id="confirm-delete"
                className="btn-modal-del"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting
                  ? <><span className="spinner-border spinner-border-sm me-1" /> Deleting...</>
                  : <><i className="bi bi-trash3 me-1" /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
