import React from 'react';
import { Link } from 'react-router-dom';
import { Book as BookType } from '../types';
import { cn } from '../lib/utils';
import { MapPin, User } from 'lucide-react';

interface BookCardProps {
  book: BookType;
  className?: string;
}

const BookCard: React.FC<BookCardProps> = ({ book, className }) => {
  return (
    <Link
      to={`/book/${book.id}`}
      className={cn(
        "group relative flex flex-col bg-surface-container-low rounded-3xl overflow-hidden transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-1 border border-outline-variant/30",
        className
      )}
    >
      {/* Book Cover Container */}
      <div className="aspect-[3/4] overflow-hidden relative">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Availability Badge */}
        <div className={cn(
          "absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md",
          book.status === 'available' ? "bg-tertiary-container text-on-tertiary-container" : "bg-error-container text-on-error-container"
        )}>
          {book.status === 'available' ? 'Available' : 'Borrowed'}
        </div>
      </div>

      {/* Book Info */}
      <div className="p-4 flex flex-col gap-1">
        <h3 className="font-headline font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-on-surface-variant line-clamp-1 italic">
          {book.author}
        </p>

        <div className="mt-3 flex items-center justify-between text-xs text-on-surface-variant">
          <div className="flex items-center gap-1">
            <User size={14} className="text-primary" />
            <span>{book.ownerName}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={14} className="text-secondary" />
            <span>{book.location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
