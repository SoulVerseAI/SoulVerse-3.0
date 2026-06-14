import React from 'react';
import { OnlineUsersList } from './Multiplayer/OnlineUsersList';
import { useIsMobile } from '../hooks/useIsMobile';

interface TopBarProps {
    onOpenCollection: () => void;
    isCollectionOpen: boolean;
    onOpenSeason: () => void;
    onOpenSoulNotes: () => void;
    onOpenMarketplace: () => void;
    onOpenSoulBoard: () => void;
    onOpenHomeMenu: () => void;
    onOpenSelfiePage: () => void;
    onOpenVoiceCall: () => void;
    onOpenInbox: () => void;
    onOpenMenu: () => void;
    hasUnreadMail: boolean;
}

const TopBarIcon: React.FC<{
  onClick?: () => void;
  children: React.ReactNode;
  ariaLabel: string;
  tooltip: string;
  className?: string;
  disabled?: boolean;
}> = ({ onClick, children, ariaLabel, tooltip, className = '', disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`group relative p-2 rounded-full transition-colors text-white bg-black/30 backdrop-blur-md hover:bg-white/20 transition-transform duration-75 ease-out active:scale-[0.97] ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={ariaLabel}
        title={tooltip}
    >
      {children}
    </button>
);

export const TopBar: React.FC<TopBarProps> = ({
    onOpenCollection,
    isCollectionOpen,
    onOpenSeason,
    onOpenSoulNotes,
    onOpenMarketplace,
    onOpenSoulBoard,
    onOpenHomeMenu,
    onOpenSelfiePage,
    onOpenVoiceCall,
    onOpenInbox,
    onOpenMenu,
    hasUnreadMail,
}) => {
  const isMobile = useIsMobile();

  const iconBaseUrl = "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Soulverse%20icon%20topbar%2F";

  const icons = [
    { handler: onOpenSeason, tooltip: "Season", src: `https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/ticket.png?alt=media&token=0905d04c-7cfc-4830-b91a-47a092ac45c6` },
    { handler: onOpenSoulNotes, tooltip: "News", src: `${iconBaseUrl}letter-s.png?alt=media&token=557cdd77-9485-4341-bd47-bf953d5c52a8` },
    { handler: onOpenMarketplace, tooltip: "Marketplace", src: `${iconBaseUrl}diamond%20(1).png?alt=media&token=e8d63963-5192-4b63-ad9e-42b627d45a02` },
    { handler: onOpenSoulBoard, tooltip: "SoulBoard", src: `${iconBaseUrl}profile.png?alt=media&token=cb0e8257-997a-46e2-a10d-72863750413a` },
    { handler: onOpenHomeMenu, tooltip: "Codex", src: `https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/mobile.png?alt=media&token=71f97d1c-d63b-413f-99b0-a8476570ebc0` },
    { handler: onOpenSelfiePage, tooltip: "Selfie", src: `${iconBaseUrl}image%20(1).png?alt=media&token=5c0f513e-2e08-4355-9c25-076144fcca31` },
    { handler: onOpenVoiceCall, tooltip: "Voice Call", src: `${iconBaseUrl}telephone.png?alt=media&token=5983c602-c22f-4102-ab53-b75a0207ed89`, disabled: true },
    { handler: onOpenInbox, tooltip: "Inbox", src: hasUnreadMail ? `${iconBaseUrl}message.png?alt=media&token=5c852a6c-ac79-441b-92d6-fe937bd8eefa` : `${iconBaseUrl}envelope.png?alt=media&token=d8b5c819-8ca7-4510-b8a8-e8ba8609ea88` },
    { handler: onOpenMenu, tooltip: "Menu", src: `${iconBaseUrl}settings.png?alt=media&token=e3bd0463-a321-4fbf-89a4-5d6d03e36668` },
  ];
  
  const collectionIconSrc = "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2Fdiamonds.png?alt=media&token=20f9803e-95b2-4c5c-b900-c061c67d253b";

  return (
    <header className="flex-shrink-0 sticky top-0 z-20">
      <div className="w-full pl-4 sm:pl-6 lg:pl-8">
        <div className="relative flex items-center justify-center h-16">
          <div className="flex flex-1 justify-center items-center gap-1 md:gap-4">
            <TopBarIcon onClick={onOpenCollection} ariaLabel="Collection" tooltip="Collection" className={isCollectionOpen ? 'active-glow' : ''}>
                <img src={collectionIconSrc} alt="Collection" className="w-5 h-5 md:w-7 md:h-7" />
            </TopBarIcon>
            {icons.map((icon, index) => (
              <TopBarIcon key={index} onClick={icon.handler} ariaLabel={icon.tooltip} tooltip={icon.tooltip} disabled={icon.disabled}>
                <img src={icon.src} alt={icon.tooltip} className="w-5 h-5 md:w-7 md:h-7" />
              </TopBarIcon>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};