import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import styles from './MyOffers.module.css';

const MyOffers = () => {
  const [activeTab, setActiveTab] = useState('made'); // 'made' or 'received'
  const [sentOffers, setSentOffers] = useState([]);
  const [receivedOffers, setReceivedOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'made') {
        const res = await api.get('/offers/my');
        if (res.data.success) {
          setSentOffers(res.data.data);
        }
      } else {
        const listingsRes = await api.get('/listings/my');
        const myListings = listingsRes.data;

        const allOffers = await Promise.all(
          myListings.map(l => api.get(`/offers/listing/${l._id}`))
        );

        const flattened = allOffers
          .map(res => res.data.data)
          .flat()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setReceivedOffers(flattened);
      }
    } catch (err) {
      console.error("Error fetching offers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (offerId, status) => {
    setReceivedOffers(prev => prev.map(o => 
      o._id === offerId ? { ...o, status } : o
    ));

    try {
      await api.patch(`/offers/${offerId}/${status}`);
      if (status === 'accept') {
        fetchData();
      }
    } catch (err) {
      console.error(`Failed to ${status} offer:`, err);
      fetchData();
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ background: '#0b0f19', minHeight: '100vh', paddingBottom: '2rem' }}>
        <div className={styles.container}>
          <h1 className={styles.title}>Manage Offers</h1>
          
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'made' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('made')}
            >
              Offers I Made
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'received' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('received')}
            >
              Offers I Received
            </button>
          </div>

          {loading ? (
            <div className={styles.empty}>
              <div style={{ width: '30px', height: '30px', border: '3px solid rgba(108,99,255,0.2)', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
              <h3>Loading offers...</h3>
            </div>
          ) : (
            <div className={styles.offerList}>
              {activeTab === 'made' ? (
                sentOffers.length === 0 ? (
                  <div className={styles.empty}>
                    <span style={{ fontSize: '3rem' }}>🏷️</span>
                    <h3 style={{ marginTop: '1rem' }}>No offers sent yet</h3>
                    <p style={{ marginBottom: '1rem', color: '#6b7280' }}>Browse the marketplace and find something you like.</p>
                    <Link to="/" style={{ padding: '0.6rem 1.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textDecoration: 'none', color: '#f3f4f6' }}>Explore items</Link>
                  </div>
                ) : (
                  sentOffers.map(offer => (
                    <div key={offer._id} className={styles.offerCard}>
                      <img 
                        src={offer.listing?.images?.[0]?.url || offer.listing?.imageUrl || 'https://via.placeholder.com/100'} 
                        className={styles.itemImage} 
                        alt=""
                      />
                      <div className={styles.offerInfo}>
                        <Link to={`/listings/${offer.listing?._id}`} className={styles.listingTitle}>
                          {offer.listing?.title}
                        </Link>
                        <div className={styles.amount}>Offered: ₹{offer.amount}</div>
                        <div className={`${styles.statusBadge} ${styles[offer.status]}`}>
                          {offer.status}
                        </div>
                      </div>
                      {offer.status === 'accepted' && (
                        <div className={styles.actions}>
                          <Link to={`/chat?listingId=${offer.listing?._id}`} className={styles.chatBtn}>
                            Go to Chat
                          </Link>
                        </div>
                      )}
                    </div>
                  ))
                )
              ) : (
                receivedOffers.length === 0 ? (
                  <div className={styles.empty}>
                    <span style={{ fontSize: '3rem' }}>📥</span>
                    <h3 style={{ marginTop: '1rem' }}>No offers received</h3>
                    <p style={{ color: '#6b7280' }}>You don't have any offers on your listings yet.</p>
                  </div>
                ) : (
                  receivedOffers.map(offer => (
                    <div key={offer._id} className={styles.offerCard}>
                      <img 
                        src={offer.listing?.images?.[0]?.url || offer.listing?.imageUrl || 'https://via.placeholder.com/100'} 
                        className={styles.itemImage} 
                        alt=""
                      />
                      <div className={styles.offerInfo}>
                        <Link to={`/listings/${offer.listing?._id}`} className={styles.listingTitle}>
                          {offer.listing?.title}
                        </Link>
                        <div className={styles.buyerInfo}>
                          <div className={styles.avatar}>{offer.buyer?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                          <span className={styles.buyerName}>{offer.buyer?.name || 'Someone'}</span>
                        </div>
                        <div className={styles.amount}>Bid: ₹{offer.amount}</div>
                        <div className={`${styles.statusBadge} ${styles[offer.status]}`}>
                          {offer.status}
                        </div>
                      </div>
                      {offer.status === 'pending' ? (
                        <div className={styles.actions}>
                          <button onClick={() => handleUpdateStatus(offer._id, 'accept')} className={styles.acceptBtn}>
                            Accept
                          </button>
                          <button onClick={() => handleUpdateStatus(offer._id, 'reject')} className={styles.rejectBtn}>
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className={styles.actions}>
                           <Link to={`/chat?listingId=${offer.listing?._id}`} className={styles.chatBtn}>View Chat</Link>
                        </div>
                      )}
                    </div>
                  ))
                )
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyOffers;
