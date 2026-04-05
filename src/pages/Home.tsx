import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import BookCard from '../components/BookCard';
import SectionHeader from '../components/SectionHeader';
import { Search, BookOpen, Users, ArrowRight, MessageSquare, Feather } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { apiGetBooks, apiGetGlobalActivity, apiGetUser, apiGetStats } from '../lib/api';
import { getCurrentUser } from '../lib/auth';
import { getAvatarUrl } from '../lib/media';

const Home: React.FC = () => {
  const me = getCurrentUser();
  const [books, setBooks] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState({ books: 0, users: 0, exchanges: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [bs, acts, siteStats] = await Promise.all([
          apiGetBooks(),
          apiGetGlobalActivity(),
          apiGetStats()
        ]);
        setBooks(bs.slice(0, 4));
        setActivities(acts.slice(0, 3));
        setStats(siteStats);
        if (me?.id) {
          const ud = await apiGetUser(me.id);
          setUserData(ud);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [me?.id]);

  const avatar = getAvatarUrl({ name: me?.name, avatarUrl: userData?.avatarUrl });

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 p-8 lg:p-14 shadow-2xl border border-white/10">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\"20\\" height=\\"20\\" viewBox=\\"0 0 20 20\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cg fill=\\"%23ffffff\\" fill-opacity=\\"1\\" fill-rule=\\"evenodd\\"%3E%3Ccircle cx=\\"3\\" cy=\\"3\\" r=\\"3\\"/>%3Ccircle cx=\\"13\\" cy=\\"13\\" r=\\"3\\"/>%3C/g%3E%3C/svg%3E")' }} />
        
        <div className="relative z-10 max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-headline font-extrabold text-4xl lg:text-6xl text-white leading-tight drop-shadow-sm"
          >
            Discover Your Next <br />
            <span className="text-indigo-400 italic font-normal font-headline">Great Story</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg text-indigo-100/80 max-w-lg font-body"
          >
            A beautiful platform for requesting, exchanging, and discovering stories across the community.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-12 flex flex-wrap gap-5"
          >
            <Link
              to="/explore"
              className="px-8 py-4 bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-3 hover:bg-indigo-400 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30 transition-all uppercase tracking-widest text-xs"
            >
              Browse Books
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/add"
              className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold border border-white/20 hover:bg-white/20 hover:scale-[1.02] transition-all uppercase tracking-widest text-xs flex items-center gap-2"
            >
              <Feather size={16} /> Add Book
            </Link>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
          <BookOpen size={400} className="text-white absolute -top-20 -right-20 rotate-12" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<BookOpen className="text-primary" size={28} strokeWidth={1.5} />}
          value={`${stats.books}+`}
          label="Stories Shared"
          border="border-primary/20"
        />
        <StatCard
          icon={<Users className="text-secondary" size={28} strokeWidth={1.5} />}
          value={`${stats.users}+`}
          label="Active Readers"
          border="border-secondary/20"
        />
        <StatCard
          icon={<MessageSquare className="text-tertiary" size={28} strokeWidth={1.5} />}
          value={`${stats.exchanges}+`}
          label="Books Swapped"
          border="border-tertiary/20"
        />
      </section>

      {/* Featured Books */}
      <section>
        <SectionHeader
          title="Recent Additions"
          subtitle="Newly cataloged texts available for review."
          viewAllTo="/explore"
        />
        {loading ? (
          <div className="h-64 flex justify-center items-center font-headline text-on-surface-variant italic">Dusting the shelves...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <BookCard book={book} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <SectionHeader
            title="Activity Log"
            subtitle="Latest updates from our readers."
          />
          {loading ? (
             <div className="h-32 text-on-surface-variant italic">Retrieving records...</div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-5 p-5 bg-surface-container-low rounded-sm border border-outline-variant/50 hover:border-outline transition-colors"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-outline-variant">
                    <img
                      src={getAvatarUrl({ name: activity.userName, avatarUrl: activity.userAvatar })}
                      alt={activity.userName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-on-surface font-body leading-relaxed">
                      <span className="font-bold">{activity.userName}</span>
                      {' '}
                      <span className="text-on-surface-variant/80 italic">
                        {activity.type === 'borrow' ? 'requested to borrow' :
                         activity.type === 'return' ? 'safely returned' :
                         activity.type === 'add' ? 'cataloged a new volume:' : 'curated'}
                      </span>
                      {' '}
                      <span className="font-bold font-headline tracking-wide">{activity.bookTitle}</span>
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1.5 uppercase tracking-widest">{new Date(activity.timestamp).toLocaleDateString()} {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="hidden sm:block">
                    <span className={cn(
                      "px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border",
                      activity.type === 'borrow' ? "bg-primary-container text-on-primary-container border-primary/20" :
                      activity.type === 'return' ? "bg-secondary-container text-on-secondary-container border-secondary/20" :
                      "bg-surface-container text-on-surface border-outline-variant"
                    )}>
                      {activity.type}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Profile / Welcome */}
        <div className="bg-surface-container-high rounded-sm p-8 border-2 border-outline-variant relative">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Feather size={60} className="text-primary"/></div>
          <div className="flex items-center gap-5 mb-8 relative z-10">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-outline shadow-sm">
              <img
                src={avatar}
                alt={me?.name || 'Profile'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="font-headline font-bold text-xl text-on-surface tracking-wide italic">Good Day,</h3>
              <p className="text-primary font-bold uppercase tracking-widest text-sm mt-1">{me?.name || 'Scholar'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 bg-surface-container-low rounded-sm border border-outline-variant flex items-center justify-between">
              <div>
                 <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-1">Your Books</p>
                 <span className="text-3xl font-headline font-bold text-on-surface">{userData ? (userData.booksOwned?.length ?? 0) : '-'}</span>
              </div>
              <Link to="/profile" className="text-xs text-primary font-bold uppercase tracking-widest hover:underline">Manage</Link>
            </div>
            <div className="p-5 bg-surface-container-low rounded-sm border border-outline-variant flex items-center justify-between">
              <div>
                 <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-1">Active Requests</p>
                 <span className="text-3xl font-headline font-bold text-on-surface">{userData ? (userData.booksBorrowed?.length ?? 0) : '-'}</span>
              </div>
              <Link to="/requests" className="text-xs text-primary font-bold uppercase tracking-widest hover:underline">View</Link>
            </div>
          </div>

          <Link
            to="/profile"
            className="mt-8 w-full py-4 bg-primary text-on-primary rounded-sm font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]"
          >
            Review Profile
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
  border: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, border }) => {
  return (
    <div className={cn("p-6 rounded-sm flex items-center gap-5 border", border, "bg-surface-container-low shadow-sm")}>
      <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center shadow-inner border border-outline-variant/50">
        {icon}
      </div>
      <div>
        <p className="text-3xl font-headline font-bold text-on-surface">{value}</p>
        <p className="text-xs text-on-surface-variant uppercase font-bold tracking-widest mt-1">{label}</p>
      </div>
    </div>
  );
};

export default Home;
