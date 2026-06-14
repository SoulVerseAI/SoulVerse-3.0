import React, { useRef, useEffect } from 'react';
import { XMarkIcon } from './icons/Icons';

interface BoardMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BoardMenu: React.FC<BoardMenuProps> = ({ isOpen, onClose }) => {
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
        className={`fixed top-0 left-0 h-full backdrop-blur-xl border-r border-white/10 z-[120] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col w-full max-w-md ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundImage: 'var(--bg-menu-gradient)' }}
      >
        <header className="flex items-center justify-between p-4 flex-shrink-0">
           <h2 className="text-4xl font-bold text-white">Board Menu</h2>
           <button onClick={onClose} className="p-2 -m-2 rounded-full hover:bg-white/10">
               <XMarkIcon className="w-6 h-6" />
           </button>
        </header>
        <div className="p-4 flex-1 overflow-y-auto">
           {/* Content will go here */}
           <p className="text-lg text-neutral-300">Board menu is currently empty.</p>
        </div>
      </nav>
    </>
  );
};