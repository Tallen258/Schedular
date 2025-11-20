import React from 'react';

interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}


const Grid = ({ 
  children, 
  cols = 2,
  gap = 'md',
  className = '' 
}: GridProps) => {
  const colClasses = {
    1: '[&>*]:basis-full',
    2: '[&>*]:basis-full md:[&>*]:basis-[calc(50%-0.5rem)]',
    3: '[&>*]:basis-full md:[&>*]:basis-[calc(50%-0.5rem)] lg:[&>*]:basis-[calc(33.333%-0.667rem)]',
    4: '[&>*]:basis-full md:[&>*]:basis-[calc(50%-0.5rem)] lg:[&>*]:basis-[calc(25%-0.75rem)]',
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div className={`flex flex-wrap ${colClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

export default Grid;
