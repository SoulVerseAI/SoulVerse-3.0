
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AccountSettings, DrawerContent, Soul } from '../types';
import { CollapsibleSection } from './ui/CollapsibleSection';
import { buildSystemInstruction } from '../services/geminiService';
import { ChevronDownIcon } from './icons/Icons';

interface AdminPanelProps {
  accountSettings: AccountSettings;
  setAccountSettings: (updater: (prev: AccountSettings) => AccountSettings) => void;
  setDrawerContent: (content: DrawerContent) => void;
  onOpenAdminDeleteModal: () => void;
}

const initialThemeColors: { [key: string]: { label: string, value: string } } = {
    '--bg-main': { label: 'Main Background', value: '#101010' },
    '--bg-soul-message': { label: 'Soul Message BG', value: '#292524' },
    '--bg-user-message': { label: 'User Message BG', value: '#2d3045' },
    '--text-soul-name': { label: 'Soul Name Color', value: '#e2a259' },
    '--text-user-name': { label: 'User Name Color', value: '#9ea3e6' },
};

const ColorInput: React.FC<{ label: string, color: string, onChange: (color: string) => void }> = ({ label, color, onChange }) => (
    <div className="flex items-center justify-between">
        <label className="text-sm text-neutral-300">{label}</label>
        <div className="flex items-center gap-2">
            <input
                type="text"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="w-24 bg-neutral-700/60 rounded-md p-1 text-sm text-center border border-neutral-600 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <input
                type="color"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="w-8 h-8 p-0 border-none rounded-md cursor-pointer bg-transparent"
                style={{ backgroundColor: color }}
            />
        </div>
    </div>
);

