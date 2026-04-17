import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGetAllUsers } from '../lib/api';
import { Shield, Loader, Search, ExternalLink, Calendar, BookOpen, Clock, Activity, Send } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { getCurrentUser } from '../lib/auth';
import { getAvatarUrl } from '../lib/media';
import { cn } from '../lib/utils';

type UserOverview = {
  id: string;
  name: string;
  email: string;
  course: string;
  year: string;
  role: string;
  phone: string;
  phoneVisible: boolean;
  avatarUrl: string;
  createdAt: string;
  _count: {
    booksListed: number;
    booksBorrowed: number;
    requestsAsBorrower: number;
    requestsAsOwner: number;
  };
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    if (user?.role !== 'Admin') {
      navigate('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        const data = await apiGetAllUsers();
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-error/10 p-8 text-center text-error border border-error/20">
        <Shield className="mx-auto h-12 w-12 opacity-50 mb-4" />
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.course.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24 md:pb-8">
      <SectionHeader 
        title="Admin Dashboard" 
        subtitle="Manage users and view platform analytics." 
        icon={<Shield className="h-6 w-6 text-primary" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface-container-low p-6 rounded-2xl border border-primary/10 shadow-sm">
          <p className="text-on-surface-variant text-sm font-medium">Total Users</p>
          <p className="text-3xl font-bold text-on-surface mt-2">{users.length}</p>
        </div>
        <div className="bg-surface-container-low p-6 rounded-2xl border border-primary/10 shadow-sm">
          <p className="text-on-surface-variant text-sm font-medium">Books Listed</p>
          <p className="text-3xl font-bold text-on-surface mt-2">{users.reduce((acc, user) => acc + user._count.booksListed, 0)}</p>
        </div>
        <div className="bg-surface-container-low p-6 rounded-2xl border border-primary/10 shadow-sm">
          <p className="text-on-surface-variant text-sm font-medium">Books Borrowed</p>
          <p className="text-3xl font-bold text-on-surface mt-2">{users.reduce((acc, user) => acc + user._count.booksBorrowed, 0)}</p>
        </div>
        <div className="bg-surface-container-low p-6 rounded-2xl border border-primary/10 shadow-sm">
          <p className="text-on-surface-variant text-sm font-medium">Total Requests</p>
          <p className="text-3xl font-bold text-on-surface mt-2">{users.reduce((acc, user) => acc + user._count.requestsAsBorrower, 0)}</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-primary/10 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-primary/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-on-surface">Registered Users</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full md:w-64 pl-9 pr-4 py-2 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Course/Year</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium">Stats</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={getAvatarUrl({ name: user.name, id: user.id, avatarUrl: user.avatarUrl, email: user.email })} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-primary/10"
                      />
                      <div>
                        <p className="font-semibold text-on-surface">{user.name}</p>
                        <p className="text-xs text-on-surface-variant">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-on-surface font-medium">{user.course}</p>
                    <p className="text-xs text-on-surface-variant">Year {user.year}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 text-xs font-semibold rounded-full",
                      user.role === 'Admin' ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3 text-xs text-on-surface-variant">
                      <div className="flex items-center gap-1" title="Books Listed">
                        <BookOpen className="w-3 h-3 text-primary/70" />
                        <span className="font-medium text-on-surface">{user._count.booksListed}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Books Borrowed">
                         <Activity className="w-3 h-3 text-primary/70" />
                        <span className="font-medium text-on-surface">{user._count.booksBorrowed}</span>
                      </div>
                       <div className="flex items-center gap-1" title="Requests Sent">
                         <Send className="w-3 h-3 text-primary/70" />
                        <span className="font-medium text-on-surface">{user._count.requestsAsBorrower}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => navigate(`/user/${user.id}`)}
                      className="inline-flex items-center justify-center p-2 rounded-xl text-primary hover:bg-primary/10 transition-colors"
                      title="View Profile"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
