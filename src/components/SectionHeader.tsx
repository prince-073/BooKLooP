import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Feather } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllTo?: string;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, viewAllTo, className }) => {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b-2 border-outline-variant/30 pb-4", className)}>
      <div className="flex flex-col gap-2">
        <h2 className="font-headline font-bold text-3xl lg:text-4xl text-on-surface italic tracking-wide">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-on-surface-variant font-body uppercase tracking-widest font-bold">
            {subtitle}
          </p>
        )}
      </div>

      {viewAllTo && (
        <Link
          to={viewAllTo}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-primary border border-primary px-4 py-2 rounded-sm hover:bg-primary hover:text-on-primary transition-all self-start md:self-auto"
        >
          View All
          <Feather size={14} />
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
