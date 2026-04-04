import React from 'react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { MapPin, User, Trash2 } from 'lucide-react';

interface BookCardProps {
  book: any;
  className?: string;
  onDelete?: (e: React.MouseEvent) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, className, onDelete }) => {
  return (
    <Link
      to={`/book/${book.id}`}
      className={cn(
        "group relative flex flex-col bg-white/70 dark:bg-surface-container/40 backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-1 border border-white/60 dark:border-white/10 hover:border-primary/40 dark:hover:border-primary/40",
        className
      )}
    >
      <div className="aspect-[3/4] overflow-hidden relative border-b border-on-surface/5">
        <img
          src={book.cover || book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className={cn(
          "absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold shadow-md border backdrop-blur-md",
          book.status === 'available' ? "bg-primary-container/80 text-on-primary-container border-primary/20 dark:bg-primary-container/60" : "bg-error-container/80 text-on-error-container border-error/20 dark:bg-error-container/60"
        )}>
          {book.status === 'available' ? 'Available' : 'Borrowed'}
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete(e);
            }}
            className="absolute top-3 left-3 p-2 bg-error/90 text-white rounded-full shadow-[0_4px_12px_rgba(220,38,38,0.4)] border border-error/20 hover:bg-error transition-colors z-20"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="p-5 flex flex-col gap-2">
        <h3 className="font-headline font-bold text-lg text-on-surface line-clamp-1 group-hover:text-primary transition-colors leading-tight">
          {book.title}
        </h3>
        <p className="text-sm font-body text-on-surface-variant line-clamp-1 italic font-medium">
          {book.author}
        </p>

        <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-on-surface/5">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">
            <User size={14} className="text-secondary" />
            <span className="font-body italic">{book.ownerName || (book.owner && book.owner.name) || 'Unknown Owner'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant hidden">
            <MapPin size={14} className="text-tertiary" />
            <span className="font-body uppercase tracking-wider text-[10px]">{book.location || 'Unknown'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
