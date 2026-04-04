import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { apiGetSavedBooks } from '../lib/api';
import BookCard from '../components/BookCard';
import SectionHeader from '../components/SectionHeader';
import { BookMarked } from 'lucide-react';

const SavedBooks: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGetSavedBooks();
        setBooks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <SectionHeader 
        title="My Wishlist" 
        subtitle="Books you have saved for later reading."
      />
      
      {loading ? (
        <div className="py-20 text-center font-headline italic">Retrieving wishlist...</div>
      ) : books.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map(book => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <BookCard book={book} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-24 flex flex-col items-center justify-center text-center max-w-md mx-auto border-2 border-dashed border-outline-variant/50 rounded-sm">
          <BookMarked size={48} className="text-on-surface-variant/30 mb-6" strokeWidth={1} />
          <h2 className="text-2xl font-headline font-bold text-on-surface mb-3">Your wishlist is empty</h2>
          <p className="text-on-surface-variant font-body">
            You haven't saved any books yet. Browse the library and click the save button on books you'd like to read later.
          </p>
        </div>
      )}
    </div>
  );
};

export default SavedBooks;
