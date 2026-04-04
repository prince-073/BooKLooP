import React, { useEffect, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { type Book } from '../data/mock';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { apiGetBooks } from '../lib/api';
import { fallbackBookCover, getBookCoverUrl } from '../lib/media';

export function BrowseBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [availability, setAvailability] = useState<'available' | 'borrowed' | ''>('');

  async function loadBooks() {
    let cancelled = false;
    try {
      setLoading(true);
      setError(null);
      const data = await apiGetBooks({
        search: search.trim() || undefined,
        subject: subject.trim() || undefined,
        availability: availability || undefined,
      });
      if (!cancelled) setBooks(data as Book[]);
    } catch (e) {
      if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load books');
    } finally {
      if (!cancelled) setLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }

  useEffect(() => {
    const cleanupPromise = loadBooks();
    return () => {
      cleanupPromise.then((cleanup) => cleanup && cleanup()).catch(() => undefined);
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      <section className="px-4 sm:px-8 py-4 sm:py-6 sticky top-0 bg-surface/80 backdrop-blur-md z-30 border-b border-primary/10">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books..."
              className="bg-surface-container-high text-on-surface rounded-xl text-xs font-medium border border-primary/15 py-2 pl-9 pr-3"
            />
          </div>
          <div className="h-6 w-px bg-primary/10 mx-2"></div>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="bg-surface-container border border-primary/10 text-on-surface-variant rounded-xl text-xs font-medium px-3 py-2"
          />
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value as 'available' | 'borrowed' | '')}
            className="bg-surface-container border border-primary/10 text-on-surface-variant rounded-xl text-xs font-medium px-3 py-2"
          >
            <option value="">All</option>
            <option value="available">Available</option>
            <option value="borrowed">Borrowed</option>
          </select>
          <button
            onClick={loadBooks}
            className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-medium"
          >
            Apply
          </button>
          <button
            onClick={() => {
              setSearch('');
              setSubject('');
              setAvailability('');
              setTimeout(() => loadBooks(), 0);
            }}
            className="ml-auto text-[10px] font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest"
          >
            Clear all filters
          </button>
        </div>
      </section>

      <div className="px-4 sm:px-8 py-8 md:py-12">
        {loading ? (
          <div className="text-on-surface-variant">Loading books...</div>
        ) : error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>

      <Link to="/add" className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-primary text-on-primary px-6 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group">
        <Plus className="w-5 h-5" />
        <span className="text-sm font-bold tracking-tight">List a Book</span>
      </Link>
    </div>
  );
}

function BookCard({ book }: { book: any, key?: string }) {
  return (
    <Link to={`/book/${book.id}`} className="group bg-surface-container-low rounded-2xl p-4 flex flex-col gap-4 hover:bg-surface-container hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-primary/10">
      <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-surface-container-lowest relative">
        <img
          src={getBookCoverUrl(book.cover, book.title)}
          onError={(e) => {
            e.currentTarget.src = fallbackBookCover(book.title);
          }}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          <span className={cn(
            "px-3 py-1 backdrop-blur-md border text-[9px] font-bold uppercase tracking-widest rounded-full",
            book.status === 'available' ? "bg-primary/10 border-primary/25 text-on-surface" : "bg-black/20 border-primary/10 text-on-surface-variant/60"
          )}>
            {book.status}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-on-surface font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">{book.title}</h3>
        <p className="text-on-surface-variant text-xs">{book.author}</p>
      </div>
      <div className="mt-auto flex items-center justify-between pt-2 border-t border-primary/10">
        <div className="flex items-center gap-2">
          <img src={book.owner.avatar} alt={book.owner.name} className="w-6 h-6 rounded-full border border-primary/15" />
          <span className="text-[10px] font-medium text-on-surface-variant">{book.owner.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("w-1.5 h-1.5 rounded-full", book.status === 'available' ? "bg-emerald-500" : "bg-red-500")}></span>
          <span className={cn("text-[9px] font-bold uppercase tracking-wider", book.status === 'available' ? "text-emerald-500" : "text-red-500")}>
            {book.status === 'available' ? 'Available' : 'Not Available'}
          </span>
        </div>
      </div>
    </Link>
  );
}
