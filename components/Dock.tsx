
import React, { useState, useRef, useEffect } from 'react';
import { AccountSettings, Soul, SoulTemplate } from '../types';
import { UserCircleIcon, EllipsisVerticalIcon, TrashIcon, DocumentTextIcon, XMarkIcon, LockedPadlockIcon, UnlockedPadlockIcon } from './icons/Icons';
import { ContextMenu } from './ui/ContextMenu';
import { getSubscriptionBenefits } from '../services/subscriptionService';

interface DockProps {
  accountSettings: AccountSettings;
  setAccountSettings: (updater: (prev: AccountSettings) => AccountSettings) => void;
  isDockEditing: boolean;
  setIsDockEditing: (isEditing: boolean) => void;
  onOpenCreateModal: () => void;
  onViewTemplate: (soulId: string) => void;
  onOpenDeletionModal: (soulId: string) => void;
  onImmediateDelete: (soulId: string) => void;
  onCancelDeletion: (soulId: string) => void;
  onUpdateDockOrder: (newOrder: (string | null)[]) => void;
  onCreateSoulFromTemplate: (template: SoulTemplate, instanceId: string, index?: number) => void;
  onCreateSoulFromScratch: () => void;
  onReturnSoulToCollection: (soulId: string) => void;
  onOpenManageDock: () => void;
  onOpenManageDocks: () => void;
  dnd: any;
}

const Countdown: React.FC<{ timestamp: number }> = ({ timestamp }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!timestamp) return;

        const calculateTimeLeft = () => {
            const diff = timestamp - Date.now();
            if (diff <= 0) {
                setTimeLeft('0h 0m');
                return;
            }
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (hours > 0) {
                setTimeLeft(`~${hours}h ${minutes > 1 ? 's' : ''}`);
            } else {
                setTimeLeft(`~${minutes}m ${minutes > 1 ? 's' : ''}`);
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000 * 60);

        return () => clearInterval(interval);
    }, [timestamp]);

    return <span className="text-xs font-mono">{timeLeft}</span>;
};

