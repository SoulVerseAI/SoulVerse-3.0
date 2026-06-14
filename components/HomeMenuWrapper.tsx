import React, { useState, useCallback } from 'react';
import { FunctionWindow } from './ui/FunctionWindow';
import { HomeMenuModal } from './HomeMenu';
import { UserAvatarModal } from './UserAvatarModal';
import { Modal } from './ui/Modal';
import { SavePersonaModal } from './ui/SavePersonaModal';
import { ManagePersonasModal } from './ui/ManagePersonasModal';
import { AccountSettings, Soul, Persona } from '../types';

interface HomeMenuWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  accountSettings: AccountSettings;
  setAccountSettings: (updater: (prev: AccountSettings) => AccountSettings) => void;
  activeSoul: Soul | null;
  setActiveSoul: (updates: Partial<Soul> | ((prevSoul: Soul) => Partial<Soul>)) => void;
  onOpenCreateModal: () => void;
  onOpenDiscoverModal: () => void;
  onViewTemplate: (soulId: string) => void;
  onPinSoul: (soulId: string) => void;
  onOpenDeletionModal: (soulId: string) => void;
  onCancelDeletion: (soulId: string) => void;
  onImmediateDelete: (soulId: string) => void;
  setToast: (toast: { title: string; message: React.ReactNode } | null) => void;
  applyPersona: (persona: Persona) => void;
  onOpenSubscriptionPage: () => void;
  onOpenUnlockModal: (soulId: string) => void;
  onOpenJournalModal: () => void;
}

export const HomeMenuWrapper: React.FC<HomeMenuWrapperProps> = (props) => {
  const { isOpen, onClose, accountSettings, setAccountSettings, activeSoul, setActiveSoul, applyPersona } = props;

  // State for modals opened from HomeMenu
  const [isUserAvatarModalOpen, setIsUserAvatarModalOpen] = useState(false);
  const [isSavePersonaModalOpen, setIsSavePersonaModalOpen] = useState(false);
  const [isManagePersonasModalOpen, setIsManagePersonasModalOpen] = useState(false);
  const [personaToConfirmOverwrite, setPersonaToConfirmOverwrite] = useState<Persona | null>(null);

  // Callbacks for modals
  const handleSaveUserAvatar = (avatarData: Partial<AccountSettings>) => {
    setAccountSettings(prev => ({ ...prev, ...avatarData }));
    setIsUserAvatarModalOpen(false);
  };

  const handleSaveNewPersona = useCallback(() => {
    const newPersona: Persona = {
      id: crypto.randomUUID(),
      name: accountSettings.userName,
      userName: accountSettings.userName,
      userGender: accountSettings.userGender,
      userBackstory: accountSettings.userBackstory,
      userAvatar: accountSettings.userAvatar,
      userAvatarStyle: accountSettings.userAvatarStyle,
      userAvatarDescription: accountSettings.userAvatarDescription,
      userAvatarFaceDetailEnhance: accountSettings.userAvatarFaceDetailEnhance,
      userAvatarFaceDetailPrompt: accountSettings.userAvatarFaceDetailPrompt,
    };
    setAccountSettings(prev => ({ ...prev, personas: [...(prev.personas || []), newPersona] }));
    setIsSavePersonaModalOpen(false);
  }, [accountSettings, setAccountSettings]);

  const handleRequestOverwrite = (persona: Persona) => {
    setPersonaToConfirmOverwrite(persona);
  };

  const handleConfirmOverwrite = useCallback(() => {
    if (!personaToConfirmOverwrite) return;
    
    const updatedPersona: Persona = {
      ...personaToConfirmOverwrite,
      userName: accountSettings.userName,
      userGender: accountSettings.userGender,
      userBackstory: accountSettings.userBackstory,
      userAvatar: accountSettings.userAvatar,
      userAvatarStyle: accountSettings.userAvatarStyle,
      userAvatarDescription: accountSettings.userAvatarDescription,
      userAvatarFaceDetailEnhance: accountSettings.userAvatarFaceDetailEnhance,
      userAvatarFaceDetailPrompt: accountSettings.userAvatarFaceDetailPrompt,
    };
    setAccountSettings(prev => ({
        ...prev,
        personas: (prev.personas || []).map(p => p.id === updatedPersona.id ? updatedPersona : p)
    }));
    setPersonaToConfirmOverwrite(null);
    setIsSavePersonaModalOpen(false);
  }, [personaToConfirmOverwrite, accountSettings, setAccountSettings]);


  const handleUsePersona = useCallback((persona: Persona) => {
      applyPersona(persona);
      setIsManagePersonasModalOpen(false);
  }, [applyPersona]);
  
  const handleDeletePersona = useCallback((personaId: string) => {
      setAccountSettings(prev => ({
          ...prev,
          personas: (prev.personas || []).filter(p => p.id !== personaId)
      }));
  }, [setAccountSettings]);

  return (
    <>
      <FunctionWindow isOpen={isOpen} onClose={onClose} title="Codex" transparentBg={true}>
        <HomeMenuModal
          {...props}
          onOpenUserAvatarModal={() => setIsUserAvatarModalOpen(true)}
          onOpenSavePersonaModal={() => setIsSavePersonaModalOpen(true)}
          onOpenManagePersonasModal={() => setIsManagePersonasModalOpen(true)}
        />
      </FunctionWindow>

      {/* Modals managed by this wrapper */}
      <UserAvatarModal
        isOpen={isUserAvatarModalOpen}
        onClose={() => setIsUserAvatarModalOpen(false)}
        onSave={handleSaveUserAvatar}
        accountSettings={accountSettings}
      />
      <SavePersonaModal 
        isOpen={isSavePersonaModalOpen}
        onClose={() => setIsSavePersonaModalOpen(false)}
        onSave={handleSaveNewPersona}
        onOverwrite={handleRequestOverwrite}
        currentSettings={{ userName: accountSettings.userName, userGender: accountSettings.userGender }}
        existingPersonas={accountSettings.personas || []}
      />
      <ManagePersonasModal
        isOpen={isManagePersonasModalOpen}
        onClose={() => setIsManagePersonasModalOpen(false)}
        personas={accountSettings.personas || []}
        onUse={handleUsePersona}
        onDelete={handleDeletePersona}
      />
      {personaToConfirmOverwrite && (
        <Modal 
            isOpen={!!personaToConfirmOverwrite} 
            onClose={() => setPersonaToConfirmOverwrite(null)} 
            title="Confirm Overwrite"
            maxWidth="max-w-md"
        >
          <div className="p-6 text-center">
            <p className="text-neutral-300">
              Are you sure you want to overwrite the persona "{personaToConfirmOverwrite.name}" with your current settings?
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <button onClick={() => setPersonaToConfirmOverwrite(null)} className="py-2 px-6 rounded-md text-sm font-medium bg-neutral-700 hover:bg-neutral-600 transition-transform duration-75 ease-out active:scale-[0.97]">
                No
              </button>
              <button onClick={handleConfirmOverwrite} className="py-2 px-6 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-transform duration-75 ease-out active:scale-[0.97]">
                Yes, overwrite
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
