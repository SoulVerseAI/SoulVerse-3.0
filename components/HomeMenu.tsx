import React, { useState, useCallback } from 'react';
import { AccountSettings, Soul, Gender, Persona } from '../types';
import { BackstoryPageContent } from './BackstoryPage';
import { AvatarPageContent } from './AvatarPage';
import { useAuth } from '../contexts/AuthContext';
import { CollapsibleSection } from './ui/CollapsibleSection';
import { UserCircleIcon, XMarkIcon, TrashIcon } from './icons/Icons';
import { getSubscriptionBenefits } from '../services/subscriptionService';
import { Modal } from './ui/Modal';
import { Toggle } from './ui/Toggle';
import { Slider } from './ui/Slider';

// --- Page Content Components from AibotsSettingsPage.tsx ---

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


const UserProfileLeftPane: React.FC<{ 
    localAccountSettings: AccountSettings; 
    currentUser: any; 
    onOpenUserAvatarModal: () => void;
    handleAccountSettingChange: <K extends keyof AccountSettings>(key: K, value: AccountSettings[K]) => void;
}> = ({ localAccountSettings, currentUser, onOpenUserAvatarModal, handleAccountSettingChange }) => {
    const isSubscribed = localAccountSettings.subscriptionTier !== 'Free';
    const email = currentUser?.email || '';

    return (
        <div className="flex flex-col items-center justify-start text-center h-full pt-4 space-y-4 px-4">
            <h2 className={`text-lg font-bold tracking-wider truncate max-w-full px-2 ${isSubscribed ? 'text-gradient-cyan-purple' : 'text-white'}`}>{email}</h2>
            <div className="w-56 h-56 border-2 border-cyan-400/50 rounded-lg overflow-hidden shadow-lg bg-black/30 flex items-center justify-center">
            {localAccountSettings.userAvatar ? (
                <img src={localAccountSettings.userAvatar} alt="Player Avatar" className="w-full h-full object-cover" />
            ) : (
                <UserCircleIcon className="w-48 h-48 text-neutral-600" />
            )}
            </div>
            <button onClick={onOpenUserAvatarModal} className="w-56 py-2 px-4 rounded-md text-sm font-medium transition-colors bg-neutral-700/60 hover:bg-neutral-600">
                Edit your Avatar
            </button>
            <div className="w-full text-left pt-4">
                <CollapsibleSection isOpen={true} title={<h3 className="text-base font-semibold text-white">My Profile</h3>}>
                    <div className="space-y-4 pt-2">
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">My name</label>
                            <input
                                type="text"
                                value={localAccountSettings.userName}
                                onChange={(e) => handleAccountSettingChange('userName', e.target.value)}
                                className="w-full bg-neutral-800/60 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none border border-neutral-700"
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
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
};

const UserProfileRightPane: React.FC<{
    localAccountSettings: AccountSettings;
    handleAccountSettingChange: <K extends keyof AccountSettings>(key: K, value: AccountSettings[K]) => void;
    onOpenSavePersonaModal: () => void;
    onOpenManagePersonasModal: () => void;
}> = ({ localAccountSettings, handleAccountSettingChange, onOpenSavePersonaModal, onOpenManagePersonasModal }) => {
    const benefits = getSubscriptionBenefits(localAccountSettings);
    const backstoryMaxLength = localAccountSettings.adminMode ? 99999 : benefits.userBackstoryChars;

    return (
        <div className="p-4 space-y-6">
            <CollapsibleSection isOpen={true} title={<h3 className="text-lg font-semibold text-white">My Backstory</h3>}>
                <div className="pt-2">
                    <p className="text-sm text-neutral-400 mb-2">
                        This information will be accessible to all your Souls in conversations, including group chats and voice calls.
                    </p>
                    <div className="relative">
                        <textarea
                            value={localAccountSettings.userBackstory}
                            onChange={e => handleAccountSettingChange('userBackstory', e.target.value)}
                            rows={5}
                            maxLength={backstoryMaxLength}
                            className="w-full bg-neutral-800/60 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none border border-neutral-700 resize-none"
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-neutral-500 pointer-events-none">
                            {localAccountSettings.userBackstory.length} / {backstoryMaxLength}
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            <CollapsibleSection isOpen={true} title={<h3 className="text-lg font-semibold text-white">My Personas</h3>} description="Save your user settings (name, gender, backstory, avatar) as personas. You can switch between them during chats.">
                <div className="space-y-2 pt-2">
                    <button onClick={onOpenSavePersonaModal} className="w-full py-2 px-4 rounded-md text-sm font-medium transition-colors bg-neutral-700/60 hover:bg-neutral-600">
                       Save current settings as a persona
                    </button>
                    <button onClick={onOpenManagePersonasModal} className="w-full py-2 px-4 rounded-md text-sm font-medium transition-colors bg-neutral-700/60 hover:bg-neutral-600">
                       Manage & change personas
                    </button>
                </div>
            </CollapsibleSection>
        </div>
    );
};


const UserProfileStatisticsPane: React.FC = () => {
    return (
        <div className="p-4 space-y-6 text-center text-neutral-400">
            <h3 className="text-lg font-semibold text-white">Statistics</h3>
            <p>User statistics are coming soon!</p>
            <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-700">
                <p className="font-semibold text-white">Example Stat</p>
                <p className="text-2xl font-bold text-cyan-400 mt-2">1,234</p>
                <p className="text-xs">Total Messages Sent</p>
            </div>
             <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-700">
                <p className="font-semibold text-white">Another Example</p>
                <p className="text-2xl font-bold text-purple-400 mt-2">5</p>
                <p className="text-xs">Favorite Souls</p>
            </div>
        </div>
    );
};

const SoulProfileLeftPane: React.FC<{ 
    activeSoul: Soul | null;
    personas: Persona[];
    onUpdateSoul: (updates: Partial<Soul>) => void;
    onOpenTiePersonaModal: () => void;
    onUntiePersona: () => void;
    onOpenUnlockModal: (soulId: string) => void;
}> = ({ activeSoul, onUpdateSoul, onOpenUnlockModal }) => {
    
    if (!activeSoul) {
        return (
            <div className="flex flex-col items-center justify-start text-center h-full pt-4 space-y-4 px-4">
                <div className="text-neutral-500 pt-16">No Soul selected.</div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col items-center justify-start text-center h-full pt-4 space-y-4 px-4">
            <div className="flex items-center justify-center gap-2">
                {activeSoul.tradable && (
                    <button onClick={() => onOpenUnlockModal(activeSoul.id)} title="This Soul is tradable and locked for editing. Click to unlock.">
                        <img src="https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/padlock.png?alt=media&token=d02915b4-cde4-4d20-a742-b61ab372a28f" alt="Locked" className="w-6 h-6" />
                    </button>
                )}
                <h2 className="text-xl font-bold text-white tracking-wider truncate max-w-full">{activeSoul.name}</h2>
            </div>
            <div className="w-56 h-56 border-2 border-cyan-400/50 rounded-lg overflow-hidden shadow-lg bg-black/30 flex items-center justify-center">
                {activeSoul.avatar ? (
                    <img src={activeSoul.avatar} alt="Soul Avatar" className="w-full h-full object-cover" />
                ) : (
                    <UserCircleIcon className="w-48 h-48 text-neutral-600" />
                )}
            </div>

            <div className="w-full text-left pt-4">
                <CollapsibleSection isOpen={true} title={<h3 className="text-base font-semibold text-white">Soul Profile</h3>}>
                    <div className="space-y-4 pt-2">
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Soul name</label>
                            <input
                                type="text"
                                value={activeSoul.name || ''}
                                onChange={(e) => onUpdateSoul({ name: e.target.value })}
                                className="w-full bg-neutral-800/60 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none border border-neutral-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Soul gender</label>
                            <div className="flex gap-2">
                                <SoulGenderButton gender="Male" current={activeSoul.gender} onClick={() => onUpdateSoul({ gender: 'Male' })} />
                                <SoulGenderButton gender="Female" current={activeSoul.gender} onClick={() => onUpdateSoul({ gender: 'Female' })} />
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
};

// --- Main Menu Modal ---
interface HomeMenuModalProps {
  isOpen: boolean; 
  onClose: () => void;
  accountSettings: AccountSettings;
  setAccountSettings: (updater: (prev: AccountSettings) => AccountSettings) => void;
  activeSoul: Soul | null;
  setActiveSoul: (updates: Partial<Soul>) => void;
  onOpenCreateModal: () => void;
  onOpenDiscoverModal: () => void;
  onViewTemplate: (soulId: string) => void;
  onPinSoul: (soulId: string) => void;
  onOpenDeletionModal: (soulId: string) => void;
  onCancelDeletion: (soulId: string) => void;
  onImmediateDelete: (soulId: string) => void;
  onOpenUserAvatarModal: () => void;
  onOpenJournalModal: () => void;
  setToast: (toast: { title: string; message: React.ReactNode } | null) => void;
  onOpenSavePersonaModal: () => void;
  onOpenManagePersonasModal: () => void;
  applyPersona: (persona: Persona) => void;
  onOpenSubscriptionPage: () => void;
  onOpenUnlockModal: (soulId: string) => void;
}

const mainTabs = ['Profile', 'Soul'];
const subTabsData: Record<string, { name: string; icon: string }[]> = {
  'Profile': [
    { name: 'Main', icon: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Components%2FCodex%2Favatar.png?alt=media&token=dc1df3ef-39cd-415c-853d-405aa9e8a7ab" },
    { name: 'Statistics', icon: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Components%2FCodex%2Fgrowth.png?alt=media&token=07124bea-b20b-431e-8b39-7c040193f1a2" },
  ],
  'Soul': [
    { name: 'Backstory', icon: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Soulverse%20icon%20topbar%2Fquote-request.png?alt=media&token=93f9c09d-dd10-47b4-aac5-ffe12f0e0501" },
    { name: 'Settings', icon: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Soulverse%20icon%20topbar%2Fsettings.png?alt=media&token=e3bd0463-a321-4fbf-89a4-5d6d03e36668" },
    { name: 'Avatar', icon: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Soulverse%20icon%20topbar%2Fface-scan.png?alt=media&token=4a0c10ac-3b01-4c9c-ac58-7bf50c431b82" },
  ],
};

const TopTabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`font-sans px-8 py-2 text-lg font-semibold transition-colors relative ${
            isActive ? 'text-cyan-300' : 'text-neutral-500 hover:text-neutral-300'
        }`}
    >
        {label}
        {isActive && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_theme(colors.cyan.400)]"></div>}
    </button>
);

// MODALS FOR PERSONA MANAGEMENT (re-integrated here)

export const HomeMenuModal: React.FC<HomeMenuModalProps> = (props) => {
  const [activeMainTab, setActiveMainTab] = useState('Profile');
  const [activeSubTab, setActiveSubTab] = useState('Backstory');
  const [activeProfileSubTab, setActiveProfileSubTab] = useState('Main');
  const [isTiePersonaModalOpen, setIsTiePersonaModalOpen] = useState(false);
  
  const { currentUser } = useAuth();
  
  const [localAccountSettings, setLocalAccountSettings] = useState(props.accountSettings);
  const activeSoulId = props.activeSoul?.id;
  const localActiveSoul = activeSoulId
    ? (localAccountSettings.souls.find(s => s.id === activeSoulId) || props.activeSoul)
    : null;

  const handleAccountSettingChange = <K extends keyof AccountSettings>(key: K, value: AccountSettings[K]) => {
    setLocalAccountSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleLocalSoulUpdate = useCallback((updates: Partial<Soul>) => {
    if (activeSoulId) {
        setLocalAccountSettings(prev => {
            const updatedSouls = prev.souls.map(s => 
                s.id === activeSoulId ? { ...s, ...updates } : s
            );
            return { ...prev, souls: updatedSouls };
        });
    }
  }, [activeSoulId]);

  // Effect to update localActiveSoul when localAccountSettings.souls changes
  

  const handleSave = () => {
    props.setAccountSettings(() => localAccountSettings);
    props.setToast({ title: 'Settings Saved', message: 'Your changes have been saved successfully.' });
  };
  
  const handleMainTabClick = (tab: string) => {
    setActiveMainTab(tab);
    if (tab === 'Soul') {
        setActiveSubTab('Backstory');
    }
    if (tab === 'Profile') {
        setActiveProfileSubTab('Main');
    }
  };

  const handleTiePersona = useCallback((personaId: string) => {
    if (activeSoulId) {
        setLocalAccountSettings(prev => {
            const updatedSouls = prev.souls.map(s => 
                s.id === activeSoulId ? { ...s, tiedPersonaId: personaId } : s
            );
            return { ...prev, souls: updatedSouls };
        });
    }
  }, [activeSoulId]);

  const handleUntiePersona = useCallback(() => {
    if (activeSoulId) {
        setLocalAccountSettings(prev => {
            const updatedSouls = prev.souls.map(s => 
                s.id === activeSoulId ? { ...s, tiedPersonaId: null } : s
            );
            return { ...prev, souls: updatedSouls };
        });
    }
  }, [activeSoulId]);

  const renderLeftContent = () => {
    switch (activeMainTab) {
        case 'Profile': return <UserProfileLeftPane 
                                localAccountSettings={localAccountSettings} 
                                currentUser={currentUser} 
                                onOpenUserAvatarModal={props.onOpenUserAvatarModal}
                                handleAccountSettingChange={handleAccountSettingChange}
                               />;
        case 'Soul': return <SoulProfileLeftPane 
                            activeSoul={localActiveSoul} 
                            personas={localAccountSettings.personas || []}
                            onUpdateSoul={handleLocalSoulUpdate}
                            onOpenTiePersonaModal={() => setIsTiePersonaModalOpen(true)}
                            onUntiePersona={handleUntiePersona}
                            onOpenUnlockModal={props.onOpenUnlockModal}
                           />;
        default: return null;
    }
  };

  const renderRightContent = () => {
    switch (activeMainTab) {
        case 'Profile':
            switch (activeProfileSubTab) {
                case 'Main':
                    return <UserProfileRightPane 
                            localAccountSettings={localAccountSettings} 
                            handleAccountSettingChange={handleAccountSettingChange} 
                            onOpenSavePersonaModal={props.onOpenSavePersonaModal}
                            onOpenManagePersonasModal={props.onOpenManagePersonasModal}
                           />;
                case 'Statistics':
                    return <UserProfileStatisticsPane />;
                default:
                    return <UserProfileRightPane 
                            localAccountSettings={localAccountSettings} 
                            handleAccountSettingChange={handleAccountSettingChange} 
                            onOpenSavePersonaModal={props.onOpenSavePersonaModal}
                            onOpenManagePersonasModal={props.onOpenManagePersonasModal}
                           />;
            }
        case 'Soul': {
            if (!localActiveSoul) {
                return <div className="p-6 text-center text-neutral-400"><h2 className="text-lg font-semibold mb-2 text-white">No Soul Selected</h2><p>Please select a Soul from the main menu to change its settings.</p></div>;
            }
            const { activeSoul } = props;
            const isV4Model = activeSoul?.model === 'gemini-2.5-pro';
            
            const reasoningEffort = localActiveSoul.reasoningEffort ?? 1;
            const reasoningLabels = ["Speedy", "Moderate", "Slow", "Very Slow"];
            const reasoningDescriptions = [
                "Speedy replies with minimal hidden planning. Best for spontaneous and natural responses.",
                "Deeper pass of reasoning for more reliable answers while staying highly responsive.",
                "More reasoning that keeps context, at the expense of latency.",
                "Deliberate, slower reasoning for maximum depth and fewer mistakes."
            ];

            const soulProps = {
                ...props,
                activeSoul: localActiveSoul,
                accountSettings: localAccountSettings,
                setActiveSoul: handleLocalSoulUpdate,
                currentUser: currentUser
            };
            switch (activeSubTab) {
                case 'Backstory': return <BackstoryPageContent {...soulProps} />;
                case 'Settings': 
                    return (
                        <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                             <CollapsibleSection
                                isOpen={true}
                                title={<h3 className="text-base md:text-lg font-semibold text-white">Chat Intelligence</h3>}
                                description="Control the creativity and thought process of the AI."
                            >
                                <div className="space-y-6 pt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">Chat Dynamism</label>
                                        <div className="flex items-center gap-4">
                                            <Slider
                                                min={0.20}
                                                max={1.00}
                                                step={0.01}
                                                value={activeSoul.dynamism ?? 0.95}
                                                onChange={(val) => setActiveSoul({ dynamism: val })}
                                            />
                                            <div className="w-20 bg-neutral-700/60 p-2 rounded-md text-center font-semibold">
                                                {(activeSoul.dynamism ?? 0.95).toFixed(2)}
                                            </div>
                                        </div>
                                        <p className="text-xs text-neutral-500 mt-1">Controls creativity. Lower is more predictable, higher is more chaotic. Default: 0.95.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">Reasoning Effort</label>
                                        <div className="flex items-center gap-4">
                                            <Slider
                                                min={0}
                                                max={3}
                                                step={1}
                                                value={reasoningEffort}
                                                onChange={(val) => handleLocalSoulUpdate({ reasoningEffort: val })}
                                            />
                                            <div className="w-20 bg-neutral-700/60 p-2 rounded-md text-center font-semibold">
                                                {reasoningLabels[reasoningEffort]}
                                            </div>
                                        </div>
                                        <p className="text-xs text-neutral-500 mt-1">{reasoningDescriptions[reasoningEffort]}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">Anti-Repeat Strength</label>
                                        <div className="flex items-center gap-4">
                                            <Slider
                                                min={0}
                                                max={1}
                                                step={0.01}
                                                value={activeSoul.antiRepeatStrength ?? 0.00}
                                                onChange={(val) => setActiveSoul({ antiRepeatStrength: val })}
                                            />
                                            <div className="w-20 bg-neutral-700/60 p-2 rounded-md text-center font-semibold">
                                                {(activeSoul.antiRepeatStrength ?? 0.00).toFixed(2)}
                                            </div>
                                        </div>
                                        <p className="text-xs text-neutral-500 mt-1">Attempts to reduce repetition. May alter personality. Start low. Default: 0 (off).</p>
                                    </div>
                                </div>
                            </CollapsibleSection>
                            <CollapsibleSection
                                isOpen={true}
                                title={<h3 className="text-base md:text-lg font-semibold text-white">Long-term Memory Controls</h3>}
                                description="Control whether your Souls should consolidate and recall long-term memory. This setting applies to all your Souls."
                            >
                                <div className="space-y-4 pt-4">
                                    <ToggleItem
                                    label="Memory Consolidation"
                                    description="Allow this Soul to consolidate memories from chats into long-term memory."
                                    checked={localActiveSoul.memoryConsolidation}
                                    onChange={(checked) => handleLocalSoulUpdate({ memoryConsolidation: checked })}
                                    />
                                    <ToggleItem
                                    label="Memory Recall"
                                    description="Allow this Soul to access its long-term memory during conversation."
                                    checked={localActiveSoul.memoryRecall}
                                    onChange={(checked) => handleLocalSoulUpdate({ memoryRecall: checked })}
                                    />
                                </div>
                            </CollapsibleSection>
                        </div>
                    );
                case 'Avatar': return <AvatarPageContent {...soulProps} />;
                default: return <div className="p-4">Select a category</div>;
            }
        }
        default: return null;
    }
  };
  
  const currentSubTabs = subTabsData[activeMainTab] || [];
  const activeSubTabName = activeMainTab === 'Profile' ? activeProfileSubTab : activeSubTab;
  const setActiveSubTabByName = activeMainTab === 'Profile' ? setActiveProfileSubTab : setActiveSubTab;

  return (
    <>
    <SelectPersonaModal
        isOpen={isTiePersonaModalOpen}
        onClose={() => setIsTiePersonaModalOpen(false)}
        personas={localAccountSettings.personas || []}
        onSelect={handleTiePersona}
    />
    <div className="w-full h-full flex items-center justify-center font-sans text-white">
        <style>{`.codex-bg { background-image: url('https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/codex%20(1).png?alt=media&token=df65728b-b59d-4953-8504-81501d01b498'); }`}</style>
        <div 
            className="relative w-full max-w-5xl aspect-[958/821] border border-white/10 bg-gradient-to-b from-cyan-800/50 to-purple-900/50 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden"
            style={{ backgroundImage: 'var(--bg-menu-gradient)' }}
        >
            <div className="absolute inset-0 codex-bg bg-contain bg-no-repeat bg-center pointer-events-none" />
            <button onClick={props.onClose} className="absolute flex items-center justify-center rounded-full hover:bg-black/20" style={{ top: '6.5%', right: '5.5%', width: '4.5%', height: '5.5%' }} aria-label="Close Codex">
                <XMarkIcon className="w-6 h-6"/>
            </button>
            <div className="absolute flex items-end space-x-[-1px]" style={{ top: '6.5%', left: '8%', height: '7.5%', width: 'auto' }}>
                {mainTabs.map(tab => (
                    <TopTabButton key={tab} label={tab} isActive={activeMainTab === tab} onClick={() => handleMainTabClick(tab)} />
                ))}
            </div>
            <div className="absolute flex" style={{ top: '15%', left: '6.8%', width: '86.4%', height: '77%' }}>
                <div className="absolute overflow-y-auto" style={{ top: '4.5%', left: '5%', width: '35%', height: '90%' }}>
                   {renderLeftContent()}
                </div>
                <div className="absolute" style={{ top: '2.5%', left: '50%', width: '48%', height: '90%', position: 'relative' }}>
                    <div className="h-full w-full overflow-y-auto pb-20">
                       {renderRightContent()}
                    </div>
                    {(activeMainTab === 'Profile' || (activeMainTab === 'Soul' && localActiveSoul)) && (
                        <button
                            onClick={handleSave}
                            className="absolute py-2 px-8 rounded-md text-sm font-medium transition-colors bg-gradient-cyan-purple text-white hover:opacity-90"
                            style={{ bottom: '6.5%', right: '8%' }}
                        >
                            Save
                        </button>
                    )}
                </div>
                {currentSubTabs.length > 0 && (
                    <div className="absolute flex flex-col space-y-1" style={{ top: `4.0%`, right: `-5.0%`, width: '8%', height: '80%' }}>
                        {currentSubTabs.map(subTab => (
                            <button 
                                key={subTab.name} 
                                onClick={() => setActiveSubTabByName(subTab.name)} 
                                className={`relative w-full aspect-square transition-transform hover:scale-110 mb-2 ${activeSubTabName === subTab.name ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                                title={subTab.name}
                            >
                                <img src={subTab.icon} alt={subTab.name} className="w-7 h-7 object-contain mx-auto" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
    </>
  );
};