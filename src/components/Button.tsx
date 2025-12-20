import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

const Button: React.FC<ButtonProps> = ({ variant = 'primary', className, ...props }) => {
  const base =
    'inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold transition-ios shadow-ios-soft';
  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-ios-primary text-white',
    secondary: 'bg-ios-surface text-ios-primary border border-ios-border',
    ghost: 'bg-transparent text-ios-primary border border-transparent'
  };
  return <button className={`${base} ${variants[variant]} ${className ?? ''}`.trim()} {...props} />;
};

export default Button;
