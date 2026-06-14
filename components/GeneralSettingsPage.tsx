import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AccountSettings, Hotkey, Soul } from '../types';
import { CheckIcon } from './icons/Icons';
import { Toggle } from './ui/Toggle';
import { CollapsibleSection } from './ui/CollapsibleSection';
import { BackstoryPageContent } from './BackstoryPage';
import { User } from '../contexts/AuthContext';

// New HotkeysTab Component
const defaultHotkeys: Hotkey[] = [
  { command: 'openCollection', label: 'Open Collection', key: 'c' },
  { command: 'openSeasonPass', label: 'Open Season Pass', key: 'p' },
  { command: 'openSoulNotes', label: 'Open SoulNotes', key: 'n' },
  { command: 'openVault', label: 'Open Vault', key: 'm' },
  { command: 'openSoulBoard', label: 'Open SoulBoard', key: 'b' },
  { command: 'openHomeMenu', label: 'Open Codex', key: 'v' },
  { command: 'openMenu', label: 'Open Options', key: 'o' },
  { command: 'openSelfie', label: 'Open Selfie Page', key: 's' },
  { command: 'openInbox', label: 'Open Inbox', key: 'i' },
];

const HotkeysTab: React.FC<{
  localSettings: AccountSettings;
  onSettingsChange: <K extends keyof AccountSettings>(key: K, value: AccountSettings[K]) => void;
  onSave: () => void;
  onClose: () => void;
}> = ({ localSettings, onSettingsChange, onSave, onClose }) => {
  const [hotkeys, setHotkeys] = useState(localSettings.hotkeys || defaultHotkeys);
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const listeningTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    onSettingsChange('hotkeys', hotkeys);
  }, [hotkeys, onSettingsChange]);

  const handleEditClick = () => {
    if (selectedCommand) {
      setIsListening(true);
      if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = window.setTimeout(() => setIsListening(false), 5000);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isListening && selectedCommand) {
        event.preventDefault();
        event.stopPropagation();
        const newKey = event.key.toLowerCase();
        
        if (hotkeys.some(h => h.key === newKey && h.command !== selectedCommand)) {
          // In a real app, show a toast notification here
          console.warn("Hotkey already in use.");
          setIsListening(false);
          if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
          return;
        }

        setHotkeys(prev => prev.map(h => h.command === selectedCommand ? { ...h, key: newKey } : h));
        setIsListening(false);
        if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown, true); // Use capture phase to prevent other listeners
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isListening, selectedCommand, hotkeys]);

  const handleClearClick = () => {
    if (selectedCommand) {
      setHotkeys(prev => prev.map(h => h.command === selectedCommand ? { ...h, key: '' } : h));
    }
  };

  const handleResetDefaults = () => {
    setHotkeys(defaultHotkeys);
    setSelectedCommand(null);
  };
  
  const baseButtonClasses = "px-6 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const primaryButtonClasses = `${baseButtonClasses} bg-gradient-cyan-purple text-white hover:opacity-90`;
  const secondaryButtonClasses = `${baseButtonClasses} bg-neutral-700/60 hover:bg-neutral-600 text-neutral-200`;
  
  return (
    <div className="text-neutral-300 p-6 flex flex-col h-full">
      <div className="bg-black/20 border border-neutral-700/60 rounded-md p-4 mb-6 h-64 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-sm">
          <div className="font-semibold text-neutral-400 border-b-2 border-neutral-600 pb-2">Commands</div>
          <div className="font-semibold text-neutral-400 border-b-2 border-neutral-600 pb-2">Primary Key</div>
          
          {hotkeys.map(hotkey => (
            <React.Fragment key={hotkey.command}>
              <div 
                onClick={() => setSelectedCommand(hotkey.command)}
                className={`py-1.5 px-2 rounded cursor-pointer ${selectedCommand === hotkey.command ? 'bg-blue-600/30' : 'hover:bg-neutral-700/50'}`}
              >
                {hotkey.label}
              </div>
              <div 
                onClick={() => setSelectedCommand(hotkey.command)}
                className={`py-1.5 px-2 rounded cursor-pointer font-semibold text-center ${selectedCommand === hotkey.command ? 'bg-blue-600/30' : 'hover:bg-neutral-700/50'}`}
              >
                {isListening && selectedCommand === hotkey.command ? "..." : (hotkey.key || '').toUpperCase() || 'Not Set'}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-between">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-neutral-800 border border-neutral-700/80 rounded-md text-neutral-300 font-medium">
                Display Hotkeys
                </div>
                <Toggle checked={localSettings.displayHotkeys ?? false} onChange={(c) => onSettingsChange('displayHotkeys', c)} />
            </div>
            <div className="flex items-center gap-3">
                <button onClick={handleEditClick} disabled={!selectedCommand} className={secondaryButtonClasses}>Edit Hotkey</button>
                <button onClick={handleClearClick} disabled={!selectedCommand} className={secondaryButtonClasses}>Clear Hotkey</button>
            </div>
        </div>

        <div className="border-y-2 border-neutral-800/60 py-6 my-4">
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg text-neutral-400">Default Settings</p>
            <button onClick={handleResetDefaults} className={secondaryButtonClasses}>Hotkeys Default</button>
          </div>
        </div>

        <div className="flex justify-end items-center gap-4">
          <button onClick={onClose} className={secondaryButtonClasses}>Cancel</button>
          <button onClick={onSave} className={primaryButtonClasses}>Ok</button>
        </div>
      </div>
    </div>
  );
};
// End of New Component

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

interface GeneralSettingsPageContentProps {
  accountSettings: AccountSettings;
  setAccountSettings: (updater: (prev: AccountSettings) => AccountSettings) => void;
  onCloseDrawer: () => void;
  setPreviewTheme: (theme: string | null) => void;
  currentUser: User | null;
  onOpenJournalModal: () => void;
}

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
            isActive ? 'text-cyan-300' : 'text-neutral-500 hover:text-neutral-300'
        }`}
    >
        {label}
        {isActive && <div className="absolute bottom-[-2px] left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_8px_theme(colors.cyan.400)]"></div>}
    </button>
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


export const GeneralSettingsPageContent: React.FC<GeneralSettingsPageContentProps> = ({ setAccountSettings, accountSettings, onCloseDrawer, setPreviewTheme, currentUser, onOpenJournalModal }) => {
  const [localAccountSettings, setLocalAccountSettings] = useState(accountSettings);
  const [activeTab, setActiveTab] = useState<'General' | 'Visual' | 'Hotkeys' | 'Notifications' | 'Soul Edit'>('General');
  
  const localActiveSoul = useMemo(() => {
    return localAccountSettings.souls.find(s => s.id === localAccountSettings.activeSoulId) || null;
  }, [localAccountSettings.souls, localAccountSettings.activeSoulId]);

  useEffect(() => {
    setLocalAccountSettings(accountSettings);
  }, [accountSettings]);

  const handleAccountSettingChange = <K extends keyof AccountSettings>(key: K, value: AccountSettings[K]) => {
    setLocalAccountSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSoulSettingChange = (updates: Partial<Soul>) => {
    if (!localActiveSoul) return;
    setLocalAccountSettings(prev => ({
        ...prev,
        souls: prev.souls.map(s => s.id === localActiveSoul.id ? { ...s, ...updates } : s)
    }));
  };

  const handleSave = () => {
    setAccountSettings(() => localAccountSettings);
    setPreviewTheme(null);
    onCloseDrawer();
  };
  
  const handleClose = () => {
    setPreviewTheme(null);
    onCloseDrawer();
  };
  
  const tabs: ('General' | 'Visual' | 'Hotkeys' | 'Notifications' | 'Soul Edit')[] = ['General', 'Visual', 'Hotkeys', 'Notifications'];
  if (accountSettings.adminMode) {
      tabs.push('Soul Edit');
  }

  return (
    <div className="flex flex-col h-full">
        <div className="flex-shrink-0 px-4 border-b-2 border-cyan-500/30">
            <nav className="flex items-center">
                {tabs.map(tab => (
                    <TabButton
                        key={tab}
                        label={tab}
                        isActive={activeTab === tab}
                        onClick={() => setActiveTab(tab)}
                    />
                ))}
            </nav>
        </div>
        
        <div className="flex-1 overflow-y-auto">
            {activeTab === 'General' && (
                <div className="p-6 space-y-8">
                     <CollapsibleSection
                      isOpen={true}
                      title={<h3 className="text-base md:text-lg font-semibold text-white">Global UI Toggles</h3>}
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
                                description="ON: allow multi-paragraph responses for more complex roleplay. OFF: for more stable, concise responses."
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
                </div>
            )}
            {activeTab === 'Visual' && (
                <div className="pt-4 space-y-4 p-6">
                    <p className="text-sm text-neutral-400">Choose a theme to change the main background and menu colors.</p>
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
            )}
            {activeTab === 'Hotkeys' && (
                <HotkeysTab 
                  localSettings={localAccountSettings} 
                  onSettingsChange={handleAccountSettingChange}
                  onSave={handleSave}
                  onClose={handleClose}
                />
            )}
            {activeTab === 'Notifications' && (
                <div className="text-neutral-500 text-center pt-16 p-6">Notifications settings will be configured here.</div>
            )}
            {activeTab === 'Soul Edit' && accountSettings.adminMode && localActiveSoul && (
                 <BackstoryPageContent
                    activeSoul={localActiveSoul}
                    setActiveSoul={handleSoulSettingChange}
                    accountSettings={localAccountSettings}
                    onOpenJournalModal={onOpenJournalModal}
                    currentUser={currentUser}
                />
            )}
        </div>

        {activeTab !== 'Hotkeys' && (
            <div className="flex-shrink-0 p-4 border-t border-neutral-700/60 bg-[#1c1c1c]">
                <button onClick={handleSave} className="w-full py-3 rounded-full font-semibold text-lg text-white bg-gradient-cyan-purple hover:opacity-90 transition-opacity">
                    Save
                </button>
            </div>
        )}
    </div>
  );
};
