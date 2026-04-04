import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BOOKS, CURRENT_USER } from '../constants';
import { ArrowLeft, MapPin, User, Calendar, BookOpen, MessageSquare, Share2, Heart, ShieldCheck, Info } from 'lucide-react';
import { cn } from '../lib/utils';

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  const book = BOOKS.find(b => b.id === id);

  if (!book) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-headline font-bold text-on-surface">Book not found</h2>
        <p className="text-on-surface-variant mt-2">The book you're looking for doesn't exist or has been removed.</p>
        <Link to="/explore" className="mt-6 px-8 py-3 bg-primary text-on-primary rounded-2xl font-bold">
          Back to Collection
        </Link>
      </div>
    );
  }

  const isOwner = CURRENT_USER.booksOwned.includes(book.id);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Collection
      </button>

      {/* Book Main Info */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Book Cover */}
        <div className="lg:col-span-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-outline-variant/30"
          >
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className={cn(
              "absolute top-4 right-4 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md",
              book.status === 'available' ? "bg-tertiary-container text-on-tertiary-container" : "bg-error-container text-on-error-container"
            )}>
              {book.status === 'available' ? 'Available' : 'Borrowed'}
            </div>
          </motion.div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={cn(
                "flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all",
                isLiked ? "bg-error-container text-on-error-container" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              )}
            >
              <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
              {isLiked ? 'Saved to Wishlist' : 'Save to Wishlist'}
            </button>
            <button className="p-3 bg-surface-container rounded-2xl text-on-surface-variant hover:bg-surface-container-high transition-colors">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Book Details */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                {book.category}
              </span>
              <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
                <Calendar size={14} />
                Curated Oct 2025
              </span>
            </div>
            <h1 className="font-headline font-bold text-4xl lg:text-5xl text-on-surface mb-2">
              {book.title}
            </h1>
            <p className="text-xl text-on-surface-variant italic font-medium">
              by {book.author}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <InfoBox icon={<User size={18} />} label="Owner" value={book.ownerName} />
            <InfoBox icon={<MapPin size={18} />} label="Location" value={book.location} />
            <InfoBox icon={<BookOpen size={18} />} label="Condition" value="Like New" />
            <InfoBox icon={<ShieldCheck size={18} />} label="Security" value="Verified" />
          </div>

          <div className="prose prose-stone max-w-none mb-10">
            <h3 className="font-headline font-bold text-xl text-on-surface mb-4">Curator's Note</h3>
            <p className="text-on-surface-variant leading-relaxed italic">
              "This is a rare first-edition academic copy. It contains extensive marginalia that I've added during my research on {book.category}. I'm happy to share it with fellow scholars who will appreciate the depth of this work. Please handle with care as it's a significant part of my personal library."
            </p>
          </div>

          <div className="mt-auto p-6 bg-surface-container rounded-3xl border border-outline-variant/30">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1">
                <h4 className="font-headline font-bold text-lg text-on-surface mb-1">Ready to borrow?</h4>
                <p className="text-sm text-on-surface-variant">
                  Send a request to {book.ownerName} to start the exchange process.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none px-8 py-4 bg-primary text-on-primary rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                  Request to Borrow
                </button>
                <button className="p-4 bg-surface text-on-surface rounded-2xl font-bold border border-outline-variant/30 hover:bg-surface-container-high transition-all">
                  <MessageSquare size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Books */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-headline font-bold text-2xl text-on-surface">More in {book.category}</h2>
          <Link to="/explore" className="text-sm font-bold text-primary hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {BOOKS.filter(b => b.category === book.category && b.id !== book.id).slice(0, 4).map(b => (
            <div key={b.id} className="opacity-80 hover:opacity-100 transition-opacity">
              <Link to={`/book/${b.id}`}>
                <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-3 border border-outline-variant/30">
                  <img src={b.coverUrl} alt={b.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <h4 className="font-bold text-sm text-on-surface line-clamp-1">{b.title}</h4>
                <p className="text-xs text-on-surface-variant italic">{b.author}</p>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

interface InfoBoxProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({ icon, label, value }) => {
  return (
    <div className="p-4 bg-surface rounded-2xl border border-outline-variant/20 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</span>
      </div>
      <span className="font-bold text-sm text-on-surface truncate">{value}</span>
    </div>
  );
};

export default BookDetails;
