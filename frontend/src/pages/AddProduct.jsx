import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createProduct } from '../services/api';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const CATS  = ['Ethnic', 'Bridal', 'Festive', 'Casual Ethnic', 'Wedding', 'Formal'];

const AddProduct = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', price: '', size: '', description: '', category: 'Ethnic' });
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 3) e.name = 'Name must be at least 3 characters';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Enter a valid positive price';
    if (!form.size) e.size = 'Please select a size';
    return e;
  };

  const onChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleImg = file => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be < 5MB'); return; }
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const onDrop = e => { e.preventDefault(); setDragOver(false); handleImg(e.dataTransfer.files?.[0]); };

  const onSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); toast.error('Please fix form errors'); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('price', form.price);
      fd.append('size', form.size);
      fd.append('description', form.description.trim());
      fd.append('category', form.category);
      if (imgFile) fd.append('image', imgFile);
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

              {/* Name */}
              <div className="f-group">
                <label className="f-label" htmlFor="p-name">Product Name *</label>
                <input id="p-name" className="f-input" type="text" name="name"
                  value={form.name} onChange={onChange}
                  placeholder="e.g. Royal Banarasi Lehenga" maxLength={100} autoFocus />
                {errors.name && <p className="f-error"><i className="bi bi-exclamation-circle" /> {errors.name}</p>}
              </div>

              {/* Price + Size */}
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
                    <label className="f-label" htmlFor="p-size">Size *</label>
                    <select id="p-size" className="f-select" name="size" value={form.size} onChange={onChange}>
                      <option value="">Select size</option>
                      {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.size && <p className="f-error"><i className="bi bi-exclamation-circle" /> {errors.size}</p>}
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="f-group">
                <label className="f-label" htmlFor="p-cat">Category</label>
                <select id="p-cat" className="f-select" name="category" value={form.category} onChange={onChange}>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Description */}
              <div className="f-group">
                <label className="f-label" htmlFor="p-desc">Description</label>
                <textarea id="p-desc" className="f-textarea" name="description"
                  value={form.description} onChange={onChange}
                  placeholder="Describe this piece — fabric, occasion, style..." maxLength={500} />
                <p className="f-hint">{form.description.length}/500</p>
              </div>

              {/* Image Upload */}
              <div className="f-group">
                <label className="f-label">Product Image</label>
                {imgPreview ? (
                  <div className="text-center">
                    <div className="preview-wrap">
                      <img src={imgPreview} alt="Preview" className="preview-img" />
                      <button type="button" className="preview-remove" id="remove-img"
                        onClick={() => { setImgFile(null); setImgPreview(''); }}>
                        <i className="bi bi-x" />
                      </button>
                    </div>
                    <p className="f-hint" style={{ marginTop: '8px' }}>{imgFile?.name}</p>
                  </div>
                ) : (
                  <div
                    id="upload-zone"
                    className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    onClick={() => document.getElementById('file-input').click()}
                    role="button" tabIndex={0}
                    onKeyPress={e => e.key === 'Enter' && document.getElementById('file-input').click()}
                  >
                    <div className="upload-icon">📸</div>
                    <p className="upload-title"><strong>Click to upload</strong> or drag & drop</p>
                    <p className="upload-hint">PNG, JPG, WEBP — max 5MB</p>
                  </div>
                )}
                <input id="file-input" type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => handleImg(e.target.files?.[0])} />
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
