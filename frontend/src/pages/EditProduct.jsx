import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProductById, updateProduct } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'Custom...'];
const CATS         = ['Ethnic', 'Bridal', 'Festive', 'Casual Ethnic', 'Wedding', 'Formal'];
const MAX_IMAGES   = 10;

const EditProduct = () => {
  const { id } = useParams();
  const navigate  = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name:        '',
    price:       '',
    sizePreset:  '',
    sizeCustom:  '',
    description: '',
    category:    'Ethnic',
  });

  // Existing images already on the server
  const [existingImages, setExistingImages] = useState([]); // { url, publicId }[]
  const [removedPublicIds, setRemovedPublicIds] = useState([]); // publicIds to remove on save

  // Newly selected local images (not yet uploaded)
  const [newFiles,    setNewFiles]    = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const [errors,     setErrors]     = useState({});
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver,   setDragOver]   = useState(false);

  const isCustomSize  = form.sizePreset === 'Custom...';
  const effectiveSize = isCustomSize ? form.sizeCustom : form.sizePreset;
  const totalImages   = existingImages.length + newFiles.length;

  // ── Load existing product ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await getProductById(id);
        const p   = res.data.data;

        // Determine size preset/custom
        const isPreset = PRESET_SIZES.filter(s => s !== 'Custom...').includes(p.size || '');
        setForm({
          name:        p.name        || '',
          price:       p.price       || '',
          sizePreset:  isPreset ? p.size : 'Custom...',
          sizeCustom:  isPreset ? '' : (p.size || ''),
          description: p.description || '',
          category:    p.category    || 'Ethnic',
        });

        // Normalise images
        if (p.images && p.images.length > 0) {
          setExistingImages(p.images);
        } else if (p.image) {
          setExistingImages([{ url: p.image, publicId: p.cloudinaryPublicId || '' }]);
        }
      } catch {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  // ── Validation ─────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 3)
      e.name = 'Name must be at least 3 characters';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
      e.price = 'Enter a valid positive price';
    if (!effectiveSize || !effectiveSize.trim())
      e.size = 'Please choose or enter a size';
    return e;
  };

  const onChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const onSizeClick = val => {
    setForm(p => ({ ...p, sizePreset: val, sizeCustom: '' }));
    if (errors.size) setErrors(p => ({ ...p, size: '' }));
  };

  // ── Existing image removal ─────────────────────────────────────────────
  const removeExisting = img => {
    setExistingImages(p => p.filter(x => x.url !== img.url));
    if (img.publicId) setRemovedPublicIds(p => [...p, img.publicId]);
  };

  // ── New image handling ─────────────────────────────────────────────────
  const addImages = files => {
    const arr = Array.from(files).filter(f => {
      if (!f.type.startsWith('image/')) { toast.error(`${f.name}: not an image`); return false; }
      if (f.size > 5 * 1024 * 1024)    { toast.error(`${f.name}: exceeds 5MB`);  return false; }
      return true;
    });
    if (totalImages + arr.length > MAX_IMAGES) {
      toast.error(`Max ${MAX_IMAGES} images allowed`);
      return;
    }
    setNewFiles(p    => [...p, ...arr]);
    setNewPreviews(p => [...p, ...arr.map(f => URL.createObjectURL(f))]);
  };

  const removeNew = idx => {
    URL.revokeObjectURL(newPreviews[idx]);
    setNewFiles(p    => p.filter((_, i) => i !== idx));
    setNewPreviews(p => p.filter((_, i) => i !== idx));
  };

  const onDrop = e => {
    e.preventDefault();
    setDragOver(false);
    addImages(e.dataTransfer.files);
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const onSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); toast.error('Please fix form errors'); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name',        form.name.trim());
      fd.append('price',       form.price);
      fd.append('size',        effectiveSize.trim());
      fd.append('description', form.description.trim());
      fd.append('category',    form.category);
      if (removedPublicIds.length > 0) {
        fd.append('removeImages', JSON.stringify(removedPublicIds));
      }
      newFiles.forEach(f => fd.append('images', f));

      await updateProduct(id, fd);
      toast.success('Product updated successfully ✨');
      navigate('/products');
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="admin-page page-enter">
      <div className="container"><LoadingSpinner message="Loading Product..." /></div>
    </div>
  );

  return (
    <div className="admin-page page-enter">
      <div className="container">
        <Link to="/products" className="btn-back" id="back-btn-edit">
          <i className="bi bi-arrow-left" /> Back to Collection
        </Link>

        <div className="admin-card">
          <div className="admin-card-head">
            <h2>Edit Product</h2>
            <p>Update this piece in the SANGEET collection</p>
          </div>

          <div className="admin-card-body">
            <form id="edit-product-form" onSubmit={onSubmit} noValidate>

              {/* ── Name ── */}
              <div className="f-group">
                <label className="f-label" htmlFor="ep-name">Product Name *</label>
                <input id="ep-name" className="f-input" type="text" name="name"
                  value={form.name} onChange={onChange}
                  placeholder="e.g. Royal Banarasi Lehenga" maxLength={100} />
                {errors.name && <p className="f-error"><i className="bi bi-exclamation-circle" /> {errors.name}</p>}
              </div>

              {/* ── Price + Category ── */}
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="f-group">
                    <label className="f-label" htmlFor="ep-price">Price (₹) *</label>
                    <input id="ep-price" className="f-input" type="number" name="price"
                      value={form.price} onChange={onChange} placeholder="e.g. 4999" min="1" />
                    {errors.price && <p className="f-error"><i className="bi bi-exclamation-circle" /> {errors.price}</p>}
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="f-group">
                    <label className="f-label" htmlFor="ep-cat">Category</label>
                    <select id="ep-cat" className="f-select" name="category" value={form.category} onChange={onChange}>
                      {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Size picker ── */}
              <div className="f-group">
                <label className="f-label">Size *</label>
                <div className="size-chip-row">
                  {PRESET_SIZES.map(s => (
                    <button
                      key={s}
                      type="button"
                      className={`size-chip${form.sizePreset === s ? ' active' : ''}`}
                      onClick={() => onSizeClick(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {isCustomSize && (
                  <input
                    id="ep-size-custom"
                    className="f-input mt-2"
                    type="text"
                    name="sizeCustom"
                    value={form.sizeCustom}
                    onChange={onChange}
                    placeholder="e.g. 38, 40-42, One size fits all, Bust 36..."
                    maxLength={50}
                  />
                )}
                {errors.size && <p className="f-error"><i className="bi bi-exclamation-circle" /> {errors.size}</p>}
                {effectiveSize && !errors.size && (
                  <p className="f-hint">Selected: <strong>{effectiveSize}</strong></p>
                )}
              </div>

              {/* ── Description ── */}
              <div className="f-group">
                <label className="f-label" htmlFor="ep-desc">Description</label>
                <textarea id="ep-desc" className="f-textarea" name="description"
                  value={form.description} onChange={onChange} maxLength={1000} />
                <p className="f-hint">{form.description.length}/1000</p>
              </div>

              {/* ── Images section ── */}
              <div className="f-group">
                <label className="f-label">
                  Product Images
                  <span className="f-hint-inline"> — {totalImages}/{MAX_IMAGES} total</span>
                </label>

                {/* Existing images */}
                {existingImages.length > 0 && (
                  <div className="img-preview-grid" style={{ marginBottom: '1rem' }}>
                    {existingImages.map((img, i) => (
                      <div key={img.url} className="preview-thumb-wrap">
                        <img src={img.url} alt={`Existing ${i + 1}`} className="preview-thumb" />
                        {i === 0 && <span className="thumb-primary-badge">Primary</span>}
                        <button
                          type="button"
                          className="preview-remove"
                          onClick={() => removeExisting(img)}
                          aria-label="Remove image"
                        >
                          <i className="bi bi-x" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New image drop zone (only if under limit) */}
                {totalImages < MAX_IMAGES && (
                  <>
                    <div
                      id="edit-upload-zone"
                      className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={onDrop}
                      onClick={() => fileInputRef.current?.click()}
                      role="button" tabIndex={0}
                      onKeyPress={e => e.key === 'Enter' && fileInputRef.current?.click()}
                    >
                      <div className="upload-icon">📸</div>
                      <p className="upload-title"><strong>Add more images</strong> or drag &amp; drop</p>
                      <p className="upload-hint">PNG, JPG, WEBP — max 5MB each</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      id="edit-file-input"
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={e => addImages(e.target.files)}
                    />
                  </>
                )}

                {/* New image previews */}
                {newPreviews.length > 0 && (
                  <div className="img-preview-grid" style={{ marginTop: '0.75rem' }}>
                    {newPreviews.map((url, i) => (
                      <div key={i} className="preview-thumb-wrap">
                        <img src={url} alt={`New ${i + 1}`} className="preview-thumb" />
                        <span className="thumb-new-badge">New</span>
                        <button
                          type="button"
                          className="preview-remove"
                          onClick={() => removeNew(i)}
                          aria-label="Remove new image"
                        >
                          <i className="bi bi-x" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button id="submit-edit" type="submit" className="btn-submit" disabled={submitting}>
                {submitting
                  ? <><span className="spinner-border spinner-border-sm me-2" /> Saving Changes...</>
                  : <><i className="bi bi-check2-circle me-2" /> Save Changes</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
