import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  showAccentBar?: boolean;
}


const PageHeader = ({ 
  title, 
  subtitle,
  action,
  showAccentBar = true 
}: PageHeaderProps) => {
  return (
    <header className="mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="itin-header">{title}</h1>
          {showAccentBar && <div className="accent-bar mt-2" />}
          {subtitle && (
            <p className="text-itin-sand-600 mt-3 text-lg">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="ml-4">{action}</div>}
      </div>
    </header>
  );
};

export default PageHeader;
