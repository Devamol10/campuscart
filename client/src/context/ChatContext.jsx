// CampusCart — ChatContext.jsx
// Lightweight context for cross-component chat state (e.g. unread badge on Navbar)
import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [unreadOffersTotal, setUnreadOffersTotal] = useState(0);

  // Track the current user ID to prevent redundant initial fetches
  const userId = user?.userId || user?._id;
  const lastFetchedUserId = useRef(null);

  const refreshUnreadCount = useCallback(async () => {
    if (!userId) {
      setUnreadTotal(0);
      return;
    }
    try {
      const res = await api.get('/chat/unread-count');
      if (res.data?.success) {
        setUnreadTotal(res.data.count || 0);
      }
    } catch (error) {
      // ignore
    }
  }, [userId]);

  const refreshUnreadOffersCount = useCallback(async () => {
    if (!userId) {
      setUnreadOffersTotal(0);
      return;
    }
    try {
      const res = await api.get('/offers/unread-count');
      if (res.data?.success) {
        setUnreadOffersTotal(res.data.count || 0);
      }
    } catch (error) {
      // ignore
    }
  }, [userId]);

  // Initial fetch on mount or when user ID changes
  useEffect(() => {
    if (userId && userId !== lastFetchedUserId.current) {
      refreshUnreadCount();
      refreshUnreadOffersCount();
      lastFetchedUserId.current = userId;
    } else if (!userId) {
      setUnreadTotal(0);
      setUnreadOffersTotal(0);
      lastFetchedUserId.current = null;
    }
  }, [userId, refreshUnreadCount, refreshUnreadOffersCount]);

  // Global Sync via Sockets
  useEffect(() => {
    if (!socket || !connected || !userId) return;

    const handleNewMessage = (msg) => {
      const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
      
      // Increment if message is from someone else
      if (String(senderId) !== String(userId)) {
        setUnreadTotal((prev) => prev + 1);
      }
    };

    const handleReadSync = ({ readBy }) => {
      // If I am the one who read messages (in another tab or current tab), refresh total
      if (String(readBy) === String(userId)) {
        refreshUnreadCount();
      }
    };

    const handleOfferReceived = () => {
        setUnreadOffersTotal((prev) => prev + 1);
    };

    const handleOfferStatusChanged = () => {
        setUnreadOffersTotal((prev) => prev + 1);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messagesRead', handleReadSync);
    socket.on('offerReceived', handleOfferReceived);
    socket.on('offerStatusChanged', handleOfferStatusChanged);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messagesRead', handleReadSync);
      socket.off('offerReceived', handleOfferReceived);
      socket.off('offerStatusChanged', handleOfferStatusChanged);
    };
  }, [socket, connected, userId, refreshUnreadCount, refreshUnreadOffersCount]);

  const updateUnreadTotal = useCallback((count) => {
    setUnreadTotal(typeof count === 'number' ? count : 0);
  }, []);

  return (
    <ChatContext.Provider value={{ 
        unreadTotal, 
        updateUnreadTotal, 
        refreshUnreadCount,
        unreadOffersTotal,
        refreshUnreadOffersCount
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
