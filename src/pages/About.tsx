import React, { useEffect, useState } from 'react';
import { BookOpen, Users, Repeat, Star, Heart, Target, Eye, Lightbulb, GraduationCap, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiGetStats } from '../lib/api';

const STEPS = [
  {
    num: '01',
    title: 'Sign Up',
    desc: 'Apna college email se account banao. OTP verify karke instant access milta hai.',
    icon: GraduationCap,
    color: 'text-primary bg-primary/10 border-primary/20',
  },
  {
    num: '02',
    title: 'Browse Books',
    desc: 'Doosre students ke shared books explore karo. Genre, availability, author se filter karo.',
    icon: BookOpen,
    color: 'text-secondary bg-secondary/10 border-secondary/20',
  },
  {
    num: '03',
    title: 'Request to Borrow',
    desc: 'Pasand ki book pe request bhejo. Kitne din chahiye woh bhi bata sakte ho.',
    icon: Repeat,
    color: 'text-tertiary bg-tertiary/10 border-tertiary/20',
  },
  {
    num: '04',
    title: 'OTP Handover',
    desc: 'Owner approve kare toh physically milke OTP se secure handover karo.',
    icon: Star,
    color: 'text-primary bg-primary/10 border-primary/20',
  },
  {
    num: '05',
    title: 'Return & Rate',
    desc: 'Book padh ke return karo aur exchange experience rate karo.',
    icon: Heart,
    color: 'text-secondary bg-secondary/10 border-secondary/20',
  },
];

const STATS = [
  { label: 'Books Shared', key: 'books' as const, icon: BookOpen },
  { label: 'Students Connected', key: 'users' as const, icon: Users },
  { label: 'Successful Exchanges', key: 'exchanges' as const, icon: Repeat },
];

const TEAM = [
  {
    name: 'Kapil Delu',
    role: 'Co-Founder',
    email: 'kumarkapil9216@gmail.com',
    phone: '8059707500',
    initial: 'K',
    color: 'from-primary to-primary/60',
  },
];

export default function About() {
  const [stats, setStats] = useState<{ books: number; users: number; exchanges: number } | null>(null);

  useEffect(() => {
    apiGetStats().then(setStats).catch(() => {});
  }, []);

  function statValue(key: 'books' | 'users' | 'exchanges') {
    if (!stats) return '...';
    return stats[key];
  }
  return (
    <div className="min-h-screen bg-surface pb-16">

      {/* Hero */}
      <section className="relative overflow-hidden px-4 sm:px-8 py-16 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container/80 via-surface to-secondary-container/60 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-radial from-primary/10 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/60 backdrop-blur-md border border-primary/20 rounded-full text-primary text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
            <BookOpen className="w-4 h-4" />
            About BookLoop
          </div>
          <h1 className="font-headline font-extrabold text-5xl md:text-6xl lg:text-7xl text-on-surface mb-6 italic tracking-tight leading-tight">
            Knowledge Ko
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Ghoomne Do.
            </span>
          </h1>
          <p className="text-on-surface-variant font-body text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            BookLoop ek student-driven book-sharing platform hai jahan knowledge sirf ek shelf pe ruk nahi jaati — woh ghoomti rehti hai.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-20">

        {/* Stats */}
        <section>
          <div className="grid grid-cols-3 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center p-6 bg-surface-container-low rounded-2xl border border-primary/10">
                <s.icon className="w-6 h-6 text-primary mx-auto mb-3 opacity-60" />
                <div className="font-headline font-extrabold text-3xl text-on-surface mb-1">{statValue(s.key)}</div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-8">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-bold text-primary/70">Our</p>
                  <h2 className="font-headline font-bold text-2xl text-on-surface italic">Vision</h2>
                </div>
              </div>
              <p className="text-on-surface-variant leading-relaxed font-body text-base">
                Har student ke paas woh books hon jo unhein chahiye — chahe khareed sake ya na sake. Knowledge accessible, affordable aur community-driven ho.
              </p>
              <div className="mt-6 pt-6 border-t border-primary/15">
                <p className="text-sm font-bold text-on-surface font-headline italic">
                  "Ek aisi duniya jahan koi bhi kitaab ki kami se peeche na rahe."
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 p-8">
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-secondary/15 rounded-2xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-bold text-secondary/70">Our</p>
                  <h2 className="font-headline font-bold text-2xl text-on-surface italic">Mission</h2>
                </div>
              </div>
              <p className="text-on-surface-variant leading-relaxed font-body text-base">
                Students ke beech trust-based book sharing enable karna. Simple, secure aur community-first experience dena — ek book, ek request, ek handover at a time.
              </p>
              <div className="mt-6 pt-6 border-t border-secondary/15">
                <p className="text-sm font-bold text-on-surface font-headline italic">
                  "Community se bana, community ke liye."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-0.5 bg-primary" />
            <h2 className="font-headline font-bold text-3xl text-on-surface italic">Kaise Kaam Karta Hai?</h2>
          </div>
          <div className="space-y-4">
            {STEPS.map((step, idx) => (
              <div
                key={step.num}
                className="flex items-start gap-5 p-5 rounded-2xl border border-primary/10 bg-surface-container-low hover:border-primary/25 transition-all duration-300 group"
              >
                <div className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-headline font-black text-lg text-primary border border-primary/20 bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  {step.num}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <step.icon className="w-4 h-4 text-on-surface-variant" />
                    <h3 className="font-headline font-bold text-on-surface">{step.title}</h3>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{step.desc}</p>
                </div>
                {idx < STEPS.length - 1 && (
                  <span className="text-primary/20 text-2xl font-black shrink-0 self-center">→</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-0.5 bg-secondary" />
            <h2 className="font-headline font-bold text-3xl text-on-surface italic">Hamare Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Heart, title: 'Community First', desc: 'Har feature community ke benefit ke liye bana hai.', color: 'text-red-400' },
              { icon: Lightbulb, title: 'Simplicity', desc: 'Complex cheezein simple rakhna humara goal hai.', color: 'text-amber-400' },
              { icon: Star, title: 'Trust', desc: 'OTP verification se secure aur trustworthy exchanges.', color: 'text-primary' },
            ].map((v) => (
              <div key={v.title} className="p-6 text-center bg-surface-container-low rounded-2xl border border-primary/10">
                <v.icon className={`w-8 h-8 mx-auto mb-4 ${v.color}`} />
                <h3 className="font-headline font-bold text-on-surface mb-2">{v.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-0.5 bg-tertiary" />
            <h2 className="font-headline font-bold text-3xl text-on-surface italic">The Team</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="flex items-center gap-5 p-6 bg-surface-container-low rounded-2xl border border-primary/10 hover:border-primary/25 transition-all"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center font-headline font-black text-2xl text-white shrink-0 shadow-md`}>
                  {member.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline font-bold text-on-surface mb-0.5">{member.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-3">{member.role}</p>
                  <div className="flex flex-col gap-1">
                    <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary transition-colors">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </a>
                    <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary transition-colors">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      +91 {member.phone}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8 border-t border-primary/10">
          <h2 className="font-headline font-bold text-3xl text-on-surface mb-3 italic">Ab Shuru Karo!</h2>
          <p className="text-on-surface-variant mb-8 max-w-md mx-auto">Browse karo, share karo, aur community ka hissa bano.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/explore" className="px-8 py-4 bg-primary text-on-primary rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-md">
              Browse Books
            </Link>
            <Link to="/help" className="px-8 py-4 bg-surface-container border border-primary/20 text-on-surface rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-surface-container-high transition-all">
              Help & Support
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
