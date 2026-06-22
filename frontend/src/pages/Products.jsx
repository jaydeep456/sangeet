import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { getProducts } from '../services/api';

const SIZES = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [size, setSize] = useState('All');

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts(search, size);
      setProducts(res.data.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, size]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDeleted = (id) => setProducts(prev => prev.filter(p => p._id !== id));

  const isFiltered = search !== '' || size !== 'All';

  return (
    <main className="products-section page-enter">
      <div className="container">

        <div className="sec-header">
          <p className="sec-kicker">Admin Panel</p>
          <h1 className="sec-title">Our <span className="gold-word">Collection</span></h1>
          <div className="sec-rule" />
          <p className="sec-desc">Manage the SANGEET product catalogue with ease.</p>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="search-wrapper">
            <i className="bi bi-search search-icon" />
            <input
              id="search-input"
              type="text"
              placeholder="Search by product name..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              aria-label="Search products"
            />
          </div>

          <select
            id="size-filter"
            className="size-select"
            value={size}
            onChange={e => setSize(e.target.value)}
            aria-label="Filter by size"
          >
            {SIZES.map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Sizes' : s}</option>
            ))}
          </select>

          <span className="item-count">
            {loading ? '...' : `${products.length} item${products.length !== 1 ? 's' : ''}`}
          </span>

          <Link to="/add-product" id="add-product-btn" className="btn-add-fab">
            <i className="bi bi-plus-lg" /> Add Product
          </Link>
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
