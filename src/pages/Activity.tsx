import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import SectionHeader from '../components/SectionHeader';
import { Bell, BookOpen, CheckCircle2, BookmarkPlus, Compass } from 'lucide-react';
import { cn } from '../lib/utils';
import { apiGetGlobalActivity } from '../lib/api';
import { getAvatarUrl } from '../lib/media';
import { Link } from 'react-router-dom';

const Activity: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'borrow' | 'return' | 'add'>('all');
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGetGlobalActivity();
        setActivities(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <SectionHeader
        title="Recent Activity"
        subtitle="Stay updated with book exchanges happening right now."
      />

      {/* Activity Filters */}
      <div className="flex items-center gap-4 p-1.5 bg-surface-container-low rounded-sm border border-outline-variant/30 w-fit overflow-x-auto no-scrollbar shadow-inner">
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label="All"
        />
        <FilterButton
          active={filter === 'borrow'}
          onClick={() => setFilter('borrow')}
          label="Requests"
        />
        <FilterButton
          active={filter === 'return'}
          onClick={() => setFilter('return')}
          label="Completed Returns"
        />
        <FilterButton
          active={filter === 'add'}
          onClick={() => setFilter('add')}
          label="New Books"
        />
      </div>

      {/* Activity List */}
      <div className="min-h-[50vh]">
        {loading ? (
             <div className="h-full flex flex-col justify-center items-center py-20 text-on-surface-variant">
                <Compass size={40} className="animate-spin mb-4 opacity-20" />
                <p className="font-headline italic text-lg tracking-wide">Loading activity...</p>
             </div>
        ) : (
          <div className="space-y-5">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-surface-container-lowest rounded-sm border border-outline-variant hover:border-primary/50 transition-all duration-300 shadow-sm"
                >
                  {/* User Avatar — clickable to profile */}
                  <div className="relative flex-shrink-0">
                    <Link
                      to={activity.userId ? `/user/${activity.userId}` : '#'}
                      className="block w-16 h-16 rounded-full overflow-hidden border border-outline shadow-inner transition-all duration-300 group-hover:scale-105 hover:ring-2 hover:ring-primary/40"
                    >
                      <img
                        src={getAvatarUrl({ name: activity.userName, avatarUrl: activity.userAvatar })}
                        alt={activity.userName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </Link>
                    {/* Activity Icon Badge */}
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-surface-container-lowest",
                      activity.type === 'borrow' ? "bg-primary text-on-primary" :
                      activity.type === 'return' ? "bg-secondary text-on-secondary" :
                      "bg-tertiary text-on-tertiary"
                    )}>
                      {activity.type === 'borrow' ? <BookOpen size={12} /> :
                       activity.type === 'return' ? <CheckCircle2 size={12} /> :
                       <BookmarkPlus size={12} />}
                    </div>
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <Link
                        to={activity.userId ? `/user/${activity.userId}` : '#'}
                        className="font-headline font-bold text-xl text-on-surface group-hover:text-primary transition-colors hover:underline underline-offset-2"
                      >
                        {activity.userName}
                      </Link>
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 sm:mt-0 opacity-70">
                         {new Date(activity.timestamp).toLocaleString(undefined, {
                           month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                         })}
                      </span>
                    </div>

                    <p className="text-on-surface-variant/90 leading-relaxed font-body">
                      {activity.type === 'borrow' ? (
                        <>Requested to borrow <span className="font-bold font-headline text-on-surface text-lg ml-1">"{activity.bookTitle}"</span></>
                      ) : activity.type === 'return' ? (
                        <>Returned <span className="font-bold font-headline text-on-surface text-lg ml-1">"{activity.bookTitle}"</span></>
                      ) : (
                        <>Added a new book: <span className="font-bold font-headline text-on-surface text-lg ml-1">"{activity.bookTitle}"</span></>
                      )}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-outline-variant">
                  <Bell size={40} className="text-on-surface-variant/30" />
                </div>
                <h3 className="text-2xl font-headline font-bold text-on-surface italic">No activity recorded</h3>
                <p className="text-on-surface-variant mt-3 max-w-sm font-body">
                  This list has no {filter === 'all' ? '' : filter} activity at the moment.
                </p>
                <button
                  onClick={() => setFilter('all')}
                  className="mt-8 px-8 py-3 bg-primary text-on-primary rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-md"
                >
                  Show all activity
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({ active, onClick, label }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-6 py-2.5 rounded-sm text-[10px] uppercase tracking-widest font-bold transition-all duration-300 whitespace-nowrap",
        active
          ? "bg-surface text-primary shadow-[inset_0_0_0_1px_rgba(92,64,51,0.3)]"
          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-transparent"
      )}
    >
      {label}
    </button>
  );
};

export default Activity;
