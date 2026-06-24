import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { deleteProduct } from '../services/api';
import ImageLightbox from './ImageLightbox';

const ProductCard = ({ product, onDeleted }) => {
  const [showModal, setShowModal]     = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [activeImg, setActiveImg]     = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState(null); // null = closed

  // Read auth state
  const userJson = localStorage.getItem('sangeet_user');
  const user     = userJson ? JSON.parse(userJson) : null;
  const isAdmin  = user && user.role === 'admin';

  // Normalise to images array
  const images = product.images && product.images.length > 0
    ? product.images
    : product.image
      ? [{ url: product.image, publicId: product.cloudinaryPublicId || '' }]
      : [];

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

  const fmt = p =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  return (
    <>
      <div className="product-card page-enter">
        {/* ── Image Gallery ── */}
        <div className="product-img-wrap">
          {images.length > 0 ? (
            <>
              {/* Main clickable image */}
              <img
                className="product-img"
                src={images[activeImg]?.url || images[0]?.url}
                alt={product.name}
                loading="lazy"
                onClick={() => setLightboxIdx(activeImg)}
                title="Click to view full size"
              />
              {/* Image count badge */}
              {images.length > 1 && (
                <span className="img-count-badge">
                  <i className="bi bi-images" /> {images.length}
                </span>
              )}
              {/* Zoom hint overlay */}
              <div className="img-zoom-hint" onClick={() => setLightboxIdx(activeImg)}>
                <i className="bi bi-zoom-in" />
              </div>
            </>
          ) : (
            <div className="product-img-placeholder" onClick={() => {}}>
              <span className="ph-icon">🪷</span>
              <span className="ph-text">No Image</span>
            </div>
          )}
          <span className="cat-badge">{product.category || 'Ethnic'}</span>
        </div>

        {/* Thumbnail strip (only if >1 image) */}
        {images.length > 1 && (
          <div className="card-thumb-strip">
            {images.map((img, i) => (
              <img
                key={i}
                src={img.url}
                alt={`View ${i + 1}`}
                className={`card-thumb${i === activeImg ? ' active' : ''}`}
                onClick={() => setActiveImg(i)}
              />
            ))}
          </div>
        )}

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

        {/* Admin Actions */}
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

      {/* Lightbox */}
      {lightboxIdx !== null && images.length > 0 && (
        <ImageLightbox
          images={images}
          startIdx={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
};

export default ProductCard;