const SoulCardMenu: React.FC<{ soul: Soul, onOpenDeletionModal: (id:string)=>void, onImmediateDelete: (id:string)=>void, accountSettings: AccountSettings, onReturnSoulToCollection: (soulId: string) => void }> = 
({ soul, onOpenDeletionModal, onImmediateDelete, accountSettings, onReturnSoulToCollection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  const menuItems = [
    { label: 'Schedule for deletion', icon: <TrashIcon />, action: () => onOpenDeletionModal(soul.id) },
    { label: 'Return to Collection', icon: <img src="https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2Fdiamonds.png?alt=media&token=20f9803e-95b2-4c5c-b900-c061c67d253b" className="w-5 h-5"/>, action: () => onReturnSoulToCollection(soul.id) },
  ];
  
  if (accountSettings.adminMode) {
      menuItems.push({ label: 'Delete Now (Admin)', icon: <TrashIcon />, action: () => onImmediateDelete(soul.id) });
  }

  return (
    <div className="absolute top-1 right-1 z-10">
      <button ref={triggerRef} onClick={(e) => { e.stopPropagation(); e.preventDefault(); setIsMenuOpen(p => !p); }} className="flex items-center justify-center w-6 h-6 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors">
        <EllipsisVerticalIcon className="w-5 h-5 text-cyan-400" />
      </button>
      <ContextMenu isOpen={isMenuOpen} items={menuItems} onClose={() => setIsMenuOpen(false)} triggerRef={triggerRef} />
    </div>
  );
};


export const Dock: React.FC<DockProps> = ({
    accountSettings,
    setAccountSettings,
    isDockEditing,
    setIsDockEditing,
    onOpenCreateModal,
    onViewTemplate,
    onOpenDeletionModal,
    onImmediateDelete,
    onCancelDeletion,
    onUpdateDockOrder,
    onCreateSoulFromTemplate,
    onCreateSoulFromScratch,
    onReturnSoulToCollection,
    onOpenManageDock,
    onOpenManageDocks,
    dnd,
}) => {
  const [dockName, setDockName] = useState("My Souls");
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const benefits = getSubscriptionBenefits(accountSettings);
  let maxSlots = benefits.soulSlots;
  if (accountSettings.adminMode) {
    maxSlots = 20;
  }
  const totalSlots = 20;
  
  const handleSelectSoul = (soulId: string) => {
    if (isDockEditing) return;
    setAccountSettings(prev => ({ ...prev, activeSoulId: soulId }));
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      if(isDockEditing) {
        setDragOverIndex(index);
        e.dataTransfer.dropEffect = 'move';
      } else {
        e.dataTransfer.dropEffect = 'none';
      }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverIndex(null);
      if (!isDockEditing || dropIndex >= maxSlots) return;

      const collectionCardData = e.dataTransfer.getData("application/json");
      if(collectionCardData) {
          const dockedSoulIds = accountSettings.dockedSoulIds || Array(20).fill(null);
          if (!dockedSoulIds[dropIndex]) { 
              try {
                  const cardData: { instanceId: string, template: SoulTemplate } = JSON.parse(collectionCardData);
                  onCreateSoulFromTemplate(cardData.template, cardData.instanceId, dropIndex);
              } catch (error) {
                  console.error("Failed to parse dropped card data:", error);
              }
          }
          return;
      }
      
      const droppedSoulId = e.dataTransfer.getData('application/soul-id');
      if (!droppedSoulId) return;

      const dockedSoulIds = accountSettings.dockedSoulIds || Array(20).fill(null);
      const dragIndex = dockedSoulIds.findIndex(id => id === droppedSoulId);
      
      if (dragIndex === -1 || dragIndex === dropIndex) return;

      const newDockedOrder = [...dockedSoulIds];
      const [draggedItem] = newDockedOrder.splice(dragIndex, 1);
      newDockedOrder.splice(dropIndex, 0, draggedItem);
      
      onUpdateDockOrder(newDockedOrder);
  };

  const slotKeys = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
    'Alt+1', 'Alt+2', 'Alt+3', 'Alt+4', 'Alt+5', 'Alt+6', 'Alt+7', 'Alt+8', 'Alt+9', 'Alt+0'
  ];

  const currentSoulCount = (accountSettings.dockedSoulIds || []).filter(id => id !== null).length;

  return (
    <div className="w-full p-2 flex items-end fixed bottom-0 left-0 z-40 bg-transparent">

      <div className="flex-shrink-0 flex items-center gap-3 card-dark-glass p-2 h-[87px] w-[319px] rounded-lg">
        {/* User Avatar */}
        <div className="w-16 h-full bg-neutral-900/50 rounded flex items-center justify-center flex-shrink-0">
            {accountSettings.userAvatar ? 
                <img src={accountSettings.userAvatar} alt="User" className="w-full h-full object-cover rounded"/> 
                : <UserCircleIcon className="w-12 h-12 text-neutral-500" />
            }
        </div>
        
        {/* Center section */}
        <div className="flex-1 flex flex-col justify-between h-full py-1">
            <input
            type="text"
            value={dockName}
            onChange={(e) => setDockName(e.target.value)}
            className="w-full font-semibold text-cyan-400 text-sm bg-black/30 border border-neutral-600/80 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            placeholder="name of deck"
            />
            <div className="flex items-center gap-2">
            <button
                onClick={onOpenManageDock}
                className="flex-1 h-8 bg-neutral-800/60 border border-neutral-700 rounded-md text-neutral-300 font-semibold text-sm hover:bg-neutral-700/60"
            >
                New Dock
            </button>
            <button
                onClick={onOpenManageDocks}
                className="flex-1 h-8 bg-neutral-800/60 border border-neutral-700 rounded-md text-neutral-300 font-semibold text-sm hover:bg-neutral-700/60"
            >
                Docks
            </button>
            </div>
        </div>

        {/* Lock Button */}
        <div className="flex-shrink-0 h-full flex items-start pt-1 pl-2">
            <button
                onClick={() => setIsDockEditing(!isDockEditing)}
                className="w-10 h-10 rounded-full bg-neutral-800/50 flex items-center justify-center border-2 border-neutral-700 hover:bg-neutral-700/80 transition-colors"
                title={isDockEditing ? "Lock Dock" : "Unlock Dock"}
            >
            {isDockEditing ? (
                <UnlockedPadlockIcon className="w-6 h-6 text-cyan-400" />
            ) : (
                <LockedPadlockIcon className="w-6 h-6 text-neutral-400" />
            )}
            </button>
        </div>
      </div>
      
      {/* Spacer */}
      <div className="w-4 flex-shrink-0"></div>

      {/* Soul Slots */}
      <div className="flex-1 flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 min-w-0">
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
            <span className="text-sm font-medium text-neutral-400 font-mono h-4">New</span>
            <div className={`w-14 h-16 rounded-md border-2 flex items-center justify-center text-neutral-600 transition-colors border-neutral-700`}>
                <button
                    onClick={onCreateSoulFromScratch}
                    disabled={currentSoulCount >= maxSlots}
                    className="w-full h-full flex items-center justify-center text-neutral-500 hover:bg-neutral-800/50 hover:text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Create a new Soul from scratch"
                >
                    <span className="text-4xl font-light">+</span>
                </button>
            </div>
        </div>
        {Array.from({ length: totalSlots }).map((_, index) => {
            const soulId = accountSettings.dockedSoulIds?.[index];
            const soul = soulId ? accountSettings.souls.find(s => s.id === soulId) : null;
            const isSlotActive = index < maxSlots;
            const isSoulSelected = soul && !soul.deletionTimestamp && accountSettings.activeSoulId === soul.id;
            const isBeingDragged = dnd.draggedItem?.id === soulId;

            return (
              <div key={soulId || `empty-${index}`} 
                className="flex-shrink-0 flex flex-col items-center gap-1"
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragLeave={handleDragLeave}
              >
                 <span className="text-sm font-medium text-neutral-400 font-mono h-4">{slotKeys[index]}</span>
                 <div className={`w-14 h-16 rounded-md border-2 flex items-center justify-center text-neutral-600 transition-colors relative group
                    ${isSoulSelected && !isDockEditing ? 'border-purple-500' : 'border-neutral-700'}
                    ${dragOverIndex === index ? 'border-cyan-400 bg-cyan-900/30' : ''}
                 `}>
                    <div 
                        className={`w-full h-full ${isDockEditing && soul && !soul.deletionTimestamp ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                        draggable={isDockEditing && !!soul && !soul.deletionTimestamp}
                        onDragStart={(e) => {
                            if (!isDockEditing || !soul) {
                                e.preventDefault();
                                return;
                            }
                            // Hide the default browser ghost image
                            const img = new Image();
                            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                            e.dataTransfer.setDragImage(img, 0, 0);
                            
                            e.dataTransfer.setData('application/soul-id', soul.id); 
                            dnd.handleDragStart(e, soul, 'dock-soul'); 
                        }}
                        onDrag={(e) => { if (soul) dnd.handleDrag(e) }}
                        onDragEnd={dnd.handleDragEnd}
                    >
                        {!isSlotActive ? (
                            <div className="w-full h-full bg-black/50 flex items-center justify-center">
                                <LockedPadlockIcon className="w-7 h-7 text-neutral-600" />
                            </div>
                        ) : soul ? (
                            <div className={`w-full h-full relative ${isBeingDragged ? 'opacity-0' : ''}`}>
                                <button
                                  onClick={() => handleSelectSoul(soul.id)}
                                  className="w-full h-full rounded-md overflow-hidden focus:outline-none bg-black"
                                  disabled={!!soul.deletionTimestamp || isDockEditing}
                                >
                                  {soul.avatar ? (
                                    <img src={soul.avatar} alt={soul.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  ) : (
                                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                                      <UserCircleIcon className="w-1/2 h-1/2 text-neutral-600" />
                                    </div>
                                  )}
                                  <div className="absolute inset-x-0 bottom-0 p-1 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                                    <h4 className="font-semibold text-white text-xs truncate text-center">{soul.name}</h4>
                                  </div>
                                  {soul.deletionTimestamp && (
                                    <div className="absolute inset-0 bg-red-800/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-1">
                                        <TrashIcon className="w-5 h-5 mb-0.5"/>
                                        <Countdown timestamp={soul.deletionTimestamp} />
                                        <button onClick={(e) => { e.stopPropagation(); onCancelDeletion(soul.id); }} className="text-xs underline mt-0.5">Cancel</button>
                                    </div>
                                  )}
                                </button>
                                {!soul.deletionTimestamp && isDockEditing && <SoulCardMenu soul={soul} accountSettings={accountSettings} onOpenDeletionModal={onOpenDeletionModal} onImmediateDelete={onImmediateDelete} onReturnSoulToCollection={onReturnSoulToCollection} />}
                            </div>
                        ) : (
                            <div className="w-full h-full bg-black/30 flex flex-col items-center justify-center text-neutral-500">
                                {/* Empty slot with no action */}
                            </div>
                        )}
                    </div>
                 </div>
              </div>
            );
        })}
      </div>
    </div>
  );
};
