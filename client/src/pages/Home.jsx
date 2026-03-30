import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CategoryBar from '../components/CategoryBar';
import SectionHeading from '../components/SectionHeading';
import ProductGrid from '../components/ProductGrid';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

const Home = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(categoryName || 'All');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        // Build query string based on selection
        let url = '/listings';
        const params = new URLSearchParams();
        if (activeCategory && activeCategory !== 'All') {
          params.append('category', activeCategory);
        }
        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const res = await api.get(url);
        const fetched = res.data.listings || [];
        const mapped = fetched.map((item) => ({
          ...item,
          id: item._id,
          image: item.images?.[0]?.url || item.imageUrl || null,
          sellerName: item.sellerId?.name || 'Student',
        }));
        setListings(mapped);
      } catch (err) {
        setError('Failed to load marketplace listings.');
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [activeCategory]);

  // Sync state with URL
  useEffect(() => {
    if (categoryName) {
      setActiveCategory(categoryName);
    } else {
      setActiveCategory('All');
    }
  }, [categoryName]);

  const filteredItems = useMemo(() => {
    return listings.filter((item) => {
      const matchesSearch =
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [listings, searchTerm, activeCategory]);

  const affordableItems = useMemo(() => listings.filter((item) => item.price <= 500), [listings]);

  const isFiltering = searchTerm || activeCategory !== 'All';

  return (
    <div style={styles.page}>
      <Navbar onSearch={setSearchTerm} />
      <CategoryBar
        activeCategory={activeCategory}
        onSelect={(cat) => {
          const target = cat === activeCategory ? 'All' : cat;
          if (target === 'All') {
            navigate('/');
          } else {
            navigate(`/category/${target}`);
          }
        }}
      />

      {/* ── Hero Section ── */}
      {!isFiltering && !loading && (
        <section style={styles.hero}>
          <div style={styles.heroInner}>
            <div style={styles.heroContent}>
              <div style={styles.heroBadge}>
                <span>🎓</span> Campus Exclusive Marketplace
              </div>
              <h1 style={styles.heroTitle}>
                Buy & Sell on Campus{' '}
                <span style={styles.heroGradient}>Easily</span>
              </h1>
              <p style={styles.heroSubtitle}>
                The trusted peer-to-peer marketplace for students. Find textbooks,
                electronics, furniture, and more — all from verified campus members.
              </p>
              <div style={styles.heroActions}>
                <Link to="/add-item" style={styles.heroPrimary}>
                  <span>+</span> Sell an Item
                </Link>
                <a href="#listings" style={styles.heroSecondary}>
                  Browse Listings →
                </a>
              </div>
              <div style={styles.heroStats}>
                <div style={styles.heroStat}>
                  <span style={styles.heroStatNum}>{listings.length}</span>
                  <span style={styles.heroStatLabel}>Active Listings</span>
                </div>
                <div style={styles.heroStatDivider} />
                <div style={styles.heroStat}>
                  <span style={styles.heroStatNum}>🟢</span>
                  <span style={styles.heroStatLabel}>Live Marketplace</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Main Content ── */}
      <main style={styles.main} id="listings">
        {loading ? (
          <div style={styles.stateBox}>
            <div style={styles.spinner} />
            <p style={{ color: '#6b7280' }}>Loading fresh campus deals...</p>
          </div>
        ) : error ? (
          <div style={styles.stateBox}>
            <span style={{ fontSize: '2.5rem' }}>⚠️</span>
            <p style={{ color: '#ef4444' }}>{error}</p>
          </div>
        ) : (
          <>
            {isFiltering ? (
              <section style={styles.section}>
                <SectionHeading
                  title={searchTerm ? `Results for "${searchTerm}"` : `Category: ${activeCategory}`}
                  subtitle={`${filteredItems.length} items found`}
                />
                {filteredItems.length > 0 ? (
                  <ProductGrid layout="grid">
                    {filteredItems.map((item) => (
                      <ProductCard key={item.id} product={item} />
                    ))}
                  </ProductGrid>
                ) : (
                  <div style={styles.emptyState}>
                    <span style={{ fontSize: '3rem' }}>🔍</span>
                    <h3 style={{ color: '#e5e7eb', margin: '0.5rem 0 0.25rem' }}>No items found</h3>
                    <p style={{ color: '#6b7280', margin: '0 0 1rem' }}>Try adjusting your search or filters</p>
                    <button
                      style={styles.clearBtn}
                      onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </section>
            ) : (
              <>
                {affordableItems.length > 0 && (
                  <section style={styles.section}>
                    <SectionHeading
                      title="🔥 Deals Under ₹500"
                      subtitle="Best steals grabbed fast by students"
                    />
                    <ProductGrid layout="row">
                      {affordableItems.map((item) => (
                        <ProductCard key={item.id} product={item} />
                      ))}
                    </ProductGrid>
                  </section>
                )}

                <section style={styles.section}>
                  <SectionHeading
                    title="Fresh on Campus"
                    subtitle="Just listed by your peers"
                  />
                  {listings.length > 0 ? (
                    <ProductGrid layout="grid">
                      {listings.map((item) => (
                        <ProductCard key={item.id} product={item} />
                      ))}
                    </ProductGrid>
                  ) : (
                    <div style={styles.emptyState}>
                      <span style={{ fontSize: '3rem' }}>📦</span>
                      <h3 style={{ color: '#e5e7eb', margin: '0.5rem 0 0.25rem' }}>No listings yet</h3>
                      <p style={{ color: '#6b7280', margin: 0 }}>Be the first to sell on campus!</p>
                      <Link to="/add-item" style={{ ...styles.clearBtn, marginTop: '1rem', textDecoration: 'none' }}>
                        + Post a Listing
                      </Link>
                    </div>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <p style={styles.footerText}>© 2026 CampusCart. Built for student life.</p>
          <div style={styles.footerLinks}>
            <a href="#" style={styles.footerLink}>Safety Guidelines</a>
            <a href="#" style={styles.footerLink}>Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#0b0f19',
  },
  main: {
    flex: 1,
    maxWidth: '1280px',
    margin: '0 auto',
    width: '100%',
    padding: '2rem 1.5rem',
  },
  section: {
    marginBottom: '3rem',
  },

  /* Hero */
  hero: {
    background: 'linear-gradient(180deg, rgba(108, 99, 255, 0.06) 0%, transparent 100%)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    padding: '3rem 1.5rem 2.5rem',
  },
  heroInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '3rem',
    flexWrap: 'wrap',
  },
  heroContent: {
    flex: '1 1 500px',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 0.9rem',
    background: 'rgba(108, 99, 255, 0.1)',
    border: '1px solid rgba(108, 99, 255, 0.2)',
    borderRadius: '100px',
    color: '#a5b4fc',
    fontSize: '0.78rem',
    fontWeight: '600',
    marginBottom: '1.25rem',
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: '800',
    color: '#f3f4f6',
    lineHeight: 1.1,
    margin: '0 0 1rem',
    letterSpacing: '-0.03em',
  },
  heroGradient: {
    background: 'linear-gradient(135deg, #6c63ff 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '1.05rem',
    color: '#9ca3af',
    lineHeight: 1.6,
    margin: '0 0 1.75rem',
    maxWidth: '520px',
  },
  heroActions: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginBottom: '2rem',
  },
  heroPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.8rem 1.5rem',
    background: 'linear-gradient(135deg, #6c63ff 0%, #3b82f6 100%)',
    color: '#fff',
    fontWeight: '700',
    fontSize: '0.95rem',
    borderRadius: '12px',
    textDecoration: 'none',
    boxShadow: '0 4px 16px rgba(108, 99, 255, 0.3)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  heroSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.8rem 1.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#d1d5db',
    fontWeight: '600',
    fontSize: '0.95rem',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  },
  heroStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  heroStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
  },
  heroStatNum: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#f3f4f6',
  },
  heroStatLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  heroStatDivider: {
    width: '1px',
    height: '32px',
    background: 'rgba(255, 255, 255, 0.08)',
  },

  /* States */
  stateBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5rem 2rem',
    gap: '1rem',
    textAlign: 'center',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid rgba(108, 99, 255, 0.2)',
    borderTopColor: '#6c63ff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px dashed rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
  },
  clearBtn: {
    display: 'inline-flex',
    padding: '0.6rem 1.25rem',
    background: 'rgba(255, 255, 255, 0.06)',
    color: '#d1d5db',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.88rem',
    cursor: 'pointer',
  },

  /* Footer */
  footer: {
    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
    padding: '2rem 1.5rem',
    marginTop: 'auto',
    background: '#111827',
  },
  footerInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  footerText: { color: '#4b5563', fontSize: '0.85rem', margin: 0 },
  footerLinks: { display: 'flex', gap: '1.5rem' },
  footerLink: { color: '#6b7280', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '500' },
};

export default Home;
