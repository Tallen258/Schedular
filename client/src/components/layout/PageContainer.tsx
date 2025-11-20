import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}


const PageContainer = ({ 
  children, 
  maxWidth = 'lg',
  className = '' 
}: PageContainerProps) => {
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <main className={`min-h-screen p-6 bg-itin-sand-50 ${className}`}>
      <div className={`mx-auto ${maxWidthClasses[maxWidth]}`}>
        {children}
      </div>
    </main>
  );
};

export default PageContainer;
