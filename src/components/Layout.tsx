import { NavLink } from 'react-router-dom';
import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="app-shell">
    <header className="app-header">
      <div className="brand">KPSS Deneme Atölyesi</div>
      <nav className="nav-links">
        <NavLink to="/" end>
          Ana Sayfa
        </NavLink>
        <NavLink to="/ayarlar">Ayarlar</NavLink>
      </nav>
    </header>
    <main className="app-main">{children}</main>
  </div>
);

export default Layout;
