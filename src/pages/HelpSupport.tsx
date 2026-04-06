import React, { useState } from 'react';
import {
  Phone, Mail, MessageCircle, ChevronDown, ChevronUp,
  BookOpen, ArrowLeftRight, KeyRound, Star, Library,
  HelpCircle, LifeBuoy, Zap, Clock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const CONTACTS = [
  {
    name: 'Prince (Developer)',
    email: 'princee0391@gmail.com',
    phone: '9813517107',
    role: 'App Development & Technical Support',
    color: 'from-primary/20 to-secondary/10',
    border: 'border-primary/20',
  },
  {
    name: 'Kapil Kumar',
    email: 'kumarkapil9216@gmail.com',
    phone: '8059707500',
    role: 'Operations & Community Support',
    color: 'from-secondary/20 to-tertiary/10',
    border: 'border-secondary/20',
  },
];

const FAQS = [
  {
    q: 'BookLoop kaise use karte hain?',
    a: 'BookLoop ek book-sharing platform hai. Pehle apna account banao, phir books add karo ya doosron ki books browse karo. Koi book pasand aye to uske liye request bhejo. Owner approve karega, phir OTP ke through physical handover hoga.',
    icon: BookOpen,
  },
  {
    q: 'Book request kaise bhejein?',
    a: 'Browse Books mein koi bhi available book dekhein aur us par click karein. Book detail page pe "Request Book" button hoga. Click karein, kitne din chahiye woh select karein, aur request bhej dein.',
    icon: ArrowLeftRight,
  },
  {
    q: 'OTP verification kya hota hai?',
    a: 'Jab owner request approve kar de, aur aap physically mil ke book exchange karein, tab OTP use hota hai. Owner handover OTP generate karta hai, borrower verify karta hai. Return ke waqt borrower OTP request karta hai aur owner verify karta hai. Yeh ensure karta hai ki exchange actually hua.',
    icon: KeyRound,
  },
  {
    q: 'Agar owner request reject kar de toh?',
    a: 'Agar request reject ho jaye, aap doosri book ke liye try kar sakte hain. Aap "Negotiate" button se duration change karne ki request bhi de sakte hain.',
    icon: HelpCircle,
  },
  {
    q: 'Book return kaise karein?',
    a: 'Requests page pe apni active books mein "Return Book (OTP)" button click karein. OTP generate hoga jo owner ko milega. Owner verify karega aur book return complete ho jayegi.',
    icon: ArrowLeftRight,
  },
  {
    q: 'Rating kaise dein?',
    a: 'Jab book return complete ho jaye, owner ke Requests page pe "Rate Borrower" option aata hai. 1-5 stars aur optional review likhein.',
    icon: Star,
  },
  {
    q: 'Apni books kaise add karein?',
    a: 'Sidebar mein "Add Book" option hai ya Browse Books page pe "List a Book" button hai. 3 simple steps mein apni book add kar sakte hain — details, photo, aur description.',
    icon: Library,
  },
  {
    q: 'Chat kaise karte hain kisi se?',
    a: 'Messages section mein conversations hoti hain. Jab bhi aap kisi se book exchange karte hain, ek conversation automatically ban jaata hai. Wahan directly baat kar sakte hain.',
    icon: MessageCircle,
  },
];

const FEATURES = [
  { icon: BookOpen, title: 'Book Listing', desc: 'Apni books list karein doosron ke liye' },
  { icon: ArrowLeftRight, title: 'Smart Requests', desc: 'Duration negotiate karo with owners' },
  { icon: KeyRound, title: 'OTP Exchange', desc: 'Secure physical handover verification' },
  { icon: MessageCircle, title: 'Real-time Chat', desc: 'Direct messaging with borrowers/lenders' },
  { icon: Star, title: 'Rating System', desc: 'Community trust ke liye ratings' },
  { icon: Clock, title: 'Return Tracking', desc: 'Due dates aur nudge system' },
];

export default function HelpSupport() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-surface pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 sm:px-8 py-16 md:py-24 mb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container via-surface to-secondary-container opacity-60 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <LifeBuoy className="w-4 h-4" />
            Help & Support
          </div>
          <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-on-surface mb-4 italic tracking-tight">
            Kaise Madad Kar Saktein Hain?
          </h1>
          <p className="text-on-surface-variant font-body text-lg leading-relaxed max-w-xl mx-auto">
            Koi bhi sawaal ho, humse directly contact karein ya neeche FAQs check karein.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-16">

        {/* Contact Cards */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-0.5 bg-primary" />
            <h2 className="font-headline font-bold text-2xl text-on-surface italic">Direct Contact</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CONTACTS.map((contact) => (
              <div
                key={contact.email}
                className={cn(
                  "relative overflow-hidden rounded-2xl border p-6 bg-gradient-to-br",
                  contact.color,
                  contact.border
                )}
              >
                <div className="absolute top-4 right-4 opacity-10">
                  <LifeBuoy className="w-20 h-20 text-primary" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-headline font-bold text-xl text-on-surface mb-1">{contact.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-5">{contact.role}</p>

                  <div className="space-y-3">
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-3 p-3 bg-surface/60 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-surface/80 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition-colors">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant">Email</p>
                        <p className="text-sm font-semibold text-on-surface">{contact.email}</p>
                      </div>
                    </a>

                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-3 p-3 bg-surface/60 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-surface/80 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-full bg-secondary/15 flex items-center justify-center shrink-0 group-hover:bg-secondary/25 transition-colors">
                        <Phone className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant">Phone / WhatsApp</p>
                        <p className="text-sm font-semibold text-on-surface">+91 {contact.phone}</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Overview */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-0.5 bg-secondary" />
            <h2 className="font-headline font-bold text-2xl text-on-surface italic">App Features</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-4 bg-surface-container-low rounded-2xl border border-primary/10 hover:border-primary/30 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-headline font-bold text-sm text-on-surface mb-1">{f.title}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Onboarding tour CTA */}
        <section>
          <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-primary/20 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Zap className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-headline font-bold text-lg text-on-surface mb-1">Guided App Tour</h3>
              <p className="text-sm text-on-surface-variant">Pehli baar use kar rahe ho? Hamare step-by-step tour se app seekho interactively!</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('bookloop_tour_done');
                window.location.href = '/';
              }}
              className="shrink-0 px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-sm"
            >
              Start Tour
            </button>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-0.5 bg-tertiary" />
            <h2 className="font-headline font-bold text-2xl text-on-surface italic">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className={cn(
                  "rounded-2xl border transition-all duration-300 overflow-hidden",
                  openFaq === idx
                    ? "border-primary/30 bg-surface-container"
                    : "border-primary/10 bg-surface-container-low hover:border-primary/20"
                )}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                      openFaq === idx ? "bg-primary/20" : "bg-surface-container-high"
                    )}>
                      <faq.icon className={cn("w-4 h-4", openFaq === idx ? "text-primary" : "text-on-surface-variant")} />
                    </div>
                    <span className="font-headline font-semibold text-sm text-on-surface">{faq.q}</span>
                  </div>
                  {openFaq === idx
                    ? <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-on-surface-variant shrink-0" />
                  }
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pl-16">
                    <p className="text-sm text-on-surface-variant leading-relaxed font-body">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center py-8">
          <p className="text-on-surface-variant text-sm mb-4">Abhi bhi help chahiye?</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="mailto:princee0391@gmail.com"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-sm"
            >
              <Mail className="w-4 h-4" />
              Email Us
            </a>
            <Link
              to="/about"
              className="flex items-center gap-2 px-6 py-3 bg-surface-container border border-primary/20 text-on-surface rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-surface-container-high transition-all"
            >
              About BookLoop
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
