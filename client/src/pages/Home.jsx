// CampusCart — Home.jsx (Premium Overhaul)
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CategoryBar from '../components/CategoryBar';
import SectionHeading from '../components/SectionHeading';
import ProductGrid from '../components/ProductGrid';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import styles from './Home.module.css';

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
    <div className={styles.page}>
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

      {/* Hero Section */}
      {!isFiltering && !loading && (
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <div className={styles.heroBadge}>
                <span>🎓</span> Campus Exclusive Marketplace
              </div>
              <h1 className={styles.heroTitle}>
                Buy & Sell on Campus{' '}
                <span className={styles.heroGradient}>Easily</span>
              </h1>
              <p className={styles.heroSubtitle}>
                The trusted peer-to-peer marketplace for students. Find textbooks,
                electronics, and more from verified campus members.
              </p>
              <div className={styles.heroActions}>
                <Link to="/add-item" className={styles.heroPrimary}>
                  <span>+</span> Sell an Item
                </Link>
                <a href="#listings" className={styles.heroSecondary}>
                  Explore Market →
                </a>
              </div>
              <div className={styles.heroStats}>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatNum}>{listings.length}</span>
                  <span className={styles.heroStatLabel}>Marketplace Items</span>
                </div>
                <div className={styles.heroStatDivider} />
                <div className={styles.heroStat}>
                  <span className={styles.heroStatNum}>🟢</span>
                  <span className={styles.heroStatLabel}>Live Now</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className={styles.main} id="listings">
        {loading ? (
          <div className={styles.stateBox}>
            <div className={styles.spinner} />
            <h3 style={{ color: '#fff' }}>Loading fresh deals...</h3>
            <p style={{ color: '#6b7280' }}>Preparing the student marketplace for you.</p>
          </div>
        ) : error ? (
          <div className={styles.stateBox}>
            <span style={{ fontSize: '2.5rem' }}>⚠️</span>
            <h3 style={{ color: '#ef4444' }}>{error}</h3>
          </div>
        ) : (
          <>
            {isFiltering ? (
              <section className={styles.section}>
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
                  <div className={styles.emptyState}>
                    <span style={{ fontSize: '3rem' }}>🔍</span>
                    <h3 style={{ color: '#fff', margin: '1.5rem 0 0.5rem' }}>No results found</h3>
                    <p style={{ color: '#6b7280', margin: '0 0 2rem' }}>We couldn't find anything matching your request.</p>
                    <button
                      className={styles.clearBtn}
                      onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </section>
            ) : (
              <>
                {affordableItems.length > 0 && (
                  <section className={styles.section}>
                    <SectionHeading
                      title="🔥 Deals Under ₹500"
                      subtitle="High-value items at low campus prices."
                    />
                    <ProductGrid layout="row">
                      {affordableItems.map((item) => (
                        <ProductCard key={item.id} product={item} />
                      ))}
                    </ProductGrid>
                  </section>
                )}

                <section className={styles.section}>
                  <SectionHeading
                    title="Fresh on Campus"
                    subtitle="Newly listed items from students near you."
                  />
                  {listings.length > 0 ? (
                    <ProductGrid layout="grid">
                      {listings.map((item) => (
                        <ProductCard key={item.id} product={item} />
                      ))}
                    </ProductGrid>
                  ) : (
                    <div className={styles.emptyState}>
                      <span style={{ fontSize: '3.5rem' }}>📦</span>
                      <h3 className={styles.emptyTitle}>Be the pioneer!</h3>
                      <p className={styles.emptyText}>No items here yet. Be the first to list and start the market.</p>
                      <Link to="/add-item" className={styles.heroPrimary}>
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

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerText}>© 2026 CampusCart. Designed for student freedom.</p>
          <div className={styles.footerLinks}>
            <a href="#" className={styles.footerLink}>Safety First</a>
            <a href="#" className={styles.footerLink}>Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
