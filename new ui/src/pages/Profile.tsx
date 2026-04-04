import React from 'react';
import { motion } from 'motion/react';
import { CURRENT_USER, BOOKS } from '../constants';
import BookCard from '../components/BookCard';
import SectionHeader from '../components/SectionHeader';
import { User, MapPin, Mail, Calendar, Settings, Edit3, LogOut, BookOpen, Library, Award } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const ownedBooks = BOOKS.filter(book => CURRENT_USER.booksOwned.includes(book.id));

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Profile Header */}
      <section className="relative">
        {/* Cover Image Placeholder */}
        <div className="h-48 lg:h-64 rounded-3xl bg-primary-container/30 border border-primary/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50" />
        </div>

        {/* Profile Info Card */}
        <div className="relative -mt-24 px-6 lg:px-12 flex flex-col md:flex-row items-end gap-6">
          <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-background shadow-2xl bg-surface">
            <img
              src={CURRENT_USER.avatarUrl}
              alt={CURRENT_USER.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex-1 pb-4">
            <div className="flex flex-wrap items-center gap-4 mb-2">
              <h1 className="font-headline font-bold text-3xl lg:text-4xl text-on-surface">
                {CURRENT_USER.name}
              </h1>
              <div className="px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-xs font-bold flex items-center gap-1">
                <Award size={14} />
                Elite Curator
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant font-medium">
              <div className="flex items-center gap-1">
                <MapPin size={16} className="text-primary" />
                {CURRENT_USER.location}
              </div>
              <div className="flex items-center gap-1">
                <Mail size={16} className="text-secondary" />
                {CURRENT_USER.email}
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={16} className="text-tertiary" />
                Joined Oct 2024
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pb-4">
            <button className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 hover:bg-surface-container-high transition-colors">
              <Settings size={20} className="text-on-surface-variant" />
            </button>
            <button className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              <Edit3 size={18} />
              Edit Profile
            </button>
          </div>
        </div>
      </section>

      {/* Profile Stats & Bio */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <div className="p-6 bg-surface-container rounded-3xl border border-outline-variant/30">
            <h3 className="font-headline font-bold text-xl text-on-surface mb-4">About Me</h3>
            <p className="text-on-surface-variant leading-relaxed italic">
              "A passionate scholar of classical philosophy and modern computer science. I believe that knowledge is meant to be shared, not hoarded. Always looking for rare editions and insightful discussions."
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <Library size={18} className="text-primary" />
                  <span className="text-sm font-medium">Books Curated</span>
                </div>
                <span className="font-bold">{CURRENT_USER.booksOwned.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <BookOpen size={18} className="text-secondary" />
                  <span className="text-sm font-medium">Active Borrows</span>
                </div>
                <span className="font-bold">{CURRENT_USER.booksBorrowed.length}</span>
              </div>
            </div>
          </div>

          <button className="w-full py-4 bg-error-container text-on-error-container rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-error-container/80 transition-all">
            <LogOut size={20} />
            Sign Out
          </button>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <SectionHeader
            title="Personal Collection"
            subtitle="The academic treasures you've shared with the community."
            viewAllTo="/library"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {ownedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
