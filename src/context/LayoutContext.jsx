import { createContext, useState, useContext } from 'react';

const LayoutContext = createContext();

export function LayoutProvider({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <LayoutContext.Provider value={{ isMobileMenuOpen, toggleMobileMenu, closeMobileMenu }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  return useContext(LayoutContext);
}
