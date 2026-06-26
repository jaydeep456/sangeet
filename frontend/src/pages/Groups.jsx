import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGroups } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await getGroups();
      setGroups(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupClick = (group) => {
    if (!group.products || group.products.length === 0) return;
    const ids = group.products.join(',');
    navigate(`/products?shared=${ids}`);
  };

  if (loading) return <LoadingSpinner message="Loading Groups..." />;

  if (error) {
    return (
      <main className="container page-enter" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--danger)' }}>Error Loading Groups</h2>
        <p>{error}</p>
        <button className="btn-submit" onClick={fetchGroups} style={{ marginTop: '1rem', width: 'auto', padding: '0.8rem 2rem' }}>
          Retry
        </button>
      </main>
    );
  }

  return (
    <main className="container page-enter" style={{ padding: '2rem 1rem' }}>
      <div className="sec-header">
        <p className="sec-kicker">Collections</p>
        <h1 className="sec-title">Saved <span className="gold-word">Groups</span></h1>
        <div className="sec-rule" />
        <p className="sec-desc">Browse previously created curated selections.</p>
      </div>

      {groups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <i className="bi bi-collection" style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '1rem', display: 'block' }} />
          <h3>No groups found</h3>
          <p>Go to the collection to create a new group.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          {groups.map(group => (
            <div 
              key={group._id} 
              className="group-card" 
              onClick={() => handleGroupClick(group)}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'var(--gold)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <h3 style={{ margin: '0 0 0.5rem', color: 'var(--gold)', fontSize: '1.25rem' }}>
                <i className="bi bi-folder2-open" style={{ marginRight: '8px' }}/>
                {group.name}
              </h3>
              <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Created: {new Date(group.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ background: 'rgba(201, 168, 76, 0.1)', color: 'var(--gold)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {group.products.length} Items
                </span>
                <span style={{ color: 'var(--gold)', fontSize: '0.9rem' }}>
                  View <i className="bi bi-arrow-right" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Groups;
