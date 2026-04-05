import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import SectionHeader from '../components/SectionHeader';
import { Camera, BookOpen, User, Tag, MapPin, Info, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { apiAddBook } from '../lib/api';

const AddBook: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    type: 'Novel',
    genre: 'Romance',
    pickupPoint: 'Main Campus',
    description: '',
    coverUrl: 'https://picsum.photos/seed/book1/800/1200',
    coverBackUrl: 'https://picsum.photos/seed/book2/800/1200'
  });

  const bookTypes = [
    'Novel', 'Short Story Collection', 'Novella', 'Poetry Book', 'Drama / Play',
    'Academic / Textbook', 'Reference Book', 'Self-Help Book', 'Biography',
    'Autobiography', 'Memoir', 'Comic Book', 'Graphic Novel', 'Manga',
    'Magazine', 'Journal / Diary', 'Workbook / Practice Book'
  ];

  const genres = [
    'Romance', 'Mystery', 'Thriller', 'Fantasy', 'Science Fiction (Sci-Fi)', 'Horror',
    'Adventure', 'Drama', 'Comedy / Humor', 'Action', 'Crime', 'Psychological',
    'Historical Fiction', 'Dystopian', 'Self-Help', 'Personal Development', 'Motivation',
    'Business', 'Finance', 'Entrepreneurship', 'Technology', 'Philosophy',
    'Religion / Spirituality', 'Politics', 'Social Issues', 'Health & Fitness',
    'Travel', 'Cooking / Food', 'Art & Design', 'Children’s', 'Young Adult (YA)'
  ];

  const locations = [
    'Main Campus', 'UDMR E1', 'UDMR E2', 'UDMR E3', 'UDMR W1', 'UDMR W2', 'UDMR W3',
    'VITA', 'Canteen', 'Gymnasium Hall', 'Boys Hostel', 'Girls Hostel'
  ];

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBackFile, setImageBackFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiAddBook({
        title: formData.title,
        author: formData.author,
        type: formData.type,
        subject: formData.genre,
        pickupPoint: formData.pickupPoint,
        condition: 'Like New',
        imageFile: imageFile,
        imageBackFile: imageBackFile,
        available: true,
        abstract: formData.description
      });
      setStep(4);
      toast.success("Book curated successfully!");
    } catch(err) {
      toast.error("Failed to curate book: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-700">
      <SectionHeader
        title="Add a Book"
        subtitle="List your book for others to borrow."
      />

      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-10 px-4">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "h-1.5 flex-1 rounded-sm transition-all duration-700",
              step >= s ? "bg-primary shadow-[0_0_8px_rgba(92,64,51,0.3)]" : "bg-outline-variant/30"
            )}
          />
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-sm p-8 md:p-12 border-2 border-outline-variant/50 shadow-sm relative overflow-hidden">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10 relative z-10"
          >
            <div className="flex items-center gap-5 mb-8 border-b-2 border-outline-variant/30 pb-6">
              <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-primary border border-outline-variant shadow-inner">
                <BookOpen size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-headline font-bold text-2xl text-on-surface italic tracking-wide">Book Details</h3>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mt-1">Enter the basic information of the book</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                  <BookOpen size={14} className="text-primary" />
                  Full Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Republic"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-6 py-4 bg-surface rounded-sm border-2 border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-headline text-lg"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                  <User size={14} className="text-secondary" />
                  Author / Origin
                </label>
                <input
                  type="text"
                  placeholder="e.g. Plato"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-6 py-4 bg-surface rounded-sm border-2 border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-headline text-lg italic"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                    <Tag size={14} className="text-secondary" />
                    Format / Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-6 py-4 bg-surface rounded-sm border-2 border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none font-body text-sm"
                  >
                    {bookTypes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                    <Tag size={14} className="text-tertiary" />
                    Genre
                  </label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full px-6 py-4 bg-surface rounded-sm border-2 border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none font-body text-sm"
                  >
                    {genres.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                  <MapPin size={14} className="text-primary" />
                  Pickup Point
                </label>
                <select
                  value={formData.pickupPoint}
                  onChange={(e) => setFormData({ ...formData, pickupPoint: e.target.value })}
                  className="w-full px-6 py-4 bg-surface rounded-sm border-2 border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none font-body text-sm"
                >
                  {locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!formData.title || !formData.author}
              className="mt-10 w-full py-4 bg-primary text-on-primary rounded-sm font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]"
            >
              Next: Add Photo
              <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10 relative z-10"
          >
            <div className="flex items-center gap-5 mb-8 border-b-2 border-outline-variant/30 pb-6">
              <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-secondary border border-outline-variant shadow-inner">
                <Camera size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-headline font-bold text-2xl text-on-surface italic tracking-wide">Book Photo</h3>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mt-1">Take or upload a picture of the book</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Front Cover */}
              <div
                 className="aspect-[3/4] w-full relative rounded-sm overflow-hidden border-2 border-dashed border-outline-variant group cursor-pointer hover:border-primary transition-all bg-surface"
                 onClick={() => document.getElementById('bookImageUpload')?.click()}
              >
                <img
                  src={formData.coverUrl}
                  alt="Front Preview"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors bg-surface/20 backdrop-blur-[2px]">
                  <Camera size={48} strokeWidth={1} className="mb-4" />
                  <span className="font-bold uppercase tracking-widest text-xs">Scan Front Cover</span>
                </div>
                <input
                  id="bookImageUpload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                       setImageFile(e.target.files[0]);
                       setFormData({...formData, coverUrl: URL.createObjectURL(e.target.files[0])});
                    }
                  }}
                />
              </div>

              {/* Back Cover */}
              <div
                 className="aspect-[3/4] w-full relative rounded-sm overflow-hidden border-2 border-dashed border-outline-variant group cursor-pointer hover:border-secondary transition-all bg-surface"
                 onClick={() => document.getElementById('bookBackImageUpload')?.click()}
              >
                <img
                  src={formData.coverBackUrl}
                  alt="Back Preview"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant group-hover:text-secondary transition-colors bg-surface/20 backdrop-blur-[2px]">
                  <Camera size={48} strokeWidth={1} className="mb-4" />
                  <span className="font-bold uppercase tracking-widest text-xs">Scan Back Cover (Opt)</span>
                </div>
                <input
                  id="bookBackImageUpload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                       setImageBackFile(e.target.files[0]);
                       setFormData({...formData, coverBackUrl: URL.createObjectURL(e.target.files[0])});
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleBack}
                className="flex-1 py-4 bg-surface text-on-surface rounded-sm font-bold uppercase tracking-widest text-xs border-2 border-outline-variant/50 hover:bg-surface-container-low transition-all"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-[2] py-4 bg-primary text-on-primary rounded-sm font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]"
              >
                Next: Add Description
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10 relative z-10"
          >
            <div className="flex items-center gap-5 mb-8 border-b-2 border-outline-variant/30 pb-6">
              <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-tertiary border border-outline-variant shadow-inner">
                <Info size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-headline font-bold text-2xl text-on-surface italic tracking-wide">Description</h3>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mt-1">Tell others about the book's condition</p>
              </div>
            </div>

            <div className="space-y-3 border-l-4 border-primary/30 pl-4 py-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Book Description</label>
              <textarea
                rows={6}
                placeholder="Describe the condition, highlight any marginalia, or explain the significance..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-6 py-5 bg-surface rounded-sm border-2 border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none font-body text-sm leading-relaxed"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleBack}
                className="flex-1 py-4 bg-surface text-on-surface rounded-sm font-bold uppercase tracking-widest text-xs border-2 border-outline-variant/50 hover:bg-surface-container-low transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-[2] py-4 bg-primary text-on-primary rounded-sm font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Add Book'}
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-16 flex flex-col items-center text-center relative z-10"
          >
            <div className="w-28 h-28 bg-surface border-4 border-secondary/20 rounded-full flex items-center justify-center text-secondary mb-8 shadow-inner">
              <CheckCircle2 size={56} strokeWidth={1} />
            </div>
            <h2 className="text-4xl font-headline font-bold text-on-surface mb-4 italic tracking-wide">Book Added!</h2>
            <p className="text-on-surface-variant max-w-sm mb-12 font-body text-lg leading-relaxed">
              <span className="font-bold text-on-surface font-headline italic">"{formData.title}"</span> has been added to the library.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={() => navigate('/library')}
                className="flex-1 py-4 bg-surface text-on-surface rounded-sm font-bold uppercase tracking-widest text-xs border border-outline-variant hover:bg-surface-container-high transition-all"
              >
                View My Books
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-4 bg-primary text-on-primary rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]"
              >
                Go to Home
              </button>
            </div>
          </motion.div>
        )}
        
        {/* Subtle decorative background texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\"20\\" height=\\"20\\" viewBox=\\"0 0 20 20\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cg fill=\\"%23000000\\" fill-opacity=\\"1\\" fill-rule=\\"evenodd\\"%3E%3Ccircle cx=\\"3\\" cy=\\"3\\" r=\\"3\\"/>%3Ccircle cx=\\"13\\" cy=\\"13\\" r=\\"3\\"/>%3C/g%3E%3C/svg%3E")' }} />
      </div>
    </div>
  );
};

export default AddBook;
