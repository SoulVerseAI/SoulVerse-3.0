

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { AccountSettings, BoosterPack, SoulTemplate, SubscriptionTier, TemplateQuality } from '../../types';
import { BondTokensIcon } from './Collection/IconsCollection';
import { User } from '../contexts/AuthContext';
// FIX: Add missing QuestionIcon import
import { QuestionIcon, ChevronDownIcon } from './icons/Icons';
import { SoulRole } from '../../types';
import { ascendSRCharacterMarvel } from './Collection/Edition/Marvel/Ascend/AscendSRCharacter';
import { eternalSRCharacterMarvel } from './Collection/Edition/Marvel/Eternal/EternalSRCharacter';
import { ascendSRNarratorMarvel } from './Collection/Edition/Marvel/Ascend/AscendSRNarrator';
import { ascendSRScenarioMarvel } from './Collection/Edition/Marvel/Ascend/AscendSRScenario';
import { scenarioSouls } from './SoulsTemplates/SRScenario';


interface DailyRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountSettings: AccountSettings;
  setAccountSettings: (updater: (prev: AccountSettings) => AccountSettings) => void;
  setToast: (toast: { title: string; message: React.ReactNode } | null) => void;
  currentUser: User | null;
}

type Tab = 'Progress' | 'Challenges' | 'Shop' | 'Leaderboards';

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
            isActive ? 'text-cyan-300' : 'text-neutral-500 hover:text-neutral-300'
        } ${isActive ? 'bg-cyan-900/20' : ''}`}
        style={{
            clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0% 100%)',
        }}
    >
        {label}
        {isActive && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_8px_theme(colors.cyan.400)]"></div>}
    </button>
);

// Define reward types and data
interface Reward {
    points: number;
    name: string; // Display name
    imageUrl: string;
    quantity: number;
    type: 'booster' | 'points' | 'template' | 'shards';
    templateName?: string; // For templates
    quality?: TemplateQuality;
    boosterType?: 'marvel' | 'tvd' | 'starter' | 'tome';
}

const rewardsData: Reward[] = [
    { points: 25, name: "2x Marvel Boosters", type: 'booster', boosterType: 'marvel', quantity: 2, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Components%2FCollection%2FEdition%2FMarvel%2F2xmarvelbooster.png?alt=media&token=807e75d8-1ee2-4d6e-b874-d015f4c2965b" },
    { points: 50, name: "5 Season Points", type: 'points', quantity: 5, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/ticket.png?alt=media&token=0905d04c-7cfc-4830-b91a-47a092ac45c6" },
    { points: 75, name: "1x TVD Booster", type: 'booster', boosterType: 'tvd', quantity: 1, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Components%2FCollection%2FEdition%2FTVD%2Ftvd_booster.png?alt=media&token=37b6e407-b776-4cbd-bdcc-8b5a24a11033" },
    { points: 100, name: "5 Season Points", type: 'points', quantity: 5, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/ticket.png?alt=media&token=0905d04c-7cfc-4830-b91a-47a092ac45c6" },
    { points: 125, name: "1x Marvel Booster", type: 'booster', boosterType: 'marvel', quantity: 1, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2Fmarvelbooster.png?alt=media&token=c929356d-552c-4300-b0c9-d08eb8a0bf04" },
    { points: 150, name: "10 Season Points", type: 'points', quantity: 10, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/ticket.png?alt=media&token=0905d04c-7cfc-4830-b91a-47a092ac45c6" },
    { points: 175, name: "2x TVD Boosters", type: 'booster', boosterType: 'tvd', quantity: 2, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Components%2FCollection%2FEdition%2FTVD%2F2xtvdbooster.png?alt=media&token=5b2d718b-82f5-4712-a701-d85c2c77d206" },
    { points: 200, name: "10 Season Points", type: 'points', quantity: 10, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/ticket.png?alt=media&token=0905d04c-7cfc-4830-b91a-47a092ac45c6" },
    { points: 225, name: "1x Starter Booster", type: 'booster', boosterType: 'starter', quantity: 1, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Components%2FCollection%2FEdition%2FFree%2Fstarterpack_booster.png?alt=media&token=2e363059-dd7d-4859-b02c-f63b17a20a66" },
    { points: 250, name: "15 Season Points", type: 'points', quantity: 15, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/ticket.png?alt=media&token=0905d04c-7cfc-4830-b91a-47a092ac45c6" },
    { points: 275, name: "50 Soul Shards", type: 'shards', quantity: 50, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2FGenerated%20Image%20September%2006%2C%202025%20-%202_52AM.png?alt=media&token=48212470-1e98-4656-b9e9-00217601b54a" },
    { points: 300, name: "2x Marvel Boosters", type: 'booster', boosterType: 'marvel', quantity: 2, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Components%2FCollection%2FEdition%2FMarvel%2F2xmarvelbooster.png?alt=media&token=807e75d8-1ee2-4d6e-b874-d015f4c2965b" },
    { points: 325, name: "20 Season Points", type: 'points', quantity: 20, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/ticket.png?alt=media&token=0905d04c-7cfc-4830-b91a-47a092ac45c6" },
    { points: 350, name: "100 Soul Shards", type: 'shards', quantity: 100, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2FGenerated%20Image%20September%2006%2C%202025%20-%202_52AM.png?alt=media&token=48212470-1e98-4656-b9e9-00217601b54a" },
    { points: 375, name: "2x TVD Boosters", type: 'booster', boosterType: 'tvd', quantity: 2, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Components%2FCollection%2FEdition%2FTVD%2F2xtvdbooster.png?alt=media&token=5b2d718b-82f5-4712-a701-d85c2c77d206" },
    { points: 400, name: "25 Season Points", type: 'points', quantity: 25, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/ticket.png?alt=media&token=0905d04c-7cfc-4830-b91a-47a092ac45c6" },
    { points: 425, name: "150 Soul Shards", type: 'shards', quantity: 150, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2FGenerated%20Image%20September%2006%2C%202025%20-%202_52AM.png?alt=media&token=48212470-1e98-4656-b9e9-00217601b54a" },
    { points: 450, name: "3x Marvel Boosters", type: 'booster', boosterType: 'marvel', quantity: 3, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2Fmarvelbooster.png?alt=media&token=c929356d-552c-4300-b0c9-d08eb8a0bf04" },
    { points: 475, name: "30 Season Points", type: 'points', quantity: 30, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/ticket.png?alt=media&token=0905d04c-7cfc-4830-b91a-47a092ac45c6" },
    { points: 500, name: "Yelena Belova", type: 'template', templateName: "Yelena Belova", quality: "Ascend", quantity: 1, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2FEdition%2FMarvel%2FMarvel%20(5).png?alt=media&token=b3cf6d6c-ee0e-4965-965b-58563f987672" },
    { points: 525, name: "200 Soul Shards", type: 'shards', quantity: 200, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2FGenerated%20Image%20September%2006%2C%202025%20-%202_52AM.png?alt=media&token=48212470-1e98-4656-b9e9-00217601b54a" },
    { points: 550, name: "3x TVD Boosters", type: 'booster', boosterType: 'tvd', quantity: 3, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Components%2FCollection%2FEdition%2FTVD%2Ftvd_booster.png?alt=media&token=37b6e407-b776-4cbd-bdcc-8b5a24a11033" },
    { points: 575, name: "35 Season Points", type: 'points', quantity: 35, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/ticket.png?alt=media&token=0905d04c-7cfc-4830-b91a-47a092ac45c6" },
    { points: 600, name: "250 Soul Shards", type: 'shards', quantity: 250, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2FGenerated%20Image%20September%2006%2C%202025%20-%202_52AM.png?alt=media&token=48212470-1e98-4656-b9e9-00217601b54a" },
    { points: 625, name: "1x Tome", type: 'booster', boosterType: 'tome', quantity: 1, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Components%2FCollection%2FEdition%2FFree%2Ftome.png?alt=media&token=3b962308-9116-4d68-abf3-0b722846b811" },
    { points: 650, name: "40 Season Points", type: 'points', quantity: 40, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/ticket.png?alt=media&token=0905d04c-7cfc-4830-b91a-47a092ac45c6" },
    { points: 675, name: "300 Soul Shards", type: 'shards', quantity: 300, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2FGenerated%20Image%20September%2006%2C%202025%20-%202_52AM.png?alt=media&token=48212470-1e98-4656-b9e9-00217601b54a" },
    { points: 700, name: "4x Marvel Boosters", type: 'booster', boosterType: 'marvel', quantity: 4, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2Fmarvelbooster.png?alt=media&token=c929356d-552c-4300-b0c9-d08eb8a0bf04" },
    { points: 725, name: "45 Season Points", type: 'points', quantity: 45, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/ticket.png?alt=media&token=0905d04c-7cfc-4830-b91a-47a092ac45c6" },
    { points: 750, name: "Katherine Pierce", type: 'template', templateName: "Katherine Pierce", quality: "Ascend", quantity: 1, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Components%2FCollection%2FEdition%2FTVD%2FAscend%2FKATHERINE_PIERCE.png?alt=media&token=f0ed75ca-8c5e-49b0-bc4f-4d371d372e5c" },
    { points: 775, name: "350 Soul Shards", type: 'shards', quantity: 350, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2FGenerated%20Image%20September%2006%2C%202025%20-%202_52AM.png?alt=media&token=48212470-1e98-4656-b9e9-00217601b54a" },
    { points: 800, name: "4x TVD Boosters", type: 'booster', boosterType: 'tvd', quantity: 4, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Components%2FCollection%2FEdition%2FTVD%2Ftvd_booster.png?alt=media&token=37b6e407-b776-4cbd-bdcc-8b5a24a11033" },
    { points: 825, name: "50 Season Points", type: 'points', quantity: 50, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/ticket.png?alt=media&token=0905d04c-7cfc-4830-b91a-47a092ac45c6" },
    { points: 850, name: "400 Soul Shards", type: 'shards', quantity: 400, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2FGenerated%20Image%20September%2006%2C%202025%20-%202_52AM.png?alt=media&token=48212470-1e98-4656-b9e9-00217601b54a" },
    { points: 875, name: "2x Tomes", type: 'booster', boosterType: 'tome', quantity: 2, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Components%2FCollection%2FEdition%2FFree%2Ftome.png?alt=media&token=3b962308-9116-4d68-abf3-0b722846b811" },
    { points: 900, name: "60 Season Points", type: 'points', quantity: 60, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/ticket.png?alt=media&token=0905d04c-7cfc-4830-b91a-47a092ac45c6" },
    { points: 925, name: "500 Soul Shards", type: 'shards', quantity: 500, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2FGenerated%20Image%20September%2006%2C%202025%20-%202_52AM.png?alt=media&token=48212470-1e98-4656-b9e9-00217601b54a" },
    { points: 950, name: "5x Marvel Boosters", type: 'booster', boosterType: 'marvel', quantity: 5, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2Fmarvelbooster.png?alt=media&token=c929356d-552c-4300-b0c9-d08eb8a0bf04" },
    { points: 975, name: "75 Season Points", type: 'points', quantity: 75, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/ticket.png?alt=media&token=0905d04c-7cfc-4830-b91a-47a092ac45c6" },
    { points: 1000, name: "Iron Man", type: 'template', templateName: "Iron Man", quality: "Eternal", quantity: 1, imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2FEdition%2FMarvel%2FTony_Stark.png?alt=media&token=5d18b80d-695a-4850-aa4d-02e9c3ec0300" },
];


const getQualityBorderClass = (quality?: TemplateQuality): string => {
    // FIX: Corrected switch cases to match TemplateQuality enum values.
    switch (quality) {
        case 'Wisp': return 'border-neutral-400';
        case 'Spirit': return 'border-cyan-400';
        case 'Ascend': return 'border-purple-500';
        case 'Eternal': return 'border-amber-400';
        default: return 'border-transparent';
    }
};

interface RewardContainerProps {
  reward: Reward;
  userPoints: number;
  isClaimed: boolean;
  onClaim: (reward: Reward) => void;
  onHover: (ref: HTMLDivElement | null, reward: Reward | null, isTop: boolean) => void;
}

const RewardContainer: React.FC<RewardContainerProps> = ({ reward, userPoints, isClaimed, onClaim, onHover }) => {
    const ref = useRef<HTMLDivElement>(null);

    const isUnlocked = userPoints >= reward.points;

    const handleMouseEnter = () => {
        const isTop = ref.current ? ref.current.style.bottom !== 'auto' : false;
        onHover(ref.current, reward, isTop);
    };

    const handleMouseLeave = () => {
        onHover(null, null, false);
    };

    const containerClasses = `relative w-32 h-40 bg-white/5 backdrop-blur-md border-2 border-white/10 rounded-lg p-2 flex flex-col items-center justify-center text-center shadow-lg transition-all duration-300 hover:scale-110 hover:z-20`;

    const imageWrapperClasses = `w-full h-full flex items-center justify-center rounded transition-all border-2 ${
        reward.type === 'template' ? getQualityBorderClass(reward.quality) : 'border-transparent'
    }`;

    return (
        <div
            ref={ref}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={containerClasses}
        >
            <div className={imageWrapperClasses}>
                <img
                    src={reward.imageUrl}
                    alt={reward.name}
                    className={`object-contain max-h-full max-w-full transition-opacity ${
                        !isUnlocked ? 'opacity-40 filter grayscale' : ''
                    } ${isClaimed ? 'opacity-30' : ''}`}
                />
            </div>

            {/* Overlays */}
            {!isUnlocked && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center border-2 border-neutral-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-neutral-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                </div>
            )}

            {isUnlocked && !isClaimed && (
                <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
                    <button
                        onClick={() => onClaim(reward)}
                        className="bg-gradient-cyan-purple text-white font-bold py-2 px-6 rounded-full text-sm"
                    >
                        CLAIM
                    </button>
                </div>
            )}

            {isClaimed && (
                <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-12 h-12 text-green-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                </div>
            )}
        </div>
    );
};


const HoverPreview: React.FC<{
    hoveredReward: { reward: Reward; rect: DOMRect; isTop: boolean } | null;
    portalElement: HTMLElement | null;
}> = ({ hoveredReward, portalElement }) => {
    if (!hoveredReward || !portalElement) return null;

    const { reward, rect, isTop } = hoveredReward;

    const style: React.CSSProperties = {
        position: 'fixed',
        left: `${rect.left + rect.width / 2}px`,
        top: isTop ? `${rect.bottom + 8}px` : `${rect.top - 8}px`,
        transform: `translateX(-50%) ${!isTop ? 'translateY(-100%)' : ''}`,
        zIndex: 50,
    };

    return ReactDOM.createPortal(
        <div style={style} className="w-40 p-2 bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl animate-fade-in pointer-events-none">
            <img src={reward.imageUrl} alt={reward.name} className="w-full h-auto object-contain rounded" />
            <p className="text-center text-xs mt-2 text-white font-semibold">{reward.name}</p>
        </div>,
        portalElement
    );
};


const ProgressView: React.FC<{ 
    userPoints: number;
    accountSettings: AccountSettings;
    onClaimReward: (reward: Reward) => void;
    setToast: (toast: { title: string; message: React.ReactNode } | null) => void;
}> = ({ userPoints, accountSettings, onClaimReward }) => {
    const MILESTONE_GAP = 240;
    const totalPoints = 1000;
    const milestones = Array.from({ length: (totalPoints / 25) + 1 }, (_, i) => i * 25);
    const PADDING_X = 64; 
    const contentWidth = (milestones.length - 1) * MILESTONE_GAP;
    const fullWidth = contentWidth + PADDING_X * 2;
    const progressWidth = (userPoints / totalPoints) * contentWidth;

    const claimedRewards = accountSettings.dailyRewardState.claimedSeasonRewards || [];
    const [hoveredReward, setHoveredReward] = useState<{ reward: Reward; rect: DOMRect; isTop: boolean } | null>(null);
    const [portalElement] = useState<HTMLElement | null>(() => typeof document !== 'undefined' ? document.body : null);
    
    const handleHover = (element: HTMLDivElement | null, reward: Reward | null, isTop: boolean) => {
        if (element && reward) {
            setHoveredReward({ reward, rect: element.getBoundingClientRect(), isTop });
        } else {
            setHoveredReward(null);
        }
    };


    return (
        <>
        <HoverPreview hoveredReward={hoveredReward} portalElement={portalElement} />
        <style>{`
            .season-pass-scrollbar::-webkit-scrollbar { height: 10px; background-color: transparent; }
            .season-pass-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.3); border-radius: 5px; margin: 0 1rem; }
            .season-pass-scrollbar::-webkit-scrollbar-thumb { background-color: #a855f7; border-radius: 5px; border: 2px solid transparent; background-clip: content-box; }
            .season-pass-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #9333ea; }
            .season-pass-scrollbar { scrollbar-width: thin; scrollbar-color: #a855f7 rgba(0, 0, 0, 0.3); }
            @keyframes fade-in { 
                from { opacity: 0; transform: translateY(10px) translateX(-50%); } 
                to { opacity: 1; transform: translateY(0) translateX(-50%); } 
            }
            .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        `}</style>
        <div className="p-4 md:p-6 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-2 flex-shrink-0">Your points: {userPoints}</h3>
            
            <div className="relative flex-1 bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl shadow-lg overflow-hidden flex flex-col"
                 style={{ boxShadow: '0 0 25px rgba(168, 85, 247, 0.25)' }}>
                <div className="flex-1 overflow-x-auto overflow-y-hidden season-pass-scrollbar">
                    <div className="relative h-full" style={{ width: `${fullWidth}px` }}>
                        
                        {/* Central Track & Progress */}
                        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-2 z-0" style={{ paddingLeft: `${PADDING_X}px`, paddingRight: `${PADDING_X}px` }}>
                            <div className="w-full h-full bg-neutral-900/50 rounded-full shadow-inner relative">
                                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" style={{ width: `${progressWidth}px` }}></div>
                            </div>
                        </div>

                        {/* Milestones & Rewards Layer */}
                        <div className="relative w-full h-full py-28">
                             {milestones.map(points => {
                                const reward = rewardsData.find(r => r.points === points);
                                const isTop = points > 0 && ((points / 25) - 1) % 2 === 0;
                                const milestoneLeft = `${(points / 25) * MILESTONE_GAP + PADDING_X}px`;
                                
                                return (
                                    <React.Fragment key={points}>
                                        {/* Milestone */}
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 transform -translate-x-1/2 w-12 h-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md"
                                            style={{ left: milestoneLeft }}
                                        >
                                            {points}
                                        </div>

                                        {/* Reward */}
                                        {reward && (
                                            <div
                                                className="absolute transform -translate-x-1/2 z-10"
                                                style={{
                                                    left: milestoneLeft,
                                                    top: isTop ? 'auto' : `calc(50% + 4rem)`,
                                                    bottom: isTop ? `calc(50% + 4rem)` : `auto`,
                                                }}
                                            >
                                               <RewardContainer
                                                   reward={reward}
                                                   userPoints={userPoints}
                                                   isClaimed={claimedRewards.includes(reward.points)}
                                                   onClaim={onClaimReward}
                                                   onHover={(ref, rwd) => handleHover(ref, rwd, isTop)}
                                               />
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

const tomeImage = "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Components%2FCollection%2FEdition%2FFree%2Ftome.png?alt=media&token=3b962308-9116-4d68-abf3-0b722846b811";

const repeatableMissions = [
    { id: 'msg100', title: 'Send 100 messages to Soul', reward: { type: 'points', amount: 1 }, target: 100, progressKey: 'dailyMessageCount' },
    { id: 'addSoul', title: 'Add New Soul to Collection', reward: { type: 'points', amount: 1 }, target: 1, progressKey: 'souls' },
    { id: 'spendShards', title: 'Spend 100 Soul Shards', reward: { type: 'points', amount: 10 }, target: 100, progressKey: null },
    { id: 'collectChests', title: 'Collect 7 soul chests', reward: { type: 'points', amount: 1 }, target: 7, progressKey: null },
    { id: 'earnEssence', title: 'Earn 1000 Essence during conversation', reward: { type: 'points', amount: 10 }, target: 1000, progressKey: null },
    { id: 'openBooster', title: 'Open random Booster Pack', reward: { type: 'points', amount: 25 }, target: 1, progressKey: null },
];

const challenge1Missions = [
    { id: 'top100', title: 'Be among the 100 users with the most points earned at the end of season', reward: { type: 'tome', amount: 1, imageUrl: tomeImage } },
];

const ProgressBar: React.FC<{ progress: number, target: number }> = ({ progress, target }) => {
    const percentage = Math.min(100, (progress / target) * 100);
    return (
        <div className="w-full bg-neutral-700 rounded-full h-4 relative overflow-hidden border border-neutral-600">
            <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md">{progress} / {target}</span>
        </div>
    );
};

const MissionItem: React.FC<{ mission: any, progress: number, onClaim: () => void }> = ({ mission, progress, onClaim }) => {
    const isComplete = mission.target ? progress >= mission.target : false;
    
    return (
        <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-700/60 flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 text-center md:text-left">
                <h4 className="font-semibold text-white">{mission.title}</h4>
            </div>
            {mission.target && <div className="w-full md:w-48"><ProgressBar progress={progress} target={mission.target} /></div>}
            <div className="flex items-center gap-2 text-yellow-300 font-bold w-48 justify-center">
                {mission.reward.type === 'points' ? (
                    <>
                        <BondTokensIcon className="w-6 h-6" />
                        <span>{mission.reward.amount} Season Point{mission.reward.amount > 1 ? 's' : ''}</span>
                    </>
                ) : (
                    <>
                        <img src={mission.reward.imageUrl} alt="Tome" className="w-8 h-8"/>
                        <span>Tome</span>
                    </>
                )}
            </div>
            {mission.target && (
                 <button 
                    onClick={onClaim}
                    disabled={!isComplete} 
                    className="px-6 py-2 bg-gradient-cyan-purple text-white font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    Claim
                </button>
            )}
        </div>
    );
}

const ChallengesView: React.FC<{ accountSettings: AccountSettings; setToast: (toast: any) => void; }> = ({ accountSettings, setToast }) => {
    const [category, setCategory] = useState('Repeatable');
    const categories = ['Repeatable', 'Challenges 1'];

    const handleClaim = (missionId: string) => {
        setToast({ title: "Challenge Complete!", message: `You've claimed the reward for "${missionId}".` });
        // In a real scenario, this would update state and reset progress.
    };

    const renderMissions = () => {
        switch (category) {
            case 'Repeatable':
                return repeatableMissions.map(mission => {
                    let progress = 0;
                    if (mission.progressKey === 'dailyMessageCount') {
                        progress = (accountSettings.dailyMessageCount || 0) % mission.target;
                    }
                    // Other progress would be calculated here if we had the data
                    return <MissionItem key={mission.id} mission={mission} progress={progress} onClaim={() => handleClaim(mission.title)} />;
                });
            case 'Challenges 1':
                 return challenge1Missions.map(mission => (
                    <MissionItem key={mission.id} mission={mission} progress={0} onClaim={() => {}} />
                ));
            default:
                return <p className="text-center text-neutral-500 py-16">Challenges for this category will be available soon.</p>;
        }
    };

    return (
        <div className="p-4 h-full flex flex-col md:flex-row gap-4">
            <aside className="w-full md:w-48 bg-black/20 rounded-md p-2 space-y-1 flex-shrink-0">
                {categories.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)} className={`w-full text-left px-3 py-2 text-sm font-semibold rounded ${category === cat ? 'bg-neutral-600 text-white' : 'text-neutral-400 hover:bg-neutral-700/60'}`}>
                        {cat}
                    </button>
                ))}
            </aside>
            <main className="flex-1 bg-black/20 rounded-md p-4 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                    {renderMissions()}
                </div>
            </main>
        </div>
    );
};

