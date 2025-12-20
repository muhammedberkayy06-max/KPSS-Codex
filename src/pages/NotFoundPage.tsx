import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => (
  <div className="page">
    <div className="empty-state">
      <h2>Sayfa bulunamadı</h2>
      <p>Aradığınız sayfa taşınmış olabilir.</p>
      <Link to="/" className="link-button">Ana sayfaya dön</Link>
    </div>
  </div>
);

export default NotFoundPage;
