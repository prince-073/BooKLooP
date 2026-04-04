import React from 'react';
import { 
  Compass, 
  Library, 
  Bookmark, 
  MessageSquare, 
  GitPullRequest, 
  User, 
  Plus, 
  Settings, 
  LogOut,
  Sun,
  Edit2,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { motion } from 'motion/react';

// --- Types ---
interface Book {
  id: string;
  title: string;
  author: string;
  status: 'AVAILABLE' | 'BORROWED';
  image: string;
  owner: {
    name: string;
    avatar: string;
  };
  details: string;
}

// --- Components ---

const SidebarItem: React.FC<{ icon: any, label: string, active?: boolean }> = ({ icon: Icon, label, active = false }) => (
  <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${active ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}>
    <Icon size={20} className={active ? 'text-book-green' : 'text-book-green/60'} />
    <span className={`text-sm font-medium ${active ? 'text-book-green' : 'text-book-green/60'}`}>{label}</span>
  </div>
);

const StatCard: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="bg-book-beige p-4 rounded-xl">
    <p className="text-[10px] uppercase tracking-wider font-bold text-book-green/40 mb-1">{label}</p>
    <p className="text-xl font-bold text-book-green">{value}</p>
  </div>
);

const BookCard: React.FC<{ book: Book }> = ({ book }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-book-accent/30 group"
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={book.image} 
          alt={book.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className={`absolute top-3 left-3 px-2 py-1 rounded text-[10px] font-bold tracking-wider ${
          book.status === 'AVAILABLE' ? 'bg-[#1A2E23] text-white' : 'bg-[#D97706] text-white'
        }`}>
          {book.status}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-serif text-lg font-bold leading-tight mb-1 truncate">{book.title}</h3>
        <p className="text-xs text-book-green/60 italic mb-4">{book.author}</p>
        
        <div className="flex items-center justify-between pt-3 border-t border-book-accent/30">
          <div className="flex items-center gap-2">
            <img src={book.owner.avatar} alt={book.owner.name} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
            <div className="text-[10px] leading-tight">
              <p className="text-book-green/40">J.</p>
              <p className="font-bold text-book-green">{book.owner.name}</p>
            </div>
          </div>
          <div className="text-[10px] text-right leading-tight">
            <p className="text-book-green/40 uppercase font-bold">Edition:</p>
            <p className="font-bold text-book-green">{book.details}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = React.useState<'profile' | 'explore'>('explore');

  const books: Book[] = [
    {
      id: '1',
      title: 'The Silent Patient',
      author: 'Alex Michaelides',
      status: 'AVAILABLE',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
      owner: { name: 'Thorne', avatar: 'https://i.pravatar.cc/150?u=julian' },
      details: '2019'
    },
    {
      id: '2',
      title: 'Great Expectations',
      author: 'Charles Dickens',
      status: 'BORROWED',
      image: 'https://images.unsplash.com/photo-1543004471-2401f34ddc19?auto=format&fit=crop&q=80&w=800',
      owner: { name: 'Thorne', avatar: 'https://i.pravatar.cc/150?u=julian' },
      details: 'HARDCOVER'
    },
    {
      id: '3',
      title: 'Norwegian Wood',
      author: 'Haruki Murakami',
      status: 'AVAILABLE',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
      owner: { name: 'Thorne', avatar: 'https://i.pravatar.cc/150?u=julian' },
      details: 'PAPERBACK'
    }
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-book-cream pb-20 lg:pb-0">
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden lg:flex w-64 p-8 flex-col border-r border-book-accent/30 sticky top-0 h-screen">
        <div className="mb-12">
          <h1 className="font-serif text-2xl font-bold text-book-green mb-8">BookLoop</h1>
          <div className="flex items-center gap-3">
            <img 
              src="https://i.pravatar.cc/150?u=curator" 
              alt="Curator" 
              className="w-10 h-10 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="text-sm font-bold text-book-green">The Curator</p>
              <p className="text-[10px] uppercase tracking-wider text-book-green/40 font-bold">University Library</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          <SidebarItem icon={Compass} label="Explore" active={activeTab === 'explore'} />
          <SidebarItem icon={Library} label="Library" />
          <SidebarItem icon={Bookmark} label="Wishlist" />
          <SidebarItem icon={MessageSquare} label="Messages" />
          <SidebarItem icon={GitPullRequest} label="Requests" />
          <SidebarItem icon={User} label="Profile" active={activeTab === 'profile'} />
        </nav>

        <div className="mt-auto space-y-6">
          <button className="w-full bg-book-green text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-book-green/90 transition-colors">
            <Plus size={18} />
            Add Book
          </button>
          
          <div className="space-y-1">
            <div className="flex items-center gap-3 px-4 py-2 text-book-green/60 hover:text-book-green cursor-pointer transition-colors">
              <Settings size={18} />
              <span className="text-sm font-medium">Settings</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 text-book-green/60 hover:text-book-green cursor-pointer transition-colors">
              <LogOut size={18} />
              <span className="text-sm font-medium">Sign Out</span>
            </div>
          </div>
        </div>
      </aside>

      {/* --- Mobile Header --- */}
      <header className="lg:hidden flex items-center justify-between p-6 bg-book-cream border-b border-book-accent/30 sticky top-0 z-50">
        <h1 className="font-serif text-xl font-bold text-book-green">BookLoop</h1>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-book-beige rounded-full transition-colors">
            <Plus size={20} className="text-book-green" />
          </button>
          <img 
            src="https://i.pravatar.cc/150?u=julian" 
            alt="User" 
            className="w-8 h-8 rounded-full border border-book-accent"
            referrerPolicy="no-referrer"
          />
        </div>
      </header>

      {/* --- Profile Column (Responsive) --- */}
      <main className={`w-full lg:w-[400px] p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-book-accent/30 flex flex-col items-center ${activeTab === 'profile' ? 'flex' : 'hidden lg:flex'}`}>
        <div className="w-full flex justify-between mb-8">
          <button className="p-2 hover:bg-book-beige rounded-full transition-colors">
            <Sun size={20} className="text-book-green" />
          </button>
          <button className="p-2 hover:bg-book-beige rounded-full transition-colors">
            <Edit2 size={20} className="text-book-green" />
          </button>
        </div>

        <div className="bg-white w-full rounded-[32px] p-6 lg:p-8 shadow-sm border border-book-accent/30 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full border-4 border-book-beige p-1">
              <img 
                src="https://i.pravatar.cc/150?u=julian" 
                alt="Julian Thorne" 
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <h2 className="font-serif text-2xl lg:text-3xl font-bold text-book-green mb-1 text-center">Julian Thorne</h2>
          <span className="bg-[#B8D1C4] text-book-green text-[10px] font-bold px-3 py-1 rounded-full mb-6 lg:mb-8">Student</span>

          <div className="w-full space-y-3 mb-6 lg:mb-8">
            <div className="flex items-center gap-3 text-book-green/60">
              <MessageSquare size={16} />
              <span className="text-xs font-medium">j.thorne@unilib.edu</span>
            </div>
            <div className="flex items-center gap-3 text-book-green/60">
              <GitPullRequest size={16} />
              <span className="text-xs font-medium">+1 (555) 924-1102</span>
            </div>
          </div>

          <div className="w-full mb-6 lg:mb-8">
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-book-green/40 mb-3">About Me</h3>
            <p className="text-xs text-book-green/70 leading-relaxed">
              Final year English Literature student focusing on Victorian-era narratives. Passionate about physical books and sustainable knowledge sharing.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mb-8 lg:mb-12">
            <StatCard label="Volumes Shared" value="42" />
            <StatCard label="Specialization" value="Eng Lit" />
            <StatCard label="Cohort Year" value="'24" />
            <StatCard label="Reputation" value="4.9" />
          </div>

          <button className="flex items-center gap-2 text-red-600 font-bold text-sm hover:opacity-80 transition-opacity">
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </main>

      {/* --- Main Content Area (Responsive) --- */}
      <section className={`flex-1 p-6 lg:p-12 overflow-y-auto ${activeTab === 'explore' ? 'block' : 'hidden lg:block'}`}>
        {/* Impressions Card */}
        <div className="bg-book-green rounded-[32px] p-6 lg:p-10 mb-8 lg:mb-12 relative overflow-hidden text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2 lg:mb-4">Total Profile Impressions</p>
              <h2 className="text-4xl lg:text-6xl font-bold">1,248</h2>
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2 lg:mb-4">Recent Visitors</p>
              <div className="flex items-center gap-1">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <img 
                      key={i}
                      src={`https://i.pravatar.cc/150?u=visitor${i}`} 
                      alt="Visitor" 
                      className="w-6 h-6 lg:w-8 lg:h-8 rounded-full border-2 border-book-green"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                  +5
                </div>
              </div>
            </div>
          </div>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-48 h-48 lg:w-64 lg:h-64 bg-white/5 rounded-full -mr-10 -mt-10 lg:-mr-20 lg:-mt-20 blur-3xl" />
        </div>

        {/* Listed Books Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-book-green mb-1">My Listed Books</h2>
            <p className="text-xs lg:text-sm text-book-green/60">Curated collection currently available for circulation.</p>
          </div>
          <button className="flex items-center gap-1 text-book-green font-bold text-sm hover:gap-2 transition-all">
            View Archive <ChevronRight size={16} />
          </button>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          {books.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center py-12 border-t border-book-accent/30">
          <div className="w-16 h-1 bg-book-accent rounded-full mb-4" />
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-book-green/30">End of Collection</p>
        </div>
      </section>

      {/* --- Mobile Bottom Navigation --- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-book-accent/30 px-6 py-3 flex justify-between items-center z-50">
        <button 
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'explore' ? 'text-book-green' : 'text-book-green/40'}`}
        >
          <Compass size={24} />
          <span className="text-[10px] font-bold uppercase">Explore</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-book-green/40">
          <Library size={24} />
          <span className="text-[10px] font-bold uppercase">Library</span>
        </button>
        <div className="relative -top-6">
          <button className="bg-book-green text-white p-4 rounded-full shadow-lg shadow-book-green/20">
            <Plus size={24} />
          </button>
        </div>
        <button className="flex flex-col items-center gap-1 text-book-green/40">
          <Bookmark size={24} />
          <span className="text-[10px] font-bold uppercase">Wishlist</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-book-green' : 'text-book-green/40'}`}
        >
          <User size={24} />
          <span className="text-[10px] font-bold uppercase">Profile</span>
        </button>
      </nav>
    </div>
  );
}
