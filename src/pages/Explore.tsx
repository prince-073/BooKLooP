import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import BookCard from '../components/BookCard';
import SectionHeader from '../components/SectionHeader';
import { Search, Filter, SlidersHorizontal, X, Compass } from 'lucide-react';
import { cn } from '../lib/utils';
import { apiGetBooks } from '../lib/api';

const Explore: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Fiction', 'Non-Fiction', 'Mystery/Thriller', 'Sci-Fi/Fantasy', 'Romance', 'Biography'];

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await apiGetBooks(searchTerm ? { search: searchTerm } : undefined);
        setBooks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    const delay = setTimeout(() => {
      load();
    }, 400); // debounce
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const filteredBooks = books.filter(book => {
    const matchesCategory = selectedCategory === 'All' || book.subject === selectedCategory;
    return matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <SectionHeader
        title="The Grand Archive"
        subtitle="Search through the campus-wide academic library curated by your peers."
      />

      {/* Search and Filters */}
      <div className="sticky top-0 z-30 bg-surface/90 backdrop-blur-xl py-6 flex flex-col gap-5 border-b-2 border-outline-variant/30 mb-8">
        <div className="relative group max-w-3xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by title, author, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-12 py-4 bg-surface-container-lowest rounded-sm border-2 border-outline-variant/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-on-surface font-headline placeholder:font-body"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-surface-container rounded-full transition-colors"
            >
              <X size={16} className="text-on-surface-variant" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
          <div className="flex items-center gap-2 p-2 bg-surface-container-high rounded-sm border border-outline-variant flex-shrink-0 shadow-inner">
            <Filter size={16} className="text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Classifications</span>
          </div>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-6 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 border flex-shrink-0",
                selectedCategory === category
                  ? "bg-primary text-on-primary border-primary shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]"
                  : "bg-surface-container-low text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary"
              )}
            >
              {category}
            </button>
          ))}
          <button className="ml-auto p-2.5 bg-surface-container rounded-sm border border-outline-variant hover:bg-surface-container-high transition-colors flex-shrink-0">
            <SlidersHorizontal size={18} className="text-on-surface-variant" />
          </button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="min-h-[50vh]">
        {loading ? (
          <div className="h-full flex flex-col justify-center items-center py-20 text-on-surface-variant">
             <Compass size={40} className="animate-spin mb-4 opacity-20" />
             <p className="font-headline italic text-lg tracking-wide">Searching the archives...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-10">
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <BookCard book={book} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-24 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-outline-variant">
                  <Search size={40} className="text-on-surface-variant/30" />
                </div>
                <h3 className="text-2xl font-headline font-bold text-on-surface tracking-wide italic">No texts discovered</h3>
                <p className="text-on-surface-variant mt-3 max-w-sm font-body leading-relaxed">
                  The archives haven't yielded any results for "{searchTerm}" in the {selectedCategory} classification.
                </p>
                <button
                  onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                  className="mt-8 px-8 py-3 bg-primary text-on-primary rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
