

import React from 'react';
import { ArrowLeftIcon } from './icons/Icons';

interface SoulNotesBarProps {
  onClose: () => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  categories: string[];
}

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; isMobile?: boolean }> = ({ label, isActive, onClick, isMobile }) => (
    <button
        onClick={onClick}
        className={`flex-shrink-0 ${isMobile ? 'px-4 py-2 text-xs' : 'px-6 py-3 text-sm'} font-semibold transition-colors relative ${
            isActive ? 'text-cyan-300' : 'text-neutral-500 hover:text-neutral-300'
        } ${isActive ? 'bg-cyan-900/20' : ''}`}
        style={{
            clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0% 100%)',
        }}
    >
        {label}
        {isActive && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_8px_theme(colors.cyan.400)]"></div>}
    </button>
);


export const SoulNotesBar: React.FC<SoulNotesBarProps> = ({ onClose, activeCategory, setActiveCategory, categories }) => {
  const allCategories = ['All', ...categories];
  return (
    <header className="sticky top-0 p-4 bg-black/20 backdrop-blur-sm z-20 w-full flex-shrink-0 border-b-2 border-cyan-500/30">
      <div className="w-full max-w-5xl mx-auto flex justify-between items-center">
        {/* Left Edge: Back Arrow */}
        <button onClick={onClose} className="p-2 -m-2 rounded-full hover:bg-white/10" aria-label="Back to chat">
          <ArrowLeftIcon />
        </button>

        {/* Center: Categories (Desktop) */}
        <nav className="hidden md:flex items-center justify-center">
          {allCategories.map(cat => (
            <TabButton
              key={cat}
              label={cat}
              isActive={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </nav>
        
        {/* Right Edge: Logo */}
        <h1 className="text-2xl font-bold soulverse-logo-gradient">SoulVerse</h1>
      </div>
       {/* Mobile Categories */}
       <nav className="md:hidden w-full max-w-5xl mx-auto flex items-center mt-4 overflow-x-auto pb-1">
         {allCategories.map(cat => (
            <TabButton
              key={cat}
              label={cat}
              isActive={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              isMobile
            />
          ))}
      </nav>
    </header>
  );
};
