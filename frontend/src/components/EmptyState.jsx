import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ filtered = false }) => (
  <div className="empty-state page-enter">
    <span className="empty-icon">{filtered ? '🔍' : '🧵'}</span>
    <h3>{filtered ? 'No Results Found' : 'No Products Yet'}</h3>
    <p>
      {filtered
        ? 'Try a different search term or size filter.'
        : 'The collection is empty. Begin by adding your first piece.'}
    </p>
    {!filtered && (
      <Link to="/add-product" className="btn-add-fab" id="empty-add-btn">
        <i className="bi bi-plus-lg" /> Add First Product
      </Link>
    )}
  </div>
);

export default EmptyState;
