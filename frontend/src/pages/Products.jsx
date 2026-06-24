import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { getProducts } from '../services/api';


const SORT_OPTIONS     = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'name_asc',   label: 'Name: A → Z' },
  { value: 'name_desc',  label: 'Name: Z → A' },
];

const defaultFilters = {
  search:   '',
  size:     'All',
  category: 'All',
  minPrice: '',
  maxPrice: '',
  sort:     'newest',
};

const Products = () => {
  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Live filters (applied immediately on change, debounced for search)
  const [filters,     setFilters]     = useState(defaultFilters);
  const [searchDraft, setSearchDraft] = useState('');

  // Read auth state
  const userJson = localStorage.getItem('sangeet_user');
  const user     = userJson ? JSON.parse(userJson) : null;
  const isAdmin  = user && user.role === 'admin';

  // Selection & Sharing
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sharedIds = searchParams.get('shared');
  const isSharedView = !!sharedIds;
  const [selectedIds, setSelectedIds] = useState([]);

  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem('sangeet_custom_categories');
    const defaults = ['Ethnic', 'Bridal', 'Festive', 'Casual Ethnic', 'Wedding', 'Formal'];
    return saved ? JSON.parse(saved) : defaults;
  });
  const [customSizes, setCustomSizes] = useState(() => {
    const saved = localStorage.getItem('sangeet_custom_sizes');
    const defaults = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
    return saved ? JSON.parse(saved) : defaults;
  });

  const [removedCategories, setRemovedCategories] = useState(() => {
    const saved = localStorage.getItem('sangeet_removed_categories');
    return saved ? JSON.parse(saved) : [];
  });
  const [removedSizes, setRemovedSizes] = useState(() => {
    const saved = localStorage.getItem('sangeet_removed_sizes');
    return saved ? JSON.parse(saved) : [];
  });

  // Dynamic categories: unique from products + custom added ones
  const categoryOptions = React.useMemo(() => {
    const fromProducts = products.map(p => p.category).filter(Boolean);
    const unique = Array.from(new Set([...customCategories, ...fromProducts]));
    const active = unique.filter(c => !removedCategories.includes(c));
    return ['All', ...active];
  }, [products, customCategories, removedCategories]);

  // Dynamic sizes: unique from products + custom added ones
  const sizeOptions = React.useMemo(() => {
    const fromProducts = products.map(p => p.size).filter(Boolean);
    const unique = Array.from(new Set([...customSizes, ...fromProducts]));
    const active = unique.filter(s => !removedSizes.includes(s));
    return ['All', ...active];
  }, [products, customSizes, removedSizes]);

  const handleAddCategory = () => {
    const name = prompt('Enter new category name:');
    if (name && name.trim()) {
      const clean = name.trim();
      if (removedCategories.includes(clean)) {
        const updatedRemoved = removedCategories.filter(c => c !== clean);
        setRemovedCategories(updatedRemoved);
        localStorage.setItem('sangeet_removed_categories', JSON.stringify(updatedRemoved));
      }
      if (!customCategories.includes(clean)) {
        const updated = [...customCategories, clean];
        setCustomCategories(updated);
        localStorage.setItem('sangeet_custom_categories', JSON.stringify(updated));
        toast.success(`Category "${clean}" added to filters`);
      }
    }
  };

  const handleAddSize = () => {
    const name = prompt('Enter new size (e.g. M, 32, XXL):');
    if (name && name.trim()) {
      const clean = name.trim();
      if (removedSizes.includes(clean)) {
        const updatedRemoved = removedSizes.filter(s => s !== clean);
        setRemovedSizes(updatedRemoved);
        localStorage.setItem('sangeet_removed_sizes', JSON.stringify(updatedRemoved));
      }
      if (!customSizes.includes(clean)) {
        const updated = [...customSizes, clean];
        setCustomSizes(updated);
        localStorage.setItem('sangeet_custom_sizes', JSON.stringify(updated));
        toast.success(`Size "${clean}" added to filters`);
      }
    }
  };

  const handleRemoveCategory = (e, cat) => {
    e.stopPropagation();
    const updatedRemoved = [...removedCategories, cat];
    setRemovedCategories(updatedRemoved);
    localStorage.setItem('sangeet_removed_categories', JSON.stringify(updatedRemoved));
    
    const updatedCustom = customCategories.filter(c => c !== cat);
    setCustomCategories(updatedCustom);
    localStorage.setItem('sangeet_custom_categories', JSON.stringify(updatedCustom));
    
    if (filters.category === cat) {
      setFilter('category', 'All');
    }
    toast.success(`Category "${cat}" removed`);
  };

  const handleRemoveSize = (e, sz) => {
    e.stopPropagation();
    const updatedRemoved = [...removedSizes, sz];
    setRemovedSizes(updatedRemoved);
    localStorage.setItem('sangeet_removed_sizes', JSON.stringify(updatedRemoved));
    
    const updatedCustom = customSizes.filter(s => s !== sz);
    setCustomSizes(updatedCustom);
    localStorage.setItem('sangeet_custom_sizes', JSON.stringify(updatedCustom));
    
    if (filters.size === sz) {
      setFilter('size', 'All');
    }
    toast.success(`Size "${sz}" removed`);
  };

  // Debounce search text
  useEffect(() => {
    const t = setTimeout(() => setFilters(f => ({ ...f, search: searchDraft })), 450);
    return () => clearTimeout(t);
  }, [searchDraft]);

  // Lock body scroll while filter sidebar is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const activeFilters = { ...filters };
      if (isSharedView) {
        activeFilters.ids = sharedIds;
      }
      const res = await getProducts(activeFilters);
      setProducts(res.data.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDeleted = id => setProducts(prev => prev.filter(p => p._id !== id));
  
  const setFilter = (key, value) => setFilters(f => ({ ...f, [key]: value }));

  const clearAll = () => {
    setFilters(defaultFilters);
    setSearchDraft('');
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const getShareLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/products?shared=${selectedIds.join(',')}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareLink());
    toast.success('Link copied to clipboard!');
  };

  const handleWhatsAppShare = async () => {
    if (selectedIds.length === 0) {
      toast.error('No products selected to share.');
      return;
    }

    const selectedProducts = products.filter(p => selectedIds.includes(p._id));
    
    let text = "✨ *SANGEET Selected Designs* ✨\n\n";
    selectedProducts.forEach((p, idx) => {
      text += `*Image ${idx + 1}: ${p.name}*\n`;
      if (p.category) text += `• Category: ${p.category}\n`;
      if (p.sizes && p.sizes.length > 0) text += `• Sizes: ${p.sizes.join(', ')}\n`;
      text += `\n`;
    });

    const toastId = toast.loading('Preparing images for sharing...');

    try {
      let files = [];
      
      const fetchPromises = selectedProducts.map(async (p, idx) => {
        if (p.images && p.images.length > 0) {
          try {
            const res = await fetch(p.images[0].url, { mode: 'cors' });
            const blob = await res.blob();
            let ext = 'jpg';
            if (blob.type === 'image/png') ext = 'png';
            else if (blob.type === 'image/webp') ext = 'webp';
            
            const safeName = p.name.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
            return new File([blob], `Image_${idx + 1}_${safeName}.${ext}`, { type: blob.type });
          } catch (err) {
            console.error('Fetch error:', err);
            return null;
          }
        }
        return null;
      });
      
      const results = await Promise.all(fetchPromises);
      files = results.filter(f => f !== null);

      const shareData = {
        title: 'Sangeet Designs',
        text: text,
      };

      if (files.length > 0) {
        shareData.files = files;
      }

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        toast.dismiss(toastId);
        await navigator.share(shareData);
      } else {
        // Fallback for older devices / desktops
        toast.dismiss(toastId);
        toast.success('Information copied! Downloading images to attach manually...', { duration: 4000 });
        navigator.clipboard.writeText(text);
        
        // Trigger downloads for the images staggered to prevent browser blocking
        files.forEach((f, i) => {
          setTimeout(() => {
            const url = URL.createObjectURL(f);
            const a = document.createElement('a');
            a.href = url;
            a.download = f.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }, i * 300); 
        });
        
        setTimeout(() => {
          const encodedText = encodeURIComponent(text + "\n*(Please attach the downloaded images)*");
          window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
        }, 1500);
      }
    } catch (err) {
      toast.dismiss(toastId);
      console.error("Share failed:", err);
      if (err.name !== 'AbortError') {
        toast.error("Share action cancelled or failed.");
      }
    }
  };

  const isFiltered = Object.keys(defaultFilters).some(k =>
    k === 'search' ? filters.search !== '' : filters[k] !== defaultFilters[k]
  );

  return (
    <main className="products-section page-enter">
      <div className="container">

        <div className="sec-header">
          <p className="sec-kicker">Our Collection</p>
          <h1 className="sec-title">
            {isSharedView ? 'Shared Selection' : <>Browse <span className="gold-word">SANGEET</span></>}
          </h1>
          <div className="sec-rule" />
          <p className="sec-desc">
            {isSharedView 
              ? 'A curated selection of exclusive designs just for you.' 
              : 'Discover luxury ethnic fashion curated for every occasion.'}
          </p>
        </div>

        {/* ── Filter Bar: Hide in Shared View ── */}
        {!isSharedView ? (
          <div className="filter-bar-wrap">
            <div className="filter-top-row">
              {/* Search */}
              <div className="search-wrapper">
                <i className="bi bi-search search-icon" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search by name, description, category..."
                  value={searchDraft}
                  onChange={e => setSearchDraft(e.target.value)}
                  aria-label="Search products"
                />
                {searchDraft && (
                  <button
                    className="search-clear-btn"
                    onClick={() => setSearchDraft('')}
                    aria-label="Clear search"
                  >
                    <i className="bi bi-x" />
                  </button>
                )}
              </div>

              {/* Filters button */}
              <button
                className={`filter-toggle-btn${sidebarOpen ? ' open' : ''}`}
                onClick={() => setSidebarOpen(true)}
                aria-label="Open filters"
              >
                <i className="bi bi-sliders" />
                <span>Filters</span>
                {isFiltered && <span className="filter-dot" />}
              </button>

              {/* Admin: Add Product */}
              {isAdmin && (
                <Link to="/add-product" id="add-product-btn" className="btn-add-fab">
                  <i className="bi bi-plus-lg" /> Add Product
                </Link>
              )}
            </div>

            {/* Results count row */}
            <div className="results-row">
              <span className="item-count">
                {loading ? '...' : `${products.length} item${products.length !== 1 ? 's' : ''}`}
              </span>
              {isFiltered && !loading && (
                <button className="clear-filters-inline" onClick={clearAll}>
                  <i className="bi bi-x-circle" /> Clear filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="shared-view-actions">
            <button className="btn-back-all" onClick={() => navigate('/products')}>
              <i className="bi bi-arrow-left" /> Back to All Products
            </button>
            <span className="item-count" style={{marginLeft: 'auto'}}>
              {loading ? '...' : `${products.length} item${products.length !== 1 ? 's' : ''}`}
            </span>
          </div>
        )}

        {/* ── Product Grid ── */}
        {loading ? (
          <LoadingSpinner message={isSharedView ? "Loading selection..." : "Curating Collection..."} />
        ) : products.length === 0 ? (
          <EmptyState filtered={isFiltered || isSharedView} />
        ) : (
          <div className="products-grid">
            {products.map(p => (
              <ProductCard 
                key={p._id} 
                product={p} 
                onDeleted={handleDeleted} 
                isSelected={selectedIds.includes(p._id)}
                onToggleSelect={!isSharedView ? toggleSelect : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Floating Selection Action Bar ── */}
      {selectedIds.length > 0 && !isSharedView && createPortal(
        <div className="selection-action-bar">
          <div className="selection-count">
            <span className="count-badge">{selectedIds.length}</span> items selected
          </div>
          <div className="selection-actions">
            <button className="btn-share-wa" onClick={handleWhatsAppShare}>
              <i className="bi bi-whatsapp" /> Share
            </button>
            <button className="btn-share-link" onClick={handleCopyLink}>
              <i className="bi bi-link-45deg" /> Copy Link
            </button>
            <button className="btn-clear-selection" onClick={() => setSelectedIds([])}>
              <i className="bi bi-x" /> Clear
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* ── Filter Sidebar — Portal renders it at document.body level ── */}
      {sidebarOpen && createPortal(
        <div
          className="filter-sidebar-overlay"
          role="dialog"
          aria-modal="true"
          onClick={e => { if (e.target === e.currentTarget) setSidebarOpen(false); }}
        >
          <div className="filter-sidebar">
            {/* Header */}
            <div className="filter-sidebar-header">
              <div className="sidebar-title-row">
                <i className="bi bi-sliders sidebar-title-icon" />
                <h3>Refine Collection</h3>
              </div>
              <button
                className="filter-sidebar-close"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close filters"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {/* Scrollable Filter Body */}
            <div className="filter-sidebar-body">
              {/* Category */}
              <div className="filter-group">
                <div className="filter-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="filter-label" style={{ margin: 0 }}>Category</label>
                  <button
                    onClick={handleAddCategory}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--gold)',
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-display)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      padding: 0,
                      opacity: 0.85
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0.85}
                  >
                    <i className="bi bi-plus-circle" /> Add Category
                  </button>
                </div>
                <div className="filter-chip-row">
                  {categoryOptions.map(c => (
                    <button
                      key={c}
                      className={`filter-chip${filters.category === c ? ' active' : ''}`}
                      onClick={() => setFilter('category', c)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span>{c}</span>
                      {c !== 'All' && (
                        <span
                          onClick={(e) => handleRemoveCategory(e, c)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: 'rgba(0,0,0,0.15)',
                            fontSize: '0.55rem',
                            color: 'inherit',
                            marginLeft: '2px',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            lineHeight: 1
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,53,69,0.35)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.15)'}
                          title={`Remove "${c}"`}
                        >
                          ✕
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="filter-group">
                <div className="filter-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="filter-label" style={{ margin: 0 }}>Size</label>
                  <button
                    onClick={handleAddSize}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--gold)',
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-display)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      padding: 0,
                      opacity: 0.85
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0.85}
                  >
                    <i className="bi bi-plus-circle" /> Add Sizes
                  </button>
                </div>
                <div className="filter-chip-row">
                  {sizeOptions.map(s => (
                    <button
                      key={s}
                      className={`filter-chip${filters.size === s ? ' active' : ''}`}
                      onClick={() => setFilter('size', s)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span>{s}</span>
                      {s !== 'All' && (
                        <span
                          onClick={(e) => handleRemoveSize(e, s)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: 'rgba(0,0,0,0.15)',
                            fontSize: '0.55rem',
                            color: 'inherit',
                            marginLeft: '2px',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            lineHeight: 1
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,53,69,0.35)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.15)'}
                          title={`Remove "${s}"`}
                        >
                          ✕
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <label className="filter-label">Price Range (₹)</label>
                <div className="price-range-row">
                  <input
                    id="min-price"
                    type="number"
                    className="price-input"
                    placeholder="Min"
                    min="0"
                    value={filters.minPrice}
                    onChange={e => setFilter('minPrice', e.target.value)}
                  />
                  <span className="price-sep">—</span>
                  <input
                    id="max-price"
                    type="number"
                    className="price-input"
                    placeholder="Max"
                    min="0"
                    value={filters.maxPrice}
                    onChange={e => setFilter('maxPrice', e.target.value)}
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="filter-group">
                <label className="filter-label">Sort By</label>
                <select
                  id="sort-select"
                  className="sort-select"
                  value={filters.sort}
                  onChange={e => setFilter('sort', e.target.value)}
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="filter-sidebar-footer">
              <span className="sidebar-results-count">
                {loading ? '...' : `${products.length} item${products.length !== 1 ? 's' : ''} found`}
              </span>
              <div className="sidebar-footer-actions">
                {isFiltered && (
                  <button className="sidebar-clear-btn" onClick={clearAll}>
                    <i className="bi bi-arrow-counterclockwise" /> Clear All
                  </button>
                )}
                <button className="sidebar-apply-btn" onClick={() => setSidebarOpen(false)}>
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </main>
  );
};

export default Products;
