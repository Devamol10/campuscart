import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading, fetchUser } = useAuth();

  // If loading finished but user is null AND we have a token, 
  // it means fetchUser state hasn't propagated yet — retry once
  const [retrying, setRetrying] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !user && localStorage.getItem('token') && !retrying) {
      setRetrying(true);
      fetchUser().finally(() => setRetrying(false));
    }
  }, [loading, user, fetchUser, retrying]);

  if (loading || retrying) {
    return (
      <div 
        style={{ 
          height: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#F9FAFB',
          color: '#6B7280',
          fontWeight: '500'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <span>Verifying session...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
