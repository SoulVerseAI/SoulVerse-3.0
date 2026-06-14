
import React, { useState, useEffect, useRef } from 'react';
import { Soul } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, WandSparklesIcon } from './icons/Icons';
import { CollapsibleSection } from './ui/CollapsibleSection';
import { Slider } from './ui/Slider';
import { GenerateAvatarModal } from './ui/GenerateAvatarModal';
import { SelectGeneratedAvatarModal } from './ui/SelectGeneratedAvatarModal';
import { generateAvatarImage, generateAvatarDescriptionFromImage } from '../services/geminiService';
import { LoadingSpinner } from './icons/Icons';

// Avatar URLs
const femaleAvatars = [
    'https://gkryniecki.wordpress.com/wp-content/uploads/2025/07/fem1.png',
    'https://gkryniecki.wordpress.com/wp-content/uploads/2025/07/fem2.png',
    'https://gkryniecki.wordpress.com/wp-content/uploads/2025/07/fem3.png',
    'https://gkryniecki.wordpress.com/wp-content/uploads/2025/07/fem4.png',
    'https://gkryniecki.wordpress.com/wp-content/uploads/2025/07/fem5.png',
    'https://gkryniecki.wordpress.com/wp-content/uploads/2025/07/fem1anime.png',
    'https://gkryniecki.wordpress.com/wp-content/uploads/2025/07/fem2anime.png',
    'https://gkryniecki.wordpress.com/wp-content/uploads/2025/07/fem3anime.png',
    'https://gkryniecki.wordpress.com/wp-content/uploads/2025/07/fem4anime.png',
    'https://gkryniecki.wordpress.com/wp-content/uploads/2025/07/fem5anime.png',
];

const maleAvatars = [
    'https://gkryniecki.wordpress.com/wp-content/uploads/2025/07/male1.png',
    'https://gkryniecki.wordpress.com/wp-content/uploads/2025/07/male2.png',
    'https://gkryniecki.wordpress.com/wp-content/uploads/2025/07/male3.png',
    'https://gkryniecki.wordpress.com/wp-content/uploads/2025/07/male4.png',
    'https://gkryniecki.wordpress.com/wp-content/uploads/2025/07/male5.png',
    'https://gkryniecki.wordpress.com/wp-content/uploads/2025/07/male1anime.png',
    'https://gkryniecki.wordpress.com/wp-content/uploads/2025/07/male2anime.png',
    'https://gkryniecki.wordpress.com/wp-content/uploads/2025/07/male3anime.png',
    'https://gkryniecki.wordpress.com/wp-content/uploads/2025/07/male4anime.png',
    'https://gkryniecki.wordpress.com/wp-content/uploads/2025/07/male5anime.png',
];

interface AvatarPageProps {
  activeSoul: Soul;
  setActiveSoul: (settings: Partial<Soul>) => void;
  setToast: (toast: { title: string; message: React.ReactNode } | null) => void;
}

