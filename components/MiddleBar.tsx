import React from 'react';
import { Soul, AccountSettings } from '../types';
import { HeartIcon, ChevronDownIcon, ArrowLeftIconV2, ArrowRightIconV2, SoulProfileIcon } from './icons/Icons';
import { modelOptions, ModelOption, ModelTier } from './panels/ModelSelectorPanel';

interface MiddleBarProps {
    accountSettings: AccountSettings;
    activeSoul: Soul | null;
    firstBotMessageExists: boolean;
    isAvatarVisible: boolean;
    setIsAvatarVisible: (value: React.SetStateAction<boolean>) => void;
    hasFavorites: boolean;
    setIsSubscriptionPageOpen: (isOpen: boolean) => void;
    setIsModelSelectorOpen: (isOpen: boolean) => void;
    setIsStyleSelectorOpen: (isOpen: boolean) => void;
    setIsFavoritesOpen: (isOpen: boolean) => void;
    setSoulBoardInitialState: (state: { view: 'profile', soulId: string } | null) => void;
    onOpenModal: (modalName: string) => void;
}

const getModelTierColor = (tier: ModelTier): string => {
    switch (tier) {
        case 'Max':
        case 'Admin':
            return 'text-yellow-400';
        case 'Ultra':
            return 'text-purple-400';
        case 'Premium':
            return 'text-blue-400';
        case 'Free':
        default:
            return 'text-neutral-300';
    }
};

const getModelOption = (soul: Soul, accountSettings: AccountSettings): ModelOption | null => {
    const isFreeUser = accountSettings.subscriptionTier === 'Free' && !accountSettings.adminMode;
    if (isFreeUser) {
        return modelOptions.find(m => m.id === 'lite-free') || null;
    }

    const potentialMatches = modelOptions.filter(m =>
        m.isSelectable &&
        soul.model.includes(m.modelString) &&
        soul.enableThinking === m.enableThinking
    );

    if (potentialMatches.length === 0) {
        return modelOptions.find(m => m.id === 'lite-free') || null;
    }

    if (potentialMatches.length === 1) {
        return potentialMatches[0];
    }

    let bestMatch = potentialMatches[0];
    let smallestDiff = Infinity;

    potentialMatches.forEach(model => {
        const modelDynamism = model.dynamism ?? 0.8;
        const soulDynamism = soul.dynamism || 0.8;
        const diff = Math.abs(modelDynamism - soulDynamism);
        if (diff < smallestDiff) {
            smallestDiff = diff;
            bestMatch = model;
        }
    });

    return bestMatch;
};

export const MiddleBar: React.FC<MiddleBarProps> = ({
    accountSettings,
    activeSoul,
    firstBotMessageExists,
    isAvatarVisible,
    setIsAvatarVisible,
    hasFavorites,
    setIsSubscriptionPageOpen,
    setIsModelSelectorOpen,
    setIsStyleSelectorOpen,
    setIsFavoritesOpen,
    setSoulBoardInitialState,
    onOpenModal,
}) => {
    const selectedModel = activeSoul ? getModelOption(activeSoul, accountSettings) : null;
    const modelColorClass = selectedModel ? getModelTierColor(selectedModel.requiredTier) : 'text-neutral-300';
    const modelName = selectedModel ? (selectedModel.shortName || selectedModel.name) : 'V.S';

    return (
        <div className="flex-shrink-0 bg-transparent shadow-sm">
            <div className="w-full max-w-5xl mx-auto relative h-14 md:h-16">
                {firstBotMessageExists && (
                    <button
                        onClick={() => setIsAvatarVisible(p => !p)}
                        className="absolute top-1/2 -translate-y-1/2 left-2 md:-left-20 z-10 p-2 rounded-full text-neutral-400 block transition-transform duration-75 ease-out active:scale-[0.97]"
                        aria-label="Toggle Avatar"
                    >
                        {isAvatarVisible ? <ArrowLeftIconV2 className="w-6 h-6" /> : <ArrowRightIconV2 className="w-6 h-6" />}
                    </button>
                )}
                <div className="absolute top-1/2 -translate-y-1/2 right-2 md:right-24 flex items-center space-x-1 md:space-x-2">
                    <button
                        onClick={() => setIsStyleSelectorOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base font-semibold bg-neutral-800/60 rounded-md text-neutral-300 hover:bg-neutral-700/60 transition-colors transition-transform duration-75 ease-out active:scale-[0.97]"
                        title="Roleplay Style"
                    >
                        <span>{activeSoul?.roleplayStyle || 'Default'}</span>
                        <ChevronDownIcon className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    {accountSettings.subscriptionTier === 'Free' && !accountSettings.adminMode ? (
                        <button
                            onClick={() => setIsSubscriptionPageOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base font-semibold bg-neutral-800/60 rounded-md text-neutral-400 hover:bg-neutral-700/60 transition-colors cursor-pointer transition-transform duration-75 ease-out active:scale-[0.97]"
                            title="Upgrade to unlock more models"
                        >
                            <span className={modelColorClass}>{modelName}</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsModelSelectorOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base font-semibold bg-neutral-800/60 rounded-md text-neutral-300 hover:bg-neutral-700/60 transition-colors transition-transform duration-75 ease-out active:scale-[0.97]"
                            title="Model Version"
                        >
                            <span className={modelColorClass}>{modelName}</span>
                            <ChevronDownIcon className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    )}
                    <button
                        onClick={() => setIsFavoritesOpen(true)}
                        className="p-2 md:p-3 rounded-full text-neutral-400 hover:bg-neutral-700/60 transition-colors transition-transform duration-75 ease-out active:scale-[0.97]"
                        title="Favorite Messages"
                    >
                        <HeartIcon filled={hasFavorites} className="w-6 h-6 md:w-7 md:h-7 text-pink-500" />
                    </button>
                    {activeSoul && (
                        <button
                            onClick={() => {
                                if (activeSoul) {
                                    setSoulBoardInitialState({ view: 'profile', soulId: activeSoul.id });
                                    onOpenModal('soulBoard');
                                }
                            }}
                            className="p-2 md:p-3 rounded-full text-neutral-400 hover:bg-neutral-700/60 transition-colors transition-transform duration-75 ease-out active:scale-[0.97]"
                            title="Soul Profile"
                        >
                            <SoulProfileIcon className="w-6 h-6 md:w-7 md:h-7 text-neutral-300" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};