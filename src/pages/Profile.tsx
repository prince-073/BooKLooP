import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrentUser, setCurrentUser, clearToken, type StoredUser } from '../lib/auth';
import { apiGetBooks, apiUploadAvatar, apiUpdateUser, apiDeleteBook, apiGetMyVisitors } from '../lib/api';
import { getAvatarUrl } from '../lib/media';
import BookCard from '../components/BookCard';
import SectionHeader from '../components/SectionHeader';
import toast from 'react-hot-toast';
import { User, MapPin, Mail, Calendar, Settings, Edit3, LogOut, BookOpen, Library, Award, Camera, X, Eye, GraduationCap, Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import ImageCropperModal from '../components/ImageCropperModal';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [ownedBooks, setOwnedBooks] = useState<any[]>([]);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      navigate('/login');
      return;
    }
    setUser(u);
    fetchBooks(u.id);
  }, [navigate]);

  const fetchBooks = async (ownerId: string) => {
    try {
      const books = await apiGetBooks({ ownerId });
      setOwnedBooks(books);
      apiGetMyVisitors().then(setVisitors).catch(() => {});
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  const handleDeleteBook = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookToDelete(id);
  };

  const confirmDeleteBook = async () => {
    if (!bookToDelete) return;
    try {
      await apiDeleteBook(bookToDelete);
      setOwnedBooks(prev => prev.filter(b => b.id !== bookToDelete));
      toast.success('Book removed successfully.');
    } catch (e: any) {
      toast.error('Failed to delete book: ' + e.message);
    } finally {
      setBookToDelete(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setCropperSrc(objectUrl);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input to allow selecting the same file again
      }
    }
  };

  const handleSaveAvatar = async (croppedFile: File) => {
    try {
      const updatedUser = await apiUploadAvatar(croppedFile);
      setUser(updatedUser);
      setCurrentUser(updatedUser);
      setCropperSrc(null);
      toast.success("Avatar updated!");
    } catch (err: any) {
      toast.error('Failed to upload avatar: ' + err.message);
    }
  };

  if (!user) return <div className="py-20 text-center font-headline italic">Reviewing credentials...</div>;

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-primary-fixed opacity-10 blur-[100px] mix-blend-multiply dark:mix-blend-screen rounded-full" />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-secondary-fixed opacity-10 blur-[100px] mix-blend-multiply dark:mix-blend-screen rounded-full" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 lg:pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Sticky Left Sidebar (cols: 1 to 4) */}
          <div className="lg:col-span-4 lg:col-start-1">
            <div className="lg:sticky lg:top-8 flex flex-col gap-6">
              {/* Profile Card */}
              <div className="rounded-[2.5rem] bg-surface-bright/70 dark:bg-surface-container/60 backdrop-blur-2xl border border-outline-variant/50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] p-8 sm:p-10 flex flex-col items-center text-center">
                
                {/* Top Action Buttons (Edit / Theme) */}
                <div className="w-full flex justify-between items-center mb-8">
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-3 bg-surface-bright/50 hover:bg-surface-bright/80 backdrop-blur-md border border-outline-variant/60 text-on-surface rounded-full transition-all shadow-sm"
                    title="Toggle Dark Mode"
                  >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2.5 bg-surface-bright/50 hover:bg-surface-bright/80 backdrop-blur-md border border-outline-variant/60 text-on-surface rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>
                </div>

                {/* Avatar */}
                <div className="relative group shrink-0 mb-6 w-48 h-48 sm:w-56 sm:h-56">
                   <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-primary to-secondary blur opacity-40 group-hover:opacity-70 transition duration-700"></div>
                   <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-surface shadow-2xl bg-surface p-1.5">
                     <img
                       src={getAvatarUrl(user)}
                       alt={user.name}
                       className="w-full h-full object-cover rounded-full"
                       referrerPolicy="no-referrer"
                     />
                     <div 
                       className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-[2px] rounded-full m-1.5"
                       onClick={() => fileInputRef.current?.click()}
                     >
                       <Camera className="text-white mb-2" size={36} strokeWidth={1.5} />
                       <span className="text-[11px] font-bold text-white uppercase tracking-widest">Change Photo</span>
                     </div>
                     <input 
                       type="file" 
                       ref={fileInputRef} 
                       className="hidden" 
                       accept="image/*" 
                       onChange={handleFileSelect} 
                     />
                   </div>
                </div>

                {/* Profile Identity */}
                <div className="w-full flex-col flex items-center mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-on-surface to-on-surface-variant">
                       {user.name}
                    </h1>
                  </div>
                  <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                    <Award size={14} />
                    {user.role || 'Student'}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="w-full flex flex-col gap-3 text-sm text-on-surface-variant font-body mb-8 px-4">
                  {user.email && (
                    <div className="flex items-center gap-3 bg-surface-bright/40 p-3 rounded-2xl border border-outline-variant/40">
                      <div className="p-2 bg-white/50 dark:bg-surface/50 rounded-full text-primary shadow-sm"><Mail size={16} /></div>
                      <span className="font-medium truncate">{user.email}</span>
                    </div>
                  )}
                  {user.phoneVisible !== false && user.phone && (
                    <div className="flex items-center gap-3 bg-surface-bright/40 p-3 rounded-2xl border border-outline-variant/40">
                      <div className="p-2 bg-white/50 dark:bg-surface/50 rounded-full text-secondary shadow-sm"><MapPin size={16} /></div>
                      <span className="font-medium tracking-wide truncate">{user.phone}</span>
                    </div>
                  )}
                </div>

                {/* Vertical Bio */}
                {user.bio && (
                  <div className="w-full text-left mb-8 px-2 border-t border-on-surface/5 pt-6">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-3 flex items-center gap-2">
                      <User size={14} className="text-primary" />
                      About Me
                    </h4>
                    <p className="text-on-surface font-body text-sm leading-relaxed">{user.bio}</p>
                  </div>
                )}

                {/* Mini Stats Grid */}
                <div className="w-full grid grid-cols-2 gap-3 mb-8">
                   <div className="flex flex-col items-start p-4 rounded-[1.5rem] bg-gradient-to-br from-primary-container/40 to-transparent border border-outline-variant/40 shadow-sm col-span-2">
                     <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1 flex items-center gap-2"><Library size={14} className="text-primary"/> Volumes Shared</span>
                     <span className="font-headline text-3xl font-bold text-on-surface">{ownedBooks.length}</span>
                   </div>
                   <div className="flex flex-col items-start p-4 rounded-[1.5rem] bg-surface-bright/50 border border-outline-variant/40 shadow-sm">
                     <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1 line-clamp-1"><MapPin size={12} className="inline mr-1 text-secondary"/> Spec</span>
                     <span className="font-headline text-lg font-semibold text-on-surface line-clamp-1">{user.course || '-'}</span>
                   </div>
                   <div className="flex flex-col items-start p-4 rounded-[1.5rem] bg-surface-bright/50 border border-outline-variant/40 shadow-sm">
                     <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1 line-clamp-1"><GraduationCap size={12} className="inline mr-1 text-tertiary"/> Year</span>
                     <span className="font-headline text-lg font-semibold text-on-surface line-clamp-1">{user.year || '-'}</span>
                   </div>
                </div>

                <button 
                  onClick={handleLogout}
                  className="w-full py-4 bg-error-container/60 dark:bg-error-container/30 hover:bg-error text-error dark:text-error-fixed-dim hover:text-white border border-error/20 rounded-[1.5rem] text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-sm"
                >
                  <LogOut size={16} />
                  Log Out
                </button>

              </div>
            </div>
          </div>

          {/* Scrollable Right Feed (cols: 5 to 12) */}
          <div className="lg:col-span-8 lg:col-start-5 space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150 fill-mode-both">
            
            {/* Horizontal Analytics Banner */}
            <div className="w-full rounded-[2.5rem] bg-surface-bright/60 dark:bg-surface-container/30 backdrop-blur-xl border border-outline-variant/50 shadow-[0_15px_35px_-15px_rgba(0,0,0,0.05)] p-8 sm:p-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              <div className="shrink-0 text-center lg:text-left">
                <h3 className="font-headline font-bold text-2xl text-on-surface mb-2">Profile Analytics</h3>
                <p className="text-sm font-body text-on-surface-variant max-w-xs leading-relaxed">A quick highlight of the reach and impact your profile has cultivated.</p>
              </div>

              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6 bg-surface-bright/40 dark:bg-surface-container/40 p-5 rounded-[2rem] border border-outline-variant/30 dark:border-white/5">
                <div className="flex flex-col justify-center items-center sm:items-start sm:border-r border-on-surface/10 sm:pr-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye size={18} className="text-secondary" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Profile Views</span>
                  </div>
                  <span className="font-headline text-4xl font-black text-on-surface bg-clip-text text-transparent bg-gradient-to-br from-on-surface to-secondary-fixed-dim">{visitors.length}</span>
                </div>
                
                <div className="flex flex-col justify-center items-center sm:items-start pl-2">
                   <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-3 flex items-center gap-2">
                     <User size={14} className="text-primary" />
                     Recent Visitors
                   </span>
                   {visitors.length === 0 ? (
                     <p className="text-xs font-body italic text-on-surface-variant/80">No visits logged yet.</p>
                   ) : (
                     <div className="flex -space-x-3">
                       {visitors.slice(0, 5).map((v, i) => (
                         <div key={v.id} className="relative z-0 hover:z-10 transition-transform hover:scale-110" style={{ zIndex: 5 - i }} title={v.visitor.name}>
                           <img 
                             src={v.visitor.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${v.visitor.name}`} 
                             alt={v.visitor.name} 
                             className="w-10 h-10 rounded-full border-2 border-surface bg-surface shadow-sm object-cover" 
                           />
                         </div>
                       ))}
                       {visitors.length > 5 && (
                         <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-variant/80 text-on-surface-variant flex items-center justify-center text-[10px] font-bold shadow-sm z-0">
                           +{visitors.length - 5}
                         </div>
                       )}
                     </div>
                   )}
                </div>
              </div>
            </div>

            {/* Books Grid */}
            <div className="w-full">
              <SectionHeader
                title="My Listed Books"
                subtitle="Books you have listed for exchange."
                viewAllTo="/library"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 mt-6">
                {ownedBooks.length === 0 ? (
                  <div className="col-span-full border border-dashed border-outline-variant py-24 flex flex-col items-center justify-center text-center px-4 rounded-[2rem] bg-surface-bright/30 dark:bg-surface-container/30 backdrop-blur-md">
                     <BookOpen className="text-outline-variant mb-6 opacity-40" size={48} />
                     <p className="text-on-surface-variant font-headline font-semibold text-2xl mb-2">You haven't listed any books yet.</p>
                     <p className="text-on-surface-variant/70 text-base leading-relaxed max-w-md">Contribute to the campus exchange by adding books you no longer need.</p>
                  </div>
                ) : (
                  ownedBooks.map((book) => (
                    <BookCard key={book.id} book={book} onDelete={(e) => handleDeleteBook(book.id, e)} />
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
          <EditProfileModal 
            user={user} 
            onClose={() => setIsEditing(false)} 
            onSave={(updated) => {
              setUser(updated);
              setCurrentUser(updated);
              setIsEditing(false);
            }} 
          />
        )}
        {cropperSrc && (
          <ImageCropperModal
            imageSrc={cropperSrc}
            onClose={() => setCropperSrc(null)}
            onSave={handleSaveAvatar}
          />
        )}
        {bookToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-[2px]">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-surface w-full max-w-sm rounded-sm border-2 border-outline-variant p-8 shadow-2xl">
              <h3 className="text-xl font-headline font-bold text-on-surface mb-4">Delete Book</h3>
              <p className="text-sm text-on-surface-variant mb-8">Are you sure you want to delete this book? This action cannot be undone.</p>
              <div className="flex gap-4">
                <button onClick={() => setBookToDelete(null)} className="flex-1 py-3 border border-outline-variant text-on-surface rounded-sm text-xs font-bold uppercase tracking-widest">Cancel</button>
                <button onClick={confirmDeleteBook} className="flex-1 py-3 bg-error text-white rounded-sm text-xs font-bold uppercase tracking-widest">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EditProfileModal: React.FC<{ user: StoredUser, onClose: () => void, onSave: (u: StoredUser) => void }> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    course: user.course || '',
    year: user.year || '',
    role: user.role || 'Student',
    phone: user.phone || '',
    phoneVisible: user.phoneVisible ?? true,
    bio: user.bio || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await apiUpdateUser(formData);
      onSave(updated);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-[2px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface w-full max-w-lg rounded-sm border-2 border-outline-variant p-8 shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface">
          <X size={24} />
        </button>
        <h2 className="text-3xl font-headline font-bold text-on-surface mb-8">Edit Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block">Full Name</label>
            <input 
              className="w-full px-5 py-4 bg-surface-container rounded-sm border border-outline-variant text-on-surface font-headline focus:outline-none focus:border-primary text-lg"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block">Role</label>
            <select 
              className="w-full px-5 py-4 bg-surface-container rounded-sm border border-outline-variant text-on-surface font-headline focus:outline-none focus:border-primary text-sm appearance-none"
              value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} required 
            >
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block">Course</label>
              <input 
                className="w-full px-5 py-4 bg-surface-container rounded-sm border border-outline-variant text-on-surface focus:outline-none focus:border-primary text-sm font-body italic"
                value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})} required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block">Year of Study</label>
              <select 
                className="w-full px-5 py-4 bg-surface-container rounded-sm border border-outline-variant text-on-surface focus:outline-none focus:border-primary text-sm font-body appearance-none"
                value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} required 
              >
                <option value="" disabled>Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="5th Year">5th Year</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block">About Me / Bio</label>
            <textarea 
              className="w-full px-5 py-4 bg-surface-container rounded-sm border border-outline-variant text-on-surface focus:outline-none focus:border-primary text-sm font-body resize-none"
              rows={3}
              placeholder="What are your favorite genres? What are you studying?"
              value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block">Phone Number</label>
            <input 
              className="w-full px-5 py-4 bg-surface-container rounded-sm border border-outline-variant text-on-surface focus:outline-none focus:border-primary text-sm font-body tracking-wider"
              value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} 
            />
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/30">
            <input 
              type="checkbox" 
              id="phoneVisible" 
              checked={formData.phoneVisible} 
              onChange={(e) => setFormData({...formData, phoneVisible: e.target.checked})}
              className="w-5 h-5 border-outline-variant rounded-none accent-primary cursor-pointer"
            />
            <label htmlFor="phoneVisible" className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant cursor-pointer">
              Show phone number on profile
            </label>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 py-4 bg-primary text-on-primary rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
