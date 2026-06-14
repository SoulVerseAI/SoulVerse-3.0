

import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { AccountSettings, BoosterPack, SoulRole, SoulTemplate, VaultTab, TemplateQuality, GroupedTemplate, Soul, MailMessage, Gender } from '../types';
import { SearchIcon, XMarkIcon, ClockIcon, EyeIcon, TriangleUpIcon, TriangleDownIcon, PlusIcon } from './icons/Icons';
import { SoulShardsIcon, EssenceIcon } from './Collection/IconsCollection';
import { Modal } from './ui/Modal';
import { AnimatedButton } from './ui/AnimatedButton';
import { BoosterContentsModal } from './ui/BoosterContentsModal';
import { SoulTemplateModal } from './ui/SoulTemplateModal';
import { getSubscriptionBenefits } from '../services/subscriptionService';
import { BillingPage } from './BillingPage';

interface VaultOfEssenceProps {
    isOpen: boolean;
    onClose: () => void;
    accountSettings: AccountSettings;
    onBuyBooster: (pack: BoosterPack, isDiscounted: boolean) => void;
    setToast: (toast: { title: string; message: React.ReactNode } | null) => void;
    setAccountSettings: (updater: (prev: AccountSettings) => AccountSettings) => void;
    cardForAuction: GroupedTemplate | null;
    setCardForAuction: (card: GroupedTemplate | null) => void;
    initialTab: VaultTab;
    initialSearch?: string;
    allSouls: SoulTemplate[];
}

const getImageUrlFromTemplate = (tpl: SoulTemplate): string => {
    if (tpl.bgImageUrls && tpl.bgImageUrls.length > 0) {
        const firstImage = tpl.bgImageUrls[0];
        if (typeof firstImage === 'string') {
            return firstImage;
        }
        if (firstImage && typeof firstImage === 'object' && 'url' in firstImage && typeof firstImage.url === 'string') {
            return firstImage.url;
        }
    }
    return tpl.smallAvatarUrl || '';
};

const mbtiTypes = ['ISTJ', 'ESTJ', 'ISFJ', 'ESFJ', 'ESFP', 'ISFP', 'ESTP', 'ISTP', 'INFJ', 'ENFJ', 'INFP', 'ENFP', 'INTP', 'ENTP', 'INTJ', 'ENTJ'];
const enneagramTypes = ['1w2', '1w9', '2w1', '2w3', '3w2', '3w4', '4w3', '4w5', '5w4', '5w6', '6w5', '6w7', '7w6', '7w8', '8w7', '8w9', '9w8', '9w1'];


const storePacks: BoosterPack[] = [
    {
        id: 'pack-marvel-1',
        name: 'Marvel Edition Pack',
        description: 'Contains 5 random Souls from Soulverse Marvel Edition.',
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2Fmarvelbooster.png?alt=media&token=c929356d-552c-4300-b0c9-d08eb8a0bf04',
        cost: 500,
        cardBackUrl: 'https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2Fmarvelcardback.png?alt=media&token=cfbb817d-ce3c-4ca3-88dc-8a66b582db76',
        pool: 'marvel',
    },
    {
        id: 'pack-tvd-1',
        name: 'TVD Edition Pack',
        description: 'Contains 5 random Souls from Soulverse TVD Edition.',
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Components%2FCollection%2FEdition%2FTVD%2Ftvd_booster.png?alt=media&token=37b6e407-b776-4cbd-bdcc-8b5a24a11033',
        cost: 500,
        // The card back for all cards opened from this pack.
        cardBackUrl: 'https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Components%2FCollection%2FEdition%2FTVD%2Ftvd_cardback.png?alt=media&token=c7e2d249-d639-47ad-9011-37708f1d7cae',
        pool: 'tvd',
    },
    {
        id: 'pack-starter-1',
        name: 'Starter Pack Booster',
        description: 'Contains 5 random Souls from all Soulverse Edition Packs.',
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Components%2FCollection%2FEdition%2FFree%2Fstarterpack_booster.png?alt=media&token=2e363059-dd7d-4859-b02c-f63b17a20a66',
        cost: 500,
        pool: 'starter',
    },
    {
        id: 'pack-tome-1',
        name: 'Tome',
        description: 'Contains 5 booster packs from Marvel Edition + 2 booster packs from TVD Edition',
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Components%2FCollection%2FEdition%2FFree%2Ftome.png?alt=media&token=3b962308-9116-4d68-abf3-0b722846b811',
        cost: 3000,
        pool: 'tome',
    },
];

interface AuctionItem {
    id: string;
    name: string;
    imageUrl: string;
    currentBid: number;
    buyoutPrice: number | null;
    timeLeft: string;
    quality: TemplateQuality;
    role: SoulRole | null;
    longDescription: string;
    edition: string;
    template: SoulTemplate;
    sellerName: string;
    timeLeftValue: number;
}

const createAuctionItemsFromTemplates = (templates: SoulTemplate[]): AuctionItem[] => {
    const seasonalEditions = ['marvel', 'x-men', 'legacies', 'elite', 'harry potter', 'deadpool', 'rpg'];

    // Filter for base templates only (upgrade is 0 or undefined)
    const baseTemplates = templates.filter(template => !template.upgrade || template.upgrade === 0);

    return baseTemplates.map((template, index) => {
        const templateEdition = (template.edition || '').toLowerCase();
        const isSeasonal = seasonalEditions.some(ed => templateEdition.includes(ed) && ed !== '');

        let quality: TemplateQuality = template.quality || 'Wisp';
        let buyoutPrice: number | null;
        let currentBid: number;
        let timeLeft: string;
        let timeLeftValue: number;
        let sellerName = 'SoulVerse';
        let finalTemplate = { ...template };

        if (isSeasonal) {
            // Seasonal Logic
            switch (quality) {
                case 'Spirit': buyoutPrice = 300 + (index % 10 * 10); currentBid = 120 + (index % 10 * 5); break;
                case 'Ascend': buyoutPrice = 2000 + (index % 10 * 50); currentBid = 1200 + (index % 10 * 20); break;
                case 'Eternal': buyoutPrice = 15000 + (index % 10 * 100); currentBid = 10000 + (index % 10 * 50); break;
                case 'Wisp':
                default: buyoutPrice = 90 + (index % 10 * 2); currentBid = 30 + (index % 10); break;
            }
            timeLeft = 'Seasonal';
            timeLeftValue = 9999;
        } else {
            // Free Logic
            quality = 'Wisp';
            buyoutPrice = 0;
            currentBid = 0;
            timeLeft = 'Free';
            timeLeftValue = 0;
            finalTemplate.tradable = false;
        }
        
        return {
            id: `auction-${template.name.replace(/\s+/g, '-')}-${quality}-${index}`,
            name: template.name,
            imageUrl: getImageUrlFromTemplate(template),
            currentBid,
            buyoutPrice,
            quality,
            role: template.role || null,
            longDescription: template.longDescription,
            edition: template.edition || 'Free',
            template: finalTemplate,
            sellerName,
            timeLeftValue,
            timeLeft,
        };
    });
};

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

