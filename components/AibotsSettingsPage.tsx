import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Soul, AccountSettings, Gender, DrawerContent, Persona } from '../types';
import { Slider } from './ui/Slider';
import { Toggle } from './ui/Toggle';
import { CollapsibleSection } from './ui/CollapsibleSection';
// import { getSubscriptionBenefits } from '../services/subscriptionService';
import { Modal } from './ui/Modal';
import { PlusIcon, TrashIcon, CheckIcon } from './icons/Icons';

interface GeneralSettingsPageContentProps {
  activeSoul: Soul | null;
  accountSettings: AccountSettings;
  setAccountSettings: (updater: (prev: AccountSettings) => AccountSettings) => void;
  setDrawerContent: (content: DrawerContent) => void;
  onOpenUserAvatarModal: () => void;
  onOpenUserBackstoryModal: () => void;
  onCloseDrawer: () => void;
  setActiveSoul: (updates: Partial<Soul>) => void;
  setToast: (toast: { title: string; message: React.ReactNode } | null) => void;
  setPreviewTheme: (theme: string | null) => void;
}

// --- MODALS FOR PERSONA MANAGEMENT ---

const SavePersonaModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  onOverwrite: (persona: Persona) => void;
  currentSettings: { userName: string; userGender: Gender };
  existingPersonas: Persona[];
}> = ({ isOpen, onClose, onSave, onOverwrite, currentSettings, existingPersonas }) => {
  const [newPersonaName, setNewPersonaName] = useState('');

  const handleSaveNew = () => {
    if (newPersonaName.trim()) {
      onSave(newPersonaName.trim());
      setNewPersonaName('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save current as persona">
      <div className="p-6 space-y-4">
        <p className="text-sm text-neutral-400">
          This will save your current user settings into a persona. Make sure you've clicked 'save' on any changes you made on user profile before saving as a persona.
        </p>
        <p className="text-sm">
          Current settings to save: <span className="font-semibold text-white">{currentSettings.userName} ({currentSettings.userGender})</span>
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newPersonaName}
            onChange={(e) => setNewPersonaName(e.target.value)}
            placeholder="New Persona Name"
            className="w-full bg-neutral-700/60 border border-neutral-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            onClick={handleSaveNew}
            disabled={!newPersonaName.trim()}
            className="flex items-center gap-2 py-2 px-4 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <PlusIcon className="w-5 h-5" /> Save
          </button>
        </div>
        <div className="pt-4 border-t border-neutral-700">
          <h4 className="font-semibold text-white mb-2">Or save and overwrite/update an existing persona:</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {existingPersonas.length > 0 ? (
              existingPersonas.map(p => (
                <button
                  key={p.id}
                  onClick={() => onOverwrite(p)}
                  className="w-full text-left p-3 rounded-lg bg-neutral-800 hover:bg-neutral-700/60"
                >
                  {p.name} ({p.userGender})
                </button>
              ))
            ) : (
              <p className="text-sm text-neutral-500">No existing personas to overwrite.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

const ManagePersonasModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  personas: Persona[];
  onUse: (persona: Persona) => void;
  onDelete: (personaId: string) => void;
}> = ({ isOpen, onClose, personas, onUse, onDelete }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleConfirmDelete = () => {
    if (deletingId) {
      onDelete(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage personas">
      <div className="p-4 space-y-2">
        {personas.length > 0 ? (
          personas.map(p => (
            <div key={p.id} className="bg-neutral-800 p-3 rounded-lg flex items-center justify-between">
              {deletingId === p.id ? (
                <div className="w-full flex justify-between items-center">
                  <span className="text-sm text-red-400">Delete {p.name}?</span>
                  <div>
                    <button onClick={handleConfirmDelete} className="text-sm font-semibold px-3 py-1 text-white bg-red-600 rounded-md mr-2">Confirm</button>
                    <button onClick={() => setDeletingId(null)} className="text-sm px-3 py-1">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="font-semibold text-white">{p.name} ({p.userGender})</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onUse(p)} className="text-sm font-semibold px-3 py-1 text-white bg-blue-600 rounded-md hover:bg-blue-700">Use Persona</button>
                    <button onClick={() => setDeletingId(p.id)} className="p-2 text-neutral-400 hover:text-red-400"><TrashIcon className="w-5 h-5"/></button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-neutral-500 py-8">No personas saved.</p>
        )}
      </div>
    </Modal>
  );
};


const SelectPersonaModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    personas: Persona[];
    onSelect: (personaId: string) => void;
}> = ({ isOpen, onClose, personas, onSelect }) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Select persona">
        <div className="p-4 space-y-2">
            {personas.length > 0 ? (
                personas.map(p => (
                    <div key={p.id} className="bg-neutral-800 p-3 rounded-lg flex items-center justify-between">
                        <span className="font-semibold text-white">{p.name} ({p.userGender})</span>
                        <button onClick={() => { onSelect(p.id); onClose(); }} className="text-sm font-semibold px-3 py-1 text-white bg-blue-600 rounded-md hover:bg-blue-700">Use Persona</button>
                    </div>
                ))
            ) : (
                <p className="text-center text-neutral-500 py-8">No personas available to select.</p>
            )}
        </div>
    </Modal>
);


// --- MAIN COMPONENT ---


const SoulGenderButton: React.FC<{ gender: 'Male' | 'Female', current: Gender, onClick: () => void }> = ({ gender, current, onClick }) => (
    <button
      onClick={onClick}
      className={`py-2 px-4 rounded-md text-sm font-medium transition-colors flex-1 ${
        current === gender ? 'bg-gradient-cyan-purple text-white' : 'bg-neutral-700/60 hover:bg-neutral-600'
      }`}
    >
      {gender}
    </button>
);

const UserGenderButton: React.FC<{ gender: 'Male' | 'Female' | 'Nonbinary', current: Gender, onClick: () => void }> = ({ gender, current, onClick }) => (
    <button
      onClick={onClick}
      className={`py-2 px-4 rounded-md text-sm font-medium transition-colors flex-1 ${
        current === gender ? 'bg-gradient-cyan-purple text-white' : 'bg-neutral-700/60 hover:bg-neutral-600'
      }`}
    >
      {gender}
    </button>
);

const ToggleItem: React.FC<{label: string, description: React.ReactNode, checked: boolean, onChange: (c:boolean) => void}> = 
({label, description, checked, onChange}) => (
     <div>
      <label className="flex items-center justify-between text-sm font-medium text-neutral-300">
        <span>{label}</span>
        <Toggle
          checked={checked}
          onChange={onChange}
        />
      </label>
      <p className="text-xs text-neutral-500 mt-1">{description}</p>
    </div>
);

const themes = [
    { name: 'Default', preview: 'linear-gradient(to bottom, rgba(37, 197, 210, 0.15), rgba(164, 85, 247, 0.15)), #101010' },
    { name: 'Sunset', preview: 'linear-gradient(135deg, #ff7e5f, #feb47b)' },
    { name: 'Chromatic Glow', preview: 'linear-gradient(135deg, #00f260, #0575e6)' },
    { name: 'Aurora', preview: 'linear-gradient(135deg, #43cea2, #185a9d)' },
    { name: 'Royal', preview: 'linear-gradient(135deg, #141E30, #243B55)' },
    { name: 'Lush', preview: 'linear-gradient(135deg, #56ab2f, #a8e063)' },
    { name: 'Kashmir', preview: 'linear-gradient(135deg, #614385, #516395)' },
    { name: 'Tranquil', preview: 'linear-gradient(135deg, #eecda3, #ef629f)' },
    { name: 'Celestial', preview: 'linear-gradient(135deg, #c33764, #1d2671)' },
    { name: 'Mango', preview: 'linear-gradient(135deg, #f2994a, #f2c94c)' },
    { name: 'Seafoam', preview: 'linear-gradient(135deg, #76b852, #8dc26f)' },
    { name: 'Crimson', preview: 'linear-gradient(135deg, #642b73, #c6426e)' },
    { name: 'Oceanic', preview: 'linear-gradient(135deg, #2193b0, #6dd5ed)' },
    { name: 'Volcano', preview: 'linear-gradient(135deg, #f12711, #f5af19)' },
    { name: 'Midnight', preview: 'linear-gradient(135deg, #232526, #414345)' },
    { name: 'Forest', preview: 'linear-gradient(135deg, #134e5e, #71b280)' },
    { name: 'Grapevine', preview: 'linear-gradient(135deg, #ad5389, #3c1053)' },
    { name: 'Cosmic', preview: 'linear-gradient(135deg, #ff00cc, #333399)' },
    { name: 'Emerald Water', preview: 'linear-gradient(135deg, #348f50, #56b4d3)' },
    { name: 'Azure', preview: 'linear-gradient(135deg, #0072ff, #00c6ff)' },
    { name: 'Misty', preview: 'linear-gradient(135deg, #606c88, #3f4c6b)' },
];


export const GeneralSettingsPageContent: React.FC<GeneralSettingsPageContentProps> = ({ setAccountSettings, accountSettings, setDrawerContent, onOpenUserAvatarModal, onOpenUserBackstoryModal, setToast, setPreviewTheme }) => {
  const [localAccountSettings, setLocalAccountSettings] = useState(accountSettings);
  const [betaPassword, setBetaPassword] = useState('');
  const [betaError, setBetaError] = useState('');

  const [isSavePersonaModalOpen, setIsSavePersonaModalOpen] = useState(false);
  const [isManagePersonasModalOpen, setIsManagePersonasModalOpen] = useState(false);
  const [isTiePersonaModalOpen, setIsTiePersonaModalOpen] = useState(false);

  // Sync with global state when it changes (e.g., when activeSoul changes)
  useEffect(() => {
    setLocalAccountSettings(accountSettings);
  }, [accountSettings]);
  
  const localActiveSoul = useMemo(() => {
    return localAccountSettings.souls.find(s => s.id === localAccountSettings.activeSoulId) || null;
  }, [localAccountSettings.souls, localAccountSettings.activeSoulId]);


  const handleSoulSettingChange = useCallback(<K extends keyof Soul>(key: K, value: Soul[K]) => {
    const globalSoulSettings: (keyof Soul)[] = ['antiRepeatStrength'];

    if (globalSoulSettings.includes(key)) {
      // Apply to all souls
      setLocalAccountSettings(prev => ({
        ...prev,
        souls: prev.souls.map(s => ({ ...s, [key]: value }))
      }));
    } else if (localActiveSoul) {
      // Apply to only the active soul (e.g., name, gender, maxTokens)
      setLocalAccountSettings(prev => ({
        ...prev,
        souls: prev.souls.map(s => s.id === localActiveSoul.id ? { ...s, [key]: value } : s)
      }));
    }
  }, [localActiveSoul]);
  
  const handleAccountSettingChange = <K extends keyof AccountSettings>(key: K, value: AccountSettings[K]) => {
    setLocalAccountSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSave = () => {
    setAccountSettings(() => localAccountSettings);
    setPreviewTheme(null); // Clear preview on save to lock in the new theme
    setDrawerContent('main-menu');
  };

  const handleBetaToggleChange = (isChecked: boolean) => {
      setBetaError('');
      if (isChecked) {
          if (betaPassword.trim() === 'SOULVERSE') {
              handleAccountSettingChange('betaTesterMode', true);
              handleAccountSettingChange('adminMode', false);
          } else if (betaPassword.trim() === 'ADMINVERSE') { // Example for admin
              handleAccountSettingChange('adminMode', true);
              handleAccountSettingChange('betaTesterMode', false);
          } else {
              setBetaError('Incorrect password. Beta status not activated.');
          }
      } else {
          handleAccountSettingChange('betaTesterMode', false);
          handleAccountSettingChange('adminMode', false);
          setBetaPassword('');
      }
  };

  // --- Persona Handlers ---
  const handleSaveNewPersona = useCallback((name: string) => {
    const newPersona: Persona = {
      id: crypto.randomUUID(),
      name,
      userName: localAccountSettings.userName,
      userGender: localAccountSettings.userGender,
      userBackstory: localAccountSettings.userBackstory,
      userAvatar: localAccountSettings.userAvatar,
      userAvatarStyle: localAccountSettings.userAvatarStyle,
      userAvatarDescription: localAccountSettings.userAvatarDescription,
      userAvatarFaceDetailEnhance: localAccountSettings.userAvatarFaceDetailEnhance,
      userAvatarFaceDetailPrompt: localAccountSettings.userAvatarFaceDetailPrompt,
    };
    setLocalAccountSettings(prev => ({ ...prev, personas: [...(prev.personas || []), newPersona] }));
    setIsSavePersonaModalOpen(false);
    setToast({ title: 'Success', message: 'Current settings saved as new persona.' });
  }, [localAccountSettings, setToast]);

  const handleOverwritePersona = useCallback((personaToOverwrite: Persona) => {
      const updatedPersona: Persona = {
        ...personaToOverwrite,
        userName: localAccountSettings.userName,
        userGender: localAccountSettings.userGender,
        userBackstory: localAccountSettings.userBackstory,
        userAvatar: localAccountSettings.userAvatar,
        userAvatarStyle: localAccountSettings.userAvatarStyle,
        userAvatarDescription: localAccountSettings.userAvatarDescription,
        userAvatarFaceDetailEnhance: localAccountSettings.userAvatarFaceDetailEnhance,
        userAvatarFaceDetailPrompt: localAccountSettings.userAvatarFaceDetailPrompt,
      };
      setLocalAccountSettings(prev => ({
          ...prev,
          personas: (prev.personas || []).map(p => p.id === updatedPersona.id ? updatedPersona : p)
      }));
      setIsSavePersonaModalOpen(false);
      setToast({ title: 'Success', message: `Persona '${personaToOverwrite.name}' updated.` });
  }, [localAccountSettings, setToast]);

  const handleUsePersona = useCallback((persona: Persona) => {
      setLocalAccountSettings(prev => ({
          ...prev,
          userName: persona.userName,
          userGender: persona.userGender,
          userBackstory: persona.userBackstory,
          userAvatar: persona.userAvatar,
          userAvatarStyle: persona.userAvatarStyle,
          userAvatarDescription: persona.userAvatarDescription,
          userAvatarFaceDetailEnhance: persona.userAvatarFaceDetailEnhance,
          userAvatarFaceDetailPrompt: persona.userAvatarFaceDetailPrompt,
      }));
      setIsManagePersonasModalOpen(false);
      setToast({ title: 'Success', message: `Using persona: ${persona.name}` });
  }, [setToast]);
  
  const handleDeletePersona = useCallback((personaId: string) => {
      setLocalAccountSettings(prev => ({
          ...prev,
          personas: (prev.personas || []).filter(p => p.id !== personaId)
      }));
      setToast({ title: 'Success', message: 'Persona deleted successfully.' });
  }, [setToast]);

  const handleTiePersona = useCallback((personaId: string) => {
    handleSoulSettingChange('tiedPersonaId', personaId);
  }, [handleSoulSettingChange]);

  const handleUntiePersona = useCallback(() => {
    handleSoulSettingChange('tiedPersonaId', null);
  }, [handleSoulSettingChange]);

  
  // const isV4Model = localActiveSoul?.model === 'gemini-2.5-pro';
  // const isV3Model = localActiveSoul?.model === 'gemini-2.5-flash';
  const tiedPersona = localActiveSoul?.tiedPersonaId ? localAccountSettings.personas.find(p => p.id === localActiveSoul.tiedPersonaId) : null;

  return (
     <>
        <SavePersonaModal 
            isOpen={isSavePersonaModalOpen}
            onClose={() => setIsSavePersonaModalOpen(false)}
            onSave={handleSaveNewPersona}
            onOverwrite={handleOverwritePersona}
            currentSettings={{ userName: localAccountSettings.userName, userGender: localAccountSettings.userGender }}
            existingPersonas={localAccountSettings.personas || []}
        />
        <ManagePersonasModal
            isOpen={isManagePersonasModalOpen}
            onClose={() => setIsManagePersonasModalOpen(false)}
            personas={localAccountSettings.personas || []}
            onUse={handleUsePersona}
            onDelete={handleDeletePersona}
        />
        <SelectPersonaModal
            isOpen={isTiePersonaModalOpen}
            onClose={() => setIsTiePersonaModalOpen(false)}
            personas={localAccountSettings.personas || []}
            onSelect={handleTiePersona}
        />

        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* --- Account Settings Section --- */}
                <div className="space-y-4">
                   <h2 className="text-lg font-semibold text-white pb-2">Account-wide Settings</h2>
                    <CollapsibleSection
                      title="My profile & personas"
                      description="Your details like your name, gender, your user avatar. Create personas and manage them here."
                      note={<>Changing your name or gender may result in small inconsistencies in your Soul's memories. You can resolve this by adding a note in the backstory.</>}
                    >
                        <div className="space-y-6 pt-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">My name</label>
                                <input
                                  type="text"
                                  value={localAccountSettings.userName}
                                  onChange={(e) => handleAccountSettingChange('userName', e.target.value)}
                                  className="w-full bg-neutral-700/60 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">My gender</label>
                                <div className="flex gap-2">
                                   <UserGenderButton gender="Male" current={localAccountSettings.userGender} onClick={() => handleAccountSettingChange('userGender', 'Male')} />
                                   <UserGenderButton gender="Female" current={localAccountSettings.userGender} onClick={() => handleAccountSettingChange('userGender', 'Female')} />
                                   <UserGenderButton gender="Nonbinary" current={localAccountSettings.userGender} onClick={() => handleAccountSettingChange('userGender', 'Nonbinary')} />
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">My backstory</label>
                                <button onClick={onOpenUserBackstoryModal} className="w-full py-2 px-4 rounded-md text-sm font-medium transition-colors bg-neutral-700/60 hover:bg-neutral-600">
                                   Edit Your Backstory
                                </button>
                            </div>
                            <div>
                                <button onClick={onOpenUserAvatarModal} className="w-full text-left group p-1 -m-1 rounded-md hover:bg-neutral-700/60">
                                    <span className="block text-sm font-medium text-neutral-300 group-hover:text-white cursor-pointer">My avatar</span>
                                    <span className="text-xs text-neutral-500 group-hover:text-neutral-400 cursor-pointer">Add a user avatar to insert yourself into group selfies.</span>
                                </button>
                                {localAccountSettings.userAvatar && (
                                    <img src={localAccountSettings.userAvatar} alt="User avatar preview" className="w-20 h-20 rounded-lg object-cover mt-2" />
                                )}
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">My personas</label>
                                <p className="text-xs text-neutral-500 mb-2">Save your user settings (name, gender, backstory, avatar) as personas. You can switch between them during chats.</p>
                                <div className="space-y-2">
                                    <button onClick={() => setIsSavePersonaModalOpen(true)} className="w-full py-2 px-4 rounded-md text-sm font-medium transition-colors bg-neutral-700/60 hover:bg-neutral-600">
                                       Save current settings as a persona
                                    </button>
                                    <button onClick={() => setIsManagePersonasModalOpen(true)} className="w-full py-2 px-4 rounded-md text-sm font-medium transition-colors bg-neutral-700/60 hover:bg-neutral-600">
                                       Manage & change personas
                                    </button>
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Color Schemes"
                        description="Personalize the look and feel of your chat experience."
                    >
                        <div className="pt-4 space-y-4">
                            <p className="text-xs text-neutral-400">Choose a theme to change the main background and menu colors.</p>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                                {themes.map(theme => (
                                    <div key={theme.name} className="flex flex-col items-center gap-2">
                                        <button 
                                            onClick={() => {
                                                handleAccountSettingChange('activeTheme', theme.name);
                                                setPreviewTheme(theme.name);
                                            }}
                                            className={`w-16 h-16 rounded-full relative transition-all duration-200 ${localAccountSettings.activeTheme === theme.name ? 'ring-2 ring-offset-2 ring-offset-neutral-800 ring-blue-500' : ''}`}
                                            style={{ background: theme.preview }}
                                            aria-label={`Select ${theme.name} theme`}
                                        >
                                            {localAccountSettings.activeTheme === theme.name && (
                                                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                                                    <CheckIcon className="w-8 h-8 text-white" />
                                                </div>
                                            )}
                                        </button>
                                        <span className="text-xs text-neutral-300 text-center">{theme.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CollapsibleSection>
                    
                    <CollapsibleSection
                      title="Global UI Toggles"
                      description="Customize the user interface experience."
                    >
                        <div className="space-y-4 pt-4">
                             <ToggleItem
                                label="Text Streaming"
                                description="ON: See the response as it's generating. OFF: See the response all at once."
                                checked={localAccountSettings.textStreaming}
                                onChange={checked => handleAccountSettingChange('textStreaming', checked)}
                             />
                              <ToggleItem
                                label="Multi-paragraph responses"
                                description="ON: allow multi-paragraph responses for more complex roleplay. OFF: (default) for more stable, concise responses."
                                checked={localAccountSettings.multiParagraphResponses}
                                onChange={checked => handleAccountSettingChange('multiParagraphResponses', checked)}
                             />
                             <ToggleItem
                                label="Auto-play Audio"
                                description="Auto-play audio in single/group chats after response is generated."
                                checked={localAccountSettings.autoPlayAudio}
                                onChange={checked => handleAccountSettingChange('autoPlayAudio', checked)}
                             />
                             <ToggleItem
                                label="Game Mode"
                                description="Enables RPG features like the Character Sheet for all Souls."
                                checked={localAccountSettings.gameMode || false}
                                onChange={checked => handleAccountSettingChange('gameMode', checked)}
                            />
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection
                      title="Beta Testing"
                      description="Enroll in beta testing to try new features."
                    >
                        <div className="space-y-6 pt-4">
                          <p className="text-xs text-neutral-400">
                           Enroll for beta testing by entering a valid password. Passwords may be distributed in the official Discord server for access to different features.
                          </p>
                          <div>
                            <label htmlFor="beta-password" className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
                            <input
                              id="beta-password"
                              type="password"
                              value={betaPassword}
                              onChange={(e) => {
                                  setBetaPassword(e.target.value);
                                  if (betaError) setBetaError('');
                              }}
                              className="w-full bg-neutral-700/60 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                          <ToggleItem
                            label="Activate Special Status"
                            description="Enable beta or admin features with the correct password."
                            checked={localAccountSettings.betaTesterMode || localAccountSettings.adminMode}
                            onChange={handleBetaToggleChange}
                          />
                          {betaError && <p className="text-xs text-red-500">{betaError}</p>}
                        </div>
                    </CollapsibleSection>
                </div>

                {/* --- Soul Settings Section --- */}
                 <div className="space-y-4 pt-4">
                    <h2 className="text-lg font-semibold text-white pb-2">Soul-specific Settings</h2>
                    {!localActiveSoul ? (
                         <div className="flex-1 flex flex-col h-full items-center justify-center p-6 text-center text-neutral-400">
                            <h2 className="text-lg font-semibold mb-2 text-white">No Soul Selected</h2>
                            <p>Please create or select a Soul from the "My Souls" menu to change its settings.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <CollapsibleSection
                              title="Soul Profile"
                              description="Change basic details such as your Soul’s name and gender."
                            >
                                <div className="space-y-6 pt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">Soul name</label>
                                        <input
                                          type="text"
                                          value={localActiveSoul.name || ''}
                                          onChange={(e) => handleSoulSettingChange('name', e.target.value)}
                                          className="w-full bg-neutral-700/60 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>
                                     <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">Soul gender</label>
                                        <div className="flex gap-2">
                                            <SoulGenderButton gender="Male" current={localActiveSoul.gender || null} onClick={() => handleSoulSettingChange('gender', 'Male')} />
                                            <SoulGenderButton gender="Female" current={localActiveSoul.gender || null} onClick={() => handleSoulSettingChange('gender', 'Female')} />
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleSection>
                            
                            <CollapsibleSection
                              title="Tied user persona"
                              description="Tie a user persona to this Soul, so every time you chat with the Soul, your persona is automatically switched to the tied persona."
                            >
                                <div className="pt-4">
                                    {tiedPersona ? (
                                        <div className="bg-neutral-800 p-3 rounded-lg flex items-center justify-between">
                                            <span className="font-semibold text-white">{tiedPersona.name} ({tiedPersona.userGender})</span>
                                            <button onClick={handleUntiePersona} className="text-sm font-semibold px-3 py-1 text-white bg-neutral-600 rounded-md hover:bg-neutral-500">Unset</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setIsTiePersonaModalOpen(true)} className="w-full py-2 px-4 rounded-md text-sm font-medium transition-colors bg-neutral-700/60 hover:bg-neutral-600">
                                            Select persona
                                        </button>
                                    )}
                                </div>
                            </CollapsibleSection>
                            
                            {localAccountSettings.adminMode && (
                                <CollapsibleSection
                                    title="Message Length Control"
                                    description="Set a hard limit on how long a single message can be."
                                    note={<p className="font-bold text-red-400">Admin-only Setting</p>}
                                >
                                    <div className="space-y-6 pt-4">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-300 mb-2">Max Tokens Per Message</label>
                                            <div className="flex items-center gap-4">
                                                <Slider
                                                    min={256}
                                                    max={4000}
                                                    step={32}
                                                    value={localActiveSoul.maxTokens ?? 4000}
                                                    onChange={(val) => handleSoulSettingChange('maxTokens', val)}
                                                />
                                                <input 
                                                    type="number"
                                                    min={256}
                                                    max={4000}
                                                    step={32}
                                                    value={localActiveSoul.maxTokens ?? 4000}
                                                    onChange={(e) => handleSoulSettingChange('maxTokens', parseInt(e.target.value, 10))}
                                                    className="w-20 bg-neutral-700/60 p-2 rounded-md text-center"
                                                />
                                            </div>
                                            <p className="text-xs text-neutral-500 mt-1">Enforces a hard maximum length (in tokens) for a single AI response. Default: 4000.</p>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            )}

                             <CollapsibleSection
                              title="Long-term Memory Controls"
                              description="Control whether your Souls should consolidate and recall long-term memory. This setting applies to all your Souls."
                            >
                                <div className="space-y-4 pt-4">
                                    <ToggleItem
                                       label="Memory Consolidation"
                                       description="Allow this Soul to consolidate memories from chats into long-term memory."
                                       checked={localActiveSoul.memoryConsolidation || false}
                                       onChange={(checked) => handleSoulSettingChange('memoryConsolidation', checked)}
                                    />
                                     <ToggleItem
                                       label="Memory Recall"
                                       description="Allow this Soul to access its long-term memory during conversation."
                                       checked={localActiveSoul.memoryRecall || false}
                                       onChange={(checked) => handleSoulSettingChange('memoryRecall', checked)}
                                    />
                                </div>
                            </CollapsibleSection>
                        </div>
                    )}
                </div>
                <div className="pt-4">
                    <button onClick={handleSave} className="w-full mt-4 py-3 rounded-full font-semibold text-lg transition-opacity bg-gradient-purple-pink text-white hover:opacity-90">
                        Save
                    </button>
                </div>
            </div>
        </div>
     </>
  );
};