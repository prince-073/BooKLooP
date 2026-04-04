import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, BookCheck, Clock } from 'lucide-react';
import { apiAcceptRequest, apiGetBooks, apiGetUserRequests, apiRejectRequest } from '../lib/api';
import { getCurrentUser } from '../lib/auth';
import { Link } from 'react-router-dom';
import { fallbackBookCover, getAvatarUrl, getBookCoverUrl } from '../lib/media';

export function Dashboard() {
  const currentUser = getCurrentUser();
  const name = currentUser?.name?.split(' ')[0] || 'Reader';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const [books, setBooks] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  async function handleAccept(requestId: string) {
    setActioningId(requestId);
    try {
      await apiAcceptRequest(requestId);
      setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: 'accepted' } : r)));
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(requestId: string) {
    setActioningId(requestId);
    try {
      await apiRejectRequest(requestId);
      setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' } : r)));
    } finally {
      setActioningId(null);
    }
  }


  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [booksData, requestsData] = await Promise.all([
          apiGetBooks(),
          apiGetUserRequests(),
        ]);
        if (!cancelled) {
          setBooks(booksData || []);
          setRequests(requestsData || []);
        }
      } catch {
        if (!cancelled) {
          setBooks([]);
          setRequests([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pendingIncomingCount = useMemo(
    () => requests.filter((r) => r.status === 'pending' && !r.isOutgoing).length,
    [requests]
  );
  const currentReadingCount = useMemo(
    () => books.filter((b) => b.status === 'borrowed').length,
    [books]
  );
  const totalCollection = books.length;
  const recentBooks = books.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 py-8 md:py-12">
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">{greeting}, {name}.</h2>
        <p className="text-on-surface-variant text-lg">
          You have {pendingIncomingCount} pending request{pendingIncomingCount === 1 ? '' : 's'} waiting for your approval today.
        </p>
      </motion.section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <StatCard icon={BookOpen} label="Total Collection" value={String(totalCollection)} subValue="Books Shared" />
        <StatCard icon={BookCheck} label="Current Reading" value={String(currentReadingCount)} subValue="Borrowed" />
        <StatCard icon={Clock} label="Attention Needed" value={String(pendingIncomingCount)} subValue="Pending Requests" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <section className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-on-surface tracking-tight">Recent Activity</h3>
            <Link to="/requests" className="text-xs font-bold tracking-widest text-on-surface-variant uppercase hover:text-primary transition-colors">View All</Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <p className="text-on-surface-variant text-sm">Loading activity...</p>
            ) : requests.length === 0 ? (
              <p className="text-on-surface-variant text-sm">No activity yet.</p>
            ) : (
              requests.slice(0, 3).map((request) => (
                <ActivityItem
                  key={request.id}
                  user={{ name: request.user, avatar: getAvatarUrl({ name: request.user }) }}
                  action={request.status === 'pending' ? 'requested' : request.status}
                  target={`"${request.title}"`}
                  time="Just now"
                  meta={request.isOutgoing ? 'Outgoing request' : 'Incoming request'}
                  type={request.status === 'pending' && !request.isOutgoing ? 'request' : 'other'}
                  onAccept={() => handleAccept(request.id)}
                  onDecline={() => handleReject(request.id)}
                  acting={actioningId === request.id}
                />
              ))
            )}
          </div>
        </section>

        <section className="lg:col-span-2">
          <h3 className="text-xl font-bold text-on-surface tracking-tight mb-8">Recently Added</h3>
          {recentBooks[0] ? (
          <div className="bg-surface-container-high rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
            <img 
              src={getBookCoverUrl(recentBooks[0].cover, recentBooks[0].title)}
              onError={(e) => {
                e.currentTarget.src = fallbackBookCover(recentBooks[0].title);
              }}
              alt={recentBooks[0].title || 'Featured Book'} 
              className="w-full h-64 object-cover rounded-2xl group-hover:scale-110 transition-transform duration-700"
            />
            <div className="relative z-20 mt-4">
              <p className="text-xs font-bold tracking-widest text-on-surface/60 uppercase mb-2">Editor's Choice</p>
              <h4 className="text-lg font-bold text-on-surface mb-4">{recentBooks[0].title}</h4>
              <div className="flex items-center gap-3">
                <Link
                  to={`/book/${recentBooks[0].id}`}
                  className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity text-center"
                >
                  View Book
                </Link>
                <button className="p-3 bg-primary/10 backdrop-blur-md rounded-xl text-on-surface hover:bg-primary/15 transition-colors">
                  <span className="material-symbols-outlined">bookmark</span>
                </button>
              </div>
            </div>
          </div>
          ) : (
            <div className="bg-surface-container-high rounded-3xl p-6 text-on-surface-variant text-sm">
              No books added yet.
            </div>
          )}
          <div className="flex gap-2 justify-center mt-6">
            <div className="w-8 h-1 bg-primary rounded-full"></div>
            <div className="w-2 h-1 bg-primary/25 rounded-full"></div>
            <div className="w-2 h-1 bg-primary/25 rounded-full"></div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subValue }: any) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-8 hover:bg-surface-container-high transition-all duration-300 group border border-primary/10">
      <div className="flex items-start justify-between mb-8">
        <div className="p-3 bg-surface-container-lowest rounded-xl group-hover:bg-accent group-hover:text-on-accent transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-bold text-on-surface">{value}</span>
        <span className="text-on-surface-variant font-medium text-sm">{subValue}</span>
      </div>
    </div>
  );
}

function ActivityItem({ user, action, target, time, meta, type, onAccept, onDecline, acting }: any) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low/50 hover:bg-surface-container-low transition-colors group">
      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 grayscale group-hover:grayscale-0 transition-all">
        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-on-surface">
          {user.name} {action} <span className="italic font-serif">{target}</span>
        </p>
        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{time} • {meta}</p>
      </div>
      {type === 'request' ? (
        <div className="flex gap-2">
          <button
            onClick={onAccept}
            disabled={acting}
            className="px-4 py-1.5 text-[10px] font-bold bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity uppercase tracking-widest disabled:opacity-50"
          >
            {acting ? 'Working...' : 'Accept'}
          </button>
          <button
            onClick={onDecline}
            disabled={acting}
            className="px-4 py-1.5 text-[10px] font-bold bg-surface-container-high text-on-surface rounded-lg hover:bg-surface-container-highest transition-colors uppercase tracking-widest disabled:opacity-50"
          >
            Decline
          </button>
        </div>
      ) : (
        <div className="p-2 text-on-surface-variant">
          <Clock className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
