import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
  const [products,      setProducts]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filtersOpen,   setFiltersOpen]   = useState(false);  // mobile filter panel toggle

  // Live filters (applied immediately on change, debounced for search)
  const [filters,    setFilters]    = useState(defaultFilters);
  const [searchDraft, setSearchDraft] = useState('');

  // Read auth state
  const userJson = localStorage.getItem('sangeet_user');
  const user     = userJson ? JSON.parse(userJson) : null;
  const isAdmin  = user && user.role === 'admin';

  // Debounce search text
  useEffect(() => {
    const t = setTimeout(() => setFilters(f => ({ ...f, search: searchDraft })), 450);
    return () => clearTimeout(t);
  }, [searchDraft]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts(filters);
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

  const isFiltered = Object.keys(defaultFilters).some(k =>
    k === 'search' ? filters.search !== '' : filters[k] !== defaultFilters[k]
  );

  return (
    <main className="products-section page-enter">
      <div className="container">

        <div className="sec-header">
          <p className="sec-kicker">Our Collection</p>
          <h1 className="sec-title">Browse <span className="gold-word">SANGEET</span></h1>
          <div className="sec-rule" />
          <p className="sec-desc">Discover luxury ethnic fashion curated for every occasion.</p>
        </div>

        {/* ── Filter Bar ── */}
        <div className="filter-bar-wrap">

          {/* Top row: search + mobile toggle + admin add */}
          <div className="filter-top-row">
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

            <button
              className={`filter-toggle-btn${filtersOpen ? ' open' : ''}`}
              onClick={() => setFiltersOpen(v => !v)}
              aria-label="Toggle filters"
            >
              <i className="bi bi-sliders" />
              <span>Filters</span>
              {isFiltered && <span className="filter-dot" />}
            </button>

            {isAdmin && (
              <Link to="/add-product" id="add-product-btn" className="btn-add-fab">
                <i className="bi bi-plus-lg" /> Add Product
              </Link>
            )}
          </div>

          {/* Expandable filter panel */}
          <div className={`filter-panel${filtersOpen ? ' open' : ''}`}>
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

            {/* Clear */}
            {isFiltered && (
              <button className="clear-filters-btn" onClick={clearAll}>
                <i className="bi bi-x-circle" /> Clear All Filters
              </button>
            )}
          </div>

          {/* Results count */}
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

        {/* Grid */}
        {loading ? (
          <LoadingSpinner message="Curating Collection..." />
        ) : products.length === 0 ? (
          <EmptyState filtered={isFiltered} />
        ) : (
          <div className="products-grid">
            {products.map(p => (
              <ProductCard key={p._id} product={p} onDeleted={handleDeleted} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Products;