export const AdminPanel: React.FC<AdminPanelProps> = ({ accountSettings, setAccountSettings, setDrawerContent, onOpenAdminDeleteModal }) => {
    const [themeOverrides, setThemeOverrides] = useState<{ [key: string]: string }>(
        accountSettings.themeOverrides || Object.fromEntries(Object.entries(initialThemeColors).map(([key, val]) => [key, val.value]))
    );
    const [openSections, setOpenSections] = useState({
        theme: false,
        chat: false,
        prompt: false,
        features: false,
    });
    const savedRef = useRef(false);

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const activeSoul = useMemo(() => {
        return accountSettings.souls.find(s => s.id === accountSettings.activeSoulId) || null;
    }, [accountSettings.souls, accountSettings.activeSoulId]);
    
    const [systemPrompt, setSystemPrompt] = useState('');
    
    useEffect(() => {
        const root = document.documentElement;
        
        // Apply live preview
        Object.entries(themeOverrides).forEach(([key, value]) => {
            // FIX: The `value` can be of type `unknown`. Casting to String ensures type compatibility with setProperty.
            root.style.setProperty(key, String(value));
        });
        
        savedRef.current = false;

        return () => {
            // On unmount (e.g. closing panel without saving), revert to saved settings
            if (!savedRef.current) {
                const savedOverrides = accountSettings.themeOverrides || {};
                Object.keys(initialThemeColors).forEach(key => {
                    const savedValue = savedOverrides[key];
                    const defaultValue = initialThemeColors[key as keyof typeof initialThemeColors].value;
                    // FIX: The `savedValue` can be of type `unknown` because it is parsed from a JSON string.
                    // Casting to String ensures type compatibility with setProperty.
                    root.style.setProperty(key, String(savedValue || defaultValue));
                });
            }
        };
    }, [themeOverrides, accountSettings.themeOverrides]);


    useEffect(() => {
        const generatePrompt = async () => {
            if (activeSoul) {
                const prompt = await buildSystemInstruction(activeSoul, accountSettings);
                setSystemPrompt(prompt);
            } else {
                setSystemPrompt("No active soul selected to generate a system prompt.");
            }
        };
        generatePrompt();
    }, [activeSoul, accountSettings]);


    const handleColorChange = (key: string, value: string) => {
        setThemeOverrides(prev => ({ ...prev, [key]: value }));
    };
    
    const handleSave = () => {
        savedRef.current = true;
        setAccountSettings(prev => ({ ...prev, themeOverrides }));
        setDrawerContent('main-menu');
    };

    const handleResetTheme = () => {
        setThemeOverrides(Object.fromEntries(Object.entries(initialThemeColors).map(([key, val]) => [key, val.value])));
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
                <CollapsibleSection
                    isOpen={openSections.theme}
                    onToggle={() => toggleSection('theme')}
                    title={
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">Theme Customizer</h3>
                            <ChevronDownIcon className={`w-4 h-4 text-neutral-400 transition-transform ${openSections.theme ? 'rotate-180' : ''}`} />
                        </div>
                    }
                    description="Change application colors on the fly."
                >
                    <div className="space-y-4 pt-4">
                        {Object.entries(initialThemeColors).map(([key, { label }]) => (
                            <ColorInput
                                key={key}
                                label={label}
                                color={themeOverrides[key] || '#000000'}
                                onChange={(value) => handleColorChange(key, value)}
                            />
                        ))}
                        <button onClick={handleResetTheme} className="text-xs text-neutral-400 hover:text-white underline mt-2">
                            Reset to Defaults
                        </button>
                         <p className="text-xs text-neutral-500 pt-2">
                            Note: Live updates are applied immediately. 'Save' persists them for future sessions.
                         </p>
                    </div>
                </CollapsibleSection>
                
                 <CollapsibleSection
                    isOpen={openSections.chat}
                    onToggle={() => toggleSection('chat')}
                    title={
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">Chat Management</h3>
                            <ChevronDownIcon className={`w-4 h-4 text-neutral-400 transition-transform ${openSections.chat ? 'rotate-180' : ''}`} />
                        </div>
                    }
                    description="Manage chat history and other chat-related admin tasks."
                >
                     <div className="pt-4">
                        <button 
                            onClick={onOpenAdminDeleteModal}
                            className="w-full py-2 px-4 rounded-md text-sm font-medium transition-colors bg-neutral-700/60 hover:bg-neutral-600"
                        >
                           Manage & Delete Messages
                        </button>
                    </div>
                </CollapsibleSection>

                <CollapsibleSection
                    isOpen={openSections.prompt}
                    onToggle={() => toggleSection('prompt')}
                    title={
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">System Prompt Viewer</h3>
                            <ChevronDownIcon className={`w-4 h-4 text-neutral-400 transition-transform ${openSections.prompt ? 'rotate-180' : ''}`} />
                        </div>
                    }
                    description="View the full system prompt sent to the AI for the active Soul."
                >
                    <div className="pt-4 space-y-2">
                         <textarea
                            readOnly
                            value={systemPrompt}
                            rows={15}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-xs font-mono focus:outline-none"
                        />
                        <p className="text-xs text-neutral-500">
                           This is a read-only view. Editing prompt structures requires code changes.
                        </p>
                    </div>
                </CollapsibleSection>
                
                <CollapsibleSection
                    isOpen={openSections.features}
                    onToggle={() => toggleSection('features')}
                    title={
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">Feature Flags (Read-Only)</h3>
                            <ChevronDownIcon className={`w-4 h-4 text-neutral-400 transition-transform ${openSections.features ? 'rotate-180' : ''}`} />
                        </div>
                    }
                    description="View status of experimental features."
                >
                     <div className="pt-4 text-sm text-neutral-400">
                        <p>Modal dimension changes: <span className="font-semibold text-neutral-200">Not Implemented</span></p>
                        <p className="text-xs text-neutral-500 mt-1">This feature would require significant architectural changes and is not currently available.</p>
                    </div>
                </CollapsibleSection>
                <div className="flex items-center justify-end">
                    <button onClick={handleSave} className="py-2 px-6 rounded-md text-sm font-medium transition-opacity bg-gradient-cyan-purple text-white hover:opacity-90">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};
