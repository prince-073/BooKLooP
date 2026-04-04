import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BOOKS, CURRENT_USER } from '../constants';
import BookCard from '../components/BookCard';
import SectionHeader from '../components/SectionHeader';
import { Library as LibraryIcon, BookOpen, Clock, CheckCircle2, PlusCircle, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const Library: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'owned' | 'borrowed' | 'history'>('owned');

  const ownedBooks = BOOKS.filter(book => CURRENT_USER.booksOwned.includes(book.id));
  const borrowedBooks = BOOKS.filter(book => CURRENT_USER.booksBorrowed.includes(book.id));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader
        title="Your Library"
        subtitle="Manage your personal collection and track your active borrows."
      />

      {/* Library Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-primary-container/20 border border-primary/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <LibraryIcon size={24} />
          </div>
          <div>
            <p className="text-2xl font-headline font-bold text-on-surface">{ownedBooks.length}</p>
            <p className="text-sm text-on-surface-variant font-medium">Books Curated</p>
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-secondary-container/20 border border-secondary/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-2xl font-headline font-bold text-on-surface">{borrowedBooks.length}</p>
            <p className="text-sm text-on-surface-variant font-medium">Active Borrows</p>
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-tertiary-container/20 border border-tertiary/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-2xl font-headline font-bold text-on-surface">12</p>
            <p className="text-sm text-on-surface-variant font-medium">Total Exchanges</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-surface-container rounded-2xl border border-outline-variant/30 w-fit">
        <TabButton
          active={activeTab === 'owned'}
          onClick={() => setActiveTab('owned')}
          icon={<LibraryIcon size={18} />}
          label="My Collection"
        />
        <TabButton
          active={activeTab === 'borrowed'}
          onClick={() => setActiveTab('borrowed')}
          icon={<BookOpen size={18} />}
          label="Borrowed"
        />
        <TabButton
          active={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
          icon={<Clock size={18} />}
          label="History"
        />
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'owned' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-xl text-on-surface">Your Curated Collection</h3>
              <Link
                to="/add"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                <PlusCircle size={18} />
                Add New Book
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {ownedBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'borrowed' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h3 className="font-headline font-bold text-xl text-on-surface">Currently Borrowed</h3>
            {borrowedBooks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {borrowedBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<BookOpen size={48} />}
                title="No active borrows"
                description="You haven't borrowed any books from your peers yet."
                actionText="Explore Collection"
                actionTo="/explore"
              />
            )}
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h3 className="font-headline font-bold text-xl text-on-surface">Exchange History</h3>
            <div className="bg-surface-container rounded-3xl border border-outline-variant/30 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-surface-container-high text-xs font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/30">
                  <tr>
                    <th className="px-6 py-4">Book</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Partner</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  <HistoryRow
                    book="The Republic"
                    action="Borrowed"
                    partner="Marcus Aurelius"
                    date="Oct 12, 2025"
                    status="Returned"
                  />
                  <HistoryRow
                    book="Clean Code"
                    action="Lent"
                    partner="Ada Lovelace"
                    date="Sep 28, 2025"
                    status="Completed"
                  />
                  <HistoryRow
                    book="Sapiens"
                    action="Borrowed"
                    partner="Yuval Harari"
                    date="Sep 15, 2025"
                    status="Returned"
                  />
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
        active
          ? "bg-surface text-primary shadow-sm ring-1 ring-outline-variant/30"
          : "text-on-surface-variant hover:text-on-surface hover:bg-surface/50"
      )}
    >
      {icon}
      {label}
    </button>
  );
};

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText: string;
  actionTo: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, actionText, actionTo }) => {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-surface-container rounded-3xl flex items-center justify-center mb-6 text-on-surface-variant/30">
        {icon}
      </div>
      <h3 className="text-xl font-headline font-bold text-on-surface">{title}</h3>
      <p className="text-on-surface-variant mt-2 max-w-xs mb-8">
        {description}
      </p>
      <Link
        to={actionTo}
        className="px-8 py-3 bg-primary text-on-primary rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
      >
        {actionText}
      </Link>
    </div>
  );
};

interface HistoryRowProps {
  book: string;
  action: string;
  partner: string;
  date: string;
  status: string;
}

const HistoryRow: React.FC<HistoryRowProps> = ({ book, action, partner, date, status }) => {
  return (
    <tr className="hover:bg-surface-container-low transition-colors group">
      <td className="px-6 py-4">
        <span className="font-bold text-on-surface group-hover:text-primary transition-colors">{book}</span>
      </td>
      <td className="px-6 py-4">
        <span className={cn(
          "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
          action === 'Borrowed' ? "bg-primary-container text-on-primary-container" : "bg-secondary-container text-on-secondary-container"
        )}>
          {action}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-on-surface-variant">{partner}</td>
      <td className="px-6 py-4 text-sm text-on-surface-variant">{date}</td>
      <td className="px-6 py-4 text-right">
        <span className="text-sm font-medium text-tertiary">{status}</span>
      </td>
    </tr>
  );
};

export default Library;
