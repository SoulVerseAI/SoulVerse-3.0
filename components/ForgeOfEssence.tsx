import React from 'react';
import { ArrowLeftIcon } from './icons/Icons';
import { EssenceIcon, SoulShardsIcon, BondTokensIcon, QualityEternalIcon } from './Collection/IconsCollection';

interface ForgeOfEssenceProps {
    isOpen: boolean;
    onClose: () => void;
}

const ForgeOption: React.FC<{ title: string, description: string }> = ({ title, description }) => (
    <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-700/60">
        <h4 className="font-bold text-white text-lg">{title}</h4>
        <p className="text-sm text-neutral-400 mt-1">{description}</p>
    </div>
);

export const ForgeOfEssence: React.FC<ForgeOfEssenceProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-[#0D0517] z-[100] flex flex-col text-white font-inter">
            <header className="flex-shrink-0 sticky top-0 bg-slate-900/50 backdrop-blur-md shadow-lg z-20">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                         <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-800">
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-bold">Forge of Essence</h1>
                        <div className="w-10"></div> {/* Spacer */}
                    </div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
                <div className="w-full max-w-4xl space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gradient-cyan-purple">Upgrade & Craft</h2>
                        <p className="mt-2 text-neutral-400 max-w-2xl mx-auto">Enhance your collected Souls, combine duplicates, and forge new, powerful blueprints for your creations.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-800 space-y-4">
                            <h3 className="text-xl font-semibold text-white">Select a Soul Card</h3>
                            <div className="relative aspect-[3/4] bg-black/20 border-2 border-dashed border-neutral-700 rounded-lg flex items-center justify-center text-center">
                                <span className="text-sm text-neutral-400 p-2">Drag a card from your Collection here to begin.</span>
                            </div>
                        </div>
                        <div className="space-y-6">
                             <ForgeOption
                                title="Upgrade Quality"
                                description="Combine multiple cards of the same Soul to upgrade its quality, unlocking new potential."
                            />
                             <ForgeOption
                                title="Re-roll Traits"
                                description="Use Soul Shards to re-roll a Soul's personality traits (MBTI, Enneagram) for a new dynamic."
                            />
                             <ForgeOption
                                title="Forge Blueprint"
                                description="Consume a high-quality Soul card to create a shareable Blueprint for other users to build from."
                            />
                             <div className="text-center text-5xl font-black text-neutral-700/50 pt-4">
                                COMING SOON
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
