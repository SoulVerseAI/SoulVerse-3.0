


import React, { useState, useRef } from 'react';
import { ContextMenu } from './ui/ContextMenu';
import { ChatBubbleBottomCenterTextIcon, PencilIcon, ScissorsIcon, PhotoIcon } from './icons/Icons';

interface ChatMessageActionsProps {
  messageId: string;
  onContinue: (messageId: string) => void;
  onTweak: (messageId:string) => void;
  onOpenChatBreakModal: () => void;
  onAutoSelfie: () => void;
}

export const ChatMessageActions: React.FC<ChatMessageActionsProps> = ({ messageId, onContinue, onTweak, onOpenChatBreakModal, onAutoSelfie }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const menuItems = [
    { label: 'Continue cut-off message', icon: <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />, action: () => onContinue(messageId) },
    { label: 'Auto-selfie', icon: <PhotoIcon className="w-5 h-5" />, action: onAutoSelfie },
    { label: 'Chat break', icon: <ScissorsIcon className="w-5 h-5" />, action: onOpenChatBreakModal },
    { label: 'Tweak AI Message', icon: <PencilIcon className="w-5 h-5" />, action: () => onTweak(messageId) },
  ];

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setIsMenuOpen(prev => !prev)}
        className="p-1 rounded-full text-neutral-400 hover:bg-neutral-700"
      >
        <img src="https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Soulverse%20icon%20topbar%2Fellipsis.png?alt=media&token=86f94fe9-c836-437d-9cb7-bd9c52cb3ac2" alt="More options" className="w-8 h-8" />
      </button>
      <ContextMenu
        isOpen={isMenuOpen}
        items={menuItems}
        onClose={() => setIsMenuOpen(false)}
        triggerRef={triggerRef}
        direction="up"
      />
    </div>
  );
};
