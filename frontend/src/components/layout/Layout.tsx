import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, LogOut, Menu, X, Leaf, User, ChevronRight, Facebook, Instagram } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const Header: React.FC = () => {
  const { cart, isLoggedIn, logout, user } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Plans', path: '/plans' },
    { name: 'Weekly Menu', path: '/meals' },
    { name: 'Recipes', path: '/recipes' },
  ];

  if (isLoggedIn) navLinks.push({ name: 'View Orders', path: '/dashboard' });

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled ? 'py-4' : 'py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className={`transition-all duration-500 rounded-3xl flex items-center justify-between gap-4 px-4 sm:px-8 py-3 sm:py-4 ${
          isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.04)]' : 'bg-transparent'
        }`}>
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-20 h-12 sm:w-24 sm:h-14 flex items-center justify-center overflow-hidden">
              <img
                src="/logo/balanceMeal.png"
                alt="BalancedMeal"
                className="w-20 h-12 sm:w-24 sm:h-14 object-contain"
              />
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-bold transition-all hover:text-gold-500 relative group ${
                  location.pathname === link.path ? 'text-olive-800' : 'text-gray-500'
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gold-500 transition-all duration-300 ${
                  location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/cart" className="relative p-2 sm:p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-olive-800" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 gold-gradient text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {cart.length}
                </span>
              )}
            </Link>

            <div className="h-6 w-px bg-gray-200 mx-2 hidden lg:block"></div>

            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <div className="hidden lg:block text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account</p>
                  <p className="text-sm font-bold text-olive-800">{user?.name.split(' ')[0]}</p>
                </div>
                <button 
                  onClick={() => logout()} 
                  className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="olive-gradient text-white px-4 sm:px-7 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-xl shadow-olive-800/10 hover:shadow-olive-800/20 hover:-translate-y-0.5 transition-all"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-olive-800"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`lg:hidden fixed inset-0 bg-white/95 backdrop-blur-2xl z-40 transition-all duration-500 ${
        isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
      }`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="w-20 h-12 flex items-center justify-center overflow-hidden">
              <img
                src="/logo/balanceMeal.png"
                alt="BalancedMeal"
                className="w-20 h-12 object-contain"
              />
            </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-xl text-olive-800 hover:bg-olive-50 transition-colors"
              aria-label="Close menu"
            >
              <X />
            </button>
          </div>

          <div className="px-6 pt-6 pb-4">
            <div className="rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                {isLoggedIn ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-olive-50 flex items-center justify-center text-olive-700">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Account</p>
                      <p className="text-sm font-bold text-olive-800">{user?.name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Welcome</p>
                      <p className="text-sm font-bold text-olive-800">Sign in to manage meals</p>
                    </div>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-2 rounded-2xl gold-gradient text-white text-xs font-black uppercase tracking-widest"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>

              <div className="px-4 py-4">
                <div className="grid gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`px-5 py-4 rounded-2xl text-base font-black flex items-center justify-between transition-all ${
                        location.pathname === link.path
                          ? 'bg-olive-800 text-white'
                          : 'bg-olive-50 text-olive-800 hover:bg-olive-100'
                      }`}
                    >
                      {link.name}
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  ))}
                  <Link
                    to="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-5 py-4 rounded-2xl text-base font-black flex items-center justify-between bg-olive-50 text-olive-800 hover:bg-olive-100 transition-all"
                  >
                    Cart
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              {isLoggedIn && (
                <div className="px-6 pb-6">
                  <button
                    onClick={() => logout()}
                    className="w-full px-6 py-4 rounded-2xl border border-red-200 text-red-500 font-black text-sm uppercase tracking-widest hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {!isLoggedIn && (
            <div className="mt-auto px-6 pb-8">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center px-6 py-4 rounded-2xl olive-gradient text-white font-black text-sm uppercase tracking-widest shadow-xl"
              >
                Continue to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white pt-32 pb-12 overflow-hidden border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 opacity-5 pointer-events-none">
          <Leaf className="w-96 h-96" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-20 h-12 rounded-2xl flex items-center justify-center overflow-hidden">
                <img
                  src="/logo/balanceMeal.png"
                  alt="BalancedMeal"
                  className="w-20 h-12 object-contain"
                />
              </div>
            </div>
            <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-sm">
              We're redefining healthy living through chef-led subscriptions that prioritize flavor, nutrition, and zero friction.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/people/The-Nutrition-Box/61553161297273/"
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-blue-600 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/nutritionbox.official/"
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-pink-500 hover:text-white hover:bg-pink-500 hover:border-pink-500 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8">Platform</h4>
            <ul className="space-y-5">
              <li><Link to="/plans" className="font-bold text-gray-600 hover:text-gold-500 transition-colors">Our Plans</Link></li>
              <li><Link to="/meals" className="font-bold text-gray-600 hover:text-gold-500 transition-colors">Menu</Link></li>
              <li><Link to="/recipes" className="font-bold text-gray-600 hover:text-gold-500 transition-colors">Recipes</Link></li>
              <li><Link to="/login" className="font-bold text-gray-600 hover:text-gold-500 transition-colors">Login</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8">Company</h4>
            <ul className="space-y-5">
              <li><a href="#" className="font-bold text-gray-600 hover:text-gold-500 transition-colors">About Us</a></li>
              <li><a href="#" className="font-bold text-gray-600 hover:text-gold-500 transition-colors">Sustainability</a></li>
              <li><a href="#" className="font-bold text-gray-600 hover:text-gold-500 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8">Newsletter</h4>
            <p className="text-sm text-gray-500 mb-6">Stay updated with fresh menu items.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="email@example.com" 
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-olive-800 text-white px-4 rounded-xl hover:bg-charcoal transition-colors">
                <Menu className="w-4 h-4 rotate-90" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm font-medium text-gray-400 italic">© 2024 VitalEats Inc. A new standard for fine healthy dining.</p>
          <div className="flex gap-10 text-xs font-bold uppercase tracking-widest text-gray-300">
            <a href="#" className="hover:text-gold-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gold-500 transition-colors">Terms</a>
            <a href="#" className="hover:text-gold-500 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) || '';
  const whatsappMessage = encodeURIComponent('Hi! I have a query about my subscription.');
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
    : `https://wa.me/?text=${whatsappMessage}`;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-gold-500 selection:text-white">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <a
        href={whatsappLink}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-28 sm:bottom-14 right-1 z-[110] w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl shadow-green-200/40 flex items-center justify-center hover:scale-105 transition-transform"
      >
        <svg viewBox="0 0 32 32" className="w-7 h-7 fill-current" aria-hidden="true">
          <path d="M19.1 17.8c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0c-.3-.2-1.2-.4-2.3-1.4-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.2-.7.2-.2.3-.4.5-.6.2-.2.2-.3.3-.5.1-.2 0-.4 0-.6 0-.2-.7-1.6-1-2.2-.3-.6-.6-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.7 0 1.6 1.2 3.1 1.3 3.3.2.2 2.3 3.5 5.6 4.9.8.3 1.4.6 1.9.7.8.2 1.6.2 2.2.1.7-.1 2.1-.8 2.4-1.6.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.4zM16 5.3c-5.9 0-10.7 4.8-10.7 10.7 0 1.9.5 3.8 1.4 5.4L5 27l6-1.6c1.6.9 3.3 1.3 5.1 1.3 5.9 0 10.7-4.8 10.7-10.7S21.9 5.3 16 5.3zm0 19.4c-1.6 0-3.2-.4-4.6-1.2l-.3-.2-3.5.9.9-3.4-.2-.3c-.8-1.4-1.3-3-1.3-4.7 0-5 4.1-9.1 9.1-9.1s9.1 4.1 9.1 9.1-4.1 9.1-9.1 9.1z" />
        </svg>
      </a>
    </div>
  );
};
