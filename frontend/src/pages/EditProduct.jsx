import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProductById, updateProduct } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const CATS  = ['Ethnic', 'Bridal', 'Festive', 'Casual Ethnic', 'Wedding', 'Formal'];

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', price: '', size: '', description: '', category: 'Ethnic' });
  const [currentImg, setCurrentImg] = useState('');
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getProductById(id);
        const p = res.data.data;
        setForm({ name: p.name || '', price: p.price || '', size: p.size || '', description: p.description || '', category: p.category || 'Ethnic' });
        setCurrentImg(p.image || '');
      } catch {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

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
    if (!file.type.startsWith('image/')) { toast.error('Select a valid image'); return; }
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

  const displayImg = imgPreview || currentImg;

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

              <div className="f-group">
                <label className="f-label" htmlFor="ep-name">Product Name *</label>
                <input id="ep-name" className="f-input" type="text" name="name"
                  value={form.name} onChange={onChange} placeholder="e.g. Royal Banarasi Lehenga" maxLength={100} />
                {errors.name && <p className="f-error"><i className="bi bi-exclamation-circle" /> {errors.name}</p>}
              </div>

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
                    <label className="f-label" htmlFor="ep-size">Size *</label>
                    <select id="ep-size" className="f-select" name="size" value={form.size} onChange={onChange}>
                      <option value="">Select size</option>
                      {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.size && <p className="f-error"><i className="bi bi-exclamation-circle" /> {errors.size}</p>}
                  </div>
                </div>
              </div>

              <div className="f-group">
                <label className="f-label" htmlFor="ep-cat">Category</label>
                <select id="ep-cat" className="f-select" name="category" value={form.category} onChange={onChange}>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="f-group">
                <label className="f-label" htmlFor="ep-desc">Description</label>
                <textarea id="ep-desc" className="f-textarea" name="description"
                  value={form.description} onChange={onChange} maxLength={500} />
                <p className="f-hint">{form.description.length}/500</p>
              </div>

              <div className="f-group">
                <label className="f-label">Product Image</label>
                {displayImg ? (
                  <div className="text-center">
                    <div className="preview-wrap">
                      <img src={displayImg} alt="Preview" className="preview-img" />
                      <button type="button" className="preview-remove" id="remove-edit-img"
                        onClick={() => { setImgFile(null); setImgPreview(''); if (!imgFile) setCurrentImg(''); }}>
                        <i className="bi bi-x" />
                      </button>
                    </div>
                    <p className="f-hint" style={{ marginTop: '8px' }}>
                      {imgFile ? imgFile.name : 'Current image (click × to replace)'}
                    </p>
                  </div>
                ) : (
                  <div
                    id="edit-upload-zone"
                    className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    onClick={() => document.getElementById('edit-file-input').click()}
                    role="button" tabIndex={0}
                    onKeyPress={e => e.key === 'Enter' && document.getElementById('edit-file-input').click()}
                  >
                    <div className="upload-icon">📸</div>
                    <p className="upload-title"><strong>Click to upload</strong> or drag & drop</p>
                    <p className="upload-hint">PNG, JPG, WEBP — max 5MB</p>
                  </div>
                )}
                <input id="edit-file-input" type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => handleImg(e.target.files?.[0])} />
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