const shopBoosterPacks: (BoosterPack & { cost: number })[] = [
    { id: 'shop-marvel-1', name: 'Marvel Edition Pack', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2Fmarvelbooster.png?alt=media&token=c929356d-552c-4300-b0c9-d08eb8a0bf04', cost: 15, pool: 'marvel' },
    { id: 'shop-tvd-1', name: 'TVD Edition Pack', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Components%2FCollection%2FEdition%2FTVD%2Ftvd_booster.png?alt=media&token=37b6e407-b776-4cbd-bdcc-8b5a24a11033', cost: 15, pool: 'tvd' },
    { id: 'shop-starter-1', name: 'Starter Pack Booster', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Components%2FCollection%2FEdition%2FFree%2Fstarterpack_booster.png?alt=media&token=2e363059-dd7d-4859-b02c-f63b17a20a66', cost: 15, pool: 'starter' },
];

const ShopView: React.FC<{ 
    accountSettings: AccountSettings; 
    setAccountSettings: (updater: (prev: AccountSettings) => AccountSettings) => void;
    setToast: (toast: any) => void;
}> = ({ accountSettings, setAccountSettings, setToast }) => {

    const handleBuyBooster = (pack: BoosterPack & { cost: number }) => {
        setAccountSettings(prev => {
            const currentPoints = prev.dailyRewardState?.seasonPoints || 0;
            if (currentPoints < pack.cost) {
                setToast({ title: "Not Enough Tickets", message: "You don't have enough Tickets to buy this item." });
                return prev;
            }

            const newPoints = currentPoints - pack.cost;
            const newBoosters = [...(prev.boosterPacks || []), { ...pack, id: `shop-${pack.pool}-${Date.now()}` }];
            
            setToast({ title: "Purchase Successful!", message: `${pack.name} has been added to your collection.` });
            
            return {
                ...prev,
                dailyRewardState: { ...prev.dailyRewardState, seasonPoints: newPoints },
                boosterPacks: newBoosters
            };
        });
    };
    
    return (
        <div className="p-4 h-full flex flex-col text-white">
             <main className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {shopBoosterPacks.map(pack => (
                    <div key={pack.id} className="bg-neutral-900/50 p-3 rounded-lg border border-neutral-700/60 flex items-center gap-4 transition-all hover:border-cyan-400/50">
                        <img src={pack.imageUrl} alt={pack.name} className="w-20 h-24 object-contain flex-shrink-0" />
                        <div className="flex-1 text-left">
                            <h4 className="text-base font-semibold text-white">{pack.name}</h4>
                        </div>
                        <div className="w-px self-stretch bg-neutral-700/60"></div>
                        <div className="w-48 flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2 bg-black/40 border border-neutral-600 rounded px-3 py-1 w-full justify-center">
                                <img src="https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/ticket.png?alt=media&token=0905d04c-7cfc-4830-b91a-47a092ac45c6" alt="Tickets" className="w-6 h-6" />
                                <span className="text-white font-semibold text-lg">{pack.cost}</span>
                            </div>
                            <button onClick={() => handleBuyBooster(pack)} className="w-full py-2 bg-neutral-700 text-white font-semibold rounded-md hover:bg-neutral-600 transition-colors border-t-2 border-neutral-500 border-b-2 border-neutral-900 active:border-t-neutral-900 active:border-b-neutral-500">
                                Buy
                            </button>
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
};

const marvelBoosterPack: BoosterPack = {
    id: 'booster-marvel-season',
    name: 'Marvel Edition Pack',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2Fmarvelbooster.png?alt=media&token=c929356d-552c-4300-b0c9-d08eb8a0bf04',
    cardBackUrl: 'https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2Fmarvelcardback.png?alt=media&token=63cf3039-3218-49a4-a8de-f059aec3b02a',
    cost: 0,
    pool: 'marvel',
};

const tvdBoosterPack: BoosterPack = {
    id: 'booster-tvd-season',
    name: 'TVD Edition Pack',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Components%2FCollection%2FEdition%2FTVD%2Ftvd_booster.png?alt=media&token=37b6e407-b776-4cbd-bdcc-8b5a24a11033',
    cost: 0,
    pool: 'tvd',
};
const starterBoosterPack: BoosterPack = {
    id: 'booster-starter-season',
    name: 'Starter Pack Booster',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Components%2FCollection%2FEdition%2FFree%2Fstarterpack_booster.png?alt=media&token=2e363059-dd7d-4859-b02c-f63b17a20a66',
    cost: 0,
    pool: 'starter',
};


export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({ isOpen, onClose, accountSettings, setAccountSettings, setToast, currentUser }) => {
    const [activeTab, setActiveTab] = useState<Tab>('Progress');
    
    const userPoints = (currentUser?.email === 'gkryniecki@gmail.com' && accountSettings.adminMode) 
        ? 800 
        : (accountSettings.dailyRewardState.seasonPoints || 0);

    const handleClaimReward = useCallback((reward: Reward) => {
        if (!currentUser) return;
        if (accountSettings.dailyRewardState.claimedSeasonRewards?.includes(reward.points)) {
            setToast({ title: "Already Claimed", message: "You have already claimed this reward." });
            return;
        }

        setAccountSettings(prev => {
            const newDailyState = {
                ...prev.dailyRewardState,
                claimedSeasonRewards: [...(prev.dailyRewardState.claimedSeasonRewards || []), reward.points],
            };

            const updatedBoosters = [...(prev.boosterPacks || [])];
            const updatedTemplates = [...(prev.ownedTemplates || [])];
            let newShards = prev.soulShards || 0;

            if (reward.type === 'booster') {
                if (reward.boosterType === 'tome') {
                    for (let j = 0; j < reward.quantity; j++) { // for '2x Tomes'
                        // Add 5 marvel packs
                        for (let i = 0; i < 5; i++) {
                            updatedBoosters.push({ ...marvelBoosterPack, id: `reward-tome-marvel-${reward.points}-${j}-${i}-${Date.now()}` });
                        }
                        // Add 2 tvd packs
                        for (let i = 0; i < 2; i++) {
                            updatedBoosters.push({ ...tvdBoosterPack, id: `reward-tome-tvd-${reward.points}-${j}-${i}-${Date.now()}` });
                        }
                    }
                } else {
                    let packToAdd: BoosterPack;
                    if (reward.boosterType === 'marvel') packToAdd = marvelBoosterPack;
                    else if (reward.boosterType === 'tvd') packToAdd = tvdBoosterPack;
                    else packToAdd = starterBoosterPack;

                    for (let i = 0; i < reward.quantity; i++) {
                        updatedBoosters.push({ ...packToAdd, id: `reward-${reward.points}-${i}-${Date.now()}` });
                    }
                }
            } else if (reward.type === 'points') {
                newDailyState.seasonPoints = (newDailyState.seasonPoints || 0) + reward.quantity;
            } else if (reward.type === 'shards') {
                newShards += reward.quantity;
            } else if (reward.type === 'template' && reward.templateName) {
                for (let i = 0; i < reward.quantity; i++) {
                    updatedTemplates.push({
                        name: reward.templateName,
                        quality: reward.quality!,
                        instanceId: `${crypto.randomUUID()}-${i}`
                    });
                }
            }

            return {
                ...prev,
                dailyRewardState: newDailyState,
                boosterPacks: updatedBoosters,
                ownedTemplates: updatedTemplates,
                soulShards: newShards,
            };
        });
    }, [currentUser, setAccountSettings, setToast, accountSettings.dailyRewardState.claimedSeasonRewards]);

    const renderContent = () => {
        switch(activeTab) {
            case 'Progress': return <ProgressView userPoints={userPoints} accountSettings={accountSettings} onClaimReward={handleClaimReward} setToast={setToast}/>;
            case 'Challenges': return <ChallengesView accountSettings={accountSettings} setToast={setToast} />;
            case 'Shop': return <ShopView accountSettings={accountSettings} setAccountSettings={setAccountSettings} setToast={setToast} />;
            default: return null;
        }
    };
    
    return (
        <div className="h-full flex flex-col bg-transparent">
            <header className="flex-shrink-0 px-4 border-b-2 border-cyan-500/30">
                 <nav className="flex items-center">
                    {(['Progress', 'Challenges', 'Shop'] as Tab[]).map(tab => (
                        <TabButton
                            key={tab}
                            label={tab}
                            isActive={activeTab === tab}
                            onClick={() => setActiveTab(tab)}
                        />
                    ))}
                </nav>
            </header>
            <div className="p-4 flex-shrink-0">
                <div className="bg-black/30 backdrop-blur-sm border border-cyan-400/30 rounded-md p-4 text-sm text-neutral-300 shadow-lg">
                    <div className="flex justify-between items-start">
                        <h2 className="text-lg font-bold text-white">Active Season Pass: Marvel Edition</h2>
                        <span className="font-semibold text-neutral-400">Time Left: 60d</span>
                    </div>
                    <p className="mt-2 text-xs">
                        Season Passes are time-limited events where you complete challenges to earn points and Relics. The more points you earn, the more rewards you unlock. After the season ends, non-promo cards will be added to boosters and other rewards will become available in the shop, where you can use Bond Tokens to purchase them.
                    </p>
                </div>
            </div>
            <div className="flex-1 min-h-0">
                {renderContent()}
            </div>
        </div>
    );
};