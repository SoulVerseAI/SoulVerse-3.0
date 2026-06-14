import React from 'react';
import { Soul, AccountSettings, BoosterPack } from '../types';

interface MarketplaceProps {
    activeSoul: Soul | null;
    onOpenForgeOfEssence: () => void;
    onOpenVaultOfEssence: () => void;
    onOpenStorytellersGuild: () => void;
    accountSettings: AccountSettings;
    onBuyBooster: (pack: BoosterPack, isDiscounted: boolean) => void;
}

const MarketplaceTile: React.FC<{
    title: React.ReactNode;
    description: string;
    imageUrl: string;
    onClick: () => void;
}> = ({ title, description, imageUrl, onClick }) => (
    <button 
        onClick={onClick}
        className="group relative aspect-[2/3] w-full rounded-2xl overflow-hidden card-dark-glass transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-105"
    >
        <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-60 group-hover:opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
        <div className="absolute inset-0 p-6 flex flex-col justify-end items-center text-center pb-8">
            <h3 className="text-3xl font-bold text-white leading-tight drop-shadow-md">
                 {title}
            </h3>
            <img src="https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/essence_currency.png?alt=media&token=8c6bbab2-8f02-4565-bb25-b60e8bd11c71" alt="Essence" className="w-10 h-10 my-4 drop-shadow-lg" />
            <p className="text-sm text-neutral-300 opacity-90 group-hover:opacity-100 transition-opacity duration-300 min-h-[56px]">
                {description}
            </p>
        </div>
    </button>
);


export const Marketplace: React.FC<MarketplaceProps> = ({ 
    activeSoul,
    onOpenForgeOfEssence,
    onOpenVaultOfEssence,
    onOpenStorytellersGuild,
    accountSettings,
    onBuyBooster
}) => {
    
    return (
        <div className="p-6 md:p-8 bg-gradient-to-br from-[#0D0517] via-[#1c122b] to-[#250e38] text-neutral-300 h-full">
            <div className="text-center mb-10 -mt-2">
                 <p className="text-neutral-400 max-w-2xl mx-auto">The heart of our creator economy. A place to buy, sell, or trade unique digital assets using Essence.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <MarketplaceTile
                    title={<>Vault of<br/>Essence</>}
                    description="Buy, sell, or rent fully-formed Souls with rich histories & unique personalities."
                    imageUrl="https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Marketplace%20of%20Souls.png?alt=media&token=4cd072c2-6078-4ce3-9027-384f47cbf833"
                    onClick={onOpenVaultOfEssence}
                />
                <MarketplaceTile
                    title={<>Forge of<br/>Essence</>}
                    description="Find quality blueprints & presets to build your own custom Souls from the ground up."
                    imageUrl="https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Forge.png?alt=media&token=31d15605-4844-43ee-91fe-73f1aceabea4"
                    onClick={onOpenForgeOfEssence}
                />
                <MarketplaceTile
                    title={<>Essence<br/>Chronicles</>}
                    description="Hire expert storytellers to lead you on custom role-playing adventures."
                    imageUrl="https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/essence-chronicles.png?alt=media&token=f3228ae4-8f99-479d-bdf8-b99037f0b139"
                    onClick={onOpenStorytellersGuild}
                />
            </div>
        </div>
    );
};
