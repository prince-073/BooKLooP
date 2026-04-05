import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { apiGetBook, apiSendRequest, apiSaveBook, apiUnsaveBook, apiGetSavedBooks } from '../lib/api';
import { ArrowLeft, MapPin, User, Calendar, BookOpen, MessageSquare, Share2, Heart, ShieldCheck, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { getCurrentUser } from '../lib/auth';
import toast from 'react-hot-toast';

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requestDays, setRequestDays] = useState(7);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const currentUser = getCurrentUser();

  React.useEffect(() => {
    if (id) {
      apiGetBook(id).then(b => {
        setBook(b);
        if (currentUser) {
          apiGetSavedBooks().then(saved => {
            if (saved.some(s => s.id === b.id)) setIsLiked(true);
          });
        }
        setLoading(false);
      }).catch(e => {
        setLoading(false);
      });
    }
  }, [id]);

  const handleRequest = async () => {
    try {
      await apiSendRequest(book.id, requestDays);
      toast.success('Request sent!');
      setShowRequestModal(false);
    } catch(err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="py-20 text-center font-headline italic text-on-surface-variant text-lg">Retrieving manuscript details...</div>;

  if (!book) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <h2 className="text-3xl font-headline font-bold text-on-surface mb-4">Volume not found</h2>
        <p className="text-on-surface-variant font-body leading-relaxed mb-8">The text you're looking for doesn't exist or has been removed from the archives.</p>
        <Link to="/explore" className="px-8 py-3 bg-primary text-on-primary rounded-sm font-bold uppercase tracking-widest text-xs shadow-md">
          Return to Archives
        </Link>
      </div>
    );
  }

  const isOwner = currentUser?.id === book.ownerId;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-3 text-xs uppercase tracking-widest font-bold text-on-surface-variant hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Library
      </button>

      {/* Book Main Info */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Book Cover */}
        <div className="lg:col-span-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative aspect-[3/4] overflow-hidden shadow-xl border border-outline/50 rounded-sm bg-surface-container-lowest p-2"
          >
            <div className="w-full h-full relative overflow-hidden rounded-sm border border-outline-variant/30 flex perspective-1000">
               {book.coverBack ? (
                 <>
                   {/* Dual image view container */}
                   <div className="w-full h-full flex flex-row overflow-x-auto snap-x snap-mandatory hide-scrollbar">
                     <img
                       src={book.cover || book.coverUrl || 'https://picsum.photos/400/600'}
                       alt={book.title}
                       className="w-full h-full object-cover shrink-0 snap-center"
                       referrerPolicy="no-referrer"
                     />
                     <img
                       src={book.coverBack}
                       alt={`Back of ${book.title}`}
                       className="w-full h-full object-cover shrink-0 snap-center"
                       referrerPolicy="no-referrer"
                     />
                   </div>
                   <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-none">
                     <span className="w-1.5 h-1.5 rounded-full bg-primary/80"></span>
                     <span className="w-1.5 h-1.5 rounded-full bg-surface-variant/80"></span>
                   </div>
                 </>
               ) : (
                 <img
                   src={book.cover || book.coverUrl || 'https://picsum.photos/400/600'}
                   alt={book.title}
                   className="w-full h-full object-cover"
                   referrerPolicy="no-referrer"
                 />
               )}
            </div>
            <div className={cn(
              "absolute top-5 right-5 px-4 py-1.5 rounded-sm text-[10px] uppercase tracking-widest font-bold shadow-md border",
              book.status === 'available' ? "bg-tertiary-container text-on-tertiary-container border-tertiary/20" : "bg-error-container text-on-error-container border-error/20"
            )}>
              {book.status === 'available' ? 'Available' : 'Borrowed'}
            </div>
          </motion.div>

          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={async () => {
                try {
                  if (isLiked) {
                    await apiUnsaveBook(book.id);
                    setIsLiked(false);
                  } else {
                    await apiSaveBook(book.id);
                    setIsLiked(true);
                  }
                } catch(err: any) {
                  toast.error(err.message);
                }
              }}
              className={cn(
                "flex-1 py-3.5 rounded-sm font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all border",
                isLiked ? "bg-tertiary text-on-tertiary border-tertiary shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]" : "bg-surface-container text-on-surface hover:bg-surface-container-high border-outline-variant"
              )}
            >
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
              {isLiked ? 'Saved' : 'Save'}
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied to clipboard!");
              }}
              className="p-3.5 bg-surface-container rounded-sm text-on-surface hover:bg-surface-container-high transition-colors border border-outline-variant"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Book Details */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-4 py-1.5 bg-secondary/10 border border-secondary/20 text-secondary rounded-sm text-[10px] font-bold uppercase tracking-widest">
                {book.type || 'Novel'}
              </span>
              <span className="px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-sm text-[10px] font-bold uppercase tracking-widest">
                {book.subject || book.category}
              </span>
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-widest flex items-center gap-1.5 border-l-2 border-outline-variant/50 pl-3">
                <Calendar size={14} />
                Listed Date
              </span>
            </div>
            <h1 className="font-headline font-bold text-4xl md:text-5xl lg:text-6xl text-on-surface mb-3 leading-tight">
              {book.title}
            </h1>
            <p className="text-2xl text-primary italic font-headline opacity-90">
              by <span className="font-bold">{book.author}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <Link to={`/user/${book.ownerId}`}>
              <InfoBox icon={<User size={20} strokeWidth={1.5} />} label="Owner" value={book.owner?.name || 'Unknown'} />
            </Link>
            <InfoBox icon={<MapPin size={20} strokeWidth={1.5} />} label="Pickup Point" value={book.pickupPoint || 'Main Campus'} />
            <InfoBox icon={<BookOpen size={20} strokeWidth={1.5} />} label="Condition" value={book.condition || 'Good'} />
            <InfoBox icon={<ShieldCheck size={20} strokeWidth={1.5} />} label="Security" value="Verified Vault" />
          </div>

          <div className="mb-12 border-l-4 border-primary/30 pl-6 py-2">
            <h3 className="font-headline font-bold text-xl text-on-surface mb-4 tracking-wide uppercase text-sm">Owner's Note</h3>
            <p className="text-on-surface-variant/90 leading-relaxed font-body text-lg italic">
              "This is a pristine edition containing significant marginalia related to {book.category}. I'm happy to share it with fellow scholars who appreciate the depth of this work. Please maintain its integrity."
            </p>
          </div>

          <div className="mt-auto p-8 bg-surface-container-low rounded-sm border-2 border-outline-variant/50 shadow-inner">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <h4 className="font-headline font-bold text-xl text-on-surface mb-2 tracking-wide italic">Request Book</h4>
                <p className="text-sm text-on-surface-variant font-body">
                  Submit a formal request to {book.ownerName} to borrow this volume.
                </p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                {!isOwner && book.status === 'available' && (
                  <button 
                    onClick={() => setShowRequestModal(true)}
                    className="flex-1 md:flex-none px-8 py-4 bg-primary text-on-primary rounded-sm font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]"
                  >
                    Submit Request
                  </button>
                )}
                <Link to="/messages" className="p-4 bg-surface text-on-surface rounded-sm border border-outline-variant hover:border-primary/50 transition-colors shadow-sm flex items-center justify-center">
                  <MessageSquare size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
          <div className="bg-surface w-full max-w-md rounded-sm border border-outline-variant p-8 shadow-2xl relative">
            <button onClick={() => setShowRequestModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface">
               <X size={24} />
            </button>
            <h3 className="text-2xl font-headline font-bold text-on-surface mb-3 italic">Request Details</h3>
            <p className="text-on-surface-variant text-sm mb-6 font-body">Verify the duration for which you need to retain this volume before submitting to the curator.</p>
            <div className="mb-8 p-6 bg-surface-container-low rounded-sm border border-outline-variant">
               <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-3">Retention Period (Days)</label>
               <input type="number" min={1} max={30} value={requestDays} onChange={e => setRequestDays(parseInt(e.target.value)||1)} className="w-full px-5 py-4 bg-surface-container rounded-sm border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-headline text-xl" />
            </div>
            <button onClick={handleRequest} className="w-full py-4 bg-primary text-on-primary rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]">Submit Request</button>
          </div>
        </div>
      )}
    </div>
  );
};

interface InfoBoxProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({ icon, label, value }) => {
  return (
    <div className="p-5 bg-surface-container-lowest rounded-sm border border-outline-variant/40 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-80">{label}</span>
      </div>
      <span className="font-bold text-sm text-on-surface font-body truncate mt-1">{value}</span>
    </div>
  );
};

export default BookDetails;
