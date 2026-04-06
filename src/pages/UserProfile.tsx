import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiGetUser, apiGetBooks, apiRecordVisit } from '../lib/api';
import { getAvatarUrl } from '../lib/media';
import BookCard from '../components/BookCard';
import SectionHeader from '../components/SectionHeader';
import { MapPin, Mail, Library, Award, Compass, Search, GraduationCap } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      setError(null);
      Promise.all([
         apiGetUser(id),
         apiGetBooks({ ownerId: id })
      ]).then(([u, b]) => {
         setUser(u);
         setBooks(b);
         setLoading(false);
         apiRecordVisit(id);
      }).catch((e) => {
         console.error('UserProfile fetch error:', e);
         setError(e?.message || 'Failed to load profile');
         setLoading(false);
      });
    }
  }, [id]);

  if (loading) return (
     <div className="min-h-[50vh] flex flex-col justify-center items-center py-20 text-on-surface-variant">
        <Compass size={40} className="animate-spin mb-4 opacity-20" />
        <p className="font-headline italic text-lg tracking-wide">Retrieving profile...</p>
     </div>
  );

  if (error || !user) return (
     <div className="py-24 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <h2 className="text-3xl font-headline font-bold text-on-surface mb-4 italic">
          {error ? 'Could Not Load Profile' : 'User Not Found'}
        </h2>
        <p className="text-on-surface-variant font-body leading-relaxed mb-8">
          {error || 'This profile could not be located in our records.'}
        </p>
        <Link to="/activity" className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold uppercase tracking-widest text-xs shadow-md hover:shadow-lg transition-shadow">
          Back to Activity
        </Link>
     </div>
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Hero Section with Glassmorphic Card */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-12 md:pt-24 pb-12 mb-8">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container via-surface-container to-secondary-container opacity-80 overflow-hidden pointer-events-none rounded-b-[3rem]">
           <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-fixed opacity-40 blur-3xl rounded-full mix-blend-multiply animate-pulse" />
           <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary-fixed opacity-40 blur-3xl rounded-full mix-blend-multiply animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Floating Glassmorphic Profile Card */}
        <div className="relative z-10 max-w-5xl mx-auto rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] p-6 sm:p-10 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
            
            {/* Avatar Section */}
            <div className="relative group shrink-0">
               <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-primary to-secondary blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
               <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white p-1">
                 <img
                   src={getAvatarUrl(user)}
                   alt={user.name}
                   className="w-full h-full object-cover rounded-full"
                   referrerPolicy="no-referrer"
                 />
               </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 flex flex-col justify-center text-center md:text-left h-full w-full">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                <h1 className="font-headline font-extrabold text-4xl lg:text-5xl text-on-surface tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-on-surface to-on-surface-variant">
                   {user.name}
                </h1>
                <div className="px-3 py-1 bg-secondary-container/80 backdrop-blur-md border border-secondary/20 text-on-secondary-container rounded-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                  <Award size={14} />
                  Verified Member
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 text-sm text-on-surface-variant font-body mb-8">
                {user.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-primary-fixed-dim" />
                    <span className="font-medium">{user.email}</span>
                  </div>
                )}
                {user.phoneVisible && user.phone && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-secondary-fixed-dim" />
                    <span className="font-medium tracking-wide">{user.phone}</span>
                  </div>
                )}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 md:pt-8 border-t border-on-surface/5">
                <div className="flex flex-col items-center md:items-start p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm hover:shadow-md hover:bg-white/60 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <Library size={18} />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Volumes Shared</span>
                  </div>
                  <span className="font-headline text-3xl font-bold text-on-surface">{books.length}</span>
                </div>

                <div className="flex flex-col items-center md:items-start p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm hover:shadow-md hover:bg-white/60 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2 text-secondary">
                    <MapPin size={18} />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Specialization</span>
                  </div>
                  <span className="font-headline text-xl font-semibold text-on-surface line-clamp-1">{user.course || 'None'}</span>
                </div>

                <div className="flex flex-col items-center md:items-start p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm hover:shadow-md hover:bg-white/60 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2 text-tertiary-fixed-dim">
                    <GraduationCap size={18} />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Current Year</span>
                  </div>
                  <span className="font-headline text-xl font-semibold text-on-surface">{user.year || 'None'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Books Grid Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
        <SectionHeader
          title="Shared Books"
          subtitle={`Explore the collection curated by ${user.name}.`}
          viewAllTo="/explore"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {books.length === 0 ? (
            <div className="col-span-full border border-dashed border-outline-variant py-20 flex flex-col items-center justify-center text-center px-4 rounded-2xl bg-surface/50">
               <Search className="text-outline-variant mb-4 opacity-50" size={40} />
               <p className="text-on-surface-variant font-headline font-semibold text-xl mb-2">No volumes shared yet</p>
               <p className="text-on-surface-variant/70 text-sm">When {user.name} shares books, they will appear here.</p>
            </div>
          ) : (
            books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default UserProfile;

