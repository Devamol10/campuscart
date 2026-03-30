import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { BuyModal, OfferModal } from '../components/ActionModals';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/listings/${id}`);
        setItem(res.data);
      } catch (error) {
        setItem(null);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleContactSeller = async () => {
    if (!item) return;
    try {
      const sellerId = item.sellerId?._id || item.sellerId;
      const res = await api.post('/chat/conversations', {
        listingId: item._id,
        otherUserId: sellerId,
      });
      if (res.data.success) {
        navigate(`/chat?conversationId=${res.data.data._id}`);
      }
    } catch (err) {
      navigate('/chat');
    }
  };

  const images = item?.images?.length > 0
    ? item.images.map((img) => img.url || img)
    : item?.imageUrl
    ? [item.imageUrl]
    : [];

  const isSeller = user?._id === (item?.sellerId?._id || item?.sellerId);

  if (loading) {
    return (
      <div style={s.page}>
        <Navbar />
        <div style={s.stateBox}>
          <div style={s.spinner} />
          <p style={{ color: '#6b7280' }}>Loading item details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={s.page}>
        <Navbar />
        <div style={s.stateBox}>
          <span style={{ fontSize: '3rem' }}>🔍</span>
          <h3 style={{ color: '#e5e7eb', margin: '0.5rem 0' }}>Item not found</h3>
          <Link to="/" style={s.backLink}>← Back to Marketplace</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.wrapper}>
        {/* Breadcrumb */}
        <div style={s.breadcrumb}>
          <Link to="/" style={s.breadcrumbLink}>Home</Link>
          <span style={s.breadcrumbSep}>/</span>
          <span style={s.breadcrumbCurrent}>{item.title}</span>
        </div>

        <div style={s.grid}>
          {/* ── Left: Image Gallery ── */}
          <div style={s.imageSection}>
            <div style={s.mainImageBox}>
              {images.length > 0 ? (
                <img src={images[activeImg]} alt={item.title} style={s.mainImage} />
              ) : (
                <div style={s.noImage}>
                  <span style={{ fontSize: '3rem' }}>📷</span>
                  <p style={{ color: '#4b5563', margin: 0 }}>No image available</p>
                </div>
              )}
              {item.status === 'sold' && (
                <div style={s.soldBanner}>SOLD</div>
              )}
              {item.condition && (
                <span style={s.conditionTag}>{item.condition}</span>
              )}
            </div>
            {images.length > 1 && (
              <div style={s.thumbRow}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    style={{
                      ...s.thumb,
                      ...(i === activeImg ? s.thumbActive : {}),
                    }}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img} alt="" style={s.thumbImg} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Details ── */}
          <div style={s.details}>
            <span style={s.categoryBadge}>{item.category}</span>
            <h1 style={s.title}>{item.title}</h1>
            <p style={s.price}>₹{item.price?.toLocaleString()}</p>

            {/* Description */}
            <div style={s.section}>
              <h3 style={s.sectionTitle}>Description</h3>
              <p style={s.desc}>{item.description || 'No description provided.'}</p>
            </div>

            {/* Seller Card */}
            <div style={s.sellerCard}>
              <div style={s.sellerAvatar}>
                {item.sellerId?.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div style={s.sellerInfo}>
                <span style={s.sellerLabel}>Seller</span>
                <span style={s.sellerName}>{item.sellerId?.name || 'Student'}</span>
                {item.sellerId?.email && (
                  <span style={s.sellerEmail}>{item.sellerId.email}</span>
                )}
              </div>
            </div>

            {/* Actions */}
            {!isSeller && item.status !== 'sold' && (
              <div style={s.actionGroup}>
                <button style={s.buyBtn} onClick={() => setIsBuyOpen(true)}>
                  Buy Now
                </button>
                <button style={s.offerBtn} onClick={() => setIsOfferOpen(true)}>
                  💰 Make Offer
                </button>
              </div>
            )}

            {!isSeller && (
              <button style={s.chatBtn} onClick={handleContactSeller}>
                💬 Contact Seller
              </button>
            )}

            {isSeller && (
              <div style={s.ownerBadge}>
                You own this listing
              </div>
            )}

            <Link to="/" style={s.backLink}>← Back to Marketplace</Link>
          </div>
        </div>
      </div>

      <BuyModal isOpen={isBuyOpen} onClose={() => setIsBuyOpen(false)} contact={item.sellerId?.email} />
      <OfferModal
        isOpen={isOfferOpen}
        onClose={() => setIsOfferOpen(false)}
        currentPrice={item.price}
        listingId={item._id}
        sellerId={item.sellerId?._id || item.sellerId}
      />
    </div>
  );
};

const s = {
  page: { minHeight: '100vh', background: '#0b0f19' },
  wrapper: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem 4rem' },
  stateBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '6rem 2rem', gap: '1rem', textAlign: 'center',
  },
  spinner: {
    width: '36px', height: '36px', border: '3px solid rgba(108,99,255,0.2)',
    borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  },

  /* Breadcrumb */
  breadcrumb: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' },
  breadcrumbLink: { color: '#6b7280', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '500' },
  breadcrumbSep: { color: '#4b5563', fontSize: '0.75rem' },
  breadcrumbCurrent: { color: '#9ca3af', fontSize: '0.85rem', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' },

  /* Grid */
  grid: { display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '2.5rem', alignItems: 'start' },

  /* Image section */
  imageSection: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  mainImageBox: {
    position: 'relative', borderRadius: '20px', overflow: 'hidden',
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
    aspectRatio: '4/3',
  },
  mainImage: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  noImage: {
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '0.5rem', minHeight: '300px',
  },
  soldBanner: {
    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#ef4444', fontSize: '2rem', fontWeight: '900', letterSpacing: '0.1em',
  },
  conditionTag: {
    position: 'absolute', top: '14px', left: '14px',
    background: 'rgba(17,24,39,0.85)', backdropFilter: 'blur(8px)',
    color: '#e5e7eb', padding: '0.3rem 0.75rem', borderRadius: '10px',
    fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  thumbRow: { display: 'flex', gap: '0.5rem' },
  thumb: {
    width: '64px', height: '64px', borderRadius: '10px', overflow: 'hidden',
    border: '2px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)',
    cursor: 'pointer', padding: 0, transition: 'border-color 0.15s ease',
  },
  thumbActive: { borderColor: '#6c63ff' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },

  /* Details */
  details: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  categoryBadge: {
    display: 'inline-block', padding: '0.3rem 0.8rem',
    background: 'rgba(108,99,255,0.1)', color: '#a5b4fc',
    borderRadius: '100px', fontSize: '0.75rem', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: '0.05em', width: 'fit-content',
  },
  title: {
    fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800', lineHeight: 1.15,
    color: '#f3f4f6', margin: '0.5rem 0 0.25rem', letterSpacing: '-0.02em',
  },
  price: {
    fontSize: '1.75rem', fontWeight: '800', color: '#22c55e', margin: '0 0 1rem',
  },

  section: {
    padding: '1.25rem 0', borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  sectionTitle: {
    fontSize: '0.8rem', fontWeight: '700', color: '#6b7280',
    textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.6rem',
  },
  desc: { fontSize: '0.95rem', color: '#9ca3af', lineHeight: 1.6, margin: 0 },

  /* Seller card */
  sellerCard: {
    display: 'flex', alignItems: 'center', gap: '0.875rem',
    padding: '1rem 1.15rem', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px',
    margin: '0.5rem 0 1rem',
  },
  sellerAvatar: {
    width: '44px', height: '44px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff 0%, #3b82f6 100%)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '1.1rem', flexShrink: 0,
  },
  sellerInfo: { display: 'flex', flexDirection: 'column' },
  sellerLabel: { fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' },
  sellerName: { fontSize: '0.95rem', fontWeight: '700', color: '#f3f4f6' },
  sellerEmail: { fontSize: '0.8rem', color: '#6b7280' },

  /* Buttons */
  actionGroup: { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' },
  buyBtn: {
    flex: 1, padding: '0.9rem 1.5rem',
    background: 'linear-gradient(135deg, #6c63ff 0%, #3b82f6 100%)',
    color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700',
    fontSize: '0.95rem', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(108,99,255,0.25)', transition: 'all 0.15s ease',
  },
  offerBtn: {
    flex: 1, padding: '0.9rem 1.5rem', background: 'transparent',
    color: '#a5b4fc', border: '2px solid rgba(108,99,255,0.4)',
    borderRadius: '12px', fontWeight: '700', fontSize: '0.95rem',
    cursor: 'pointer', transition: 'all 0.15s ease',
  },
  chatBtn: {
    width: '100%', padding: '0.85rem',
    background: 'rgba(255,255,255,0.05)', color: '#d1d5db',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
    fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer',
    transition: 'all 0.15s ease', marginTop: '0.25rem',
  },
  ownerBadge: {
    padding: '0.8rem', background: 'rgba(108,99,255,0.08)',
    border: '1px solid rgba(108,99,255,0.2)', borderRadius: '12px',
    color: '#a5b4fc', fontWeight: '600', fontSize: '0.9rem',
    textAlign: 'center', margin: '0.5rem 0',
  },
  backLink: {
    display: 'inline-flex', color: '#6b7280', textDecoration: 'none',
    fontWeight: '600', fontSize: '0.88rem', marginTop: '1.5rem',
    transition: 'color 0.15s',
  },
};

// Responsive override via media query in CSS would be ideal, but inline works for now
if (typeof window !== 'undefined' && window.innerWidth <= 768) {
  s.grid.gridTemplateColumns = '1fr';
}

export default ItemDetails;
