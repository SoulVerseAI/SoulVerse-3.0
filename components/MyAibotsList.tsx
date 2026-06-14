import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AccountSettings, Soul, SoulRole } from '../types';
import { UserCircleIcon, PlusIcon, EllipsisVerticalIcon, PinIcon, TrashIcon, DocumentTextIcon, InformationCircleIcon, ChevronDownIcon, XMarkIcon } from './icons/Icons';
import { ContextMenu } from './ui/ContextMenu';
import { getSubscriptionBenefits } from '../services/subscriptionService';

interface MySoulsListProps {
  accountSettings: AccountSettings;
  setAccountSettings: (updater: (prev: AccountSettings) => AccountSettings) => void;
  onOpenCreateModal: () => void;
  onCloseDrawer: () => void;
  onViewTemplate: (soulId: string) => void;
  onPinSoul: (soulId: string) => void;
  onOpenDeletionModal: (soulId: string) => void;
  onCancelDeletion: (soulId: string) => void;
  onImmediateDelete: (soulId: string) => void;
  searchTerm: string;
  roleFilters: SoulRole[];
}

const SoulCardMenu: React.FC<{ soul: Soul, accountSettings: AccountSettings, onViewTemplate: (id:string)=>void, onPinSoul: (id:string)=>void, onOpenDeletionModal: (id:string)=>void }> = 
({ soul, accountSettings, onViewTemplate, onPinSoul, onOpenDeletionModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  const isPinned = accountSettings.quickSwitchSoulIds.includes(soul.id);

  const menuItems = [
    { label: 'View template', icon: <DocumentTextIcon />, action: () => onViewTemplate(soul.id) },
    { label: isPinned ? 'Unpin Soul' : 'Pin Soul', icon: <PinIcon />, action: () => onPinSoul(soul.id) },
    { label: 'Schedule for deletion', icon: <TrashIcon />, action: () => onOpenDeletionModal(soul.id) },
  ];

  return (
    <div className="absolute top-2 right-2 z-10">
      <button ref={triggerRef} onClick={(e) => { e.stopPropagation(); setIsMenuOpen(p => !p); }} className="flex items-center justify-center w-7 h-7 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors">
        <EllipsisVerticalIcon className="w-5 h-5" />
      </button>
      <ContextMenu isOpen={isMenuOpen} items={menuItems} onClose={() => setIsMenuOpen(false)} triggerRef={triggerRef} />
    </div>
  );
};

const DeletedSoulCardMenu: React.FC<{
  soul: Soul;
  onViewTemplate: (id: string) => void;
  onCancelDeletion: (id: string) => void;
  onImmediateDelete: (id: string) => void;
  isAdmin: boolean;
}> = ({ soul, onViewTemplate, onCancelDeletion, onImmediateDelete, isAdmin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const menuItems = [
    { label: 'View template', icon: <DocumentTextIcon />, action: () => onViewTemplate(soul.id) },
    { label: 'Cancel Scheduled Deletion', icon: <XMarkIcon />, action: () => onCancelDeletion(soul.id) },
  ];

  if (isAdmin) {
    menuItems.push({ label: 'Delete Now', icon: <TrashIcon />, action: () => onImmediateDelete(soul.id) });
  }

  return (
    <div className="absolute top-2 right-2 z-10">
      <button ref={triggerRef} onClick={(e) => { e.stopPropagation(); setIsMenuOpen(p => !p); }} className="flex items-center justify-center w-7 h-7 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors">
        <EllipsisVerticalIcon className="w-5 h-5" />
      </button>
      <ContextMenu isOpen={isMenuOpen} items={menuItems} onClose={() => setIsMenuOpen(false)} triggerRef={triggerRef} />
    </div>
  );
};


const formatTimeLeft = (timestamp: number) => {
    const diff = timestamp - Date.now();
    if (diff <= 0) return '0 hours';
    const hours = Math.ceil(diff / (1000 * 60 * 60));
    return `~${hours} hours`;
}


export const MySoulsList: React.FC<MySoulsListProps> = ({ accountSettings, setAccountSettings, onOpenCreateModal, onCloseDrawer, onViewTemplate, onPinSoul, onOpenDeletionModal, onCancelDeletion, onImmediateDelete, searchTerm, roleFilters }) => {
  const [showDeleted, setShowDeleted] = useState(true);
  const [timers, setTimers] = useState<{ [key: string]: string }>({});
  const [selectedForAction, setSelectedForAction] = useState<string | null>(null);


  const { activeSouls, scheduledForDeletionSouls } = useMemo(() => {
    let active = accountSettings.souls.filter(s => !s.deletionTimestamp);
    
    if (searchTerm) {
        active = active.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    if (roleFilters && roleFilters.length > 0) {
        active = active.filter(s => s.role && roleFilters.includes(s.role));
    }

    const scheduled = accountSettings.souls.filter(s => s.deletionTimestamp);
    return { activeSouls: active, scheduledForDeletionSouls: scheduled };
  }, [accountSettings.souls, searchTerm, roleFilters]);


  useEffect(() => {
    const updateTimers = () => {
      const newTimers: { [key: string]: string } = {};
      scheduledForDeletionSouls.forEach(soul => {
        if (soul.deletionTimestamp) {
          newTimers[soul.id] = formatTimeLeft(soul.deletionTimestamp);
        }
      });
      setTimers(newTimers);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000 * 60); // Update every minute
    return () => clearInterval(interval);
  }, [scheduledForDeletionSouls]);


  const handleSelectSoul = (soulId: string) => {
    setAccountSettings(prev => ({ ...prev, activeSoulId: soulId }));
    onCloseDrawer();
  };

  const benefits = getSubscriptionBenefits(accountSettings);
  const soulSlots = benefits.soulSlots;
  const currentSoulCount = accountSettings.souls.filter(s => !s.deletionTimestamp).length;
  // FIX: Changed comparison from 'Wisp' to 'Free' to match SubscriptionTier type.
  const subscriberText = accountSettings.subscriptionTier === 'Free'
    ? `As a free user you have ${soulSlots} Soul slots by default.`
    : `As a subscriber you have ${soulSlots} Soul slots by default.`;

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-white">Souls ({currentSoulCount}/{soulSlots})</h2>
        </div>
        <p className="text-xs md:text-sm text-neutral-400 mt-1">
          {subscriberText}
          {' '}
          <button className="underline text-neutral-300 hover:text-white">Purchase more slots</button>
        </p>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto pr-2 space-y-4">
        <div className="grid grid-cols-2 gap-2 md:gap-4 content-start w-full mx-auto pt-2">
          <button
            onClick={() => { onOpenCreateModal(); onCloseDrawer(); }}
            className="w-full aspect-square rounded-2xl bg-black flex flex-col items-center justify-center text-neutral-400 hover:text-white transition-colors border border-neutral-800 hover:border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentSoulCount >= soulSlots}
          >
            <PlusIcon className="w-10 h-10" />
            <span className="mt-2 text-sm font-semibold">Create Soul</span>
          </button>

          {activeSouls.map(soul => {
            const isActive = accountSettings.activeSoulId === soul.id;
            return (
              <div key={soul.id} className={`relative w-full aspect-square rounded-2xl transition-all ${isActive ? 'ring-2 ring-purple-500' : ''}`}>
                <button
                  onClick={() => setSelectedForAction(soul.id)}
                  className="w-full h-full rounded-2xl overflow-hidden focus:outline-none group bg-black"
                >
                  {soul.avatar ? (
                    <img src={soul.avatar} alt={soul.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                      <UserCircleIcon className="w-1/2 h-1/2 text-neutral-600" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
                    <h4 className="font-bold text-white text-base truncate text-center">{soul.name}</h4>
                  </div>
                </button>

                {selectedForAction === soul.id && (
                  <div 
                    className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center transition-opacity"
                    onMouseLeave={() => setSelectedForAction(null)}
                  >
                    <button 
                      onClick={() => {
                        handleSelectSoul(soul.id);
                        setSelectedForAction(null);
                      }}
                      className="bg-gradient-cyan-purple text-white font-semibold py-2 px-6 rounded-full"
                    >
                      Select
                    </button>
                  </div>
                )}

                <SoulCardMenu soul={soul} accountSettings={accountSettings} onViewTemplate={onViewTemplate} onPinSoul={onPinSoul} onOpenDeletionModal={onOpenDeletionModal} />
              </div>
            );
          })}
        </div>

        {scheduledForDeletionSouls.length > 0 && (
          <div className="pt-4 mt-4">
            <button onClick={() => setShowDeleted(!showDeleted)} className="w-full flex justify-between items-center py-2 text-left">
              <h3 className="font-semibold text-neutral-300">Souls scheduled for deletion ({scheduledForDeletionSouls.length})</h3>
              <ChevronDownIcon className={`w-5 h-5 text-neutral-400 transition-transform ${showDeleted ? 'rotate-180' : ''}`} />
            </button>
            <p className="text-xs text-neutral-500">Souls scheduled for deletion do not count towards your soul slot limit.</p>
            
            {showDeleted && (
              <div className="mt-4 grid grid-cols-2 gap-2 md:gap-4 content-start">
                {scheduledForDeletionSouls.map(soul => (
                  <div key={soul.id} className={`relative w-full aspect-square rounded-2xl transition-all ${selectedForAction === soul.id ? 'ring-2 ring-purple-500' : ''}`}>
                    <button 
                      onClick={() => setSelectedForAction(soul.id)}
                      className="w-full h-full rounded-2xl overflow-hidden relative group bg-neutral-800 cursor-pointer"
                    >
                      {soul.avatar && (
                        <img src={soul.avatar} alt={soul.name} className="w-full h-full object-cover opacity-30" />
                      )}
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-2">
                        <div className="w-8 h-8 flex items-center justify-center bg-red-500/20 rounded-full mb-2">
                          <InformationCircleIcon className="w-6 h-6 text-red-400" />
                        </div>
                        <p className="text-xs text-red-300 font-semibold">Will be deleted in {timers[soul.id] || '...'}</p>
                      </div>
                       <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
                         <h4 className="font-bold text-white text-base truncate text-center">{soul.name}</h4>
                       </div>
                    </button>
                    <DeletedSoulCardMenu
                      soul={soul}
                      onViewTemplate={onViewTemplate}
                      onCancelDeletion={onCancelDeletion}
                      onImmediateDelete={onImmediateDelete}
                      isAdmin={accountSettings.adminMode}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};