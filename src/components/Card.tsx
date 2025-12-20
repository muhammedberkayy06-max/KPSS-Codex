import React from 'react';

type CardProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

const Card: React.FC<CardProps> = ({ title, subtitle, children, className }) => (
  <section className={`card ${className ?? ''}`.trim()}>
    {(title || subtitle) && (
      <header className="card-header">
        {title && <h3>{title}</h3>}
        {subtitle && <p>{subtitle}</p>}
      </header>
    )}
    <div className="card-body">{children}</div>
  </section>
);

export default Card;
