import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

const Button: React.FC<ButtonProps> = ({ variant = 'primary', className, ...props }) => (
  <button className={`btn btn-${variant} ${className ?? ''}`} {...props} />
);

export default Button;
