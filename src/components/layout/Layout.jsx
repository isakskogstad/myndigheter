import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ 
  children, 
  activeTab, 
  onTabChange, 
  showIntro, 
  onToggleIntro,
  isDark,
  onToggleDark,
  searchQuery,
  onSearchChange
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Map ID to label
  const tabs = {
    overview: 'Översikt',
    departments: 'Departement',
    regions: 'Regioner',
    list: 'Register',
    compare: 'Jämförelse'
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans selection:bg-primary-100 selection:text-primary-900">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(id) => {
          onTabChange(id);
          setIsMobileMenuOpen(false);
        }}
        showIntro={showIntro}
        onToggleIntro={onToggleIntro}
        isDark={isDark}
        onToggleDark={onToggleDark}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-w-0 bg-white/50">
        <Header 
          activeTabLabel={tabs[activeTab]} 
          searchQuery={searchQuery} 
          onSearchChange={onSearchChange}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onShare={() => {
            navigator.clipboard.writeText(window.location.href);
            // Toast notification could go here
            alert('Länk kopierad till urklipp!');
          }}
        />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth relative">
          <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fade-in">
            {children}
          </div>

          {/* Footer */}
          <footer className="max-w-7xl mx-auto pt-12 pb-8 mt-12 border-t border-stone-100 text-xs text-stone-400 flex flex-col sm:flex-row justify-between items-center gap-6">
            <p>© {new Date().getFullYear()} Svenska Myndigheter. Ett analysverktyg av Isak Skogstad.</p>
            <div className="flex flex-wrap justify-center gap-6 font-medium">
              <a href="https://github.com/civictechsweden/myndighetsdata" target="_blank" rel="noreferrer" className="hover:text-primary-600 transition-colors">Civic Tech Sweden</a>
              <a href="https://www.esv.se/" target="_blank" rel="noreferrer" className="hover:text-primary-600 transition-colors">ESV</a>
              <a href="https://www.scb.se/" target="_blank" rel="noreferrer" className="hover:text-primary-600 transition-colors">SCB</a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout;
