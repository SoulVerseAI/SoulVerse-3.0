import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from './icons/Icons';

interface DatabaseMenuProps {
  isOpen: boolean;
  onClose: () => void;
  sourceData: any[];
  onSelectSubcategory: (subcategoryName: string) => void;
}

export const DatabaseMenu: React.FC<DatabaseMenuProps> = ({ isOpen, onClose, sourceData, onSelectSubcategory }) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleCategoryClick = (categoryName: string) => {
    setOpenMenu(prev => prev === categoryName ? null : categoryName);
  };

  const handleSubcategorySelect = (subcategoryName: string) => {
    onSelectSubcategory(subcategoryName);
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-[110] md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <nav
        ref={menuRef}
        className={`fixed top-0 left-0 h-full backdrop-blur-xl border-r border-white/10 z-[120] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col w-full max-w-md text-white ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundImage: 'var(--bg-menu-gradient)' }}
      >
        <header className="flex-shrink-0 flex items-center justify-between p-4">
           <h2 className="text-4xl font-bold text-white">Categories</h2>
           <button onClick={onClose} className="p-2 -m-2 rounded-full hover:bg-white/10">
               <XMarkIcon className="w-6 h-6" />
           </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {sourceData.map(cat => (
                <div key={cat.name} className="py-1">
                    <button onClick={() => handleCategoryClick(cat.name)} className="w-full text-left font-medium text-neutral-300 p-4 text-xl rounded-lg hover:bg-white/20 hover:text-white flex justify-between items-center">
                        <span>{cat.name}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 transition-transform ${openMenu === cat.name ? 'rotate-180' : ''}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                    {openMenu === cat.name && (
                        <div className="pl-8 pt-1 space-y-1">
                            {cat.subcategories.map((sub: any) => (
                                <button key={sub.name} onClick={() => handleSubcategorySelect(sub.name)} className="w-full text-left px-4 py-2 text-lg text-neutral-400 hover:bg-white/10 hover:text-white rounded-lg">
                                    {sub.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </nav>
    </>
  );
};