const StoreItem: React.FC<{ pack: BoosterPack; onBuyRequest: (pack: BoosterPack, isDiscounted: boolean) => void; onContentsRequest: (pack: BoosterPack) => void; isDiscounted: boolean }> = ({ pack, onBuyRequest, onContentsRequest, isDiscounted }) => {
    const price = isDiscounted && pack.pool !== 'tome' ? Math.max(0, pack.cost - 100) : pack.cost;
    const originalPrice = isDiscounted && pack.pool !== 'tome' ? pack.cost : null;

    return (
        <div className="flex items-center justify-between p-3 border-b border-neutral-800 hover:bg-neutral-800/40 transition-colors">
            <img src={pack.imageUrl} alt={pack.name} className="w-20 h-24 object-contain flex-shrink-0" />
            <div className="flex-1 px-4 text-left">
                <h4 className="font-semibold text-white">{pack.name}</h4>
                <p className="text-xs text-neutral-400 mt-1">{pack.description}</p>
            </div>
            <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 text-xl font-bold text-white">
                    <SoulShardsIcon className="w-6 h-6" />
                    <div className="flex items-baseline gap-2">
                        <span>{price}</span>
                        {originalPrice !== null && <span className="text-sm text-neutral-500 line-through">{originalPrice}</span>}
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <AnimatedButton onClick={() => onBuyRequest(pack, isDiscounted)} className="w-32 py-2 bg-gradient-cyan-purple text-white font-semibold rounded-md hover:opacity-90 transition-opacity text-sm">
                        Buy
                    </AnimatedButton>
                    <AnimatedButton onClick={() => onContentsRequest(pack)} className="w-32 py-2 bg-neutral-700 text-white font-semibold rounded-md hover:bg-neutral-600 transition-colors text-sm">
                        Contents
                    </AnimatedButton>
                </div>
            </div>
        </div>
    );
};

const TooltipOverlay: React.FC<{ item: AuctionItem | null; position: { top: number; left: number } }> = ({ item, position }) => {
    if (!item) return null;

    return ReactDOM.createPortal(
        <div
            style={{ top: position.top, left: position.left }}
            className="fixed z-[200] w-56 p-3 bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl pointer-events-none animate-fade-in"
        >
            <img src={item.imageUrl} alt={item.name} className="w-full h-auto rounded-md mb-2" />
            <p className="text-xs text-neutral-300">{item.longDescription}</p>
        </div>,
        document.body
    );
};

const HeaderSortControl: React.FC<{
    label: string,
    sortKey: 'timeLeft' | 'seller' | 'price' | 'buyout',
    activeSort: 'timeLeft' | 'seller' | 'price' | 'buyout' | null,
    activeOrder: 'asc' | 'desc' | null,
    onSort: (key: 'timeLeft' | 'seller' | 'price' | 'buyout' | null, order: 'asc' | 'desc' | null) => void,
}> = ({ label, sortKey, activeSort, activeOrder, onSort }) => {
    
    const handleSort = (order: 'asc' | 'desc') => {
        if (activeSort === sortKey && activeOrder === order) {
            onSort(null, null); // Toggle off
        } else {
            onSort(sortKey, order);
        }
    };

    const isAscActive = activeSort === sortKey && activeOrder === 'asc';
    const isDescActive = activeSort === sortKey && activeOrder === 'desc';

    return (
        <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-semibold text-neutral-300">{label}</span>
            <div className="flex items-center gap-1 mt-1">
                <button aria-label={`${label} ascending`} aria-pressed={isAscActive} onClick={() => handleSort('asc')}
                    className={`p-1 border rounded-sm ${isAscActive ? 'bg-cyan-400 border-purple-500' : 'bg-neutral-800 border-neutral-600 hover:bg-neutral-600'}`}
                >
                    <TriangleUpIcon className={`w-3 h-3 ${isAscActive ? 'text-black' : 'text-cyan-400'}`} />
                </button>
                <button aria-label={`${label} descending`} aria-pressed={isDescActive} onClick={() => handleSort('desc')}
                    className={`p-1 border rounded-sm ${isDescActive ? 'bg-cyan-400 border-purple-500' : 'bg-neutral-800 border-neutral-600 hover:bg-neutral-600'}`}
                >
                    <TriangleDownIcon className={`w-3 h-3 ${isDescActive ? 'text-black' : 'text-cyan-400'}`} />
                </button>
            </div>
        </div>
    );
};

