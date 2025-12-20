import React from 'react';

type CardProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

const Card: React.FC<CardProps> = ({ title, subtitle, children, className }) => (
  <section
    className={`bg-ios-bg shadow-ios-soft rounded-xl border border-ios-border p-5 ${
      className ?? ''
    }`.trim()}
  >
    {(title || subtitle) && (
      <header className="flex flex-col gap-1 mb-3">
        {title && <h3 className="text-ios-title">{title}</h3>}
        {subtitle && <p className="text-ios-muted text-ios-subtitle">{subtitle}</p>}
      </header>
    )}
    <div className="flex flex-col gap-4">{children}</div>
  </section>
);

export default Card;
