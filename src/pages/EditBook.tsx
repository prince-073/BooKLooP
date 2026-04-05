import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import SectionHeader from '../components/SectionHeader';
import { Camera, BookOpen, User, Tag, MapPin, Info, CheckCircle2, ArrowRight, X, Compass } from 'lucide-react';
import { cn } from '../lib/utils';
import { apiGetBook, apiEditBook } from '../lib/api';

const EditBook: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    type: 'Fiction',
    language: 'English',
    genre: 'Romance',
    pickupPoint: 'Main Campus',
    description: '',
    coverUrl: 'https://picsum.photos/seed/book1/800/1200',
    coverBackUrl: 'https://picsum.photos/seed/book2/800/1200',
    available: true,
  });

  const bookTypes = [
    'Fiction', 'Non-Fiction', 'Novel', 'Short Story Collection', 'Novella', 'Poetry Book', 'Drama / Play',
    'Academic / Textbook', 'Reference Book', 'Self-Help Book', 'Biography',
    'Autobiography', 'Memoir', 'Comic Book', 'Graphic Novel', 'Manga',
    'Magazine', 'Journal / Diary', 'Workbook / Practice Book'
  ];

  const languages = ['English', 'Hindi', 'Regional', 'Other'];

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

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setInitialLoading(true);
    apiGetBook(id)
      .then(book => {
        setFormData({
          title: book.title || '',
          author: book.author || '',
          type: book.category?.includes('Fiction') ? book.category : 'Fiction',
          language: book.language || 'English',
          genre: book.subject || 'Romance',
          pickupPoint: book.pickupPoint || 'Main Campus',
          description: book.abstract || '',
          coverUrl: book.image || 'https://picsum.photos/seed/book1/800/1200',
          coverBackUrl: book.imageBack || 'https://picsum.photos/seed/book2/800/1200',
          available: book.status === 'available',
        });
      })
      .catch(err => {
        toast.error("Failed to load book details");
        console.error(err);
      })
      .finally(() => setInitialLoading(false));
  }, [id]);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    try {
      await apiEditBook(id, {
        title: formData.title,
        author: formData.author,
        type: formData.type,
        subject: formData.genre,
        pickupPoint: formData.pickupPoint,
        language: formData.language,
        abstract: formData.description,
        available: formData.available,
      });
      setStep(4);
      toast.success("Book updated successfully!");
    } catch(err) {
      toast.error("Failed to update book: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center py-20 text-on-surface-variant">
         <Compass size={40} className="animate-spin mb-4 opacity-20" />
         <p className="font-headline italic text-lg tracking-wide">Loading book details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-700">
      <SectionHeader
        title="Edit Book Details"
        subtitle="Update the information for this volume."
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
                <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mt-1">Update the basic information of the book</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between bg-surface-container-low p-4 rounded-sm border border-outline-variant">
                <div>
                   <h4 className="font-headline font-bold text-on-surface text-lg">Availability Status</h4>
                   <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Is this book currently available for others?</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.available} onChange={(e) => setFormData({...formData, available: e.target.checked})} />
                  <div className="w-11 h-6 bg-outline-variant/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
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
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                    <Tag size={14} className="text-secondary" />
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-6 py-4 bg-surface rounded-sm border-2 border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none font-body text-sm"
                  >
                    {languages.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!formData.title || !formData.author}
              className="mt-10 w-full py-4 bg-primary text-on-primary rounded-sm font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]"
            >
              Next: Photos
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
                <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mt-1">Photos cannot be changed for transparency.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Front Cover */}
              <div className="aspect-[3/4] w-full relative rounded-sm overflow-hidden border-2 border-outline-variant/50 bg-surface">
                <img
                  src={formData.coverUrl}
                  alt="Front Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-sm uppercase tracking-widest">Current Front</div>
              </div>

              {/* Back Cover */}
              <div className="aspect-[3/4] w-full relative rounded-sm overflow-hidden border-2 border-outline-variant/50 bg-surface">
                <img
                  src={formData.coverBackUrl}
                  alt="Back Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-sm uppercase tracking-widest">Current Back</div>
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
                Next: Edit Description
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
                <h3 className="font-headline font-bold text-2xl text-on-surface italic tracking-wide">Owner's Note</h3>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mt-1">Tell others about the book's condition</p>
              </div>
            </div>

            <div className="space-y-3 border-l-4 border-primary/30 pl-4 py-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Owner's Note</label>
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
                {loading ? 'Saving...' : 'Update Details'}
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
            <h2 className="text-4xl font-headline font-bold text-on-surface mb-4 italic tracking-wide">Book Updated!</h2>
            <p className="text-on-surface-variant max-w-sm mb-12 font-body text-lg leading-relaxed">
              <span className="font-bold text-on-surface font-headline italic">"{formData.title}"</span> has been successfully updated.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={() => navigate(`/book/${id}`)}
                className="flex-1 py-4 bg-surface text-on-surface rounded-sm font-bold uppercase tracking-widest text-xs border border-outline-variant hover:bg-surface-container-high transition-all"
              >
                View Book
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

export default EditBook;
