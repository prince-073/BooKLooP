import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BOOKS } from '../constants';
import BookCard from '../components/BookCard';
import SectionHeader from '../components/SectionHeader';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '../lib/utils';

const Explore: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Computer Science', 'History', 'Philosophy', 'Literature', 'Physics', 'Mathematics'];

  const filteredBooks = BOOKS.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader
        title="Explore Collection"
        subtitle="Search through the campus-wide academic library curated by your peers."
      />

      {/* Search and Filters */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl py-4 flex flex-col gap-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by title, author, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-surface-container rounded-2xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-on-surface"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-container-high rounded-full transition-colors"
            >
              <X size={16} className="text-on-surface-variant" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
          <div className="flex items-center gap-2 p-2 bg-surface-container-high rounded-xl border border-outline-variant/30 flex-shrink-0">
            <Filter size={18} className="text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Categories</span>
          </div>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border",
                selectedCategory === category
                  ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20"
                  : "bg-surface text-on-surface border-outline-variant/30 hover:bg-surface-container-low"
              )}
            >
              {category}
            </button>
          ))}
          <button className="ml-auto p-2 bg-surface-container rounded-xl border border-outline-variant/30 hover:bg-surface-container-high transition-colors flex-shrink-0">
            <SlidersHorizontal size={20} className="text-on-surface-variant" />
          </button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <BookCard book={book} />
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-surface-container rounded-3xl flex items-center justify-center mb-4">
              <Search size={40} className="text-on-surface-variant/30" />
            </div>
            <h3 className="text-xl font-headline font-bold text-on-surface">No books found</h3>
            <p className="text-on-surface-variant mt-2 max-w-xs">
              We couldn't find any books matching "{searchTerm}" in the {selectedCategory} category.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="mt-6 px-6 py-2 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary/20 transition-all"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
