import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';
import { Camera, BookOpen, User, Tag, MapPin, Info, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { cn } from '../lib/utils';

const AddBook: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'Computer Science',
    location: 'Main Campus Library',
    description: '',
    coverUrl: 'https://picsum.photos/seed/book/800/1200'
  });

  const categories = ['Computer Science', 'History', 'Philosophy', 'Literature', 'Physics', 'Mathematics'];
  const locations = ['Main Campus Library', 'Engineering Block', 'Science Center', 'Arts Quad', 'Graduate Lounge'];

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would save the book here
    setStep(4); // Success step
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500">
      <SectionHeader
        title="Curate a New Book"
        subtitle="Share your academic treasures with the campus community."
      />

      {/* Progress Bar */}
      <div className="flex items-center gap-4 mb-12">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "h-2 flex-1 rounded-full transition-all duration-500",
              step >= s ? "bg-primary" : "bg-surface-container-highest"
            )}
          />
        ))}
      </div>

      <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/30 shadow-xl shadow-primary/5">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">Book Information</h3>
                <p className="text-sm text-on-surface-variant">Tell us what you're curating today.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
                  <BookOpen size={16} className="text-primary" />
                  Book Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Republic"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-6 py-4 bg-surface rounded-2xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
                  <User size={16} className="text-secondary" />
                  Author
                </label>
                <input
                  type="text"
                  placeholder="e.g. Plato"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-6 py-4 bg-surface rounded-2xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
                    <Tag size={16} className="text-tertiary" />
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-6 py-4 bg-surface rounded-2xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
                    <MapPin size={16} className="text-primary" />
                    Exchange Location
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-6 py-4 bg-surface rounded-2xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                  >
                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!formData.title || !formData.author}
              className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              Continue
              <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                <Camera size={24} />
              </div>
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">Book Cover</h3>
                <p className="text-sm text-on-surface-variant">Upload a clear photo of your book.</p>
              </div>
            </div>

            <div className="aspect-[3/4] max-w-xs mx-auto relative rounded-3xl overflow-hidden border-2 border-dashed border-outline-variant/50 group cursor-pointer hover:border-primary/50 transition-all">
              <img
                src={formData.coverUrl}
                alt="Preview"
                className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                <Camera size={48} className="mb-2" />
                <span className="font-bold">Change Photo</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleBack}
                className="flex-1 py-4 bg-surface text-on-surface rounded-2xl font-bold border border-outline-variant/30 hover:bg-surface-container-high transition-all"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-[2] py-4 bg-primary text-on-primary rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Continue
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                <Info size={24} />
              </div>
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">Final Details</h3>
                <p className="text-sm text-on-surface-variant">Add a note for potential borrowers.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface-variant">Curator's Note</label>
              <textarea
                rows={6}
                placeholder="Describe the condition, any marginalia, or why you're sharing this book..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-6 py-4 bg-surface rounded-2xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleBack}
                className="flex-1 py-4 bg-surface text-on-surface rounded-2xl font-bold border border-outline-variant/30 hover:bg-surface-container-high transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-[2] py-4 bg-primary text-on-primary rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Curate Book
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 bg-tertiary-container rounded-3xl flex items-center justify-center text-on-tertiary-container mb-8 shadow-xl shadow-tertiary/20">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-headline font-bold text-on-surface mb-4">Book Curated!</h2>
            <p className="text-on-surface-variant max-w-xs mb-12">
              Your book <span className="font-bold text-on-surface italic">"{formData.title}"</span> has been added to the campus collection.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={() => navigate('/library')}
                className="flex-1 py-4 bg-surface text-on-surface rounded-2xl font-bold border border-outline-variant/30 hover:bg-surface-container-high transition-all"
              >
                Go to Library
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-4 bg-primary text-on-primary rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AddBook;
