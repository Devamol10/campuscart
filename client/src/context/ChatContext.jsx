// CampusCart — ChatContext.jsx
// Lightweight context for cross-component chat state (e.g. unread badge on Navbar)
import React, { createContext, useState, useContext, useCallback } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [unreadTotal, setUnreadTotal] = useState(0);

  const updateUnreadTotal = useCallback((count) => {
    setUnreadTotal(typeof count === 'number' ? count : 0);
  }, []);

  return (
    <ChatContext.Provider value={{ unreadTotal, updateUnreadTotal }}>
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
