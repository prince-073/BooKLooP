/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, Book, PenTool, Landmark, ArrowRight } from 'lucide-react';

type AuthView = 'login' | 'register';

export default function App() {
  const [view, setView] = useState<AuthView>('register');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 md:px-12 flex justify-between items-center bg-transparent z-10">
        <div className="text-2xl font-serif font-bold tracking-tight text-brand-green">
          BookLoop
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-brand-green transition-colors">Catalog</a>
          <a href="#" className="hover:text-brand-green transition-colors">The Archive</a>
          <a href="#" className="hover:text-brand-green transition-colors">Journal</a>
          <button className="text-gray-400 hover:text-brand-green transition-colors">
            <HelpCircle size={20} />
          </button>
        </nav>
        <div className="md:hidden">
          <HelpCircle size={20} className="text-gray-400" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background Decorative Element (Subtle Gradient/Blur) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-gold/5 rounded-full blur-3xl -z-10" />
        
        {/* Hero Text */}
        <div className="text-center mb-10 max-w-2xl">
          <AnimatePresence mode="wait">
            {view === 'register' ? (
              <motion.div
                key="register-hero"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-4xl md:text-6xl font-serif text-brand-green leading-tight mb-4">
                  Join the Curator's <br />
                  <span className="italic text-brand-gold">Circle</span>
                </h1>
                <p className="text-gray-600 text-lg md:text-xl font-light">
                  Your gateway to a shared scholarly archive of <br className="hidden md:block" />
                  wisdom and literature.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="login-hero"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-4xl md:text-6xl font-serif text-brand-green leading-tight mb-4">
                  Welcome Back
                </h1>
                <p className="text-gray-600 text-lg md:text-xl font-light">
                  Continue your curated literary journey.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Auth Card */}
        <motion.div 
          layout
          className="w-full max-w-md bg-white rounded-lg auth-card-shadow p-8 md:p-10 relative z-10"
        >
          {/* Tabs */}
          <div className="flex border-b border-gray-100 mb-8">
            <button
              onClick={() => setView('login')}
              className={`flex-1 pb-4 text-xs font-bold tracking-widest transition-all relative ${
                view === 'login' ? 'text-brand-green' : 'text-gray-300 hover:text-gray-400'
              }`}
            >
              LOGIN
              {view === 'login' && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green" 
                />
              )}
            </button>
            <button
              onClick={() => setView('register')}
              className={`flex-1 pb-4 text-xs font-bold tracking-widest transition-all relative ${
                view === 'register' ? 'text-brand-green' : 'text-gray-300 hover:text-gray-400'
              }`}
            >
              REGISTER
              {view === 'register' && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green" 
                />
              )}
            </button>
          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {view === 'register' ? (
              <motion.form
                key="register-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div>
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" placeholder="scholar@bibliophile.com" />
                </div>
                <div>
                  <label htmlFor="name">Full Name</label>
                  <input type="text" id="name" placeholder="Julian Thorne" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="role">Role</label>
                    <div className="relative">
                      <select id="role" className="appearance-none">
                        <option>Student</option>
                        <option>Professor</option>
                        <option>Researcher</option>
                        <option>Librarian</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="year">Current Year</label>
                    <input type="text" id="year" placeholder="2024" />
                  </div>
                </div>
                <div>
                  <label htmlFor="course">Course / Department</label>
                  <input type="text" id="course" placeholder="Comparative Literature & Philosophy" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="phone" className="mb-0">Phone Number</label>
                    <span className="text-[10px] italic text-gray-400">Optional</span>
                  </div>
                  <input type="tel" id="phone" placeholder="+1 (555) 000-0000" />
                </div>
                
                <button className="w-full bg-brand-green hover:bg-brand-green/90 text-white py-4 rounded-sm font-bold text-xs tracking-widest flex items-center justify-center space-x-2 transition-all mt-8 group">
                  <span>REGISTER & SEND OTP</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-[10px] text-center text-gray-400 leading-relaxed mt-6">
                  By registering, you agree to the Archivist's Terms of Service and our <br />
                  commitment to digital preservation.
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6 py-4"
              >
                <div>
                  <label htmlFor="login-email">Email Address</label>
                  <input type="email" id="login-email" placeholder="reader@modernbibliophile.com" />
                </div>
                
                <button className="w-full bg-brand-green hover:bg-brand-green/90 text-white py-4 rounded-sm font-bold text-xs tracking-widest flex items-center justify-center space-x-2 transition-all mt-8 group">
                  <span>SEND OTP VIA EMAIL</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-[10px] text-center text-gray-400 leading-relaxed mt-6">
                  By signing in, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Bottom Icons */}
        <div className="mt-16 flex items-center space-x-12">
          <div className="h-px w-16 bg-gray-200 hidden md:block" />
          <div className="flex space-x-6 text-gray-400">
            <Book size={20} className="hover:text-brand-gold transition-colors cursor-pointer" />
            <PenTool size={20} className="hover:text-brand-gold transition-colors cursor-pointer" />
            <Landmark size={20} className="hover:text-brand-gold transition-colors cursor-pointer" />
          </div>
          <div className="h-px w-16 bg-gray-200 hidden md:block" />
        </div>

        {/* Background Image (Subtle Book Stack) */}
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10 pointer-events-none hidden lg:block">
          <img 
            src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400" 
            alt="Books" 
            className="w-full h-full object-cover grayscale"
            referrerPolicy="no-referrer"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-10 md:px-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 text-gray-500 text-xs">
        <div className="font-serif font-bold text-lg text-brand-green">
          {view === 'register' ? 'BookLoop' : 'Modern Bibliophile'}
        </div>
        <div className="flex space-x-8">
          <a href="#" className="hover:text-brand-green transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-brand-green transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-brand-green transition-colors">Contact Us</a>
        </div>
        <div>
          © 2024 Modern Bibliophile. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
