import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createProduct } from '../services/api';

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'Custom...'];
const CATS         = ['Ethnic', 'Bridal', 'Festive', 'Casual Ethnic', 'Wedding', 'Formal'];
const MAX_IMAGES   = 10;

const AddProduct = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name:        '',
    price:       '',
    sizePreset:  '',    // selected preset button value
    sizeCustom:  '',    // custom text when "Custom..." is chosen
    description: '',
    category:    'Ethnic',
  });
  const [imgFiles,    setImgFiles]    = useState([]);   // File[]
  const [imgPreviews, setImgPreviews] = useState([]);   // object-URL[]
  const [errors,      setErrors]      = useState({});
  const [submitting,  setSubmitting]  = useState(false);
  const [dragOver,    setDragOver]    = useState(false);

  const isCustomSize = form.sizePreset === 'Custom...';
  const effectiveSize = isCustomSize ? form.sizeCustom : form.sizePreset;

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

  // ── Form field change ──────────────────────────────────────────────────
  const onChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  // ── Size preset click ──────────────────────────────────────────────────
  const onSizeClick = val => {
    setForm(p => ({ ...p, sizePreset: val, sizeCustom: '' }));
    if (errors.size) setErrors(p => ({ ...p, size: '' }));
  };

  // ── Image handling ─────────────────────────────────────────────────────
  const addImages = files => {
    const arr = Array.from(files).filter(f => {
      if (!f.type.startsWith('image/')) { toast.error(`${f.name}: not an image`); return false; }
      if (f.size > 5 * 1024 * 1024)    { toast.error(`${f.name}: exceeds 5MB`);  return false; }
      return true;
    });
    if (imgFiles.length + arr.length > MAX_IMAGES) {
      toast.error(`Max ${MAX_IMAGES} images allowed`);
      return;
    }
    const newFiles    = [...imgFiles,    ...arr];
    const newPreviews = [...imgPreviews, ...arr.map(f => URL.createObjectURL(f))];
    setImgFiles(newFiles);
    setImgPreviews(newPreviews);
  };

  const removeImage = idx => {
    URL.revokeObjectURL(imgPreviews[idx]);
    setImgFiles(p    => p.filter((_, i) => i !== idx));
    setImgPreviews(p => p.filter((_, i) => i !== idx));
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
      imgFiles.forEach(f => fd.append('images', f));

      await createProduct(fd);
      toast.success('Product added to collection ✨');
      navigate('/products');
    } catch (err) {
      toast.error(err.message || 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page page-enter">
      <div className="container">
        <Link to="/products" className="btn-back" id="back-btn">
          <i className="bi bi-arrow-left" /> Back to Collection
        </Link>

        <div className="admin-card">
          <div className="admin-card-head">
            <h2>Add New Product</h2>
            <p>Expand the SANGEET luxury collection</p>
          </div>

          <div className="admin-card-body">
            <form id="add-product-form" onSubmit={onSubmit} noValidate>

              {/* ── Name ── */}
              <div className="f-group">
                <label className="f-label" htmlFor="p-name">Product Name *</label>
                <input id="p-name" className="f-input" type="text" name="name"
                  value={form.name} onChange={onChange}
                  placeholder="e.g. Royal Banarasi Lehenga" maxLength={100} autoFocus />
                {errors.name && <p className="f-error"><i className="bi bi-exclamation-circle" /> {errors.name}</p>}
              </div>

              {/* ── Price + Category ── */}
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="f-group">
                    <label className="f-label" htmlFor="p-price">Price (₹) *</label>
                    <input id="p-price" className="f-input" type="number" name="price"
                      value={form.price} onChange={onChange} placeholder="e.g. 4999" min="1" />
                    {errors.price && <p className="f-error"><i className="bi bi-exclamation-circle" /> {errors.price}</p>}
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="f-group">
                    <label className="f-label" htmlFor="p-cat">Category</label>
                    <select id="p-cat" className="f-select" name="category" value={form.category} onChange={onChange}>
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
                    id="p-size-custom"
                    className="f-input mt-2"
                    type="text"
                    name="sizeCustom"
                    value={form.sizeCustom}
                    onChange={onChange}
                    placeholder="e.g. 38, 40-42, One size fits all, Bust 36..."
                    maxLength={50}
                    autoFocus
                  />
                )}
                {errors.size && <p className="f-error"><i className="bi bi-exclamation-circle" /> {errors.size}</p>}
                {effectiveSize && !errors.size && (
                  <p className="f-hint">Selected: <strong>{effectiveSize}</strong></p>
                )}
              </div>

              {/* ── Description ── */}
              <div className="f-group">
                <label className="f-label" htmlFor="p-desc">Description</label>
                <textarea id="p-desc" className="f-textarea" name="description"
                  value={form.description} onChange={onChange}
                  placeholder="Describe this piece — fabric, occasion, style..." maxLength={1000} />
                <p className="f-hint">{form.description.length}/1000</p>
              </div>

              {/* ── Multi Image Upload ── */}
              <div className="f-group">
                <label className="f-label">
                  Product Images
                  <span className="f-hint-inline"> — up to {MAX_IMAGES} photos (different views, colours)</span>
                </label>

                {/* Drop zone */}
                <div
                  id="upload-zone"
                  className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button" tabIndex={0}
                  onKeyPress={e => e.key === 'Enter' && fileInputRef.current?.click()}
                >
                  <div className="upload-icon">📸</div>
                  <p className="upload-title"><strong>Click to upload</strong> or drag &amp; drop</p>
                  <p className="upload-hint">PNG, JPG, WEBP — max 5MB each · {imgFiles.length}/{MAX_IMAGES} selected</p>
                </div>
                <input
                  ref={fileInputRef}
                  id="file-input"
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={e => addImages(e.target.files)}
                />

                {/* Preview grid */}
                {imgPreviews.length > 0 && (
                  <div className="img-preview-grid">
                    {imgPreviews.map((url, i) => (
                      <div key={i} className="preview-thumb-wrap">
                        <img src={url} alt={`Preview ${i + 1}`} className="preview-thumb" />
                        {i === 0 && <span className="thumb-primary-badge">Primary</span>}
                        <button
                          type="button"
                          className="preview-remove"
                          onClick={() => removeImage(i)}
                          aria-label="Remove image"
                        >
                          <i className="bi bi-x" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button id="submit-add" type="submit" className="btn-submit" disabled={submitting}>
                {submitting
                  ? <><span className="spinner-border spinner-border-sm me-2" /> Adding to Collection...</>
                  : <><i className="bi bi-plus-lg me-2" /> Add to Collection</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
