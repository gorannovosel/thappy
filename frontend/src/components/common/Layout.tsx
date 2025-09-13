import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      <Header />
      <main
        style={{
          flex: 1,
          paddingTop: 'var(--spacing-xl)',
          paddingBottom: 'var(--spacing-xl)',
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
