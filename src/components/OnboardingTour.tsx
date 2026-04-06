import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, BookOpen, Search, ArrowLeftRight, MessageCircle, Library, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

const TOUR_KEY = 'bookloop_tour_done';

const STEPS = [
  {
    title: 'BookLoop mein Swagat Hai! 📚',
    description: 'Yahan students apni books share karte hain. Tum bhi kisi ki book borrow kar sakte ho ya apni book doosron ko de sakte ho — bilkul free!',
    icon: BookOpen,
    color: 'from-primary/20 to-secondary/10',
    iconColor: 'text-primary',
    highlight: null,
    tip: 'Sidebar mein saare features accessible hain.',
  },
  {
    title: 'Books Browse Karo 🔍',
    description: '"Browse Books" section mein hazaron books available hain. Genre, type, ya availability se filter karo.',
    icon: Search,
    color: 'from-secondary/20 to-primary/10',
    iconColor: 'text-secondary',
    highlight: 'explore',
    tip: '"Novel", "Fiction" jaise quick filters use karo fast search ke liye.',
  },
  {
    title: 'Book Request Bhejo 📬',
    description: 'Koi book pasand aye? Book detail page pe jao aur "Request Book" button dabao. Owner approve karega.',
    icon: ArrowLeftRight,
    color: 'from-tertiary/20 to-primary/10',
    iconColor: 'text-tertiary',
    highlight: 'explore',
    tip: 'Kitne din chahiye woh bhi customize kar sakte ho.',
  },
  {
    title: 'Requests Track Karo ✅',
    description: '"Requests" page pe apni saari incoming aur outgoing requests dekhein. OTP se secure book handover/return karo.',
    icon: Library,
    color: 'from-primary/20 to-tertiary/10',
    iconColor: 'text-primary',
    highlight: 'requests',
    tip: 'Owner borrower ki profile inspect kar sakta hai "View Profile" se.',
  },
  {
    title: 'Chat Karo 💬',
    description: '"Messages" section mein directly borrow/lend partners se baat karo. Book exchange coordinate karo.',
    icon: MessageCircle,
    color: 'from-secondary/20 to-tertiary/10',
    iconColor: 'text-secondary',
    highlight: 'messages',
    tip: 'Attachments bhi bhej sakte ho — images aur documents.',
  },
  {
    title: 'Sab Set Hai! 🚀',
    description: 'Ab tum BookLoop use karne ke liye ready ho! Apni pehli book add karo ya koi book borrow karo. Community ka hissa bano!',
    icon: Zap,
    color: 'from-primary/20 to-secondary/20',
    iconColor: 'text-primary',
    highlight: null,
    tip: 'Help ke liye sidebar mein "Help & Support" section hai.',
  },
];

export function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      // Small delay so page loads first
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleDone();
    }
  }

  function handlePrev() {
    if (step > 0) setStep(step - 1);
  }

  function handleDone() {
    localStorage.setItem(TOUR_KEY, '1');
    setVisible(false);
    setDismissed(true);
  }

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={cn(
        "w-full max-w-md bg-surface rounded-3xl shadow-2xl border border-primary/20 overflow-hidden animate-in slide-in-from-bottom-8 duration-500",
      )}>
        {/* Progress bar */}
        <div className="h-1 bg-surface-container">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className={cn("p-6 bg-gradient-to-br", current.color)}>
          <div className="flex items-start justify-between mb-6">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center bg-surface/60 backdrop-blur-sm border border-white/20 shadow-sm"
            )}>
              <Icon className={cn("w-7 h-7", current.iconColor)} />
            </div>
            <button
              onClick={handleDone}
              className="w-8 h-8 rounded-full bg-surface/60 flex items-center justify-center text-on-surface-variant hover:bg-surface/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h2 className="font-headline font-bold text-2xl text-on-surface mb-3 leading-snug">
            {current.title}
          </h2>
          <p className="font-body text-on-surface-variant leading-relaxed mb-4">
            {current.description}
          </p>

          {/* Tip */}
          <div className="p-3 bg-surface/50 backdrop-blur-sm rounded-xl border border-white/20">
            <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">💡 Tip</p>
            <p className="text-xs text-on-surface leading-relaxed">{current.tip}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 flex items-center justify-between bg-surface">
          {/* Step indicators */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === step
                    ? "w-6 h-2 bg-primary"
                    : i < step
                    ? "w-2 h-2 bg-primary/40"
                    : "w-2 h-2 bg-surface-container-high"
                )}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors uppercase tracking-widest"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-sm"
            >
              {step === STEPS.length - 1 ? (
                <>Let's Go! <Zap className="w-3.5 h-3.5" /></>
              ) : (
                <>Next <ChevronRight className="w-3.5 h-3.5" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
