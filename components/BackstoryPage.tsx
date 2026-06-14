import React, { useState, useRef } from 'react';
import { Soul, AccountSettings, SoulRole } from '../types';
import { getSubscriptionBenefits } from '../services/subscriptionService';
import { CollapsibleSection } from './ui/CollapsibleSection';
import { ChevronDownIcon, ExclamationTriangleIcon } from './icons/Icons';
import { User } from '../contexts/AuthContext';

interface BackstoryPageContentProps {
  activeSoul: Soul;
  setActiveSoul: (updates: Partial<Soul>) => void;
  accountSettings: AccountSettings;
  onOpenJournalModal: () => void;
  currentUser: User | null;
}

const mbtiTypes = ['ISTJ', 'ESTJ', 'ISFJ', 'ESFJ', 'ESFP', 'ISFP', 'ESTP', 'ISTP', 'INFJ', 'ENFJ', 'INFP', 'ENFP', 'INTP', 'ENTP', 'INTJ', 'ENTJ'];
const enneagramTypes = ['1w2', '1w9', '2w1', '2w3', '3w2', '3w4', '4w3', '4w5', '5w4', '5w6', '6w5', '6w7', '7w6', '7w8', '8w7', '8w9', '9w8', '9w1'];

export const BackstoryPageContent: React.FC<BackstoryPageContentProps> = ({ activeSoul, setActiveSoul, accountSettings, onOpenJournalModal, currentUser }) => {
    const [openSections, setOpenSections] = useState({
        backstory: false,
        additionalContext: false,
        personality: false,
        responseDirective: false,
        keyMemories: false,
        greeting: false,
        exampleMessage: false,
        characterSheet: false,
        journal: false,
    });

    const [localSoulData, setLocalSoulData] = useState(activeSoul);

    const fileInputRef = useRef<HTMLInputElement>(null);

    

    const handleTextChange = (field: keyof typeof localSoulData, value: string) => {
        setLocalSoulData(prev => ({ ...prev, [field]: value }));
    };

    const handleBlur = (field: keyof typeof localSoulData) => {
        if (activeSoul[field as keyof Soul] !== localSoulData[field]) {
            setActiveSoul({ [field]: localSoulData[field] });
        }
    };

    const benefits = getSubscriptionBenefits(accountSettings);
    const isEditable = activeSoul.tradable !== true;

    const isAdminOverLimit = (currentLength: number, limit: number) => {
        return accountSettings.adminMode && currentLength > limit;
    };

    const greetingLimit = 2000;
    const exampleMessageLimit = 2000;

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleDownloadCS = () => {
        if (!activeSoul) return;
        const content = activeSoul.characterSheet || '';
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeSoul.name}_CharacterSheet.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownload = () => {
        if (!activeSoul) return;

        const content = [
            `Backstory\n${localSoulData.backstory}`,
            `Additional Context\n${localSoulData.additionalContext}`,
            `Personality\nMBTI: ${activeSoul.mbti || ''}\nEnneagram: ${activeSoul.enneagram || ''}`,
            `Response Directive\n${localSoulData.responseDirective}`,
            `Key Memories\n${localSoulData.keyMemories}`,
            `Greeting Message\n${localSoulData.greeting}`,
            `Example Message\n${localSoulData.exampleMessage}`,
            `Character Sheet\n${localSoulData.characterSheet}`,
        ].join('\n~~\n');

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeSoul.name}_backstory.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) return;

            const updates: Partial<Soul> = {};
            const sections = text.split('\n~~\n');

            sections.forEach(section => {
                const lines = section.split('\n');
                const title = lines.shift()?.trim();
                const content = lines.join('\n');

                switch (title) {
                    case 'Backstory':
                        updates.backstory = content;
                        break;
                    case 'Additional Context':
                        updates.additionalContext = content;
                        break;
                    case 'Response Directive':
                        updates.responseDirective = content;
                        break;
                    case 'Key Memories':
                        updates.keyMemories = content;
                        break;
                    case 'Greeting Message':
                        updates.greeting = content;
                        break;
                    case 'Example Message':
                        updates.exampleMessage = content;
                        break;
                    case 'Character Sheet':
                        updates.characterSheet = content;
                        break;
                    case 'Personality': {
                        const mbtiLine = lines.find(l => l.startsWith('MBTI:'));
                        const enneagramLine = lines.find(l => l.startsWith('Enneagram:'));
                        if (mbtiLine) {
                            updates.mbti = mbtiLine.replace('MBTI:', '').trim() || null;
                        }
                        if (enneagramLine) {
                            updates.enneagram = enneagramLine.replace('Enneagram:', '').trim() || null;
                        }
                        break;
                    }
                }
            });

            setActiveSoul(updates);
        };
        reader.readAsText(file);
        
        if (event.target) {
            event.target.value = '';
        }
    };
    
    return (
        <div className="p-4 md:p-6 space-y-3 md:space-y-4">
             <CollapsibleSection
                isOpen={openSections.backstory}
                onToggle={() => toggleSection('backstory')}
                title={
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base md:text-lg font-semibold text-white">Backstory</h3>
                            <span className={`text-xs md:text-sm font-medium ${isAdminOverLimit(localSoulData.backstory.length, benefits.soulBackstoryChars) ? 'text-red-500 font-bold' : 'text-white'}`}>
                                {localSoulData.backstory.length} / {benefits.soulBackstoryChars}
                            </span>
                        </div>
                        <ChevronDownIcon className={`w-4 h-4 text-neutral-400 transition-transform ${openSections.backstory ? 'rotate-180' : ''}`} />
                    </div>
                }
                description="Strong influence on your Soul. The backstory describes the NPC’s past context and their relationship with you. Write in 3rd person, use proper nouns, and be clear & concise."
            >
                <textarea
                    id="backstory"
                    value={localSoulData.backstory}
                    onChange={(e) => handleTextChange('backstory', e.target.value)}
                    onBlur={() => handleBlur('backstory')}
                    maxLength={accountSettings.adminMode ? 99999 : benefits.soulBackstoryChars}
                    rows={12}
                    readOnly={!isEditable}
                    className={`w-full bg-neutral-700/60 border border-neutral-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm resizable-textarea ${!isEditable ? 'cursor-not-allowed opacity-70' : ''}`}
                />
            </CollapsibleSection>

            {benefits.additionalBackstoryChars > 0 && (
                <CollapsibleSection
                    isOpen={openSections.additionalContext}
                    onToggle={() => toggleSection('additionalContext')}
                    title={
                        <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base md:text-lg font-semibold text-white">Additional Context</h3>
                                <span className={`text-xs md:text-sm font-medium ${isAdminOverLimit(localSoulData.additionalContext.length, benefits.additionalBackstoryChars) ? 'text-red-500 font-bold' : 'text-white'}`}>
                                    {localSoulData.additionalContext.length} / {benefits.additionalBackstoryChars}
                                </span>
                            </div>
                            <ChevronDownIcon className={`w-4 h-4 text-neutral-400 transition-transform ${openSections.additionalContext ? 'rotate-180' : ''}`} />
                        </div>
                    }
                    description="For users on Ultra or MAX add-on tiers, this serves as an additional backstory section and is treated identically to backstory by the AI."
                >
                    <textarea
                        id="additionalContext"
                        value={localSoulData.additionalContext}
                        onChange={(e) => handleTextChange('additionalContext', e.target.value)}
                        onBlur={() => handleBlur('additionalContext')}
                        maxLength={accountSettings.adminMode ? 99999 : benefits.additionalBackstoryChars}
                        rows={8}
                        readOnly={!isEditable}
                        className={`w-full bg-neutral-700/60 border border-neutral-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm resizable-textarea ${!isEditable ? 'cursor-not-allowed opacity-70' : ''}`}
                    />
                </CollapsibleSection>
            )}

             <CollapsibleSection
                isOpen={openSections.personality}
                onToggle={() => toggleSection('personality')}
                 title={
                    <div className="flex justify-between items-center w-full">
                       <div className="flex items-center gap-2">
                            <h3 className="text-base md:text-lg font-semibold text-white">Personality</h3>
                        </div>
                       <ChevronDownIcon className={`w-4 h-4 text-neutral-400 transition-transform ${openSections.personality ? 'rotate-180' : ''}`} />
                    </div>
                }
                description="Shape your Soul's core personality using established frameworks."
            >
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                        <label htmlFor="mbti-select" className="block text-xs font-medium text-neutral-400 mb-1">Four Letter</label>
                        <select
                            id="mbti-select"
                            value={activeSoul.mbti || ''}
                            onChange={(e) => setActiveSoul({ mbti: e.target.value || null })}
                            disabled={!isEditable}
                            className="w-full bg-neutral-700/60 border border-neutral-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="">Select...</option>
                            {mbtiTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="enneagram-select" className="block text-xs font-medium text-neutral-400 mb-1">Enneagram</label>
                        <select
                            id="enneagram-select"
                            value={activeSoul.enneagram || ''}
                            onChange={(e) => setActiveSoul({ enneagram: e.target.value || null })}
                            disabled={!isEditable}
                            className="w-full bg-neutral-700/60 border border-neutral-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="">Select...</option>
                            {enneagramTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                    The chosen MBTI and Enneagram types can help shape your Soul's core personality, influencing how it expresses itself, reacts, and engages in conversation.
                </p>
            </CollapsibleSection>

             <CollapsibleSection
                isOpen={openSections.responseDirective}
                onToggle={() => toggleSection('responseDirective')}
                note={<>Warning: directives are very strong & easy to misuse. Try simple ones to start, and ask the community for help if you're unsure.</>}
                title={
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base md:text-lg font-semibold text-white">Response Directive</h3>
                            <span className={`text-xs md:text-sm font-medium ${isAdminOverLimit(localSoulData.responseDirective.length, benefits.soulResponseDirectiveChars) ? 'text-red-500 font-bold' : 'text-white'}`}>
                                {localSoulData.responseDirective.length} / {benefits.soulResponseDirectiveChars}
                            </span>
                        </div>
                       <ChevronDownIcon className={`w-4 h-4 text-neutral-400 transition-transform ${openSections.responseDirective ? 'rotate-180' : ''}`} />
                    </div>
                }
                description="Very strong influence on your Soul. You can strongly direct and specify length, tone, personality, descriptiveness, formatting, etc."
            >
                 <textarea
                    id="responseDirective"
                    value={localSoulData.responseDirective}
                    onChange={(e) => handleTextChange('responseDirective', e.target.value)}
                    onBlur={() => handleBlur('responseDirective')}
                    maxLength={accountSettings.adminMode ? 99999 : benefits.soulResponseDirectiveChars}
                    rows={4}
                    readOnly={!isEditable}
                    className={`w-full bg-neutral-700/60 border border-neutral-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm resizable-textarea ${!isEditable ? 'cursor-not-allowed opacity-70' : ''}`}
                />
            </CollapsibleSection>
            
             <CollapsibleSection
                isOpen={openSections.keyMemories}
                onToggle={() => toggleSection('keyMemories')}
                title={
                     <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base md:text-lg font-semibold text-white">Key Memories</h3>
                            <span className={`text-xs md:text-sm font-medium ${isAdminOverLimit(localSoulData.keyMemories.length, benefits.soulKeyMemoriesChars) ? 'text-red-500 font-bold' : 'text-white'}`}>
                                {localSoulData.keyMemories.length} / {benefits.soulKeyMemoriesChars}
                            </span>
                        </div>
                       <ChevronDownIcon className={`w-4 h-4 text-neutral-400 transition-transform ${openSections.keyMemories ? 'rotate-180' : ''}`} />
                    </div>
                }
                description="Moderate influence on your Soul. Key memories are things NPC should always remember, about them or you. Write in 3rd person, use proper nouns, and be clear & concise."
            >
                <textarea
                    id="keyMemories"
                    value={localSoulData.keyMemories}
                    onChange={(e) => handleTextChange('keyMemories', e.target.value)}
                    onBlur={() => handleBlur('keyMemories')}
                    maxLength={accountSettings.adminMode ? 99999 : benefits.soulKeyMemoriesChars}
                    rows={12}
                    readOnly={!isEditable}
                    className={`w-full bg-neutral-700/60 border border-neutral-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm resizable-textarea ${!isEditable ? 'cursor-not-allowed opacity-70' : ''}`}
                />
            </CollapsibleSection>

            <CollapsibleSection
                isOpen={openSections.greeting}
                onToggle={() => toggleSection('greeting')}
                title={
                     <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base md:text-lg font-semibold text-white">Greeting Message</h3>
                            <span className={`text-xs md:text-sm font-medium ${isAdminOverLimit(localSoulData.greeting.length, greetingLimit) ? 'text-red-500 font-bold' : 'text-white'}`}>
                                {localSoulData.greeting.length} / {greetingLimit}
                            </span>
                        </div>
                       <ChevronDownIcon className={`w-4 h-4 text-neutral-400 transition-transform ${openSections.greeting ? 'rotate-180' : ''}`} />
                    </div>
                }
                description="The first message your Soul sends in a new conversation."
            >
                 <textarea
                    id="greeting"
                    value={localSoulData.greeting}
                    onChange={(e) => handleTextChange('greeting', e.target.value)}
                    onBlur={() => handleBlur('greeting')}
                    maxLength={accountSettings.adminMode ? 99999 : greetingLimit}
                    rows={4}
                    readOnly={!isEditable}
                    className={`w-full bg-neutral-700/60 border border-neutral-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm resizable-textarea ${!isEditable ? 'cursor-not-allowed opacity-70' : ''}`}
                />
            </CollapsibleSection>

            <CollapsibleSection
                isOpen={openSections.exampleMessage}
                onToggle={() => toggleSection('exampleMessage')}
                title={
                     <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base md:text-lg font-semibold text-white">Example Message</h3>
                            <span className={`text-xs md:text-sm font-medium ${isAdminOverLimit(localSoulData.exampleMessage.length, exampleMessageLimit) ? 'text-red-500 font-bold' : 'text-white'}`}>
                                {localSoulData.exampleMessage.length} / {exampleMessageLimit}
                            </span>
                        </div>
                       <ChevronDownIcon className={`w-4 h-4 text-neutral-400 transition-transform ${openSections.exampleMessage ? 'rotate-180' : ''}`} />
                    </div>
                }
                description="Moderate influence on your Soul. The example message is a reference for the tone, mannerisms, message lengths, etc. Write it from the perspective of your Soul."
            >
                <textarea
                    id="exampleMessage"
                    value={localSoulData.exampleMessage}
                    onChange={(e) => handleTextChange('exampleMessage', e.target.value)}
                    onBlur={() => handleBlur('exampleMessage')}
                    maxLength={accountSettings.adminMode ? 99999 : exampleMessageLimit}
                    rows={12}
                    readOnly={!isEditable}
                    className={`w-full bg-neutral-700/60 border border-neutral-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm resizable-textarea ${!isEditable ? 'cursor-not-allowed opacity-70' : ''}`}
                />
            </CollapsibleSection>

            {(accountSettings.gameMode || activeSoul.role === SoulRole.SCENARIO) && (
                <CollapsibleSection
                    isOpen={openSections.characterSheet}
                    onToggle={() => toggleSection('characterSheet')}
                    title={
                        <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base md:text-lg font-semibold text-white">Character Sheet</h3>
                                <span className={`text-xs md:text-sm font-medium ${isAdminOverLimit((localSoulData.characterSheet || '').length, 10000) ? 'text-red-500 font-bold' : 'text-white'}`}>
                                    {(localSoulData.characterSheet || '').length} / 10000
                                </span>
                            </div>
                            <ChevronDownIcon className={`w-4 h-4 text-neutral-400 transition-transform ${openSections.characterSheet ? 'rotate-180' : ''}`} />
                        </div>
                    }
                    description="Contains all essential details for RPGs, including abilities, stats, and equipment."
                >
                    <div className="flex items-start gap-3 text-sm text-red-300 bg-red-900/40 border border-red-500/50 p-3 rounded-md my-4">
                        <ExclamationTriangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-400" />
                        <p>
                            The Character Sheet shows your current character. If you want to change gender, backstory, or character, first inform the Game Master and note it in Key Memories. Character Sheet is for reference only and cannot be edited!
                        </p>
                    </div>
                    <textarea
                        value={localSoulData.characterSheet}
                        onChange={(e) => handleTextChange('characterSheet', e.target.value)}
                        onBlur={() => handleBlur('characterSheet')}
                        maxLength={accountSettings.adminMode ? 99999 : 10000}
                        rows={12}
                        readOnly={!isEditable || ((accountSettings.gameMode || activeSoul.role === SoulRole.SCENARIO) && !accountSettings.adminMode)}
                        className={`w-full bg-neutral-700/60 border border-neutral-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm resizable-textarea ${(!isEditable || ((accountSettings.gameMode || activeSoul.role === SoulRole.SCENARIO) && !accountSettings.adminMode)) ? 'cursor-not-allowed opacity-70' : ''}`}
                    />
                    <div className="flex justify-between items-center mt-1">
                        <button onClick={handleDownloadCS} className="text-sm text-blue-400 hover:text-blue-300 underline">
                            Download CS
                        </button>
                    </div>
                </CollapsibleSection>
            )}
            
            <div className="py-1">
                <div className="p-2">
                    <div className="flex items-center gap-2">
                        <h3 className="text-base md:text-lg font-semibold text-white">Journal entries</h3>
                    </div>
                    <p className="px-2 pb-1 text-sm text-neutral-500">
                        Journal entries can be recalled when you mention a specific matching keyphrase in conversation and can be used as a flexible information bank or lorebook. AI-specific journal entries are only for the current Soul, while global journals are shared across all Souls.
                    </p>
                </div>
                <div className="pt-2">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={onOpenJournalModal} className="w-full py-2 px-4 rounded-md text-sm font-medium transition-colors bg-neutral-700/60 hover:bg-neutral-600">
                           {activeSoul.name} Journal
                        </button>
                        <button onClick={() => alert("Global journal management is not yet implemented.")} className="w-full py-2 px-4 rounded-md text-sm font-medium transition-colors bg-neutral-700/60 hover:bg-neutral-600">
                           Global Journal
                        </button>
                    </div>
                </div>
            </div>
            {currentUser?.email === 'gkryniecki@gmail.com' && (
                <div className="pt-4 mt-4 border-t border-neutral-700/60">
                    <h3 className="text-base md:text-lg font-semibold text-white mb-4">Admin Import/Export</h3>
                    <div className="flex gap-4">
                            <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".txt"
                            style={{ display: 'none' }}
                        />
                        <button
                            onClick={handleDownload}
                            className="w-full py-2 px-4 rounded-md text-sm font-medium transition-colors bg-neutral-700/60 hover:bg-neutral-600"
                        >
                            Download .txt
                        </button>
                        <button
                            onClick={handleUploadClick}
                            className="w-full py-2 px-4 rounded-md text-sm font-medium transition-colors bg-neutral-700/60 hover:bg-neutral-600"
                        >
                            Upload .txt
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
