import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, XCircle, Search, CalendarDays, KeyRound, X, Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  apiAcceptRequest, apiCancelRequest, apiCompleteRequest, 
  apiGetUserRequests, apiRejectRequest, 
  apiModifyRequest, apiRequestReturnOtp, apiVerifyReturnOtp,
  apiRequestHandoverOtp, apiVerifyHandoverOtp, apiNudgeReturn,
  apiSubmitRating
} from '../lib/api';
import { Link } from 'react-router-dom';
import { getAvatarUrl } from '../lib/media';

type RequestItem = {
  id: string;
  title: string;
  user: string;
  status: 'pending' | 'accepted' | 'rejected' | 'pending_out' | 'completed';
  image: string;
  isOutgoing: boolean;
  daysRequested?: number;
  hasRating?: boolean;
  isHandedOver?: boolean;
  ownerRequestedReturn?: boolean;
};

export function Requests() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  // Modals state
  const [modifyModalOpen, setModifyModalOpen] = useState(false);
  const [modifyId, setModifyId] = useState('');
  const [modifyDays, setModifyDays] = useState(7);

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpId, setOtpId] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpType, setOtpType] = useState<'handover' | 'return'>('return');

  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [rateId, setRateId] = useState('');
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetUserRequests();
      setRequests(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const incoming = useMemo(() => requests.filter((r) => !r.isOutgoing), [requests]);
  const outgoing = useMemo(() => requests.filter((r) => r.isOutgoing), [requests]);

  async function onAccept(id: string) {
    setActingId(id);
    try {
      await apiAcceptRequest(id);
      await load();
      toast.success('Request accepted! Arrange to handover the book.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to accept');
    } finally {
      setActingId(null);
    }
  }

  async function onReject(id: string) {
    setActingId(id);
    try {
      await apiRejectRequest(id);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to reject');
    } finally {
      setActingId(null);
    }
  }

  async function onCancel(id: string) {
    setActingId(id);
    try {
      await apiCancelRequest(id);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to cancel');
    } finally {
      setActingId(null);
    }
  }

  // Modify Flow
  function openModify(id: string, days: number) {
    setModifyId(id);
    setModifyDays(days);
    setModifyModalOpen(true);
  }

  async function handleModify() {
    setLoading(true);
    try {
      await apiModifyRequest(modifyId, modifyDays);
      setModifyModalOpen(false);
      await load();
      toast.success('Request modified successfully');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  // OTP Flow
  function openOtp(id: string, type: 'handover' | 'return') {
    setOtpId(id);
    setOtpValue('');
    setOtpType(type);
    setOtpModalOpen(true);
  }

  async function handleRequestOtp() {
    try {
      let res;
      if (otpType === 'return') {
        res = await apiRequestReturnOtp(otpId);
      } else {
        res = await apiRequestHandoverOtp(otpId);
      }
      toast.success(res.message || 'Authorization code sent!');
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleVerifyOtp() {
    setLoading(true);
    try {
      if (otpType === 'return') {
        await apiVerifyReturnOtp(otpId, otpValue);
        toast.success('Return verified successfully!');
      } else {
        await apiVerifyHandoverOtp(otpId, otpValue);
        toast.success('Handover complete! The user now has your book.');
      }
      setOtpModalOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleNudge(id: string) {
    setActingId(id);
    try {
      await apiNudgeReturn(id);
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActingId(null);
    }
  }

  function openRate(id: string) {
    setRateId(id);
    setRatingScore(5);
    setRatingComment('');
    setRateModalOpen(true);
  }

  async function handleSubmitRating() {
    setLoading(true);
    try {
      await apiSubmitRating({ requestId: rateId, score: ratingScore, comment: ratingComment });
      setRateModalOpen(false);
      await load();
      toast.success('Review submitted successfully!');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 md:py-12 relative animate-in fade-in duration-700 space-y-12">
      <header className="border-b-2 border-outline-variant/30 pb-6 flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-headline font-bold text-on-surface mb-2 tracking-wide italic">Requests</h2>
          <p className="text-on-surface-variant font-body text-sm uppercase tracking-widest font-bold">Manage books you are borrowing or lending.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Lending</h3>
            <span className="px-3 py-1 bg-primary-container text-on-primary-container text-[10px] font-bold rounded-sm border border-primary/20">{incoming.filter((r) => r.status === 'pending').length} Pending</span>
          </div>
          {loading && requests.length === 0 ? (
            <p className="text-on-surface-variant text-sm border-2 border-dashed border-outline-variant/50 p-6 rounded-sm text-center font-headline italic">Loading requests...</p>
          ) : (
            incoming.map((item) => (
              <RequestCard
                key={item.id}
                {...item}
                onAccept={() => onAccept(item.id)}
                onReject={() => onReject(item.id)}
                onModify={() => openModify(item.id, item.daysRequested || 7)}
                onRate={() => openRate(item.id)}
                onHandoverOtp={() => openOtp(item.id, 'handover')}
                onNudge={() => handleNudge(item.id)}
                acting={actingId === item.id}
              />
            ))
          )}
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Borrowing</h3>
            <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-sm border border-secondary/20">{outgoing.length} Active</span>
          </div>
          {loading && requests.length === 0 ? (
            <p className="text-on-surface-variant text-sm border-2 border-dashed border-outline-variant/50 p-6 rounded-sm text-center font-headline italic">Loading requests...</p>
          ) : (
            outgoing.map((item) => (
              <RequestCard
                key={item.id}
                {...item}
                onCancel={() => onCancel(item.id)}
                onReturnOtp={() => openOtp(item.id, 'return')}
                acting={actingId === item.id}
              />
            ))
          )}
        </section>
      </div>

      {error && <p className="text-error font-body font-bold text-sm mt-6 p-4 bg-error-container border border-error-container rounded-sm">{error}</p>}

      {incoming.length === 0 && outgoing.length === 0 && !loading && (
        <div className="mt-12 p-8 md:p-16 border-2 border-dashed border-outline-variant/50 rounded-sm flex flex-col items-center text-center bg-surface-container-lowest">
          <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-6 border border-outline-variant">
            <Search className="w-8 h-8 text-on-surface-variant/30" />
          </div>
          <h5 className="text-2xl font-headline font-bold text-on-surface mb-3 italic">Start borrowing books</h5>
          <p className="text-on-surface-variant max-w-sm text-sm mb-8 font-body leading-relaxed">Your list of incoming and outgoing requests will appear here.</p>
          <Link to="/explore" className="px-8 py-4 bg-primary text-on-primary rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-sm">Explore Archives</Link>
        </div>
      )}

      {/* Modify Modal */}
      {modifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-sm rounded-sm p-8 shadow-2xl relative border border-outline-variant">
            <button onClick={() => setModifyModalOpen(false)} className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-headline font-bold text-on-surface mb-6 flex items-center gap-3 italic">
              <CalendarDays className="text-primary" size={24} />
              Modify Duration
            </h3>
            <div className="mb-8 p-6 bg-surface-container-low border border-outline-variant rounded-sm">
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-3 block">New Retention Period (Days)</label>
              <input 
                type="number" 
                min={1} 
                max={30} 
                value={modifyDays} 
                onChange={e => setModifyDays(parseInt(e.target.value) || 1)} 
                className="w-full px-4 py-3 bg-surface rounded-sm border border-outline-variant text-on-surface focus:outline-none focus:border-primary text-xl font-headline" 
              />
            </div>
            <button 
              onClick={handleModify} 
              disabled={loading}
              className="w-full py-4 bg-primary text-on-primary rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Apply Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Return OTP Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-sm rounded-sm p-8 shadow-2xl relative border border-outline-variant">
            <button onClick={() => setOtpModalOpen(false)} className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-headline font-bold text-on-surface mb-4 flex items-center gap-3 italic">
               <KeyRound className="text-primary" size={24} />
               Verify Return
            </h3>
            <p className="text-sm font-body text-on-surface-variant mb-6 leading-relaxed">
              To officially record this return, <strong className="text-on-surface font-headline italic">Request Authorization Code</strong>. The owner will provide a code for verification.
            </p>
            
            <button 
              onClick={handleRequestOtp} 
              className="w-full py-4 mb-6 bg-surface-container text-on-surface border border-outline-variant rounded-sm font-bold uppercase tracking-widest text-[10px] hover:bg-surface-container-high hover:border-primary transition-all font-body"
            >
              Request Authorization Code
            </button>

            <div className="mb-8 border-t-2 border-outline-variant/30 pt-6">
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-3 block">Enter Code</label>
              <input 
                type="text" 
                placeholder="e.g. A1B2C3"
                value={otpValue} 
                onChange={e => setOtpValue(e.target.value)} 
                className="w-full px-5 py-4 text-center tracking-[0.3em] font-headline text-2xl bg-surface-container-lowest rounded-sm border border-outline-variant text-on-surface focus:outline-none focus:border-primary/50 uppercase" 
              />
            </div>
            <button 
              onClick={handleVerifyOtp} 
              disabled={loading || !otpValue}
              className="w-full py-4 bg-primary text-on-primary rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Submit'}
            </button>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {rateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-sm rounded-sm p-8 shadow-2xl relative border border-outline-variant">
            <button onClick={() => setRateModalOpen(false)} className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-headline font-bold text-on-surface mb-6 flex items-center gap-3 italic">
               <Star className="text-secondary" size={24} />
               Assess Exchange
            </h3>
            
            <div className="mb-6 bg-surface-container-low p-6 rounded-sm border border-outline-variant">
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-4 block text-center">Score (1-5)</label>
              <div className="flex gap-3 justify-center">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setRatingScore(s)} className={`w-12 h-12 rounded-full flex items-center justify-center font-headline text-xl transition-all border ${ratingScore >= s ? 'bg-secondary text-on-secondary border-secondary shadow-sm' : 'bg-surface-container text-on-surface-variant border-outline-variant'}`}>{s}</button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 block">Write a Review (Optional)</label>
              <textarea 
                rows={3} 
                value={ratingComment} 
                onChange={e => setRatingComment(e.target.value)} 
                placeholder="How was the exchange?"
                className="w-full px-5 py-4 bg-surface-container rounded-sm border border-outline-variant text-on-surface focus:outline-none focus:border-primary font-body text-sm resize-none" 
              />
            </div>
            
            <button 
              onClick={handleSubmitRating} 
              disabled={loading || !ratingScore}
              className="w-full py-4 bg-primary text-on-primary rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RequestCard({
  title, user, id, status, image, isOutgoing, daysRequested, hasRating, isHandedOver, ownerRequestedReturn,
  onAccept, onReject, onModify, onCancel, onReturnOtp, onHandoverOtp, onNudge, onRate, acting,
}: {
  title: string; user: string; id: string; status: string; image: string; isOutgoing: boolean; daysRequested?: number; hasRating?: boolean; isHandedOver?: boolean; ownerRequestedReturn?: boolean;
  onAccept?: () => void; onReject?: () => void; onModify?: () => void; onCancel?: () => void; onComplete?: () => void; onReturnOtp?: () => void; onHandoverOtp?: () => void; onNudge?: () => void; onRate?: () => void; acting: boolean;
}) {
  return (
    <div className="group bg-surface-container-lowest p-5 rounded-sm transition-all duration-300 hover:border-primary/50 border border-outline-variant/50 shadow-sm flex flex-col sm:flex-row gap-5">
      <div className="relative w-full sm:w-28 aspect-[3/4] sm:aspect-auto sm:h-36 shrink-0 rounded-sm overflow-hidden bg-surface-container border border-outline-variant/30">
        <img src={image} alt={title} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
      </div>
      <div className="flex flex-col justify-between flex-grow py-1">
        <div>
          <div className="flex justify-between items-start mb-2 gap-4">
            <h4 className="text-xl font-headline font-bold text-on-surface leading-snug">{title}</h4>
            <div className="shrink-0 mt-1">
              {status === 'accepted' && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-secondary-container bg-secondary-container px-2 py-0.5 rounded-sm border border-secondary/20 uppercase tracking-widest">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                </div>
              )}
              {status === 'rejected' && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-error-container bg-error-container px-2 py-0.5 rounded-sm border border-error/20 uppercase tracking-widest">
                  <XCircle className="w-3.5 h-3.5" /> Rejected
                </div>
              )}
              {status === 'completed' && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-tertiary-container bg-tertiary-container px-2 py-0.5 rounded-sm border border-tertiary/20 uppercase tracking-widest">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Filed
                </div>
              )}
              {(status === 'pending_out' || status === 'pending') && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 border border-primary/20 rounded-sm uppercase tracking-widest animate-pulse">
                  <Clock className="w-3.5 h-3.5" /> Pending
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <img
              src={getAvatarUrl({ name: user })}
              alt={user}
              className="w-6 h-6 rounded-full border border-outline"
            />
            <span className="text-sm font-body text-on-surface-variant italic">
              {isOutgoing ? 'Owner:' : 'Borrower:'} <span className="text-on-surface font-bold font-headline not-italic">{user}</span>
            </span>
          </div>
          {daysRequested && (
            <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface mb-5 bg-surface-container border border-outline-variant w-fit px-3 py-1 rounded-sm shadow-inner">
              Retention: {daysRequested} Days
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3 mt-auto">
          {!isOutgoing && status === 'pending' && (
            <>
              <button
                onClick={onAccept}
                disabled={acting}
                className="flex-1 py-2.5 px-3 bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest rounded-sm transition-transform active:scale-[0.98] hover:bg-primary/90 disabled:opacity-50 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]"
              >
                Approve
              </button>
              <button
                onClick={onModify}
                disabled={acting}
                className="flex-1 py-2.5 px-3 bg-surface border border-outline-variant text-on-surface text-[10px] font-bold uppercase tracking-widest rounded-sm hover:border-primary transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Negotiate
              </button>
              <button
                onClick={onReject}
                disabled={acting}
                className="flex-1 py-2.5 px-3 bg-surface border border-outline-variant text-on-surface text-[10px] font-bold uppercase tracking-widest rounded-sm hover:border-error hover:text-error transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Decline
              </button>
            </>
          )}

          {isOutgoing && status === 'pending_out' && (
            <button
              onClick={onCancel}
              disabled={acting}
              className="w-full py-3 bg-surface border border-outline-variant text-on-surface text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-surface-container hover:border-primary transition-all disabled:opacity-50"
            >
              Cancel Request
            </button>
          )}

          {/* OWNER SIDE: Accepted & Not Handed Over -> Init Handover */}
          {!isOutgoing && status === 'accepted' && !isHandedOver && onHandoverOtp && (
            <button
              onClick={onHandoverOtp}
              disabled={acting}
              className="w-full py-3 bg-secondary text-on-secondary text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-secondary/90 transition-all disabled:opacity-50 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
            >
               <KeyRound size={14} /> Provide Book (Handover OTP)
            </button>
          )}

          {/* OWNER SIDE: Accepted & Handed Over -> Wait for Return / Nudge */}
          {!isOutgoing && status === 'accepted' && isHandedOver && (
            <div className="w-full flex gap-2">
              <div className="flex-1 py-2.5 text-center text-on-surface-variant text-[10px] font-bold uppercase tracking-widest rounded-sm border-2 border-dashed border-outline-variant/50 bg-surface-container-lowest flex items-center justify-center">
                Waiting for Return
              </div>
              {!ownerRequestedReturn && onNudge && (
                <button
                  onClick={onNudge}
                  disabled={acting}
                  className="px-4 py-2 bg-surface border border-outline-variant text-[10px] text-on-surface font-bold uppercase tracking-widest rounded-sm hover:border-primary transition-all active:scale-[0.98] disabled:opacity-50 shrink-0"
                >
                  Nudge
                </button>
              )}
            </div>
          )}

          {/* BORROWER SIDE: Accepted & Not Handed Over -> Waiting */}
          {isOutgoing && status === 'accepted' && !isHandedOver && (
             <div className="w-full py-2.5 text-center text-on-surface-variant text-[10px] font-bold uppercase tracking-widest rounded-sm border-2 border-dashed border-outline-variant/50 bg-surface-container-lowest">
               Waiting for Physical Handover
             </div>
          )}

          {/* BORROWER SIDE: Accepted & Handed Over -> Init Return */}
          {isOutgoing && status === 'accepted' && isHandedOver && onReturnOtp && (
            <div className="w-full flex flex-col gap-2">
              {ownerRequestedReturn && (
                <span className="text-[10px] font-bold text-error uppercase tracking-widest text-center italic">The owner nudged you to return this!</span>
              )}
              <button
                onClick={onReturnOtp}
                disabled={acting}
                className="w-full py-3 bg-tertiary text-on-tertiary text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-tertiary/90 transition-all disabled:opacity-50 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
              >
                 <KeyRound size={14} /> Return Book (Return OTP)
              </button>
            </div>
          )}

          {!isOutgoing && status === 'completed' && !hasRating && (
            <button
              onClick={onRate}
              disabled={acting}
              className="w-full py-3 bg-secondary text-on-secondary text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-secondary/90 transition-all disabled:opacity-50 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
            >
              <Star size={14} /> Rate Borrower
            </button>
          )}

          {!isOutgoing && status === 'completed' && hasRating && (
            <div className="w-full py-2.5 border border-outline-variant/50 text-on-surface-variant text-[10px] font-bold uppercase tracking-widest rounded-sm text-center bg-surface-container-low shadow-inner">
              Reviewed
            </div>
          )}

          {isOutgoing && status === 'completed' && (
            <div className="w-full py-2.5 border border-outline-variant/50 text-on-surface-variant text-[10px] font-bold uppercase tracking-widest rounded-sm text-center bg-surface shadow-inner">
              Returned
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
