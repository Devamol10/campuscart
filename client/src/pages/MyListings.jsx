import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import ProductGrid from '../components/ProductGrid';
import SectionHeading from '../components/SectionHeading';
import api from '../services/api';

const MyListings = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/listings/my');
        const fetched = Array.isArray(res.data) ? res.data : (res.data.listings || []);
        const mapped = fetched.map((item) => ({
          ...item,
          id: item._id,
          image: item.images?.[0]?.url || item.imageUrl || null,
          sellerName: item.sellerId?.name || 'You',
        }));
        setItems(mapped);
      } catch (err) {
        setError('Failed to load your listings.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyListings();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/listings/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id && item._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  return (
    <div style={s.page}>
      <Navbar />
      <main style={s.main}>
        <div style={s.header}>
          <SectionHeading
            title="My Listings"
            subtitle={`${items.length} items you've posted`}
          />
          <Link to="/add-item" style={s.addBtn}>
            <span>+</span> New Listing
          </Link>
        </div>

        {loading ? (
          <div style={s.stateBox}>
            <div style={s.spinner} />
            <p style={{ color: '#6b7280' }}>Loading your listings...</p>
          </div>
        ) : error ? (
          <div style={s.stateBox}>
            <span style={{ fontSize: '2.5rem' }}>⚠️</span>
            <p style={{ color: '#ef4444' }}>{error}</p>
          </div>
        ) : items.length > 0 ? (
          <ProductGrid layout="grid">
            {items.map((item) => (
              <ProductCard key={item.id} product={item} onDelete={handleDelete} />
            ))}
          </ProductGrid>
        ) : (
          <div style={s.emptyState}>
            <span style={{ fontSize: '3.5rem' }}>📦</span>
            <h3 style={s.emptyTitle}>No listings yet</h3>
            <p style={s.emptyText}>Start selling your items to see them here!</p>
            <Link to="/add-item" style={s.sellBtn}>+ Sell Something</Link>
          </div>
        )}
      </main>
    </div>
  );
};

const s = {
  page: { minHeight: '100vh', background: '#0b0f19' },
  main: { maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem',
  },
  addBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg, #6c63ff 0%, #3b82f6 100%)',
    color: '#fff', fontWeight: '700', fontSize: '0.88rem', borderRadius: '10px',
    textDecoration: 'none', boxShadow: '0 2px 10px rgba(108,99,255,0.25)',
    transition: 'all 0.15s ease', flexShrink: 0,
  },
  stateBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '5rem 2rem', gap: '1rem',
  },
  spinner: {
    width: '32px', height: '32px', border: '3px solid rgba(108,99,255,0.2)',
    borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  },
  emptyState: {
    textAlign: 'center', padding: '5rem 2rem',
    background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)',
    borderRadius: '20px',
  },
  emptyTitle: { fontSize: '1.35rem', fontWeight: '700', color: '#e5e7eb', margin: '0.75rem 0 0.25rem' },
  emptyText: { color: '#6b7280', margin: '0 0 1.5rem' },
  sellBtn: {
    display: 'inline-flex', padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #6c63ff 0%, #3b82f6 100%)',
    color: '#fff', fontWeight: '700', borderRadius: '12px', textDecoration: 'none',
    boxShadow: '0 4px 16px rgba(108,99,255,0.25)',
  },
};

export default MyListings;
