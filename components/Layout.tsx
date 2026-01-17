
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, LogOut, Menu, X, Leaf, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { cart, isLoggedIn, logout, user, isAdmin } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Plans', path: '/plans' },
    { name: 'Weekly Menu', path: '/meals' },
    { name: 'Recipes', path: '/recipes' },
  ];

  if (isAdmin) navLinks.push({ name: 'Admin', path: '/admin' });

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled ? 'py-4' : 'py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className={`transition-all duration-500 rounded-3xl flex items-center justify-between px-8 py-4 ${
          isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.04)]' : 'bg-transparent'
        }`}>
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 olive-gradient rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-500">
              <Leaf className="w-6 h-6" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-olive-800">
              Vital<span className="text-gold-500">Eats</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
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

          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
              <ShoppingBag className="w-5 h-5 text-olive-800" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 gold-gradient text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {cart.length}
                </span>
              )}
            </Link>

            <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>

            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:block text-right">
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
                className="olive-gradient text-white px-7 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-olive-800/10 hover:shadow-olive-800/20 hover:-translate-y-0.5 transition-all"
              >
                Sign In
              </Link>
            )}

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-olive-800">
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`md:hidden fixed inset-0 bg-white/95 backdrop-blur-2xl z-40 transition-all duration-500 ${
        isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
      }`}>
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-3xl font-bold text-olive-800"
            >
              {link.name}
            </Link>
          ))}
          {!isLoggedIn && (
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="px-12 py-5 gold-gradient rounded-3xl text-white font-bold text-xl">
              Sign In
            </Link>
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
              <div className="w-12 h-12 olive-gradient rounded-2xl flex items-center justify-center text-white">
                <Leaf className="w-7 h-7" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-olive-800">VitalEats</span>
            </div>
            <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-sm">
              We're redefining healthy living through chef-led subscriptions that prioritize flavor, nutrition, and zero friction.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'Instagram', 'LinkedIn'].map(social => (
                <a key={social} href="#" className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gold-500 hover:bg-white hover:border-gold-500 transition-all duration-300">
                  <span className="sr-only">{social}</span>
                  <div className="w-5 h-5 border-2 border-current rounded-sm"></div>
                </a>
              ))}
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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-gold-500 selection:text-white">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
