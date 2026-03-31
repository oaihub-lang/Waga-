import React, { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeRoom, setActiveRoom] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => setToastMessage(null), duration);
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [{ ...notification, id: Date.now(), read: false }, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  return (
    <AppContext.Provider
      value={{
        notifications,
        unreadCount,
        activeRoom,
        setActiveRoom,
        toastMessage,
        showToast,
        addNotification,
        markAllRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export default AppContext;
