import React from 'react';
import { motion } from 'motion/react';
import { BOOKS, ACTIVITIES, CURRENT_USER } from '../constants';
import BookCard from '../components/BookCard';
import SectionHeader from '../components/SectionHeader';
import { Search, BookOpen, Users, ArrowRight, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const Home: React.FC = () => {
  const featuredBooks = BOOKS.slice(0, 4);
  const recentActivities = ACTIVITIES.slice(0, 3);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-primary-container p-8 lg:p-12 shadow-2xl shadow-primary/10">
        <div className="relative z-10 max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-headline font-bold text-4xl lg:text-6xl text-on-primary-container leading-tight"
          >
            Curate Your Campus <br />
            <span className="text-primary italic">Library Collection</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-lg text-on-primary-container/80 max-w-lg"
          >
            The Curator is a scholarly exchange platform for students to share, borrow, and curate their academic resources.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              to="/explore"
              className="px-8 py-4 bg-primary text-on-primary rounded-2xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Explore Collection
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/add"
              className="px-8 py-4 bg-surface text-on-surface rounded-2xl font-bold border border-outline-variant hover:bg-surface-container-low transition-all"
            >
              Curate a Book
            </Link>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
          <BookOpen size={400} className="text-primary absolute -top-20 -right-20 rotate-12" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<BookOpen className="text-primary" />}
          value="1,240+"
          label="Books Curated"
          color="bg-primary-container/30"
        />
        <StatCard
          icon={<Users className="text-secondary" />}
          value="850+"
          label="Active Scholars"
          color="bg-secondary-container/30"
        />
        <StatCard
          icon={<MessageSquare className="text-tertiary" />}
          value="420+"
          label="Exchanges Today"
          color="bg-tertiary-container/30"
        />
      </section>

      {/* Featured Books */}
      <section>
        <SectionHeader
          title="Featured Collection"
          subtitle="Hand-picked academic treasures from your campus peers."
          viewAllTo="/explore"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featuredBooks.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <BookCard book={book} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <SectionHeader
            title="Recent Activity"
            subtitle="Stay updated with the latest exchanges in your network."
          />
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-surface-container rounded-2xl border border-outline-variant/30"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={activity.userAvatar}
                    alt={activity.userName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-on-surface">
                    <span className="font-bold">{activity.userName}</span>
                    {' '}
                    <span className="text-on-surface-variant">
                      {activity.type === 'borrow' ? 'requested to borrow' :
                       activity.type === 'return' ? 'returned' :
                       activity.type === 'add' ? 'curated a new book:' : 'curated'}
                    </span>
                    {' '}
                    <span className="font-bold text-primary">{activity.bookTitle}</span>
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">{activity.timestamp}</p>
                </div>
                <div className="hidden sm:block">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    activity.type === 'borrow' ? "bg-primary-container text-on-primary-container" :
                    activity.type === 'return' ? "bg-tertiary-container text-on-tertiary-container" :
                    "bg-secondary-container text-on-secondary-container"
                  )}>
                    {activity.type}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Profile / Welcome */}
        <div className="bg-surface-container-highest rounded-3xl p-6 border border-outline-variant/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/20">
              <img
                src={CURRENT_USER.avatarUrl}
                alt={CURRENT_USER.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="font-headline font-bold text-xl text-on-surface">Welcome back,</h3>
              <p className="text-primary font-bold">{CURRENT_USER.name}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-surface rounded-2xl border border-outline-variant/30">
              <p className="text-xs text-on-surface-variant uppercase font-bold tracking-widest mb-1">Your Library</p>
              <div className="flex justify-between items-end">
                <span className="text-2xl font-headline font-bold text-on-surface">{CURRENT_USER.booksOwned.length}</span>
                <Link to="/library" className="text-xs text-primary font-bold hover:underline">Manage</Link>
              </div>
            </div>
            <div className="p-4 bg-surface rounded-2xl border border-outline-variant/30">
              <p className="text-xs text-on-surface-variant uppercase font-bold tracking-widest mb-1">Active Borrows</p>
              <div className="flex justify-between items-end">
                <span className="text-2xl font-headline font-bold text-on-surface">{CURRENT_USER.booksBorrowed.length}</span>
                <Link to="/library" className="text-xs text-primary font-bold hover:underline">View All</Link>
              </div>
            </div>
          </div>

          <Link
            to="/profile"
            className="mt-8 w-full py-3 bg-primary text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all"
          >
            View Full Profile
          </Link>
        </div>
      </section>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color }) => {
  return (
    <div className={cn("p-6 rounded-3xl flex items-center gap-4 border border-outline-variant/30", color)}>
      <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-headline font-bold text-on-surface">{value}</p>
        <p className="text-sm text-on-surface-variant font-medium">{label}</p>
      </div>
    </div>
  );
};

export default Home;