export const AvatarPageContent: React.FC<AvatarPageProps> = ({ activeSoul, setActiveSoul, setToast }) => {
    const [mode, setMode] = useState<'predefined' | 'custom'>('predefined');
    const [predefinedAvatarIndex, setPredefinedAvatarIndex] = useState(0);
    
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedAvatars, setGeneratedAvatars] = useState<{url: string, prompt: string}[]>([]);
    
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const currentAvatarList = activeSoul?.gender === 'Male' ? maleAvatars : femaleAvatars;
    
    useEffect(() => {
        const currentList = activeSoul.gender === 'Male' ? maleAvatars : femaleAvatars;
        const predefinedIdx = currentList.indexOf(activeSoul.avatar || '');

        if (predefinedIdx > -1) {
            setMode('predefined');
            setPredefinedAvatarIndex(predefinedIdx);
        } else {
            setMode('custom');
        }
    }, [activeSoul.avatar, activeSoul.gender]);

    const handleCycleAvatar = (direction: 'next' | 'prev') => {
        const listLength = currentAvatarList.length;
        let newIndex = predefinedAvatarIndex;
        if (direction === 'next') {
            newIndex = (predefinedAvatarIndex + 1) % listLength;
        } else {
            newIndex = (predefinedAvatarIndex - 1 + listLength) % listLength;
        }
        setPredefinedAvatarIndex(newIndex);
        setActiveSoul({ avatar: currentAvatarList[newIndex]});
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setMode('custom');
            const reader = new FileReader();
            reader.onloadend = () => {
                setActiveSoul({ avatar: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateAvatar = async (prompt: string, style: 'Photoreal' | 'Anime') => {
        setIsGenerateModalOpen(false);
        setToast({ title: "Avatar Generation", message: "Avatar photo generation request sent. Please wait a moment for the result." });
        setIsSelectModalOpen(true);
        setIsGenerating(true);
    
        try {
            const genderPrefix = activeSoul?.gender ? `${activeSoul.gender}, ` : '';
            const finalPrompt = genderPrefix + prompt;
            const result = await generateAvatarImage(finalPrompt, style);
            setGeneratedAvatars(prev => [result, ...prev]);
        } catch (error) {
            console.error("Avatar generation failed:", error);
            setToast({ title: "Generation Failed", message: `Sorry, there was an error generating the avatar. Please try again.` });
            if (generatedAvatars.length === 0) {
              setIsSelectModalOpen(false);
            }
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSelectGeneratedAvatar = (avatarUrl: string) => {
        setActiveSoul({ avatar: avatarUrl });
        setMode('custom');
        setIsSelectModalOpen(false);
    };
    
    const handleGenerateDescription = async () => {
        if (!activeSoul || !activeSoul.avatar || !activeSoul.avatar.startsWith('data:image')) return;
        setIsGeneratingDescription(true);
        try {
            const mimeType = activeSoul.avatar.substring(5, activeSoul.avatar.indexOf(';'));
            const base64Data = activeSoul.avatar.split(',')[1];
            const description = await generateAvatarDescriptionFromImage(base64Data, mimeType);
            setActiveSoul({ physicalAppearanceDescription: description });
        } catch (error) {
            console.error("Failed to generate description:", error);
            setToast({ title: "Error", message: "Failed to generate description from image." });
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    return (
        <>
        <GenerateAvatarModal 
            isOpen={isGenerateModalOpen}
            onClose={() => setIsGenerateModalOpen(false)}
            onConfirm={handleGenerateAvatar}
        />
        <SelectGeneratedAvatarModal
            isOpen={isSelectModalOpen}
            onClose={() => setIsSelectModalOpen(false)}
            isLoading={isGenerating}
            generatedAvatars={generatedAvatars}
            onSelect={handleSelectGeneratedAvatar}
            onRegenerate={() => {
                setIsSelectModalOpen(false);
                setIsGenerateModalOpen(true);
            }}
        />

        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <h3 className="text-lg md:text-xl font-bold text-white">Choose how your Soul looks.</h3>
            
            <div className="flex bg-neutral-800 rounded-lg p-1">
                <button onClick={() => setMode('predefined')} className={`py-2 px-4 rounded-md text-sm font-medium transition-colors flex-1 ${mode === 'predefined' ? 'bg-neutral-600 text-white' : 'text-neutral-400 hover:text-white'}`}>Predefined</button>
                <button onClick={() => setMode('custom')} className={`py-2 px-4 rounded-md text-sm font-medium transition-colors flex-1 ${mode === 'custom' ? 'bg-neutral-600 text-white' : 'text-neutral-400 hover:text-white'}`}>Custom</button>
            </div>
            
            {mode === 'predefined' ? (
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => handleCycleAvatar('prev')} className="p-1 md:p-2 rounded-full bg-neutral-700 hover:bg-neutral-600"><ChevronLeftIcon /></button>
                <img src={currentAvatarList[predefinedAvatarIndex]} alt="Predefined Avatar" className="w-40 h-40 md:w-48 md:h-48 rounded-lg object-cover border-2 border-neutral-700"/>
                <button onClick={() => handleCycleAvatar('next')} className="p-1 md:p-2 rounded-full bg-neutral-700 hover:bg-neutral-600"><ChevronRightIcon /></button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-center">
                    <div className="relative w-40 h-40 md:w-48 md:h-48">
                        <button onClick={() => fileInputRef.current?.click()} className="w-full h-full bg-neutral-800 border-2 border-dashed border-neutral-600 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-700/60 hover:border-neutral-500 transition-colors">
                        {(activeSoul.avatar) ? (
                            <img src={activeSoul.avatar} alt="Custom Avatar" className="w-full h-full object-cover rounded-md"/>
                        ) : (
                            <span>upload photo</span>
                        )}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden"/>
                    </div>
                </div>

                <button onClick={() => setIsGenerateModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-2 md:py-2.5 rounded-lg text-sm font-semibold bg-gradient-cyan-purple text-white hover:opacity-90 transition-opacity">
                    <WandSparklesIcon className="w-5 h-5" /> Generate an avatar
                </button>
                 
                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">What style is your avatar?</label>
                    <div className="flex gap-2">
                        <button onClick={() => setActiveSoul({ avatarStyle: 'Photoreal' })} className={`py-2 px-4 rounded-md text-sm font-medium transition-colors flex-1 ${activeSoul.avatarStyle === 'Photoreal' ? 'bg-gradient-cyan-purple text-white' : 'bg-neutral-700/60 hover:bg-neutral-600'}`}>Photoreal</button>
                        <button onClick={() => setActiveSoul({ avatarStyle: 'Anime' })} className={`py-2 px-4 rounded-md text-sm font-medium transition-colors flex-1 ${activeSoul.avatarStyle === 'Anime' ? 'bg-gradient-cyan-purple text-white' : 'bg-neutral-700/60 hover:bg-neutral-600'}`}>Anime</button>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-neutral-300">Physical appearance description</label>
                    </div>
                    <div className="relative">
                      <textarea 
                        value={activeSoul.physicalAppearanceDescription} 
                        onChange={e => setActiveSoul({ physicalAppearanceDescription: e.target.value })} 
                        maxLength={800} 
                        rows={4} 
                        className="w-full bg-neutral-700/60 border border-neutral-600 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                      />
                      <button
                          type="button"
                          onClick={handleGenerateDescription}
                          disabled={isGeneratingDescription || !activeSoul.avatar?.startsWith('data:image')}
                          className="absolute top-2 right-2 p-1.5 rounded-full text-neutral-400 hover:text-white bg-neutral-700/80 hover:bg-neutral-600/80 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Generate description from image"
                      >
                          {isGeneratingDescription ? <LoadingSpinner className="w-5 h-5"/> : <WandSparklesIcon className="w-5 h-5"/>}
                      </button>
                    </div>
                    <p className="text-right text-xs text-neutral-500 mt-1">{activeSoul.physicalAppearanceDescription.length} / 800</p>
                    <p className="text-xs text-neutral-500 mt-2">Used in the selfies engine and text chat. This is critical for correct avatar rendering.</p>
                </div>
              </div>
            )}
            
            <CollapsibleSection title="Face Detail" description="In Photoreal, this adds more realistic detail to the face.">
                <div className="space-y-4 pt-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">Face detail enhance: {Math.round((activeSoul.faceDetailEnhance || 0) * 100)}%</label>
                         <Slider min={0} max={1} step={0.01} value={activeSoul.faceDetailEnhance || 0} onChange={(val) => setActiveSoul({ faceDetailEnhance: val })} />
                         <p className="text-xs text-neutral-500 mt-2">Higher values add detail (freckles, beauty marks) but reduce facial consistency.</p>
                    </div>
                     <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-neutral-300">Face detail prompt</label>
                          <span className="text-xs text-neutral-500">{activeSoul.faceDetailPrompt.length} / 200</span>
                        </div>
                        <textarea value={activeSoul.faceDetailPrompt} onChange={e => setActiveSoul({ faceDetailPrompt: e.target.value })} maxLength={200} rows={2} className="w-full bg-neutral-700/60 border border-neutral-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"/>
                        <p className="text-xs text-neutral-500 mt-2">Use with high face detail for best results.</p>
                    </div>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Avatar Boost" description="Avatar boost enhances the likeness of your images using your provided reference photos.">
                <div className="pt-4">
                    <button onClick={() => alert("Avatar Boost not implemented yet.")} className="w-full py-2 px-4 rounded-md text-sm font-medium transition-colors bg-neutral-700/60 hover:bg-neutral-600">
                       Add Avatar Boost
                    </button>
                </div>
            </CollapsibleSection>
        </div>
        </>
    );
};
