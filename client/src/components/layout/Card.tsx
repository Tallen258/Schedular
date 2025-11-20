import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card = ({ 
  children, 
  className = '', 
  padding = 'md',
  hover = true 
}: CardProps) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div 
      className={`card ${paddingClasses[padding]} ${hover ? '' : '!shadow-sm hover:!shadow-sm'} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
