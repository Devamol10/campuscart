// CampusCart — ChatContext.jsx
// Lightweight context for cross-component chat state (e.g. unread badge on Navbar)
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [unreadOffersTotal, setUnreadOffersTotal] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!user) {
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
  }, [user]);

  const refreshUnreadOffersCount = useCallback(async () => {
    if (!user) {
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
  }, [user]);

  // Initial fetch on mount or login
  useEffect(() => {
    refreshUnreadCount();
    refreshUnreadOffersCount();
  }, [refreshUnreadCount, refreshUnreadOffersCount]);

  // Global Sync via Sockets
  useEffect(() => {
    if (!socket || !connected || !user) return;

    const handleNewMessage = (msg) => {
      const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
      const myId = user.userId || user._id;

      // Increment if message is from someone else
      if (String(senderId) !== String(myId)) {
        setUnreadTotal((prev) => prev + 1);
      }
    };

    const handleReadSync = ({ readBy }) => {
      const myId = user.userId || user._id;
      // If I am the one who read messages (in another tab or current tab), refresh total
      if (String(readBy) === String(myId)) {
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
  }, [socket, connected, user, refreshUnreadCount, refreshUnreadOffersCount]);

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
