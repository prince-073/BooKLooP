import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllTo?: string;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, viewAllTo, className }) => {
  return (
    <div className={cn("flex items-end justify-between mb-6", className)}>
      <div className="flex flex-col gap-1">
        <h2 className="font-headline font-bold text-2xl lg:text-3xl text-on-surface">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-on-surface-variant max-w-md">
            {subtitle}
          </p>
        )}
      </div>

      {viewAllTo && (
        <Link
          to={viewAllTo}
          className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
        >
          View All
          <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
