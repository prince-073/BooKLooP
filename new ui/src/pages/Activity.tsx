import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ACTIVITIES } from '../constants';
import SectionHeader from '../components/SectionHeader';
import { Bell, MessageSquare, BookOpen, CheckCircle2, Filter, X } from 'lucide-react';
import { cn } from '../lib/utils';

const Activity: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'borrow' | 'return' | 'add'>('all');

  const filteredActivities = ACTIVITIES.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader
        title="Activity Feed"
        subtitle="Stay updated with the latest exchanges and notifications in your network."
      />

      {/* Activity Filters */}
      <div className="flex items-center gap-2 p-1 bg-surface-container rounded-2xl border border-outline-variant/30 w-fit overflow-x-auto no-scrollbar">
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label="All Activity"
        />
        <FilterButton
          active={filter === 'borrow'}
          onClick={() => setFilter('borrow')}
          label="Borrow Requests"
        />
        <FilterButton
          active={filter === 'return'}
          onClick={() => setFilter('return')}
          label="Returns"
        />
        <FilterButton
          active={filter === 'add'}
          onClick={() => setFilter('add')}
          label="New Curations"
        />
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group p-6 bg-surface-container rounded-3xl border border-outline-variant/30 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="flex items-start gap-6">
                {/* User Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/10 shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <img
                      src={activity.userAvatar}
                      alt={activity.userName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {/* Activity Icon Badge */}
                  <div className={cn(
                    "absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg border-2 border-surface",
                    activity.type === 'borrow' ? "bg-primary text-on-primary" :
                    activity.type === 'return' ? "bg-tertiary text-on-tertiary" :
                    "bg-secondary text-on-secondary"
                  )}>
                    {activity.type === 'borrow' ? <BookOpen size={14} /> :
                     activity.type === 'return' ? <CheckCircle2 size={14} /> :
                     <Bell size={14} />}
                  </div>
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors">
                      {activity.userName}
                    </h4>
                    <span className="text-xs text-on-surface-variant font-medium">{activity.timestamp}</span>
                  </div>

                  <p className="text-on-surface-variant leading-relaxed">
                    {activity.type === 'borrow' ? (
                      <>Requested to borrow <span className="font-bold text-on-surface italic">"{activity.bookTitle}"</span> for their research project.</>
                    ) : activity.type === 'return' ? (
                      <>Successfully returned <span className="font-bold text-on-surface italic">"{activity.bookTitle}"</span> to the collection.</>
                    ) : (
                      <>Added a new academic treasure to the collection: <span className="font-bold text-on-surface italic">"{activity.bookTitle}"</span>.</>
                    )}
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <button className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                      {activity.type === 'borrow' ? 'Accept Request' : 'View Details'}
                    </button>
                    <button className="px-4 py-2 bg-surface text-on-surface rounded-xl text-xs font-bold border border-outline-variant/30 hover:bg-surface-container-high transition-all">
                      <MessageSquare size={14} className="inline mr-2" />
                      Message
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-surface-container rounded-3xl flex items-center justify-center mb-4">
              <Bell size={40} className="text-on-surface-variant/30" />
            </div>
            <h3 className="text-xl font-headline font-bold text-on-surface">No activity found</h3>
            <p className="text-on-surface-variant mt-2 max-w-xs">
              There are no {filter === 'all' ? '' : filter} activities to show at the moment.
            </p>
            <button
              onClick={() => setFilter('all')}
              className="mt-6 px-6 py-2 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary/20 transition-all"
            >
              Show all activity
            </button>
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
        "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap",
        active
          ? "bg-surface text-primary shadow-sm ring-1 ring-outline-variant/30"
          : "text-on-surface-variant hover:text-on-surface hover:bg-surface/50"
      )}
    >
      {label}
    </button>
  );
};

export default Activity;
