import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import BookCard from '../components/BookCard';
import SectionHeader from '../components/SectionHeader';
import { Library as LibraryIcon, BookOpen, Clock, CheckCircle2, BookmarkPlus, Compass } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { apiGetUser, apiGetUserRequests } from '../lib/api';
import { getCurrentUser } from '../lib/auth';

const Library: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'owned' | 'borrowed' | 'history'>('owned');
  const [loading, setLoading] = useState(true);
  const [ownedBooks, setOwnedBooks] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  
  const me = getCurrentUser();

  useEffect(() => {
    async function loadData() {
      if (!me) return;
      try {
        const [userData, userReqs] = await Promise.all([
          apiGetUser(me.id),
          apiGetUserRequests()
        ]);
        setOwnedBooks(userData.booksOwned || []);
        setRequests(userReqs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [me]);

  const activeBorrows = requests.filter(r => r.isOutgoing && r.status === 'accepted');
  const history = requests.filter(r => r.status === 'completed' || r.status === 'rejected');

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <SectionHeader
        title="Personal Archives"
        subtitle="Manage your cataloged volumes and track current academic exchanges."
      />

      {/* Library Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-sm bg-surface-container-low border border-outline-variant flex items-center gap-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container border border-outline-variant shadow-inner">
            <LibraryIcon size={28} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-4xl font-headline font-bold text-on-surface">{ownedBooks.length}</p>
            <p className="text-xs text-on-surface-variant uppercase font-bold tracking-widest mt-1">Volumes Curated</p>
          </div>
        </div>
        <div className="p-8 rounded-sm bg-surface-container-low border border-outline-variant flex items-center gap-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container border border-outline-variant shadow-inner">
            <BookOpen size={28} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-4xl font-headline font-bold text-on-surface">{activeBorrows.length}</p>
            <p className="text-xs text-on-surface-variant uppercase font-bold tracking-widest mt-1">Active Holds</p>
          </div>
        </div>
        <div className="p-8 rounded-sm bg-surface-container-low border border-outline-variant flex items-center gap-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant border border-outline-variant shadow-inner">
            <CheckCircle2 size={28} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-4xl font-headline font-bold text-on-surface">{history.length}</p>
            <p className="text-xs text-on-surface-variant uppercase font-bold tracking-widest mt-1">Past Exchanges</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 p-1.5 bg-surface-container-low rounded-sm border border-outline-variant/50 w-fit shadow-inner overflow-x-auto no-scrollbar">
        <TabButton
          active={activeTab === 'owned'}
          onClick={() => setActiveTab('owned')}
          icon={<LibraryIcon size={16} />}
          label="My Collection"
        />
        <TabButton
          active={activeTab === 'borrowed'}
          onClick={() => setActiveTab('borrowed')}
          icon={<BookOpen size={16} />}
          label="Active Holds"
        />
        <TabButton
          active={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
          icon={<Clock size={16} />}
          label="Ledger History"
        />
      </div>

      {/* Tab Content */}
      <div className="min-h-[40vh]">
        {loading ? (
          <div className="h-full flex flex-col justify-center items-center py-16 text-on-surface-variant">
             <Compass size={40} className="animate-spin mb-4 opacity-20" />
             <p className="font-headline italic text-lg tracking-wide">Accessing archives...</p>
          </div>
        ) : (
          <>
            {activeTab === 'owned' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between border-b-2 border-outline-variant/30 pb-4">
                  <h3 className="font-headline font-bold text-2xl text-on-surface">Your Curated Collection</h3>
                  <Link
                    to="/add"
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-primary/90 transition-all shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]"
                  >
                    <BookmarkPlus size={16} />
                    Catalog Volume
                  </Link>
                </div>

                {ownedBooks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-10">
                    {ownedBooks.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<BookmarkPlus size={48} />}
                    title="No volumes cataloged"
                    description="You haven't added any texts to your personal reserve yet."
                    actionText="Catalog First Volume"
                    actionTo="/add"
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'borrowed' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="border-b-2 border-outline-variant/30 pb-4">
                  <h3 className="font-headline font-bold text-2xl text-on-surface">Currently Retained</h3>
                </div>
                {activeBorrows.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-10">
                    {activeBorrows.map((req) => (
                      <div key={req.id} className="relative group flex flex-col bg-surface-container-low rounded-sm overflow-hidden border border-outline-variant/50 hover:border-primary/50 transition-colors">
                        <div className="aspect-[3/4] overflow-hidden">
                           <img src={req.image} alt={req.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-4">
                           <h4 className="font-headline font-bold text-on-surface line-clamp-1">{req.title}</h4>
                           <p className="text-xs text-on-surface-variant italic mt-1">From: {req.user}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<BookOpen size={48} />}
                    title="No active holds"
                    description="You are not currently retaining any volumes from your peers."
                    actionText="Explore Archives"
                    actionTo="/explore"
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="border-b-2 border-outline-variant/30 pb-4">
                  <h3 className="font-headline font-bold text-2xl text-on-surface">Exchange Ledger History</h3>
                </div>
                {history.length > 0 ? (
                 <div className="bg-surface-container-lowest rounded-sm border border-outline-variant shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant">
                      <tr>
                        <th className="px-6 py-4">Title Documented</th>
                        <th className="px-6 py-4">Nature</th>
                        <th className="px-6 py-4">Counterparty</th>
                        <th className="px-6 py-4 text-right">Outcome</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                      {history.map((req) => (
                         <HistoryRow key={req.id} book={req.title} action={req.isOutgoing ? 'Borrowing' : 'Lending'} partner={req.user} status={req.status} />
                      ))}
                    </tbody>
                  </table>
                 </div>
                ) : (
                  <EmptyState
                    icon={<Clock size={48} />}
                    title="Blank Ledger"
                    description="Your historical records of exchanges are currently empty."
                    actionText="Explore Archives"
                    actionTo="/explore"
                  />
                )}
              </motion.div>
            )}
          </>
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
        "flex items-center justify-center gap-2 px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
        active
          ? "bg-surface text-primary shadow-[inset_0_0_0_1px_rgba(92,64,51,0.2)]"
          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-transparent"
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
    <div className="py-24 flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6 text-on-surface-variant/30 border border-outline-variant">
        {icon}
      </div>
      <h3 className="text-2xl font-headline font-bold text-on-surface italic">{title}</h3>
      <p className="text-on-surface-variant mt-3 max-w-sm font-body">
        {description}
      </p>
      <Link
        to={actionTo}
        className="mt-8 px-8 py-3 bg-primary text-on-primary rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-md"
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
  status: string;
}

const HistoryRow: React.FC<HistoryRowProps> = ({ book, action, partner, status }) => {
  return (
    <tr className="hover:bg-surface transition-colors group">
      <td className="px-6 py-5">
        <span className="font-bold font-headline text-lg text-on-surface group-hover:text-primary transition-colors">{book}</span>
      </td>
      <td className="px-6 py-5">
        <span className={cn(
          "px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border",
          action === 'Borrowing' ? "bg-primary-container text-on-primary-container border-primary/20" : "bg-secondary-container text-on-secondary-container border-secondary/20"
        )}>
          {action}
        </span>
      </td>
      <td className="px-6 py-5 text-sm font-body text-on-surface-variant italic">{partner}</td>
      <td className="px-6 py-5 text-right">
        <span className="text-[10px] uppercase tracking-widest font-bold text-tertiary">{status}</span>
      </td>
    </tr>
  );
};

export default Library;
