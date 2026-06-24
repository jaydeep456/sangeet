import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { getProducts } from '../services/api';

const SIZE_OPTIONS     = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const CATEGORY_OPTIONS = ['All', 'Ethnic', 'Bridal', 'Festive', 'Casual Ethnic', 'Wedding', 'Formal'];
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

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Hey! I selected some exclusive designs for you. Check them out here:\n\n${getShareLink()}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
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
                onToggleSelect={isAdmin && !isSharedView ? toggleSelect : undefined}
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
                <label className="filter-label">Category</label>
                <div className="filter-chip-row">
                  {CATEGORY_OPTIONS.map(c => (
                    <button
                      key={c}
                      className={`filter-chip${filters.category === c ? ' active' : ''}`}
                      onClick={() => setFilter('category', c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="filter-group">
                <label className="filter-label">Size</label>
                <div className="filter-chip-row">
                  {SIZE_OPTIONS.map(s => (
                    <button
                      key={s}
                      className={`filter-chip${filters.size === s ? ' active' : ''}`}
                      onClick={() => setFilter('size', s)}
                    >
                      {s}
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