export const VaultOfEssence: React.FC<VaultOfEssenceProps> = ({ isOpen, onClose, onBuyBooster, accountSettings, setToast, setAccountSettings, cardForAuction, setCardForAuction, initialTab, initialSearch, allSouls }) => {
    const [activeTab, setActiveTab] = useState<VaultTab>(initialTab);
    const [redemptionCode, setRedemptionCode] = useState(['', '', '', '']);
    const codeInputsRef = useRef<(HTMLInputElement | null)[]>([]);
    
    const [auctionItem, setAuctionItem] = useState<GroupedTemplate | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [enableStartingBid, setEnableStartingBid] = useState(false);
    const [startingBid, setStartingBid] = useState('');
    const [enableBuyout, setEnableBuyout] = useState(false);
    const [buyoutPrice, setBuyoutPrice] = useState('');
    const [auctionTime, setAuctionTime] = useState('48h');
    const [auctionCardQuality, setAuctionCardQuality] = useState<TemplateQuality>('Wisp');
    const [auctionCost, setAuctionCost] = useState(0);

    const [confirmationState, setConfirmationState] = useState<{
        isOpen: boolean;
        pack: BoosterPack | null;
        isDiscounted: boolean;
    }>({ isOpen: false, pack: null, isDiscounted: false });
    
    // Item search state
    const [hasSearched, setHasSearched] = useState(!!initialSearch);
    const [isDefaultSort, setIsDefaultSort] = useState(false);
    const [searchTerm, setSearchTerm] = useState(initialSearch || '');
    const [qualityFilter, setQualityFilter] = useState<TemplateQuality | 'All'>('All');
    const [roleFilter, setRoleFilter] = useState<SoulRole | 'All'>('All');
    const [genderFilter, setGenderFilter] = useState<Gender | 'None'>('None');
    const [fourLetterFilter, setFourLetterFilter] = useState<string>('All');
    const [enneagramFilter, setEnneagramFilter] = useState<string>('All');
    
    // Executed filters for search results
    const [executedFilters, setExecutedFilters] = useState({
        term: initialSearch || '',
        quality: 'All',
        role: 'All',
        gender: 'None',
        fourLetter: 'All',
        enneagram: 'All',
    });

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;
    const [sortBy, setSortBy] = useState<'timeLeft' | 'seller' | 'price' | 'buyout' | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

    const [hoveredItem, setHoveredItem] = useState<AuctionItem | null>(null);
    const [hoverPosition, setHoverPosition] = useState({ top: 0, left: 0 });
    
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [soulToView, setSoulToView] = useState<Soul | null>(null);

    const dailyMessageCount = accountSettings.dailyMessageCount || 0;
    const dailyDiscountUsed = accountSettings.dailyRewardState?.dailyBoosterDiscountUsed || false;
    
    const [isContentsModalOpen, setIsContentsModalOpen] = useState(false);
    const [selectedPackForContents, setSelectedPackForContents] = useState<BoosterPack | null>(null);

    const [buyoutConfirmation, setBuyoutConfirmation] = useState<AuctionItem | null>(null);
    const allAuctionableItems = useMemo(() => createAuctionItemsFromTemplates(allSouls), [allSouls]);
    const [auctionItems, setAuctionItems] = useState<AuctionItem[]>([]);
    
    useEffect(() => {
        setAuctionItems(allAuctionableItems);
    }, [allAuctionableItems]);

    useEffect(() => {
        if (isDetailsModalOpen) {
            document.body.classList.add('vault-details-modal-open');
        } else {
            document.body.classList.remove('vault-details-modal-open');
        }
        return () => {
            document.body.classList.remove('vault-details-modal-open');
        }
    }, [isDetailsModalOpen]);

    const handleOpenContentsModal = (pack: BoosterPack) => {
        setSelectedPackForContents(pack);
        setIsContentsModalOpen(true);
    };

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
            if (cardForAuction) {
                setAuctionItem(cardForAuction);
                setCardForAuction(null);
            }
        } else {
            setHasSearched(false);
            setSortBy(null);
            setSortOrder(null);
            setIsDefaultSort(false);
        }
    }, [isOpen, initialTab, cardForAuction, setCardForAuction]);

    useEffect(() => {
        if (isOpen && initialSearch) {
            setSearchTerm(initialSearch);
            setExecutedFilters(prev => ({ ...prev, term: initialSearch }));
            setHasSearched(true);
            setIsDefaultSort(false);
        }
    }, [isOpen, initialSearch]);

    useEffect(() => {
        if (!isOpen) return;
    
        const getUSTodayString = () => {
            const timezone = 'America/Los_Angeles';
            const now = new Date();
            const year = now.toLocaleString('en-US', { year: 'numeric', timeZone: timezone });
            const month = now.toLocaleString('en-US', { month: '2-digit', timeZone: timezone });
            const day = now.toLocaleString('en-US', { day: '2-digit', timeZone: timezone });
            return `${year}-${month}-${day}`;
        };

        const lastResetTimestamp = accountSettings.dailyRewardState?.lastMessageCountReset;
        let lastResetDateString = '';
        if (lastResetTimestamp) {
            const lastResetDate = new Date(lastResetTimestamp);
            const year = lastResetDate.toLocaleString('en-US', { year: 'numeric', timeZone: 'America/Los_Angeles' });
            const month = lastResetDate.toLocaleString('en-US', { month: '2-digit', timeZone: 'America/Los_Angeles' });
            const day = lastResetDate.toLocaleString('en-US', { day: '2-digit', timeZone: 'America/Los_Angeles' });
            lastResetDateString = `${year}-${month}-${day}`;
        }
    
        const todayString = getUSTodayString();
    
        if (lastResetDateString !== todayString) {
            setAccountSettings(prev => ({
                ...prev,
                dailyMessageCount: 0,
                dailyRewardState: {
                    ...prev.dailyRewardState,
                    dailyBoosterDiscountUsed: false,
                    lastMessageCountReset: Date.now(),
                }
            }));
        }
    }, [isOpen, accountSettings.dailyRewardState?.lastMessageCountReset, setAccountSettings]);
    
    const isDiscountAvailable = dailyMessageCount >= 45 && !dailyDiscountUsed;

    const timeOptions = [ { value: '2h', label: 'Very Short (2h)' }, { value: '8h', label: 'Short (8h)' }, { value: '24h', label: 'Medium (24h)' }, { value: '48h', label: 'Long (48h)' }, { value: '120h', label: 'Very Long (120h)' } ];
    const auctionCostMatrix: Record<TemplateQuality, Record<string, number>> = { 'Wisp': { '2h': 1, '8h': 2, '24h': 3, '48h': 4, '120h': 5 }, 'Spirit': { '2h': 2, '8h': 4, '24h': 6, '48h': 8, '120h': 10 }, 'Ascend': { '2h': 5, '8h': 10, '24h': 15, '48h': 20, '120h': 25 }, 'Eternal': { '2h': 20, '8h': 40, '24h': 60, '48h': 80, '120h': 100 } };
    
    useEffect(() => { setAuctionCost(auctionCostMatrix[auctionCardQuality]?.[auctionTime] || 0); }, [auctionTime, auctionCardQuality]);

    const filteredAndSortedAuctions = useMemo(() => {
        let items = auctionItems.filter(item => {
            const { term, quality, role, gender, fourLetter, enneagram } = executedFilters;
            const lowerTerm = term.toLowerCase();

            const searchMatch = (() => {
                if (lowerTerm.trim() === '') return true;
                if (lowerTerm.startsWith('=soulid:')) {
                    const soulId = parseInt(lowerTerm.replace('=soulid:', ''), 10);
                    if (isNaN(soulId)) return false;
                    return item.template.soulId === soulId;
                }
                return item.name.toLowerCase().includes(lowerTerm);
            })();

            const qualityMatch = quality === 'All' || item.quality === quality;
            const roleMatch = role === 'All' || item.role === role || (role === 'Other' && (item.role === SoulRole.NARRATOR || item.role === SoulRole.SCENARIO));
            const genderMatch = gender === 'None' || item.template.gender === gender;
            
            const showConditional = role === SoulRole.CHARACTER || role === SoulRole.ASSISTANT;

            const fourLetterMatch = !showConditional || fourLetter === 'All' || (item.template.mbti && item.template.mbti.toLowerCase().includes(fourLetter.toLowerCase()));
            const enneagramMatch = !showConditional || enneagram === 'All' || (item.template.enneagram && item.template.enneagram.startsWith(enneagram));
            
            return searchMatch && qualityMatch && roleMatch && genderMatch && fourLetterMatch && enneagramMatch;
        });

        if (sortBy && sortOrder) {
            items.sort((a, b) => {
                let valA: string | number, valB: string | number;
                switch (sortBy) {
                    case 'timeLeft':
                        valA = a.timeLeftValue;
                        valB = b.timeLeftValue;
                        break;
                    case 'seller':
                        valA = a.sellerName;
                        valB = b.sellerName;
                        return sortOrder === 'asc' ? (valA as string).localeCompare(valB as string) : (valB as string).localeCompare(valA as string);
                    case 'price':
                        valA = a.currentBid;
                        valB = b.currentBid;
                        break;
                    case 'buyout':
                        valA = a.buyoutPrice ?? (sortOrder === 'asc' ? Infinity : -Infinity);
                        valB = b.buyoutPrice ?? (sortOrder === 'asc' ? Infinity : -Infinity);
                        break;
                    default:
                        return 0;
                }
                if (typeof valA === 'number' && typeof valB === 'number') {
                    return sortOrder === 'asc' ? valA - valB : valB - valA;
                }
                return 0;
            });
        } else if (isDefaultSort) {
            items.sort((a, b) => {
                if (a.timeLeft === 'Free' && b.timeLeft !== 'Free') return -1;
                if (a.timeLeft !== 'Free' && b.timeLeft === 'Free') return 1;
                return (a.template.soulId || 0) - (b.template.soulId || 0);
            });
        }
        
        return items;
    }, [executedFilters, sortBy, sortOrder, auctionItems, isDefaultSort]);


    const totalPages = Math.ceil(filteredAndSortedAuctions.length / ITEMS_PER_PAGE);
    const paginatedItems = filteredAndSortedAuctions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleSearchExecution = () => {
        setHasSearched(true);
        setCurrentPage(1);

        const isDefault = searchTerm.trim() === '' &&
            qualityFilter === 'All' &&
            roleFilter === 'All' &&
            genderFilter === 'None' &&
            fourLetterFilter.trim() === 'All' &&
            enneagramFilter === 'All';
        
        if (isDefault) {
            setIsDefaultSort(true);
            setSortBy(null);
            setSortOrder(null);
        } else {
            setIsDefaultSort(false);
        }

        setExecutedFilters({
            term: searchTerm,
            quality: qualityFilter,
            role: roleFilter,
            gender: genderFilter,
            fourLetter: fourLetterFilter,
            enneagram: enneagramFilter,
        });
    };
    
    const handleSort = (key: 'timeLeft' | 'seller' | 'price' | 'buyout' | null, order: 'asc' | 'desc' | null) => {
        setIsDefaultSort(false);
        setSortBy(key);
        setSortOrder(order);
    };

    const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages || 1));
    
    const handleBuyRequest = (pack: BoosterPack, isDiscounted: boolean) => {
        if (pack.id === 'pack-tome-1') {
            const price = pack.cost;
            if ((accountSettings.soulShards || 0) < price) {
                setToast({ title: "Insufficient Shards", message: "You don't have enough Soul Shards." });
                return;
            }
    
            const marvelPack = storePacks.find(p => p.pool === 'marvel');
            const tvdPack = storePacks.find(p => p.pool === 'tvd');
    
            if (!marvelPack || !tvdPack) {
                setToast({ title: "Error", message: "Cannot find required booster packs." });
                return;
            }
            
            setAccountSettings(prev => {
                const newBoosters = [...(prev.boosterPacks || [])];
                for (let i = 0; i < 5; i++) {
                    newBoosters.push({ ...marvelPack, id: `tome-marvel-${Date.now()}-${i}` });
                }
                for (let i = 0; i < 2; i++) {
                    newBoosters.push({ ...tvdPack, id: `tome-tvd-${Date.now()}-${i}` });
                }
                const newShards = (prev.soulShards || 0) - price;
                
                setToast({ title: "Purchase Successful", message: `${pack.name} has been opened and its contents added to your boosters.` });
    
                return { 
                    ...prev, 
                    soulShards: newShards, 
                    boosterPacks: newBoosters,
                };
            });
        } else {
            setConfirmationState({ isOpen: true, pack, isDiscounted });
        }
    };

    const handleConfirmBuy = () => {
        if (confirmationState.pack) {
            onBuyBooster(confirmationState.pack, confirmationState.isDiscounted);
        }
        setConfirmationState({ isOpen: false, pack: null, isDiscounted: false });
    };

    const handleConfirmBuyout = () => {
        if (!buyoutConfirmation || buyoutConfirmation.buyoutPrice === null) return;
    
        const price = buyoutConfirmation.buyoutPrice;
    
        if (accountSettings.soulShards < price) {
            setToast({ title: "Insufficient Funds", message: "You do not have enough Soul Shards to buy this item." });
            setTimeout(() => setToast(null), 5000);
            setBuyoutConfirmation(null);
            return;
        }
    
        const newShards = accountSettings.soulShards - price;
        
        const newMailMessage: MailMessage = {
            id: crypto.randomUUID(),
            from: 'SoulVerse',
            title: `Congratulations you won the bid for '${buyoutConfirmation.name}'`,
            body: `The item '${buyoutConfirmation.name}' has been successfully purchased and sent to your inbox. You can claim it from the message attachment.`,
            timestamp: new Date().toISOString(),
            isRead: false,
            hasClaimable: true,
            isClaimed: false,
            attachedTemplate: {
                name: buyoutConfirmation.template.name,
                quality: buyoutConfirmation.quality,
            },
        };
    
        setAccountSettings(prev => ({
            ...prev,
            soulShards: newShards,
            mailMessages: [...(prev.mailMessages || []), newMailMessage],
        }));
    
        setAuctionItems(prev => prev.filter(item => item.id !== buyoutConfirmation.id));
        setToast({ title: "Purchase Successful", message: `'${buyoutConfirmation.name}' has been sent to your inbox.` });
        setBuyoutConfirmation(null);
    };

    const handleClaim = (itemToClaim: AuctionItem) => {
        const benefits = getSubscriptionBenefits(accountSettings);
        const activeSoulsCount = accountSettings.souls.filter(s => !s.deletionTimestamp).length;
    
        if (activeSoulsCount >= benefits.soulSlots) {
            setToast({
                title: "No Soul Slots Available",
                message: "Please upgrade your subscription or schedule a Soul for deletion to create a new one."
            });
            return;
        }

        const ownedCount = accountSettings.ownedTemplates?.filter(t => t.name === itemToClaim.template.name).length || 0;
        if (ownedCount >= 4) {
            setToast({
                title: "Collection Full",
                message: `You already own the maximum of 4 copies of ${itemToClaim.name}.`
            });
            return;
        }
    
        const newOwnedTemplate = {
            name: itemToClaim.template.name,
            quality: itemToClaim.quality,
            instanceId: crypto.randomUUID(),
            upgrade: itemToClaim.template.upgrade ?? 0,
        };
    
        setAccountSettings(prev => ({
            ...prev,
            ownedTemplates: [...(prev.ownedTemplates || []), newOwnedTemplate],
        }));
    
        setAuctionItems(prev => prev.filter(item => item.id !== itemToClaim.id));
    
        setToast({
            title: "Template Claimed",
            message: `${itemToClaim.name} has been added to your Collection.`
        });
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => { const newCode = [...redemptionCode]; newCode[index] = e.target.value.toUpperCase().slice(0, 5); setRedemptionCode(newCode); if (e.target.value.length === 5 && index < 3) { codeInputsRef.current[index + 1]?.focus(); } };
    
    const handleRedeemCode = () => {
        const fullCode = redemptionCode.join('').trim();
        if (!fullCode) {
            setToast({ title: "Invalid Code", message: "Please enter a code." });
            return;
        }
        
        if (accountSettings.redeemedCodes?.includes(fullCode)) {
            setToast({ title: "Already Used", message: "You have already redeemed this code." });
            setRedemptionCode(['', '', '', '']);
            return;
        }
        
        let success = false;
        let toastTitle = "Code Redeemed!";
        let toastMessage = "";
    
        switch (fullCode) {
            case 'BOOSTER2025FREEWIN':
                const marvelPack = storePacks.find(p => p.pool === 'marvel');
                if (marvelPack) {
                    setAccountSettings(prev => {
                        const newBoosters = [...(prev.boosterPacks || []), { ...marvelPack, id: `booster-redeemed-${Date.now()}` }];
                        const newRedeemed = [...(prev.redeemedCodes || []), fullCode];
                        return { ...prev, boosterPacks: newBoosters, redeemedCodes: newRedeemed };
                    });
                    toastMessage = "You received a free Marvel Edition Booster Pack!";
                    success = true;
                } else {
                    toastTitle = "Error";
                    toastMessage = "Could not find the Marvel Pack to award.";
                }
                break;
            case 'SOUL500SHARDS2025X':
                setAccountSettings(prev => {
                    const newShards = (prev.soulShards || 0) + 500;
                    const newRedeemed = [...(prev.redeemedCodes || []), fullCode];
                    return { ...prev, soulShards: newShards, redeemedCodes: newRedeemed };
                });
                toastMessage = "500 Soul Shards have been added to your account!";
                success = true;
                break;
            case 'ESSENCE3000POWERUP':
                setAccountSettings(prev => {
                    const newEssence = (prev.referralEssence || 0) + 3000;
                    const newRedeemed = [...(prev.redeemedCodes || []), fullCode];
                    return { ...prev, referralEssence: newEssence, redeemedCodes: newRedeemed };
                });
                toastMessage = "3000 Essence has been added to your account!";
                success = true;
                break;
            default:
                setToast({ title: "Invalid Code", message: "The code you entered is not valid." });
                break;
        }
        
        if (success) {
            setToast({ title: toastTitle, message: toastMessage });
            setRedemptionCode(['', '', '', '']); // Clear input
        }
    };

    const handleItemHover = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, item: AuctionItem | null) => {
        if (item) {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoverPosition({ top: rect.top, left: rect.right + 10 });
            setHoveredItem(item);
        } else {
            setHoveredItem(null);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const cardDataString = e.dataTransfer.getData("application/json");
        if (cardDataString) {
            try {
                const cardData = JSON.parse(cardDataString);
                setAuctionItem(cardData);
            } catch (error) {
                console.error("Failed to parse dropped card data:", error);
            }
        }
    };
    
    const handleViewDetails = (template: SoulTemplate) => {
        const soulForModal: Soul = {
            id: 'template-view-' + template.name, name: template.name, description: template.title, model: 'gemini-2.5-flash', gender: template.gender,
            avatar: template.smallAvatarUrl, backstory: template.backstory, responseDirective: template.responseDirective, keyMemories: template.keyMemories,
            greeting: template.greeting, exampleMessage: template.exampleMessage || '', voiceURI: 'Zephyr', mbti: template.mbti || null,
            enneagram: template.enneagram || null, dynamism: template.dynamism, thinkingBudget: 128, antiRepeatStrength: 0.00,
            memoryConsolidation: true, memoryRecall: true, maxTokens: 2048, avatarStyle: 'Photoreal',
            physicalAppearanceDescription: template.longDescription, faceDetailEnhance: 0, faceDetailPrompt: '', enableNsfwSelfies: false,
            selfies: [], followersCount: 0, followingCount: 0, username: template.name.toLowerCase().replace(/\s+/g, '_'),
            bio: template.longDescription, profileBannerUrl: template.profileBannerUrl || null, posts: template.posts || [],
            role: template.role || null, templateName: template.name, soulId: template.soulId, shareCode: template.shareCode,
            edition: template.edition, upgrade: template.upgrade, tradable: template.tradable,
        };
        setSoulToView(soulForModal);
        setIsDetailsModalOpen(true);
    };

    const renderAuctionList = (items: AuctionItem[]) => {
        const getQualityClass = (quality: TemplateQuality) => ({ 'Wisp': 'border-neutral-400', 'Spirit': 'border-cyan-400', 'Ascend': 'border-purple-400', 'Eternal': 'border-yellow-400' })[quality] || 'border-neutral-700';
        
        return (
            <div className="space-y-1">
                {items.map(item => (
                    <div key={item.id} className="bg-neutral-800/50 border border-neutral-700/60 rounded-lg p-4 flex items-center gap-4 text-sm text-neutral-200 shadow-sm">
                        <div className={`relative w-20 h-28 p-0.5 bg-black/20 rounded-md border-2 flex-shrink-0 ${getQualityClass(item.quality)}`} onMouseEnter={(e) => handleItemHover(e, item)} onMouseLeave={(e) => handleItemHover(e, null)}>
                             <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-sm" />
                        </div>
                        <div className="w-40 flex-shrink-0 flex items-center justify-center text-center font-semibold">
                            <span>{item.name.replace(/★/g, '').trim()}</span>
                            <button onClick={() => handleViewDetails(item.template)} className="ml-2 p-1 rounded-full hover:bg-neutral-700">
                                <EyeIcon className="w-5 h-5 text-neutral-400" />
                            </button>
                        </div>
                        <div className="w-px bg-neutral-700 self-stretch mx-2"></div>
                        <div className="w-24 flex-shrink-0 flex items-center justify-center text-center">{item.timeLeft}</div>
                        <div className="w-px bg-neutral-700 self-stretch mx-2"></div>
                        <div className="w-32 flex-shrink-0 flex items-center justify-center text-center text-neutral-300">{item.sellerName}</div>
                        <div className="w-px bg-neutral-700 self-stretch mx-2"></div>

                        <div className="flex-grow grid grid-cols-[max-content_1fr_max-content] items-center gap-x-4 gap-y-2">
                            {item.timeLeft === 'Free' ? (
                                <>
                                    <label className="text-neutral-300 text-right text-sm">Enter your Bid:</label>
                                    <div className="bg-black/20 border border-neutral-700 rounded-md flex items-center px-2 h-10 opacity-50">
                                        <SoulShardsIcon className="w-5 h-5 text-cyan-400 flex-shrink-0"/>
                                        <input type="number" placeholder="0" disabled className="w-full bg-transparent text-center p-2 focus:outline-none text-white font-semibold cursor-not-allowed"/>
                                    </div>
                                    <button disabled className="py-2 px-8 text-sm font-semibold text-white bg-neutral-600 rounded opacity-50 cursor-not-allowed">Bid</button>
                                    
                                    <label className="text-neutral-300 text-right text-sm">Price:</label>
                                    <div className="bg-black/20 border border-neutral-700 rounded-md flex items-center px-2 h-10">
                                        <SoulShardsIcon className="w-5 h-5 text-cyan-400 flex-shrink-0"/>
                                        <span className="w-full text-center font-semibold">0</span>
                                    </div>
                                    <button onClick={() => handleClaim(item)} className="py-2 px-8 text-sm font-semibold text-white bg-gradient-to-r from-cyan-400 to-purple-500 rounded hover:opacity-90 transition-opacity transition-transform duration-75 ease-out active:scale-[0.97]">Claim</button>
                                </>
                            ) : (
                                <>
                                    <label className="text-neutral-300 text-right text-sm">Enter your Bid:</label>
                                    <div className="bg-black/20 border border-neutral-700 rounded-md flex items-center px-2 h-10">
                                        <SoulShardsIcon className="w-5 h-5 text-cyan-400 flex-shrink-0"/>
                                        <input type="number" placeholder={`${item.currentBid + 1}`} className="w-full bg-transparent text-center p-2 focus:outline-none text-white font-semibold"/>
                                    </div>
                                    <button className="py-2 px-8 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded hover:opacity-90 transition-opacity transition-transform duration-75 ease-out active:scale-[0.97]">Bid</button>
                                    <label className="text-neutral-300 text-right text-sm">Buyout:</label>
                                    <div className="bg-black/20 border border-neutral-700 rounded-md flex items-center px-2 h-10">
                                        <SoulShardsIcon className="w-5 h-5 text-cyan-400 flex-shrink-0"/>
                                        <span className="w-full text-center font-semibold">{item.buyoutPrice || '---'}</span>
                                    </div>
                                    <button onClick={() => setBuyoutConfirmation(item)} disabled={!item.buyoutPrice} className="py-2 px-8 text-sm font-semibold text-white bg-gradient-to-r from-cyan-400 to-purple-500 rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-75 ease-out active:scale-[0.97]">Buyout</button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'store': {
                const progressText = `Send messages with your Souls for a daily <strong>100 SHARDS</strong> booster discount.`;
                const availableText = `You have a daily 100 SHARDS booster discount available!`;
                return (
                    <div className="p-4 h-full overflow-y-auto custom-scrollbar">
                        <div className="p-3 border-b border-neutral-800 text-center space-y-4">
                             {dailyDiscountUsed ? (<div className="flex items-center justify-center text-sm p-3 rounded-md bg-neutral-900/50 border border-neutral-700/60 text-green-400 font-semibold">You already bought the discounted booster today.</div>) : (<div className="flex items-center justify-center gap-3 text-sm p-3 rounded-md bg-neutral-900/50 border border-neutral-700/60"><ClockIcon className="w-5 h-5 text-cyan-400"/><span className="flex-grow text-left" dangerouslySetInnerHTML={{ __html: isDiscountAvailable ? availableText : progressText }}/><div className="w-32 bg-neutral-700 rounded-full h-2.5"><div className={`h-2.5 rounded-full transition-all ${isDiscountAvailable ? 'bg-green-500 animate-pulse' : 'bg-gradient-to-r from-cyan-500 to-purple-500'}`} style={{ width: `${Math.min(100, (dailyMessageCount / 45) * 100)}%` }}></div></div><span className="font-mono font-bold text-lg text-white">{dailyMessageCount}/45 messages</span></div>)}
                            <div><p className="text-sm mb-2">Enter a code to claim rewards that are associated with it.</p><div className="flex items-center justify-center gap-2">{redemptionCode.map((value, index) => (<React.Fragment key={index}><input ref={el => { codeInputsRef.current[index] = el; }} type="text" maxLength={5} value={value} onChange={(e) => handleCodeChange(e, index)} className="w-24 h-9 bg-neutral-800/60 border border-neutral-700 rounded text-center focus:ring-purple-500 focus:outline-none focus:ring-1 uppercase tracking-widest"/>{index < 3 && <span className="text-neutral-600">-</span>}</React.Fragment>))}<button onClick={handleRedeemCode} className="ml-4 px-6 py-1.5 bg-gradient-cyan-purple text-white font-semibold rounded-md hover:opacity-90 transition-opacity text-sm transition-transform duration-75 ease-out active:scale-[0.97]">Register</button></div></div>
                        </div>
                        <div className="space-y-2">
                            {storePacks.map(pack => <StoreItem key={pack.id} pack={pack} onBuyRequest={handleBuyRequest} onContentsRequest={handleOpenContentsModal} isDiscounted={isDiscountAvailable} />)}
                        </div>
                    </div>
                );
            }
            case 'soul-search': return (
                <div className="p-2 flex flex-col h-full font-sans">
                    <header className="flex-shrink-0 flex items-end gap-3 flex-wrap px-4 py-3 bg-neutral-900/50 border-b border-neutral-700/80 min-h-[80px]">
                        <div>
                             <label className="block text-xs font-medium text-neutral-400 mb-1">Search...</label>
                            <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSearchExecution(); }} className="w-48 bg-neutral-800 border border-neutral-700 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"/>
                        </div>
                        <div>
                            <button onClick={handleSearchExecution} className="px-5 py-2 bg-gradient-cyan-purple text-white font-semibold rounded-md hover:opacity-90 transition-opacity text-sm">Soul Search</button>
                        </div>
                        <div className="ml-6">
                            <label className="block text-xs font-medium text-neutral-400 mb-1">Quality</label>
                            <select value={qualityFilter} onChange={e => setQualityFilter(e.target.value as any)} className="bg-neutral-800 border border-neutral-700 rounded-md py-2 px-3 focus:ring-1 focus:ring-purple-500 focus:outline-none text-sm appearance-none"><option value="All">All</option><option value="Wisp">Wisp</option><option value="Spirit">Spirit</option><option value="Ascend">Ascend</option><option value="Eternal">Eternal</option></select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 mb-1">Gender</label>
                            <select value={genderFilter} onChange={e => setGenderFilter(e.target.value as any)} className="bg-neutral-800 border border-neutral-700 rounded-md py-2 px-3 focus:ring-1 focus:ring-purple-500 focus:outline-none text-sm appearance-none"><option value="None">All</option><option value="Male">Male</option><option value="Female">Female</option></select>
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-neutral-400 mb-1">Role</label>
                            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)} className="bg-neutral-800 border border-neutral-700 rounded-md py-2 px-3 focus:ring-1 focus:ring-purple-500 focus:outline-none text-sm appearance-none"><option value="All">All</option><option value={SoulRole.CHARACTER}>Character</option><option value={SoulRole.ASSISTANT}>Assistant</option><option value={SoulRole.NARRATOR}>Narrator</option><option value={SoulRole.SCENARIO}>Scenario</option></select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 mb-1">MBTI</label>
                            <select value={fourLetterFilter} onChange={e => setFourLetterFilter(e.target.value)} disabled={!(roleFilter === SoulRole.CHARACTER || roleFilter === SoulRole.ASSISTANT)} className="bg-neutral-800 border border-neutral-700 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm appearance-none disabled:opacity-50 disabled:cursor-not-allowed"><option value="All">All</option>{mbtiTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 mb-1">Enneagram</label>
                            <select value={enneagramFilter} onChange={e => setEnneagramFilter(e.target.value)} disabled={!(roleFilter === SoulRole.CHARACTER || roleFilter === SoulRole.ASSISTANT)} className="bg-neutral-800 border border-neutral-700 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm appearance-none disabled:opacity-50 disabled:cursor-not-allowed"><option value="All">All</option>{enneagramTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
                        </div>
                    </header>
                    
                    {hasSearched ? (
                        <>
                            <div className="flex-shrink-0 flex items-center gap-4 text-sm shadow-sm px-4 py-1 mt-2 bg-black/20 border-y border-neutral-800/80">
                                <div className="w-20 flex-shrink-0"></div>
                                <div className="w-40 flex-shrink-0 font-semibold text-center text-neutral-300">Soul</div>
                                <div className="w-px bg-neutral-700 self-stretch mx-2 h-12"></div>
                                <div className="w-24 flex-shrink-0 flex justify-center"><HeaderSortControl label="Time Left" sortKey="timeLeft" activeSort={sortBy} activeOrder={sortOrder} onSort={handleSort} /></div>
                                <div className="w-px bg-neutral-700 self-stretch mx-2 h-12"></div>
                                <div className="w-32 flex-shrink-0 flex justify-center"><HeaderSortControl label="Seller" sortKey="seller" activeSort={sortBy} activeOrder={sortOrder} onSort={handleSort} /></div>
                                <div className="w-px bg-neutral-700 self-stretch mx-2 h-12"></div>
                                <div className="flex-grow flex items-center justify-around">
                                    <HeaderSortControl label="Price" sortKey="price" activeSort={sortBy} activeOrder={sortOrder} onSort={handleSort} />
                                    <HeaderSortControl label="Buyout" sortKey="buyout" activeSort={sortBy} activeOrder={sortOrder} onSort={handleSort} />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar mt-1 pr-2">
                                {paginatedItems.length > 0 ? renderAuctionList(paginatedItems) : <div className="h-full flex items-center justify-center text-neutral-500">No items match your search.</div>}
                            </div>
                            <div className="flex justify-between items-center pt-2 text-sm text-neutral-400 flex-shrink-0 mt-2">
                                <button onClick={handlePreviousPage} disabled={currentPage === 1} className="px-4 py-2 bg-neutral-700 text-white font-semibold rounded hover:bg-neutral-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-75 ease-out active:scale-[0.97]">Previous Page</button>
                                <span>{filteredAndSortedAuctions.length} cards found. Page {currentPage} of {totalPages || 1}</span>
                                <button onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0} className="px-4 py-2 bg-neutral-700 text-white font-semibold rounded hover:bg-neutral-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-75 ease-out active:scale-[0.97]">Next Page</button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-neutral-500">
                            <SearchIcon className="w-16 h-16 mb-4" />
                            <h3 className="text-xl font-semibold text-neutral-300">Search for Souls</h3>
                            <p>Use the filters above and click "Soul Search" to find items.</p>
                        </div>
                    )}
                </div>
            );
            /*
            case 'my-auctions': return (
                <div className="grid grid-cols-3 gap-4 h-full p-4">
                    <div className="col-span-1 bg-neutral-900/50 p-4 rounded-lg flex flex-col space-y-4 border border-purple-500/20">
                        <h3 className="text-center text-lg font-semibold text-white">Create New Auction</h3>
                        <div 
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative aspect-[3/4] w-full max-w-[16rem] mx-auto bg-black/20 border-2 border-dashed rounded-lg transition-colors ${isDragOver ? 'border-purple-500 bg-purple-900/30' : 'border-neutral-700'}`}>
                            {auctionItem ? (
                                <img src={getImageUrlFromTemplate(auctionItem.template)} alt={auctionItem.template.name} className="absolute inset-0 w-full h-full object-contain p-2" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-sm text-neutral-400 p-2">Drag a Soul here.</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Enter Starting Bid</label>
                            <div className="flex items-center gap-2">
                                <SoulShardsIcon className={`w-6 h-6 transition-opacity ${!enableStartingBid ? 'opacity-50' : ''}`}/>
                                <input type="number" className="w-32 bg-neutral-700/60 border border-neutral-600 rounded-md p-2 text-center focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50" disabled={!enableStartingBid} value={startingBid} onChange={(e) => setStartingBid(e.target.value)} min="2"/>
                                <input type="checkbox" checked={enableStartingBid} onChange={(e) => { setEnableStartingBid(e.target.checked); if (e.target.checked) setStartingBid('2'); else setStartingBid(''); }} className="w-5 h-5 bg-neutral-800 border-neutral-600 rounded text-purple-500 focus:ring-purple-500 shrink-0 cursor-pointer"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Enter Buyout Price</label>
                            <div className="flex items-center gap-2">
                                <SoulShardsIcon className={`w-6 h-6 transition-opacity ${!enableBuyout ? 'opacity-50' : ''}`}/>
                                <input type="number" className="w-32 bg-neutral-700/60 border border-neutral-600 rounded-md p-2 text-center focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50" disabled={!enableBuyout} value={buyoutPrice} onChange={(e) => setBuyoutPrice(e.target.value)} min="3"/>
                                <input type="checkbox" checked={enableBuyout} onChange={(e) => { setEnableBuyout(e.target.checked); if (e.target.checked) setBuyoutPrice('3'); else setBuyoutPrice(''); }} className="w-5 h-5 bg-neutral-800 border-neutral-600 rounded text-purple-500 focus:ring-purple-500 shrink-0 cursor-pointer"/>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-300 mb-1 block">Set Time</label>
                            <select value={auctionTime} onChange={(e) => setAuctionTime(e.target.value)} className="w-full bg-neutral-700/60 border border-neutral-600 rounded-md p-2 appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500">{timeOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-neutral-800">{opt.label}</option>)}</select>
                        </div>
                        <div className="flex justify-between items-center text-sm pt-2 border-t border-neutral-800">
                            <span className="text-neutral-300">Auction Cost</span>
                            <div className="flex items-center gap-2 font-semibold text-white">
                                <SoulShardsIcon className="w-5 h-5"/>
                                <span>{auctionCost}</span>
                            </div>
                        </div>
                        <div className="pt-2 !mt-auto">
                            <button className="w-full py-3 bg-gradient-cyan-purple text-white font-semibold rounded-full hover:opacity-90 transition-opacity transition-transform duration-75 ease-out active:scale-[0.97]">Create Auction</button>
                        </div>
                    </div>
                    <div className="col-span-2 bg-black/20 p-4 rounded-lg flex flex-col border border-neutral-800">
                        <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr] gap-4 text-xs font-bold text-neutral-400 uppercase border-b border-neutral-800 pb-2 mb-4">
                            <span>Auction</span>
                            <span>Time Left</span>
                            <span>Bidder</span>
                            <span className="text-right">Bid and Buyout Price</span>
                        </div>
                        <div className="flex-1 text-center text-neutral-500 flex items-center justify-center">No active auctions.</div>
                        <div className="text-sm text-center text-neutral-500 pt-2 border-t border-neutral-800">0 / 100 active auctions</div>
                    </div>
                </div>
            );
            */
            case 'currency':
                return <CurrencyView accountSettings={accountSettings} setAccountSettings={setAccountSettings} />;
            case 'billing':
                return <div className="h-full overflow-y-auto custom-scrollbar"><BillingPage accountSettings={accountSettings} /></div>;
            default: return null;
        }
    };

    return (
        <>
            <TooltipOverlay item={hoveredItem} position={hoverPosition} />
            {isContentsModalOpen && selectedPackForContents && (
                <BoosterContentsModal
                    isOpen={isContentsModalOpen}
                    onClose={() => setIsContentsModalOpen(false)}
                    pack={selectedPackForContents}
                    allSouls={allSouls}
                />
            )}
            {buyoutConfirmation && (
                <Modal isOpen={!!buyoutConfirmation} onClose={() => setBuyoutConfirmation(null)} title="Confirm Buyout">
                    <div className="p-6 text-center">
                        <p className="text-neutral-300">Do you really want to buyout this item?</p>
                        <div className="flex justify-center gap-4 mt-6">
                            <AnimatedButton onClick={() => setBuyoutConfirmation(null)} className="py-2 px-8 rounded-md text-sm font-medium bg-neutral-700 hover:bg-neutral-600">NO</AnimatedButton>
                            <AnimatedButton onClick={handleConfirmBuyout} className="py-2 px-8 rounded-md text-sm font-medium bg-gradient-cyan-purple text-white hover:opacity-90">YES</AnimatedButton>
                        </div>
                    </div>
                </Modal>
            )}
            {confirmationState.isOpen && confirmationState.pack && (
                <Modal 
                    isOpen={confirmationState.isOpen} 
                    onClose={() => setConfirmationState({ isOpen: false, pack: null, isDiscounted: false })} 
                    title="Confirm Purchase"
                    maxWidth="max-w-md"
                >
                    <div className="p-6 text-center bg-neutral-900/50">
                        <p className="text-neutral-300">
                           Are you sure you want to buy <strong>{confirmationState.pack.name}</strong> for {' '}
                           <span className="font-bold text-white">{confirmationState.isDiscounted ? Math.max(0, confirmationState.pack.cost - 100) : confirmationState.pack.cost}</span> Soul Shards?
                        </p>
                        <div className="flex justify-center gap-4 mt-6">
                            <AnimatedButton onClick={() => setConfirmationState({ isOpen: false, pack: null, isDiscounted: false })} className="py-2 px-8 rounded-md text-sm font-medium bg-neutral-800 hover:bg-neutral-700">
                                NO
                            </AnimatedButton>
                            <AnimatedButton onClick={handleConfirmBuy} className="py-2 px-8 rounded-md text-sm font-medium bg-gradient-cyan-purple text-white hover:opacity-90">
                                YES
                            </AnimatedButton>
                        </div>
                    </div>
                </Modal>
            )}
            <SoulTemplateModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                soul={soulToView}
                position="top"
            />
            <div
                className="w-full h-full bg-transparent text-neutral-300 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex-shrink-0 px-4 border-b-2 border-cyan-500/30">
                    <nav className="flex items-center">
                        <TabButton label="Store" isActive={activeTab === 'store'} onClick={() => setActiveTab('store')} />
                        <TabButton label="Soul Search" isActive={activeTab === 'soul-search'} onClick={() => setActiveTab('soul-search')} />
                        {/* <TabButton label="My Auctions" isActive={activeTab === 'my-auctions'} onClick={() => setActiveTab('my-auctions')} /> */}
                        <TabButton label="Currency" isActive={activeTab === 'currency'} onClick={() => setActiveTab('currency')} />
                        <TabButton label="Billing" isActive={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
                    </nav>
                </header>
                <main className="flex-1 bg-black/40 overflow-hidden">
                    {renderContent()}
                </main>
            </div>
        </>
    );
};

const CurrencyView: React.FC<{
    accountSettings: AccountSettings;
    setAccountSettings: (updater: (prev: AccountSettings) => AccountSettings) => void;
}> = ({ accountSettings, setAccountSettings }) => {
    
    const shardPacks = [
        { shards: 600, price: 3.25 },
        { shards: 1200, price: 6.50 },
        { shards: 3000, price: 13.00 },
        { shards: 6500, price: 25.75 },
        { shards: 17500, price: 64.25 },
    ];
    
    return (
        <div className="p-6 h-full overflow-y-auto custom-scrollbar space-y-8">
            <div>
                <h3 className="text-xl font-bold text-white mb-4 text-center">Buy Soul Shards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {shardPacks.map(pack => (
                        <div key={pack.shards} className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-700/60 flex flex-col items-center text-center">
                            <SoulShardsIcon className="w-12 h-12 mb-2"/>
                            <p className="text-2xl font-bold text-white">{pack.shards.toLocaleString()}</p>
                            <p className="text-sm text-neutral-400">Soul Shards</p>
                            <button className="mt-4 w-full py-2 bg-gradient-cyan-purple text-white font-semibold rounded-md hover:opacity-90 transition-opacity">
                                ${pack.price.toFixed(2)}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};