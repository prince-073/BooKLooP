import React, { useEffect, useState, useRef } from 'react';
import { Search, Plus, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { apiGetBooks } from '../lib/api';
import { fallbackBookCover, getBookCoverUrl } from '../lib/media';

const BOOK_TYPES = [
  '', 'Novel', 'Fiction', 'Non-Fiction', 'Story Book', 'Short Story Collection',
  'Novella', 'Poetry Book', 'Drama / Play', 'Academic / Textbook', 'Reference Book',
  'Self-Help Book', 'Biography', 'Autobiography', 'Memoir', 'Comic Book',
  'Graphic Novel', 'Manga', 'Magazine', 'Workbook / Practice Book'
];

export function BrowseBooks() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [availability, setAvailability] = useState<'available' | 'borrowed' | ''>('');
  const [bookType, setBookType] = useState('');

  // Applied filter (used for actual API call)
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    subject: '',
    availability: '' as 'available' | 'borrowed' | '',
    bookType: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  async function loadBooks(filters: typeof appliedFilters) {
    try {
      setLoading(true);
      setError(null);
      const data = await apiGetBooks({
        search: filters.search.trim() || undefined,
        subject: filters.subject.trim() || undefined,
        availability: filters.availability || undefined,
        condition: filters.bookType || undefined,
      });
      setBooks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load books');
    } finally {
      setLoading(false);
    }
  }

  // Load on mount with empty filters
  useEffect(() => {
    loadBooks(appliedFilters);
  }, []);

  // Load whenever applied filters change
  useEffect(() => {
    loadBooks(appliedFilters);
  }, [appliedFilters]);

  function handleApply() {
    const newFilters = { search, subject, availability, bookType };
    setAppliedFilters(newFilters);
    setShowFilters(false);
  }

  function handleClear() {
    setSearch('');
    setSubject('');
    setAvailability('');
    setBookType('');
    const cleared = { search: '', subject: '', availability: '' as const, bookType: '' };
    setAppliedFilters(cleared);
    setShowFilters(false);
  }

  const hasActiveFilters = appliedFilters.search || appliedFilters.subject || appliedFilters.availability || appliedFilters.bookType;

  return (
    <div className="min-h-screen bg-surface">
      {/* Sticky Filter Bar */}
      <section className="px-4 sm:px-8 py-3 sticky top-0 bg-surface/95 backdrop-blur-md z-30 border-b border-primary/10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleApply(); }}
              placeholder="Search by title, author..."
              className="w-full bg-surface-container-high text-on-surface rounded-xl text-xs font-medium border border-primary/15 py-2.5 pl-9 pr-3 focus:outline-none focus:border-primary/40 transition-colors"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all",
              showFilters || hasActiveFilters
                ? "bg-primary text-on-primary border-primary"
                : "bg-surface-container border-primary/15 text-on-surface-variant hover:border-primary/30"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-4 h-4 bg-on-primary text-primary rounded-full text-[9px] flex items-center justify-center font-black">
                ●
              </span>
            )}
          </button>

          {/* Apply */}
          <button
            onClick={handleApply}
            className="px-5 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-sm"
          >
            Search
          </button>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="max-w-7xl mx-auto mt-3 p-4 bg-surface-container rounded-2xl border border-primary/10 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Availability */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant">Availability</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as any)}
                className="w-full bg-surface border border-primary/15 text-on-surface rounded-lg text-xs font-medium px-3 py-2 focus:outline-none focus:border-primary/40 appearance-none"
              >
                <option value="">All</option>
                <option value="available">Available</option>
                <option value="borrowed">Borrowed</option>
              </select>
            </div>

            {/* Book Type */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant">Book Type</label>
              <select
                value={bookType}
                onChange={(e) => setBookType(e.target.value)}
                className="w-full bg-surface border border-primary/15 text-on-surface rounded-lg text-xs font-medium px-3 py-2 focus:outline-none focus:border-primary/40 appearance-none"
              >
                {BOOK_TYPES.map(t => (
                  <option key={t} value={t}>{t || 'All Types'}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="space-y-1.5 col-span-2 sm:col-span-2">
              <label className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant">Subject / Genre</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Physics, Romance, History..."
                className="w-full bg-surface border border-primary/15 text-on-surface rounded-lg text-xs font-medium px-3 py-2 focus:outline-none focus:border-primary/40"
              />
            </div>

            {/* Quick Type Chips */}
            <div className="col-span-2 sm:col-span-4">
              <label className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 block">Quick Filters</label>
              <div className="flex flex-wrap gap-2">
                {['Novel', 'Story Book', 'Fiction', 'Non-Fiction', 'Academic / Textbook', 'Biography', 'Self-Help Book'].map(t => (
                  <button
                    key={t}
                    onClick={() => setBookType(prev => prev === t ? '' : t)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold border transition-all",
                      bookType === t
                        ? "bg-primary text-on-primary border-primary"
                        : "bg-surface border-primary/20 text-on-surface-variant hover:border-primary/40"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-2 sm:col-span-4 flex gap-3 pt-1">
              <button
                onClick={handleApply}
                className="flex-1 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all"
              >
                Apply Filters
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2.5 bg-surface border border-primary/15 text-on-surface-variant rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-surface-container transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Active filter pills */}
        {hasActiveFilters && !showFilters && (
          <div className="max-w-7xl mx-auto mt-2 flex flex-wrap gap-2">
            {appliedFilters.search && (
              <span className="px-3 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-[10px] font-bold flex items-center gap-1">
                "{appliedFilters.search}"
                <button onClick={() => { setSearch(''); setAppliedFilters(f => ({ ...f, search: '' })); }}><X className="w-3 h-3" /></button>
              </span>
            )}
            {appliedFilters.availability && (
              <span className="px-3 py-0.5 bg-secondary/10 border border-secondary/20 text-secondary rounded-full text-[10px] font-bold flex items-center gap-1 capitalize">
                {appliedFilters.availability}
                <button onClick={() => { setAvailability(''); setAppliedFilters(f => ({ ...f, availability: '' })); }}><X className="w-3 h-3" /></button>
              </span>
            )}
            {appliedFilters.bookType && (
              <span className="px-3 py-0.5 bg-tertiary/10 border border-tertiary/20 text-tertiary rounded-full text-[10px] font-bold flex items-center gap-1">
                {appliedFilters.bookType}
                <button onClick={() => { setBookType(''); setAppliedFilters(f => ({ ...f, bookType: '' })); }}><X className="w-3 h-3" /></button>
              </span>
            )}
            {appliedFilters.subject && (
              <span className="px-3 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-[10px] font-bold flex items-center gap-1">
                {appliedFilters.subject}
                <button onClick={() => { setSubject(''); setAppliedFilters(f => ({ ...f, subject: '' })); }}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}
      </section>

      <div className="px-4 sm:px-8 py-8 md:py-12 max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-surface-container animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-error-container border border-error/20 rounded-2xl text-error text-sm font-body">
            {error}
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-6 border border-outline-variant">
              <Search className="w-8 h-8 text-on-surface-variant/30" />
            </div>
            <h3 className="text-2xl font-headline font-bold text-on-surface mb-3 italic">No books found</h3>
            <p className="text-on-surface-variant text-sm mb-6 max-w-sm">Try adjusting your filters or search terms.</p>
            <button onClick={handleClear} className="px-6 py-3 bg-primary text-on-primary rounded-xl text-xs font-bold uppercase tracking-widest">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-6">
              {books.length} book{books.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </>
        )}
      </div>

      <Link
        to="/add"
        className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-primary text-on-primary px-6 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group"
      >
        <Plus className="w-5 h-5" />
        <span className="text-sm font-bold tracking-tight">List a Book</span>
      </Link>
    </div>
  );
}

function BookCard({ book }: { book: any }) {
  return (
    <Link
      to={`/book/${book.id}`}
      className="group bg-surface-container-low rounded-2xl p-3 flex flex-col gap-3 hover:bg-surface-container hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-primary/10"
    >
      <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-surface-container-lowest relative">
        <img
          src={getBookCoverUrl(book.cover, book.title)}
          onError={(e) => { e.currentTarget.src = fallbackBookCover(book.title); }}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-2 left-2">
          <span className={cn(
            "px-2 py-0.5 backdrop-blur-md border text-[8px] font-bold uppercase tracking-widest rounded-full",
            book.status === 'available'
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-700"
              : "bg-black/20 border-white/10 text-white/60"
          )}>
            {book.status === 'available' ? 'Available' : 'Borrowed'}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        <h3 className="text-on-surface font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">{book.title}</h3>
        <p className="text-on-surface-variant text-xs line-clamp-1">{book.author}</p>
      </div>
      <div className="mt-auto flex items-center gap-2 pt-2 border-t border-primary/10">
        <img
          src={book.owner?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${book.owner?.name}`}
          alt={book.owner?.name}
          className="w-5 h-5 rounded-full border border-primary/15"
        />
        <span className="text-[10px] font-medium text-on-surface-variant truncate">{book.owner?.name}</span>
      </div>
    </Link>
  );
}
