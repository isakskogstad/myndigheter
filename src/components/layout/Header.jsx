import React from 'react';
import { Search, Share, ChevronRight, Command, Menu } from 'lucide-react';

const Header = ({ 
  activeTabLabel, 
  searchQuery, 
  onSearchChange, 
  onShare,
  onToggleMobileMenu 
}) => {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-stone-200 flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0 w-full transition-all duration-300">
      
      {/* Left Side: Menu & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 -ml-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center text-sm text-stone-500">
          <span className="hover:text-stone-800 cursor-pointer hidden sm:inline font-medium transition-colors">Start</span>
          <ChevronRight className="w-4 h-4 mx-2 text-stone-300 hidden sm:block" />
          <span className="font-semibold text-stone-900">{activeTabLabel}</span>
        </div>
      </div>
      
      {/* Right Side: Search & Actions */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Sök myndighet..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-32 sm:w-64 pl-9 pr-4 py-2 bg-white/50 border border-stone-200 rounded-xl text-sm text-stone-600 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all shadow-sm placeholder-stone-400 hover:bg-white"
          />
          <div className="absolute right-2 top-2 hidden lg:flex pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-stone-100 border border-stone-200 rounded text-stone-400 flex items-center gap-0.5">
              <Command className="w-3 h-3" /> K
            </kbd>
          </div>
        </div>

        {/* Share Button */}
        <button 
          onClick={onShare}
          className="p-2 text-stone-400 hover:text-primary-600 hover:bg-primary-50 border border-transparent hover:border-primary-100 rounded-xl transition-all duration-200"
          title="Dela denna vy"
        >
          <Share className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;