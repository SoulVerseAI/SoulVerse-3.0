import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { Modal } from './components/ui/Modal';
import { TweakMessageModal } from './components/ui/TweakMessageModal';
import { MemoryRecallModal } from './components/ui/MemoryRecallModal';
import { ChatBreakModal } from './components/ui/ChatBreakModal';
// FIX: Import FunctionWindow component.
import { FunctionWindow } from './components/ui/FunctionWindow';
import { ChatMessage, Soul, Gender, LongTermMemory, Persona, SoulRole, SoulTemplate, BoosterPack, GroupedTemplate, VaultTab, TemplateQuality, Hotkey } from './types';
// FIX: claimEssenceFromMail is exported from inboxService, not dataService.
import { continueGeminiResponse, generateGeminiResponse, generateUserReplyInPersona, regenerateGeminiResponse, streamGeminiResponse, generateMemorySummary, generateMetaResponse, generateUpdatedCharacterSheet, generateTextToSpeechAudio, enforceDialoguePurity } from './services/geminiService';
import { useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { LoginOptions } from './components/LoginOptions';
import { LandingPage } from './components/LandingPage';
import { TopBarContainer } from './components/TopBarContainer';
import { ModelSelectorPanel } from './components/panels/ModelSelectorPanel';
import { StyleSelectorPanel } from './components/panels/StyleSelectorPanel';
import { FavoritesPanel } from './components/panels/FavoritesPanel';
import { VoiceCallSettingsModal } from './components/VoiceCallSettingsModal';
import { TermsPage } from './components/TermsPage';
import { UserGuide } from './components/UserGuide';
import { DailyRewardsModal } from './components/DailyRewardsModal';
import { ToastNotification } from './components/ui/ToastNotification';
// FIX: Add UserCircleIcon to imports
import { UserCircleIcon } from './components/icons/Icons';
import { SoulTemplateModal } from './components/ui/SoulTemplateModal';
import { ScheduleForDeletionModal } from './components/ui/ScheduleForDeletionModal';
import { CheckMail } from './components/onboarding/CheckMail';
import { Welcome } from './components/onboarding/Welcome';
import { MultiaccountWarningModal } from './components/ui/MultiaccountWarningModal';
import { SoulHello } from './components/onboarding/SoulHello';
import { NameYourSoul } from './components/onboarding/NameYourSoul';
import { LookYourSoul } from './components/onboarding/LookYourSoul';
import { WhatYourSoul } from './components/onboarding/WhatYourSoul';
import { HelloYourSoul } from './components/onboarding/HelloYourSoul';
import { SubscriptionBanner } from './components/SubscriptionBanner';
import { SubscriptionPage } from './components/SubscriptionPage';
import { UserAvatarModal } from './components/UserAvatarModal';
import { fetchAccountSettings, updateAccountSettings, fetchMessages, addMessage, updateMessage, fetchConsolidatedMemories, addConsolidatedMemory, deleteSouls, deleteMessage, createSoul, deleteMessagesForSoul, deleteConsolidatedMemory, updateConsolidatedMemory, deleteMemoriesForSoul } from './services/dataService';
import { JournalModal } from './components/ui/JournalModal';
import { getSubscriptionBenefits, getDefaultModelForTier } from './services/subscriptionService';
import { DebugStats } from './components/DebugStats';
import { SoulNotesPage } from './components/SoulNotesPage';
import { UnstuckSoulModal } from './components/ui/UnstuckSoulModal';
import { AdminDeleteMessagesModal } from './components/ui/AdminDeleteMessagesModal';
import { characterSheetLinks } from './components/SoulsTemplates/CSTemplates';
import { narratorSouls } from './components/SoulsTemplates/SRNarrator';
import { characterSouls } from './components/SoulsTemplates/SRCharacter';
import { assistantSouls } from './components/SoulsTemplates/SRAssistant';
import { scenarioSouls } from './components/SoulsTemplates/SRScenario';
import { wispSRCharacterMarvel } from './components/Collection/Edition/Marvel/Wisp/WispSRCharacter';
import { wispSRNarratorMarvel } from './components/Collection/Edition/Marvel/Wisp/WispSRNarrator';
import { spiritSRCharacterMarvel } from './components/Collection/Edition/Marvel/Spirit/SpiritSRCharacter';
import { ascendSRCharacterMarvel } from './components/Collection/Edition/Marvel/Ascend/AscendSRCharacter';
import { ascendSRScenarioMarvel } from './components/Collection/Edition/Marvel/Ascend/AscendSRScenario';
import { eternalSRCharacterMarvel } from './components/Collection/Edition/Marvel/Eternal/EternalSRCharacter';
import { wispSRCharacterTVD } from './components/Collection/Edition/TVD/Wisp/WispSRCharacter';
import { wispSRAssistantTVD } from './components/Collection/Edition/TVD/Wisp/WispSRAssistant';
import { wispSRNarratorTVD } from './components/Collection/Edition/TVD/Wisp/WispSRNarrator';
import { wispSRScenarioTVD } from './components/Collection/Edition/TVD/Wisp/WispSRScenario';
import { spiritSRCharacterTVD } from './components/Collection/Edition/TVD/Spirit/SpiritSRCharacter';
import { spiritSRAssistantTVD } from './components/Collection/Edition/TVD/Spirit/SRAssistant';
import { spiritSRNarratorTVD } from './components/Collection/Edition/TVD/Spirit/SpiritSRNarrator';
import { spiritSRScenarioTVD } from './components/Collection/Edition/TVD/Spirit/SpiritSRScenario';
import { ascendSRCharacterTVD } from './components/Collection/Edition/TVD/Ascend/AscendSRCharacter';
import { ascendSRAssistantTVD } from './components/Collection/Edition/TVD/Ascend/AscendSRAssistant';
import { ascendSRNarratorTVD } from './components/Collection/Edition/TVD/Ascend/AscendSRNarrator';
import { ascendSRScenarioTVD } from './components/Collection/Edition/TVD/Ascend/AscendSRScenario';
import { eternalSRCharacterTVD } from './components/Collection/Edition/TVD/Eternal/EternalSRCharacter';
import { eternalSRAssistantTVD } from './components/Collection/Edition/TVD/Eternal/EternalSRAssistant';
import { eternalSRNarratorTVD } from './components/Collection/Edition/TVD/Eternal/EternalSRNarrator';
import { eternalSRScenarioTVD } from './components/Collection/Edition/TVD/Eternal/EternalSRScenario';
import { CollectionDrawer } from './components/Collection/CollectionDrawer';
import { SoulBoardPage } from './components/SoulBoardPage';
import { VoiceCallOverlay } from './components/VoiceCallOverlay';
import { SelfiePage } from './components/SelfiePage';
import { InboxModal } from './components/InboxModal';
import { VaultOfEssence } from './components/VaultOfEssence';
import { AudioPermissionModal } from './components/ui/AudioPermissionModal';
import { RegenerateModal } from './components/ui/RegenerateModal';
import { DeletionWarningBar } from './components/ui/DeletionWarningBar';
import { DiscoverPage } from './components/SoulsTemplates/DiscoverPage';
import { ExplorePage } from './components/ExplorePage';
import { HomeMenuWrapper } from './components/HomeMenuWrapper';
import { GeneralSettingsWrapper } from './components/GeneralSettingsWrapper';
import { MiddleBar } from './components/MiddleBar';
import { Dock } from './components/Dock';
import { FloatingPanel } from './components/ui/FloatingPanel';
import { OnboardingSurvey } from './components/onboarding/OnboardingSurvey';
import { useIsMobile } from './hooks/useIsMobile';
import { ResponsiveFunctionWindow } from './components/ResponsiveFunctionWindow';
import { ManageDock } from './components/ManageDock';
import { ManageDocks } from './components/ManageDocks';
import { useDragAndDrop } from './components/Engine/useDragAndDrop';
import { StackedCollectionCardPreview } from './components/Collection/CollectionPage';
import { ForgeOfEssence } from './components/ForgeOfEssence';
import { ReturnToCollectionModal } from './components/ui/ReturnToCollectionModal';
import { NSFW_BLACKLIST } from './services/nsfwVocabulary';

type Location = 'landing' | 'login-options' | 'login' | 'check-mail' | 'welcome' | 'discover-onboarding' | 'soul-hello' | 'app' | 'terms' | 'create-soul-name' | 'create-soul-look' | 'create-soul-what' | 'create-soul-hello' | 'user-guide';
type CreationModalView = 'create-name' | 'create-look' | 'create-what' | 'create-hello';

const CHAT_PAGE_SIZE = 10;
const TOTAL_MESSAGE_TOKEN_LIMIT = 1100;
const APPROX_CHARS_PER_TOKEN = 4; // A common approximation
const INITIAL_VISIBLE_MESSAGES = 15;
const MESSAGES_TO_REVEAL = 10;

// --- Reserved Usernames ---
const RESERVED_USERNAMES = ['OA', 'GRZEGORZ KRYNIECKI'];
const WHITELISTED_EMAILS = ['gkryniecki@gmail.com', 'soulverseai@gmail.com'];

const isUsernameReserved = (name: string, userEmail: string): boolean => {
    const normalizedName = name.toUpperCase().trim();
    if (!RESERVED_USERNAMES.includes(normalizedName)) {
        return false; // Not a reserved name
    }
    const normalizedEmail = userEmail.toLowerCase().trim();
    if (WHITELISTED_EMAILS.includes(normalizedEmail)) {
        return false; // User is whitelisted
    }
    return true; // Name is reserved and user is not whitelisted
};

const getUpgradeLevelFromQuality = (quality?: TemplateQuality): number => {
    switch (quality) {
        case 'Spirit': return 1;
        case 'Ascend': return 2;
        case 'Eternal': return 3;
        default: return 0; // Wisp and default
    }
};

const getQualityFromUpgrade = (upgrade?: number): TemplateQuality => {
    switch (upgrade) {
        case 1: return 'Spirit';
        case 2: return 'Ascend';
        case 3: return 'Eternal';
        default: return 'Wisp';
    }
};

const MenuPrompt: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onOpenOptions: () => void;
  onOpenSupport: () => void;
  onLogout: () => void;
}> = ({ isOpen, onClose, onOpenOptions, onOpenSupport, onLogout }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Menu" maxWidth="max-w-sm">
      <div className="p-6 space-y-4">
        <button
          onClick={onOpenOptions}
          className="w-full py-4 text-lg font-semibold text-white bg-neutral-700/60 hover:bg-neutral-700 rounded-lg transition-colors"
        >
          Options
        </button>
        <button
          onClick={onOpenSupport}
          className="w-full py-4 text-lg font-semibold text-white bg-neutral-700/60 hover:bg-neutral-700 rounded-lg transition-colors"
        >
          Support
        </button>
        <button
          onClick={onLogout}
          className="w-full py-4 text-lg font-semibold text-white bg-rose-800/60 hover:bg-rose-800 rounded-lg transition-colors"
        >
          Log Out
        </button>
      </div>
    </Modal>
  );
};


// --- Custom Hook for Gemini TTS Audio Playback ---
const useAudioPlayback = (onPlaybackEnd: () => void) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentUrlRef = useRef<string | null>(null);
    const generationCancelledRef = useRef(false);

    const speak = useCallback(async (text: string, voiceName: string | null) => {
        generationCancelledRef.current = false; // Reset cancellation flag for this new request

        if (!text || !voiceName) {
            onPlaybackEnd();
            return;
        }

        setIsSpeaking(true);
        
        const fullCleanup = () => {
            setIsSpeaking(false);
            onPlaybackEnd();
            if (currentUrlRef.current) {
                URL.revokeObjectURL(currentUrlRef.current);
                currentUrlRef.current = null;
            }
        };
        
        try {
            const audioBlob = await generateTextToSpeechAudio(text, voiceName);

            if (generationCancelledRef.current) {
                console.log("TTS playback cancelled during audio generation.");
                return; // Exit. State has already been cleaned up by cancelSpeech.
            }

            if (audioBlob) {
                const url = URL.createObjectURL(audioBlob);
                currentUrlRef.current = url;
                
                const audio = new Audio(url);
                audioRef.current = audio;
                
                audio.onended = fullCleanup;
                 audio.onerror = (e) => {
                    console.error("Audio playback error:", e);
                    fullCleanup();
                };
                
                audio.play().catch(e => {
                     console.error("Audio play() failed:", e);
                     fullCleanup();
                });

            } else {
                throw new Error("Failed to generate audio data.");
            }
        } catch (error) {
            console.error("Gemini TTS error:", error);
            fullCleanup();
        }
    }, [onPlaybackEnd]);

    const cancelSpeech = useCallback(() => {
        generationCancelledRef.current = true;

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = ''; 
            audioRef.current = null;
        }
        if (currentUrlRef.current) {
            URL.revokeObjectURL(currentUrlRef.current);
            currentUrlRef.current = null;
        }
        setIsSpeaking(false);
        onPlaybackEnd();
    }, [onPlaybackEnd]);

    return { isSpeaking, speak, cancelSpeech };
};

export interface SendMessageOptions {
    useInternet?: boolean;
    linkUrl?: string;
    image?: { mimeType: string; data: string };
    imageUrlForUi?: string;
}

export const defaultSoul = (accountSettings: AccountSettings): Omit<Soul, 'id'> => {
    const { model, enableThinking } = getDefaultModelForTier(accountSettings.subscriptionTier);

    return {
        name: '',
        description: '',
        model,
        enableThinking,
        gender: 'Female',
        avatar: null,
        backstory: '',
        responseDirective: '',
        keyMemories: '',
        characterSheet: '',
        greeting: '',
        exampleMessage: '',
        voiceURI: 'Zephyr',
        mbti: null,
        enneagram: null,
        dynamism: 0.95,
        thinkingBudget: 128,
        antiRepeatStrength: 0.00,
        memoryConsolidation: true,
        memoryRecall: true,
        maxTokens: 2048,
        roleplayStyle: 'Default',
        avatarStyle: 'Photoreal',
        physicalAppearanceDescription: '',
        faceDetailEnhance: 0,
        faceDetailPrompt: '',
        enableNsfwSelfies: false,
        selfies: [],
        followersCount: 0,
        followingCount: 0,
        username: '',
        bio: '',
        profileBannerUrl: null,
        additionalContext: '',
        posts: [],
        role: null,
        tiedPersonaId: null,
    };
};

const SoulCardPreview: React.FC<{ avatar: string | null, name: string }> = ({ avatar, name }) => (
    <div className="w-14 h-16 rounded-md border-2 border-purple-500 bg-black flex items-center justify-center relative overflow-hidden">
        {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
            <UserCircleIcon className="w-1/2 h-1/2 text-neutral-600" />
        )}
        <div className="absolute inset-x-0 bottom-0 p-1 bg-gradient-to-t from-black/80 to-transparent">
            <h4 className="font-semibold text-white text-xs truncate text-center">{name}</h4>
        </div>
    </div>
);


type DragLayerProps = {
  draggedItem: Soul | { template: SoulTemplate, quality: TemplateQuality } | null;
  draggedItemType: string | null;
  draggedPosition: { x: number; y: number } | null;
};

const DragLayer: React.FC<DragLayerProps> = ({ draggedItem, draggedItemType, draggedPosition }) => {
    if (!draggedItem || !draggedPosition) {
        return null;
    }

    const renderPreview = () => {
        switch (draggedItemType) {
            case 'dock-soul': {
                const soul = draggedItem as Soul;
                return <SoulCardPreview avatar={soul.avatar} name={soul.name} />;
            }
            case 'collection-template': {
                const { template, quality } = draggedItem as { template: SoulTemplate, quality: TemplateQuality };
                return <StackedCollectionCardPreview template={template} quality={quality} />;
            }
            default:
                return null;
        }
    };
    
    return (
        <div 
            className="fixed top-0 left-0 pointer-events-none z-[200]"
            style={{
                transform: `translate(${draggedPosition.x}px, ${draggedPosition.y}px)`,
            }}
        >
            {renderPreview()}
        </div>
    );
};


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

const getDefaultAccountSettings = (): AccountSettings => ({
    userName: "", userGender: null, userBackstory: "", 
    userAvatar: null, userAvatarStyle: 'Photoreal', userAvatarDescription: '', userAvatarFaceDetailEnhance: 0.3, userAvatarFaceDetailPrompt: '',
    personas: [], souls: [], activeSoulId: null,
    dockedSoulIds: Array(20).fill(null),
    quickSwitchSoulIds: [],
    favoriteMessages: [],
    textStreaming: true, autoPlayAudio: false, directWritingStyle: true,
    enableNsfwMode: true, multiParagraphResponses: true,
    lightMode: false,
    adminMode: false, betaTesterMode: false,
    // FIX: Changed 'Wisp' to 'Free' to match SubscriptionTier type.
    subscriptionTier: 'Free',
    dailyRewardState: { streak: 0, lastClaimTimestamp: null, lastMessageCountReset: null, dailyBoosterDiscountUsed: false },
    dailyMessageCount: 0,
    referralEssence: 0,
    mailMessages: [],
    soulShards: 0,
    boosterPacks: [],
    unlockedTemplateNames: [],
    ownedTemplates: [],
    voiceCallUnifiedHistory: true,
    voiceCallPushToTalk: true,
    voiceCallSpontaneousResponse: false,
    voiceCallPreferNarration: false,
    followedSoulsIds: [],
    likedPostIds: [],
    themeOverrides: {},
    activeTheme: 'Default',
    customBackgroundUrl: null,
    hotkeys: defaultHotkeys,
    displayHotkeys: false,
    hasCompletedOnboardingSurvey: false,
});

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const isMobile = useIsMobile();
  
  const [location, setLocation] = useState<Location>('landing');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTweakModalOpen, setIsTweakModalOpen] = useState(false);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [isChatBreakModalOpen, setIsChatBreakModalOpen] = useState(false);
  const [isVoiceCallSettingsOpen, setIsVoiceCallSettingsOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: React.ReactNode } | null>(null);
  const [messageToTweak, setMessageToTweak] = useState<ChatMessage | null>(null);
  const [messageToRegenerate, setMessageToRegenerate] = useState<ChatMessage | null>(null);
  const [showAudioPermissionModal, setShowAudioPermissionModal] = useState(false);
  
  const [isUserTweakModalOpen, setIsUserTweakModalOpen] = useState(false);
  const [userMessageToTweak, setUserMessageToTweak] = useState<ChatMessage | null>(null);
  const [isUnstuckModalOpen, setIsUnstuckModalOpen] = useState(false);
  // FIX: Add state for the unlock soul modal
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [soulToUnlock, setSoulToUnlock] = useState<Soul | null>(null);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isDockEditing, setIsDockEditing] = useState(false);
  const [isUnlockTemplateModalOpen, setIsUnlockTemplateModalOpen] = useState(false);
  const [templateToUnlock, setTemplateToUnlock] = useState<{ instanceId: string; name: string } | null>(null);
  const [soulToReturn, setSoulToReturn] = useState<Soul | null>(null);

  const dnd = useDragAndDrop();

  // Effect to prevent dropping on invalid areas
  useEffect(() => {
    const preventDefaultDrop = (e: DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'none';
        }
    };

    if (dnd.isDragging) {
        document.addEventListener('dragover', preventDefaultDrop);
        document.addEventListener('drop', preventDefaultDrop);
    }

    return () => {
        document.removeEventListener('dragover', preventDefaultDrop);
        document.removeEventListener('drop', preventDefaultDrop);
    };
  }, [dnd.isDragging]);


  // States for soul management modals
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [soulToView, setSoulToView] = useState<Soul | null>(null);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [soulToDelete, setSoulToDelete] = useState<Soul | null>(null);
  const [isAdminDeleteModalOpen, setIsAdminDeleteModalOpen] = useState(false);
  const [isManageDockOpen, setIsManageDockOpen] = useState(false);
  const [isManageDocksOpen, setIsManageDocksOpen] = useState(false);


  // States for onboarding flow
  const [onboardingEmail, setOnboardingEmail] = useState<string>('');
  const [welcomeError, setWelcomeError] = useState<string>('');
  const [onboardingTemplate, setOnboardingTemplate] = useState<SoulTemplate | null>(null);
  const [newSoulData, setNewSoulData] = useState<Partial<Soul>>({});
  const [createSoulView, setCreateSoulView] = useState<CreationModalView | null>(null);
  const [isMultiAccountWarningOpen, setIsMultiAccountWarningOpen] = useState(false);


  // States for new top-bar modals
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [isStyleSelectorOpen, setIsStyleSelectorOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isSubscriptionPageOpen, setIsSubscriptionPageOpen] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  
  const [isAvatarVisible, setIsAvatarVisible] = useState(false);
  
  // States for pagination and message visibility
  const [messagePage, setMessagePage] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
  const [displayedMessagesCount, setDisplayedMessagesCount] = useState(INITIAL_VISIBLE_MESSAGES);

  // States for favorite message navigation
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  
  // Ref to prevent initial settings save on load
  const isInitialLoadRef = useRef(true);

  // States for new memory consolidation system
  const [consolidatedMemories, setConsolidatedMemories] = useState<LongTermMemory[]>([]);
  const [memoriesForModal, setMemoriesForModal] = useState<LongTermMemory[]>([]);
  const lastConsolidationMsgIndexRef = useRef<Record<string, number>>({});

  // New state for temporary regeneration suggestions
  const [regenerationSuggestions, setRegenerationSuggestions] = useState<Record<string, string[]>>({});
  
  // State for message versioning
  const [messageVersions, setMessageVersions] = useState<Record<string, { versions: string[], currentIndex: number }>>({});
  
  // Ref to track the previous soul ID to prevent effect re-runs in StrictMode
  const prevSoulIdRef = useRef<string | null>(null);
  
  // New state for admin meta-conversation mode
  const [isMetaMode, setIsMetaMode] = useState(false);

  // New state for caching backstory to implement user request
  const [activeChatBackstory, setActiveChatBackstory] = useState<string>('');
  const [activeChatAdditionalContext, setActiveChatAdditionalContext] = useState<string>('');
  
  // --- REFACTORED: Centralized Modal/Drawer States ---
  const [isCollectionDrawerOpen, setIsCollectionDrawerOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  const [soulBoardInitialState, setSoulBoardInitialState] = useState<{ view: 'feed', soulId: null } | { view: 'profile', soulId: string } | null>(null);
  
  // --- State for Collection -> Auction flow ---
  const [cardForAuction, setCardForAuction] = useState<GroupedTemplate | null>(null);
  const [initialVaultTab, setInitialVaultTab] = useState<VaultTab>('store');
  const [initialMarketplaceSearch, setInitialMarketplaceSearch] = useState<string>('');

  // --- State for Theme Preview ---
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);

  const handleOpenModal = useCallback((modalName: string | null) => {
    if (activeModal === 'vault' && modalName !== 'vault') {
        setInitialMarketplaceSearch(''); 
    }
    setActiveModal(prev => prev === modalName ? null : modalName);
  }, [activeModal]);
  
  const allPredefinedSouls = useMemo(() => [
    ...narratorSouls,
    ...characterSouls,
    ...assistantSouls,
    ...scenarioSouls,
    ...wispSRCharacterMarvel,
    ...wispSRNarratorMarvel,
    ...spiritSRCharacterMarvel,
    ...ascendSRCharacterMarvel,
    ...ascendSRScenarioMarvel,
    ...eternalSRCharacterMarvel,
    ...wispSRCharacterTVD,
    ...wispSRAssistantTVD,
    ...wispSRNarratorTVD,
    ...wispSRScenarioTVD,
    ...spiritSRCharacterTVD,
    ...spiritSRAssistantTVD,
    ...spiritSRNarratorTVD,
    ...spiritSRScenarioTVD,
    ...ascendSRCharacterTVD,
    ...ascendSRAssistantTVD,
    ...ascendSRNarratorTVD,
    ...ascendSRScenarioTVD,
    ...eternalSRCharacterTVD,
    ...eternalSRAssistantTVD,
    ...eternalSRNarratorTVD,
    ...eternalSRScenarioTVD,
  ], []);

  const discoverableSouls = useMemo(() => 
    allPredefinedSouls.filter(soul => soul.edition !== 'Marvel'), 
    [allPredefinedSouls]
  );

  const [accountSettings, setAccountSettings] = useState<AccountSettings>(getDefaultAccountSettings());
  const activeSoul = useMemo(() => {
    return accountSettings.souls.find(a => a.id === accountSettings.activeSoulId) || null;
  }, [accountSettings.souls, accountSettings.activeSoulId]);
  
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const handleSpeechEnd = useCallback(() => {
    setSpeakingMessageId(null);
  }, []);

  const { isSpeaking, speak, cancelSpeech } = useAudioPlayback(handleSpeechEnd);

  const handlePlayPauseSpeech = useCallback((messageId: string, text: string) => {
    if (speakingMessageId === messageId) {
        cancelSpeech();
    } else {
        if (isSpeaking) {
            cancelSpeech();
        }
        setSpeakingMessageId(messageId);
        speak(text, activeSoul?.voiceURI);
    }
  }, [isSpeaking, speakingMessageId, cancelSpeech, speak, activeSoul?.voiceURI]);

  const firstBotMessageExists = useMemo(() => messages.some(m => m.sender === 'ai' && m.text !== '--- Chat Break ---'), [messages]);
  
  // Effect for dynamic layout control to fix scrolling issues
  useEffect(() => {
    const scrollableLocations: Location[] = ['landing', 'soul-hello', 'discover-onboarding'];
    if (scrollableLocations.includes(location) || location.startsWith('create-soul')) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'auto'; // Reset on component unmount
    };
  }, [location]);

  // Keyboard shortcuts handler for main UI navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (isMobile || location !== 'app') return;

        const activeElement = document.activeElement;
        if (activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            (activeElement as HTMLElement).isContentEditable
        )) {
            return;
        }

        const hotkeys = accountSettings.hotkeys || [];
        const pressedKey = event.key.toLowerCase();
        const hotkeyAction = hotkeys.find(h => h.key.toLowerCase() === pressedKey);

        // MODIFIER KEY FIX: Check that Ctrl, Alt, Meta (Cmd/Win), and Shift are NOT pressed.
        // This prevents single-letter hotkeys from interfering with system shortcuts like Ctrl+C (copy).
        if (hotkeyAction && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
            // Prevent default browser action if a hotkey is matched (e.g., 's' for save page)
            event.preventDefault();
            switch (hotkeyAction.command) {
                case 'openCollection': setIsCollectionDrawerOpen(prev => !prev); break;
                case 'openSeasonPass': handleOpenModal('seasonPass'); break;
                case 'openSoulNotes': handleOpenModal('soulNotes'); break;
                case 'openVault': { setInitialVaultTab('store'); handleOpenModal('vault'); break; }
                case 'openSoulBoard': 
                  setSoulBoardInitialState({ view: 'feed', soulId: null });
                  handleOpenModal('soulBoard'); 
                  break;
                case 'openHomeMenu': handleOpenModal('homeMenu'); break; // Codex
                case 'openMenu': handleOpenModal('menu'); break; // Options
                case 'openSelfie': handleOpenModal('selfie'); break;
                case 'openInbox': handleOpenModal('inbox'); break;
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [location, accountSettings.hotkeys, isMobile, handleOpenModal]);

  // Effect to apply user-selected color themes
  useEffect(() => {
    const root = document.documentElement;

    const themes: { [key: string]: { [cssVar: string]: string } } = {
        'Default': { '--bg-main': 'linear-gradient(to bottom, rgba(37, 197, 210, 0.15), rgba(164, 85, 247, 0.15)), #101010', '--bg-menu-gradient': 'linear-gradient(to bottom, rgba(37, 197, 210, 0.15), rgba(164, 85, 247, 0.15))' },
        'Sunset': { '--bg-main': 'linear-gradient(135deg, #ff7e5f, #feb47b)', '--bg-menu-gradient': 'linear-gradient(to bottom, rgba(255, 126, 95, 0.2), rgba(254, 180, 123, 0.2))' },
        'Chromatic Glow': { '--bg-main': 'linear-gradient(135deg, #00f260, #0575e6)', '--bg-menu-gradient': 'linear-gradient(to bottom, rgba(0, 242, 96, 0.15), rgba(5, 117, 230, 0.15))' },
        'Aurora': { '--bg-main': 'linear-gradient(135deg, #43cea2, #185a9d)', '--bg-menu-gradient': 'linear-gradient(to bottom, rgba(67, 206, 162, 0.15), rgba(24, 90, 157, 0.2))' },
        'Royal': { '--bg-main': 'linear-gradient(135deg, #141E30, #243B55)', '--bg-menu-gradient': 'linear-gradient(to bottom, rgba(20, 30, 48, 0.2), rgba(36, 59, 85, 0.2))' },
        'Lush': { '--bg-main': 'linear-gradient(135deg, #56ab2f, #a8e063)', '--bg-menu-gradient': 'linear-gradient(to bottom, rgba(86, 171, 47, 0.2), rgba(168, 224, 99, 0.2))' },
        'Kashmir': { '--bg-main': 'linear-gradient(135deg, #614385, #516395)', '--bg-menu-gradient': 'linear-gradient(to bottom, rgba(97, 67, 133, 0.2), rgba(81, 99, 149, 0.2))' },
        'Tranquil': { '--bg-main': 'linear-gradient(135deg, #eecda3, #ef629f)', '--bg-menu-gradient': 'linear-gradient(to bottom, rgba(238, 205, 163, 0.2), rgba(239, 98, 159, 0.2))' },
        'Celestial': { '--bg-main': 'linear-gradient(135deg, #c33764, #1d2671)', '--bg-menu-gradient': 'linear-gradient(to bottom, rgba(195, 55, 100, 0.2), rgba(29, 38, 113, 0.2))' },
        'Mango': { '--bg-main': 'linear-gradient(135deg, #f2994a, #f2c94c)', '--bg-menu-gradient': 'linear-gradient(to bottom, rgba(242, 153, 74, 0.2), rgba(242, 201, 76, 0.2))' },
        'Seafoam': { '--bg-main': 'linear-gradient(135deg, #76b852, #8dc26f)', '--bg-menu-gradient': 'linear-gradient(to bottom, rgba(118, 184, 82, 0.2), rgba(141, 194, 111, 0.2))' },
        'Crimson': { '--bg-main': 'linear-gradient(135deg, #642b73, #c6426e)', '--bg-menu-gradient': 'linear-gradient(to bottom, rgba(100, 43, 115, 0.2), rgba(198, 66, 110, 0.2))' },
        'Oceanic': { '--bg-main': 'linear-gradient(135deg, #2193b0, #6dd5ed)', '--bg-menu-gradient': 'linear-gradient(to bottom, rgba(33, 147, 176, 0.2), rgba(109, 213, 237, 0.2))' },
        'Volcano': { '--bg-main': 'linear-gradient(135deg, #f12711, #f5af19)', '--bg-menu-gradient': 'linear-gradient(to bottom, rgba(241, 39, 17, 0.2), rgba(245, 175, 25, 0.2))' },
        'Midnight': { '--bg-main': 'linear-gradient(135deg, #232526, #414345)', '--bg-menu-gradient': 'linear-gradient(to bottom, rgba(35, 37, 38, 0.2), rgba(65, 67, 69, 0.2))' },
        'Forest': { '--bg-main': 'linear-gradient(135deg, #134e5e, #71b280)', '--bg-menu-gradient': 'linear-gradient(to bottom, rgba(19, 78, 94, 0.2), rgba(113, 178, 128, 0.2))' },
        'Grapevine': { '--bg-main': 'linear-gradient(135deg, #ad5389, #3c1053)', '--bg-menu-gradient': 'linear-gradient(to bottom, rgba(173, 83, 137, 0.2), rgba(60, 16, 83, 0.2))' },
        'Cosmic': { '--bg-main': 'linear-gradient(135deg, #ff00cc, #333399)', '--bg-menu-gradient': 'linear-gradient(to bottom, rgba(255, 0, 204, 0.15), rgba(51, 51, 153, 0.15))' },
        'Emerald Water': { '--bg-main': 'linear-gradient(135deg, #348f50, #56b4d3)', '--bg-menu-gradient': 'linear-gradient(to bottom, rgba(52, 143, 80, 0.2), rgba(86, 180, 211, 0.2))' },
        'Azure': { '--bg-main': 'linear-gradient(135deg, #0072ff, #00c6ff)', '--bg-menu-gradient': 'linear-gradient(to bottom, rgba(0, 114, 255, 0.15), rgba(0, 198, 255, 0.15))' },
        'Misty': { '--bg-main': 'linear-gradient(135deg, #606c88, #3f4c6b)', '--bg-menu-gradient': 'linear-gradient(to bottom, rgba(96, 108, 136, 0.2), rgba(63, 76, 107, 0.2))' },
    };
    
    const currentThemeName = previewTheme || accountSettings.activeTheme || 'Default';
    let activeThemeConfig = themes[currentThemeName] || themes['Default'];

    if (accountSettings.customBackgroundUrl) {
        activeThemeConfig = themes['Default'];
    }

    const finalTheme = {
        ...activeThemeConfig,
        '--bg-soul-message': '#292524',
        '--bg-user-message': '#2d3045',
    };

    if (accountSettings.customBackgroundUrl) {
        finalTheme['--bg-main'] = `url('${accountSettings.customBackgroundUrl}') center center / cover no-repeat`;
    }

    // FIX: The value from `finalTheme` might be of an unknown type to TypeScript here.
    // Explicitly casting to String ensures compatibility with setProperty.
    Object.entries(finalTheme).forEach(([key, value]) => {
        root.style.setProperty(key, String(value));
    });

  }, [previewTheme, accountSettings.activeTheme, accountSettings.customBackgroundUrl]);

  // Effect to apply admin theme overrides ON TOP of user themes
  useEffect(() => {
    const root = document.documentElement;
    if (accountSettings.themeOverrides) {
      Object.entries(accountSettings.themeOverrides).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(key, value as string);
        }
      });
    }
  }, [accountSettings.themeOverrides]);

  const updateAndPersistSettings = useCallback((updater: (prev: AccountSettings) => AccountSettings) => {
      setAccountSettings(prevSettings => {
          const newSettings = updater(prevSettings);
          if (currentUser && !isInitialLoadRef.current) {
              updateAccountSettings(currentUser.id, newSettings);
              if (newSettings.activeSoulId) {
                  sessionStorage.setItem('lastActiveSoulId', newSettings.activeSoulId);
              }
          }
          return newSettings;
      });
  }, [currentUser]);

  // Keyboard shortcuts for dock
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (isMobile || location !== 'app') return;

        const activeElement = document.activeElement;
        if (activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            (activeElement as HTMLElement).isContentEditable
        )) {
            return;
        }

        const dockedSoulIds = accountSettings.dockedSoulIds || [];
        let targetIndex = -1;
        const key = event.key;

        if (event.altKey) {
            if (key >= '1' && key <= '9') {
                targetIndex = 10 + (parseInt(key) - 1);
            } else if (key === '0') {
                targetIndex = 19;
            }
        } else if (!event.ctrlKey && !event.metaKey) {
            if (key >= '1' && key <= '9') {
                targetIndex = parseInt(key) - 1;
            } else if (key === '0') {
                targetIndex = 9;
            }
        }

        if (targetIndex !== -1) {
            const soulId = dockedSoulIds[targetIndex];
            if (soulId && accountSettings.activeSoulId !== soulId) {
                updateAndPersistSettings(prev => ({ ...prev, activeSoulId: soulId }));
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountSettings.dockedSoulIds, accountSettings.activeSoulId, updateAndPersistSettings, location, isMobile]);

  const handleAllowAudio = () => {
    localStorage.setItem('soulverse_audio_permission_set', 'true');
    setShowAudioPermissionModal(false);
  };

  const handleDenyAudio = () => {
    updateAndPersistSettings(prev => ({ ...prev, autoPlayAudio: false }));
    localStorage.setItem('soulverse_audio_permission_set', 'true');
    setShowAudioPermissionModal(false);
  };


  // Effect to handle routing and data loading on auth state change
  useEffect(() => {
    const loadData = async () => {
        if (!currentUser) {
            setAccountSettings(getDefaultAccountSettings());
            setMessages([]);
            isInitialLoadRef.current = true; // Reset for next login
            // Close any open modals/drawers on logout
            setIsCollectionDrawerOpen(false);
            setActiveModal(null);
            const nonAuthLocations = ['landing', 'login-options', 'login', 'check-mail', 'welcome', 'discover-onboarding', 'soul-hello', 'terms', 'user-guide'];
            if (!nonAuthLocations.some(l => location.startsWith(l))) {
                setLocation('landing');
            }
            return;
        }

        let settings = await fetchAccountSettings(currentUser.id, currentUser.email || '');
        let settingsChanged = false;
        
        if (settings) {
            const settingsObj = settings as Record<string, unknown>;
            // --- Migration for old bondTokens ---
            if (settingsObj.bondTokens !== undefined) {
                delete settingsObj.bondTokens;
                settingsChanged = true;
            }

            // --- Migration for new settings fields ---
            if (settings.dailyMessageCount === undefined) {
                settings.dailyMessageCount = 0;
                settingsChanged = true;
            }
            if (!settings.dailyRewardState) {
                settings.dailyRewardState = { streak: 0, lastClaimTimestamp: null };
            }
            if (settings.dailyRewardState.lastMessageCountReset === undefined) {
                settings.dailyRewardState.lastMessageCountReset = null;
                settingsChanged = true;
            }
            if (settings.dailyRewardState.dailyBoosterDiscountUsed === undefined) {
                settings.dailyRewardState.dailyBoosterDiscountUsed = false;
                settingsChanged = true;
            }
            if (settings.dailyRewardState.seasonPoints === undefined) {
                settings.dailyRewardState.seasonPoints = 0;
                settingsChanged = true;
            }
            if (settings.dailyRewardState.claimedSeasonRewards === undefined) {
                settings.dailyRewardState.claimedSeasonRewards = [];
                settingsChanged = true;
            }

            if (settingsChanged) {
                await updateAccountSettings(currentUser.id, settings);
            }

            // --- REVISED DELETION LOGIC ---
            const now = Date.now();
            const soulsToDelete = settings.souls.filter(s => s.deletionTimestamp && s.deletionTimestamp < now);

            if (soulsToDelete.length > 0) {
                const idsToDelete = soulsToDelete.map(s => s.id);
                console.log("Optimistically removing expired souls from UI:", idsToDelete);

                // Immediately create a new settings object with souls removed for UI update.
                const remainingSouls = settings.souls.filter(s => !idsToDelete.includes(s.id));
                const remainingDockedIds = (settings.dockedSoulIds || []).map(id => idsToDelete.includes(id!) ? null : id);
                
                let newActiveSoulId = settings.activeSoulId;

                // If the active soul was deleted, reset it
                if (settings.activeSoulId && idsToDelete.includes(settings.activeSoulId)) {
                    const firstDockedId = remainingDockedIds.find(id => id !== null);
                    newActiveSoulId = firstDockedId || (remainingSouls.length > 0 ? remainingSouls[0].id : null);
                }

                const updatedSettings: AccountSettings = {
                    ...settings,
                    souls: remainingSouls,
                    dockedSoulIds: remainingDockedIds,
                    activeSoulId: newActiveSoulId,
                };
                
                // Use the updated settings for the rest of this function's scope
                settings = updatedSettings;

                // Asynchronously delete from DB and update profile. The UI won't wait for this.
                (async () => {
                    const success = await deleteSouls(idsToDelete, currentUser.id);
                    if (!success) {
                        console.error("Failed to remove expired Souls from the database. UI was updated optimistically.");
                    }
                    // Also persist other changes (like the new activeSoulId) back to the database.
                    // This uses the 'updatedSettings' which correctly reflects the state after deletion.
                    await updateAccountSettings(currentUser.id, updatedSettings);
                })();
            }
            // --- END REVISED DELETION LOGIC ---
            
            // Restore last active soul on reload
            const lastActiveSoulId = sessionStorage.getItem('lastActiveSoulId');
            if (lastActiveSoulId && settings.souls.find(s => s.id === lastActiveSoulId)) {
                settings.activeSoulId = lastActiveSoulId;
            }

            const isNewUser = settings.souls.length === 0;
            const nonAuthLocations = ['login-options', 'check-mail', 'login', 'landing'];
            const isAdminEmail = currentUser.email && WHITELISTED_EMAILS.includes(currentUser.email);

            if (isNewUser && isAdminEmail) {
                // Admin user: auto-populate, create a default soul, and skip welcome flow.
                settings.userName = "OA";
                settings.userGender = "Male" as Gender;
        
                const elite1Template = allPredefinedSouls.find(s => s.name === "Elite");
                if (elite1Template) {
                    // Inlined logic from createAndAddNewSoul to use the freshest `settings`
                    const soulName = elite1Template.name;
                    const userName = settings.userName; // Use the just-set name
        
                    const { model, enableThinking } = getDefaultModelForTier(settings.subscriptionTier);
                    
                    const newSoul: Soul = {
                      id: crypto.randomUUID(),
                      name: soulName,
                      description: elite1Template.title.replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
                      model,
                      enableThinking,
                      gender: elite1Template.gender,
                      avatar: elite1Template.smallAvatarUrl,
                      backstory: elite1Template.backstory.replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
                      responseDirective: elite1Template.responseDirective.replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
                      keyMemories: elite1Template.keyMemories.replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
                      characterSheet: elite1Template.characterSheet || '',
                      greeting: elite1Template.greeting.replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
                      exampleMessage: '',
                      voiceURI: 'Zephyr',
                      mbti: elite1Template.mbti || null,
                      enneagram: elite1Template.enneagram || null,
                      dynamism: elite1Template.dynamism,
                      thinkingBudget: 128,
                      antiRepeatStrength: 0.00,
                      memoryConsolidation: true,
                      memoryRecall: true,
                      maxTokens: 2048,
                      roleplayStyle: 'Default',
                      avatarStyle: 'Photoreal',
                      physicalAppearanceDescription: elite1Template.longDescription,
                      faceDetailEnhance: 0,
                      faceDetailPrompt: '',
                      enableNsfwSelfies: false,
                      selfies: [],
                      followersCount: 0,
                      followingCount: 0,
                      templateName: elite1Template.name,
                      username: soulName.toLowerCase().replace(/\s+/g, '_'),
                      bio: elite1Template.longDescription.replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
                      profileBannerUrl: elite1Template.profileBannerUrl || null,
                      posts: [],
                      role: null,
                      tiedPersonaId: null,
                      additionalContext: '',
                      soulId: elite1Template.soulId,
                      shareCode: elite1Template.shareCode,
                      edition: elite1Template.edition,
                      upgrade: elite1Template.upgrade || 0,
                      tradable: elite1Template.tradable,
                    };
        
                    const createdSoul = await createSoul(newSoul, currentUser.id);
                    if (createdSoul) {
                        // Directly modify the settings object that will be set to state later.
                        settings.souls.push(createdSoul);
                        settings.activeSoulId = createdSoul.id;
                        if (settings.dockedSoulIds) {
                            settings.dockedSoulIds[0] = createdSoul.id;
                        }
                    }
                }
                
                // This will save the name/gender change AND the new soul.
                await updateAccountSettings(currentUser.id, settings); 
                
                // Skip directly to the app
                setLocation('app');
            } else {
                 // Regular user flow
                if (isNewUser) {
                    if (nonAuthLocations.includes(location)) {
                        setLocation('welcome');
                    }
                } else if (settings.hasCompletedOnboardingSurvey === false) {
                    setLocation('app');
                    setIsSurveyModalOpen(true);
                } else if (!location.startsWith('create-soul') && !['terms', 'soul-hello'].includes(location)) {
                    setLocation('app');
                }
            }

            // Update state with the final settings object (either modified for admin or original for others)
            setAccountSettings(settings);

            // PERSISTENCE FIX: Unlock saving mechanism only after a successful load.
            setTimeout(() => { isInitialLoadRef.current = false; }, 500);
        } else {
            console.error("Failed to load account settings. Data sync paused to prevent overwrite.");
            setToast({ title: "Loading Error", message: "Could not load your profile. Please refresh. Your data has not been changed." });
            // DO NOT unlock saving mechanism if load fails, to prevent overwriting with default state.
        }
    };

    loadData();
  }, [currentUser, allPredefinedSouls, location]);


  
  // Derive active Soul from settings
  // (Removed useEffect that called setActiveSoul)

  // Handler to apply a persona's settings
  const applyPersona = useCallback((persona: Persona) => {
      updateAndPersistSettings(prev => ({
          ...prev,
          userName: persona.userName,
          userGender: persona.userGender,
          userBackstory: persona.userBackstory,
          userAvatar: persona.userAvatar,
          userAvatarStyle: persona.userAvatarStyle,
          userAvatarDescription: persona.userAvatarDescription,
          userAvatarFaceDetailEnhance: persona.userAvatarFaceDetailEnhance,
          userAvatarFaceDetailPrompt: persona.userAvatarFaceDetailPrompt,
      }));
  }, [updateAndPersistSettings]);

  // Effect to automatically apply a tied persona when activeSoul changes
  useEffect(() => {
      if (!activeSoul || !activeSoul.tiedPersonaId) {
          return;
      }

      const tiedPersona = accountSettings.personas.find(p => p.id === activeSoul.tiedPersonaId);
      if (!tiedPersona) {
          console.warn(`Tied persona with id ${activeSoul.tiedPersonaId} not found.`);
          return;
      }

      const isPersonaActive = accountSettings.userName === tiedPersona.userName &&
                              accountSettings.userGender === tiedPersona.userGender &&
                              accountSettings.userBackstory === tiedPersona.userBackstory &&
                              accountSettings.userAvatar === tiedPersona.userAvatar;
      
      if (!isPersonaActive) {
          applyPersona(tiedPersona);
      }
  }, [activeSoul, accountSettings.personas, accountSettings.userName, accountSettings.userGender, accountSettings.userBackstory, accountSettings.userAvatar, applyPersona]);

  const handleStorageError = useCallback((error: unknown, context: string) => {
      const err = error as Error;
      const isQuotaError = err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED';
      if (isQuotaError) {
          setToast({
              title: "Storage Space Low",
              message: "Your chat history is full. We've automatically removed the oldest messages to make space. Your Soul's core identity is unaffected."
          });
      } else {
          console.error(`Storage error during ${context}:`, error);
          setToast({ title: "Storage Error", message: `Could not save data during: ${context}.` });
      }
  }, [setToast]);


  // Load messages and memories for the active Soul
  useEffect(() => {
      const loadInitialData = async () => {
          if (currentUser && activeSoul) {
              if (prevSoulIdRef.current !== activeSoul.id) {
                  setIsLoading(true);
                  setMessages([]);
                  setMessagePage(0);
                  setHasMoreMessages(true);
                  setConsolidatedMemories([]); // Reset memories for new soul
                  setDisplayedMessagesCount(INITIAL_VISIBLE_MESSAGES); // Reset visibility
                  setMessageVersions({}); // Reset message versions when soul changes
                  setActiveChatBackstory(activeSoul.backstory);
                  setActiveChatAdditionalContext(activeSoul.additionalContext || '');

                  // Fetch messages
                  const initialMessages = await fetchMessages(currentUser.id, activeSoul.id, 0, CHAT_PAGE_SIZE);
                  if (initialMessages && initialMessages.length > 0) {
                      setMessages(initialMessages);
                      setMessagePage(1);
                      if (initialMessages.length < CHAT_PAGE_SIZE) {
                          setHasMoreMessages(false);
                      }
                  } else if (initialMessages) {
                        const greeting = activeSoul.greeting || `Hello, ${accountSettings.userName}! I am ${activeSoul.name}. How can I assist you today?`;
                        const greetingMessage: ChatMessage = {
                            id: crypto.randomUUID(),
                            sender: 'ai',
                            text: greeting,
                            timestamp: new Date().toISOString(),
                        };
                      setMessages([greetingMessage]);
                      await addMessage({ ...greetingMessage, user_id: currentUser.id, soul_id: activeSoul.id }).catch(e => handleStorageError(e, "adding greeting"));
                      setHasMoreMessages(false);
                  }

                  // Fetch consolidated memories
                  const memories = await fetchConsolidatedMemories(currentUser.id, activeSoul.id);
                  if (memories) {
                      setConsolidatedMemories(memories);
                  }

                  setIsLoading(false);
              }
          } else {
              setMessages([]);
              setConsolidatedMemories([]);
              setActiveChatBackstory('');
              setActiveChatAdditionalContext('');
          }
          prevSoulIdRef.current = activeSoul ? activeSoul.id : null;
      };

      loadInitialData();
  }, [activeSoul, currentUser, accountSettings.userName, handleStorageError]);

  const consolidateMemoryNow = useCallback(async () => {
    if (!currentUser || !activeSoul || !activeSoul.memoryConsolidation || messages.length === 0) {
        return;
    }

    const lastConsolidationPoint = Math.max(
        lastConsolidationMsgIndexRef.current[activeSoul.id] ?? -1,
        messages.map(m => m.text).lastIndexOf('--- Chat Break ---')
    );
    
    const messagesSinceLastConsolidation = messages.slice(lastConsolidationPoint + 1);

    if (messagesSinceLastConsolidation.length === 0) {
        console.log("No new messages to consolidate.");
        return;
    }

    try {
        const firstRelevantMessage = messagesSinceLastConsolidation[0];
        const conversationTimestamp = new Date(firstRelevantMessage.timestamp);
        
        const formattedDateTime = conversationTimestamp.toLocaleString();
        // FIX: Added the missing 'model' argument to the generateMemorySummary call.
        const summary = await generateMemorySummary(messagesSinceLastConsolidation, activeSoul.name, accountSettings.userName, formattedDateTime, 'gemini-3-flash-preview');
        
        if (!summary || (summary || '').trim().length === 0 || summary.includes("Failed to generate") || summary.includes("No significant events")) {
            console.warn("Memory summary was empty or failed, skipping consolidation.");
            lastConsolidationMsgIndexRef.current[activeSoul.id] = messages.length - 1;
            return;
        }

        const formattedDate = conversationTimestamp.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        const finalSummary = `${activeSoul.name}'s memory on ${formattedDate}: ${summary}`;

        const newMemory: LongTermMemory = {
            id: crypto.randomUUID(),
            user_id: currentUser.id,
            soul_id: activeSoul.id,
            summary: finalSummary,
            timestamp: conversationTimestamp.toISOString(),
        };
        
        await addConsolidatedMemory(newMemory);
        setConsolidatedMemories(prev => [...prev, newMemory]);
        lastConsolidationMsgIndexRef.current[activeSoul.id] = messages.length - 1;

    } catch (e) {
        console.error("Manual memory consolidation failed:", e);
        handleStorageError(e, 'manual memory consolidation');
    }
  }, [currentUser, activeSoul, messages, accountSettings.userName, handleStorageError]);


  // Effect for background memory consolidation
  useEffect(() => {
    const checkAndConsolidate = async () => {
        if (!currentUser || !activeSoul || !activeSoul.memoryConsolidation || isLoading || messages.length === 0) {
            return;
        }
        
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || lastMessage.sender !== 'ai' || lastMessage.text.trim() === '' || lastMessage.isMeta) {
            return;
        }

        const lastConsolidationPoint = Math.max(
            lastConsolidationMsgIndexRef.current[activeSoul.id] ?? -1,
            messages.slice(0, -1).map(m => m.text).lastIndexOf('--- Chat Break ---')
        );
        
        const messagesSinceLastConsolidation = messages.slice(lastConsolidationPoint + 1);
        const aiMessagesSinceLastConsolidation = messagesSinceLastConsolidation.filter(m => m.sender === 'ai' && m.text.trim() && m.text !== '--- Chat Break ---' && !m.isMeta).length;
        
        const CONSOLIDATION_THRESHOLD = 10;
        
        if (aiMessagesSinceLastConsolidation >= CONSOLIDATION_THRESHOLD) {
            await consolidateMemoryNow();
        }
    };

    checkAndConsolidate();
  }, [messages, currentUser, activeSoul, isLoading, accountSettings.userName, handleStorageError, consolidateMemoryNow]);

  const loadMoreMessages = useCallback(async () => {
    if (isLoadingMoreMessages || !hasMoreMessages || !currentUser || !activeSoul) {
        return;
    }

    setIsLoadingMoreMessages(true);
    setIsPrependingMessages(true);
    const olderMessages = await fetchMessages(currentUser.id, activeSoul.id, messagePage, CHAT_PAGE_SIZE);

    if (olderMessages && olderMessages.length > 0) {
        setMessages(prev => [...olderMessages, ...prev]);
        setDisplayedMessagesCount(prev => prev + olderMessages.length);
        setMessagePage(prev => prev + 1);
        if (olderMessages.length < CHAT_PAGE_SIZE) {
            setHasMoreMessages(false);
        }
    } else {
        setHasMoreMessages(false);
    }
    setIsLoadingMoreMessages(false);
    setTimeout(() => setIsPrependingMessages(false), 0);
}, [isLoadingMoreMessages, hasMoreMessages, currentUser, activeSoul, messagePage]);


  // Effect to sync lightMode class to the html element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
  }, []);

  const handleUpdateSoul = useCallback((updates: Partial<Soul> | ((prevSoul: Soul) => Partial<Soul>)) => {
    if (!activeSoul) return;
    const soulId = activeSoul.id;
    updateAndPersistSettings(prevSettings => {
        const souls = prevSettings.souls;
        const soulIndex = souls.findIndex(s => s.id === soulId);
        if (soulIndex === -1) return prevSettings;

        const oldSoul = souls[soulIndex];
        const newUpdates = typeof updates === 'function' ? updates(oldSoul) : updates;

        if (Object.keys(newUpdates).length === 0) {
            return prevSettings;
        }

        const newSoul = { ...oldSoul, ...newUpdates };

        const newSouls = [...souls];
        newSouls[soulIndex] = newSoul;

        return { ...prevSettings, souls: newSouls };
    });
  }, [activeSoul, updateAndPersistSettings]);

    const handleSendMessage = useCallback(async (text: string, options: SendMessageOptions = {}, isFromVoice: boolean = false) => {
    if (!currentUser || !activeSoul) {
        console.warn("Attempted to send message before user or active soul was ready. Aborting.");
        setToast({ title: "Not Ready", message: "Please wait for your profile to load before sending a message." });
        return;
    }

    // Client-side blacklist filter
    if (NSFW_BLACKLIST.length > 0) {
        const blacklistRegex = new RegExp(`\\b(${NSFW_BLACKLIST.join('|')})\\b`, 'i');
        if (blacklistRegex.test(text)) {
            setToast({ title: "Message Blocked", message: "Your message contains prohibited terms and was not sent." });
            return;
        }
    }

    const soulForRequest: Soul = {
        ...activeSoul,
        backstory: activeChatBackstory,
        additionalContext: activeChatAdditionalContext,
    };

    // --- CONTEXT & COMMAND INTERCEPTION ---
    // This happens *before* any state updates to ensure commands are caught immediately.
    const isAdmin = accountSettings.adminMode;
    if (isAdmin) {
        const lines = text.split('\n');
        const command = lines[0].trim();
        if (command === '[STOP STORY]') {
            const metaQuery = lines.slice(1).join('\n').trim();
            setIsMetaMode(true);
            const userMetaMsg: ChatMessage = { id: crypto.randomUUID(), sender: 'user', text, timestamp: new Date().toISOString(), isMeta: true };
            const activationMsg: ChatMessage = { id: crypto.randomUUID(), sender: 'ai', text: "**[META MODE ACTIVATED]**", timestamp: new Date().toISOString(), isMeta: true };
            setMessages(prev => [...prev, userMetaMsg, activationMsg]);
            if (metaQuery) {
                setIsLoading(true);
                const response = await generateMetaResponse(metaQuery, soulForRequest, accountSettings, messages);
                const aiMetaResponse: ChatMessage = { id: crypto.randomUUID(), sender: 'ai', text: response.text, timestamp: new Date().toISOString(), isMeta: true };
                setMessages(prev => [...prev, aiMetaResponse]);
                setIsLoading(false);
            }
            return;
        }
        if (command === '[RESUME STORY]') {
            setIsMetaMode(false);
            const userMetaMsg: ChatMessage = { id: crypto.randomUUID(), sender: 'user', text, timestamp: new Date().toISOString(), isMeta: true };
            const deactivationMsg: ChatMessage = { id: crypto.randomUUID(), sender: 'ai', text: "**[STORY RESUMED]**", timestamp: new Date().toISOString(), isMeta: true };
            setMessages(prev => [...prev, userMetaMsg, deactivationMsg]);
            return;
        }
    }
    const generalCommand = text.trim();
    if (generalCommand === 'PAUSE SCENARIO') {
        const userMessage: ChatMessage = { id: crypto.randomUUID(), sender: 'user', text: generalCommand, timestamp: new Date().toISOString() };
        const aiResponse: ChatMessage = {
            id: crypto.randomUUID(),
            sender: 'ai',
            text: "**[SCENARIO PAUSED]**\n\nI have paused the narrative. I am awaiting your directive. You can provide out-of-character instructions on how to proceed, for example: \"Please re-read the key memories and continue the story,\" or \"Change the location to a dark forest.\"",
            timestamp: new Date().toISOString(),
        };
        const currentMessages = [...messages, userMessage, aiResponse];
        setMessages(currentMessages);
        await addMessage({ ...userMessage, user_id: currentUser.id, soul_id: activeSoul.id }).catch(e => handleStorageError(e, 'adding pause command'));
        await addMessage({ ...aiResponse, user_id: currentUser.id, soul_id: activeSoul.id }).catch(e => handleStorageError(e, 'adding pause response'));
        return;
    }
    // --- END COMMAND INTERCEPTION ---

    if (isFromVoice && !accountSettings.voiceCallUnifiedHistory) {
        setIsLoading(true);
        const historyForRequest = messages.filter(m => m.text !== '--- Chat Break ---' && m.text !== '--- MEMORY WIPE ---');
        const memoriesForRequest = activeSoul.memoryRecall ? consolidatedMemories : [];
        try {
            const response = await generateGeminiResponse(text, historyForRequest, soulForRequest, accountSettings, memoriesForRequest, options, [], isFromVoice);
            const finalText = response.text;
            if (finalText) {
                setSpeakingMessageId('ephemeral-voice-call');
                speak(finalText.trim(), activeSoul.voiceURI);
            }
        } catch (error) {
            console.error("Failed to process ephemeral Gemini response:", error);
            if (activeSoul.voiceURI) {
              speak("Sorry, I had trouble generating a response. Please try again.", activeSoul.voiceURI);
            }
        } finally {
            setIsLoading(false);
        }
        return; 
    }
    
    const currentMessages = messages;
    
    if (isMetaMode && isAdmin) {
        setIsLoading(true);
        const userMetaMsg: ChatMessage = { id: crypto.randomUUID(), sender: 'user', text, timestamp: new Date().toISOString(), isMeta: true };
        setMessages(prev => [...prev, userMetaMsg]);
        
        const response = await generateMetaResponse(text, soulForRequest, accountSettings, currentMessages);
        const aiMetaResponse: ChatMessage = { id: crypto.randomUUID(), sender: 'ai', text: response.text, timestamp: new Date().toISOString(), isMeta: true };
        setMessages(prev => [...prev, aiMetaResponse]);
        
        setIsLoading(false);
        return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
      imageUrl: options.imageUrlForUi,
    };
    
    updateAndPersistSettings(prev => ({
        ...prev,
        dailyMessageCount: (prev.dailyMessageCount || 0) + 1,
    }));

    setMessages(prev => [...prev, userMessage]);
    await addMessage({ ...userMessage, user_id: currentUser.id, soul_id: activeSoul.id }).catch(e => handleStorageError(e, 'adding user message'));
    
    const lastMemoryWipeIndex = currentMessages.map(m => m.text).lastIndexOf('--- MEMORY WIPE ---');
    const lastChatBreakIndex = currentMessages.map(m => m.text).lastIndexOf('--- Chat Break ---');
    
    let historySlice;
    let memoriesForRequest = activeSoul.memoryRecall ? consolidatedMemories : [];

    if (lastMemoryWipeIndex > lastChatBreakIndex) {
        historySlice = currentMessages.slice(lastMemoryWipeIndex + 1);
        const hasUserMessagesSinceWipe = historySlice.some(m => m.sender === 'user');
        if (!hasUserMessagesSinceWipe) {
            memoriesForRequest = [];
        }
    } else if (lastChatBreakIndex > -1) {
        historySlice = currentMessages.slice(lastChatBreakIndex + 1);
    } else {
        historySlice = currentMessages;
    }
    
    const historyForRequest = historySlice.filter(m => m.text !== '--- Chat Break ---' && m.text !== '--- MEMORY WIPE ---' && !m.isMeta);

    if (!isFromVoice) cancelSpeech();

    let apiText = text;
    if (!text.trim() && options.image) {
        apiText = "Describe this image, or tell me what you think about it.";
    }

    setIsLoading(true);

    const aiResponseId = crypto.randomUUID();
    const aiMessagePlaceholder: ChatMessage = {
        id: aiResponseId,
        sender: 'ai',
        text: '',
        timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, aiMessagePlaceholder]);
    await addMessage({ ...aiMessagePlaceholder, user_id: currentUser.id, soul_id: activeSoul.id }).catch(e => handleStorageError(e, 'adding AI placeholder'));

    let fullText = '';
    
    const handleResponseCompletion = async (finalText: string, userId: string, soulId: string) => {
        const cleanedText = enforceDialoguePurity(finalText);

        if ((accountSettings.autoPlayAudio) && cleanedText) {
            setSpeakingMessageId(aiResponseId);
            speak(cleanedText.trim(), activeSoul.voiceURI);
        }

        const finalAiMessage: ChatMessage = {
            id: aiResponseId,
            sender: 'ai' as const,
            text: cleanedText.trim(),
            timestamp: new Date().toISOString(),
        };
        
        await updateMessage(aiResponseId, { text: finalAiMessage.text, timestamp: finalAiMessage.timestamp }, userId, soulId).catch(e => handleStorageError(e, 'updating AI response'));
        
        setMessages(prev => prev.map(m => m.id === aiResponseId ? finalAiMessage : m));
        
        if (activeSoul && (accountSettings.gameMode || activeSoul.role === SoulRole.SCENARIO)) {
            (async () => {
                try {
                    const fullTurnHistory = [...historyForRequest, userMessage, finalAiMessage];
                    
                    const updatedSheet = await generateUpdatedCharacterSheet(
                        fullTurnHistory,
                        activeSoul.characterSheet || '',
                        finalAiMessage.text
                    );
                    
                    if (updatedSheet !== (activeSoul.characterSheet || '')) {
                        handleUpdateSoul({ characterSheet: updatedSheet });
                    }
                } catch (e) {
                    console.error("Failed to automatically update character sheet:", e);
                    setToast({ title: "Update Failed", message: "Could not automatically update the character sheet." });
                }
            })();
        }
    };
    
    try {
        const suggestionsForSoul = regenerationSuggestions[activeSoul.id] || [];
        if (accountSettings.textStreaming) {
            const stream = streamGeminiResponse(apiText, historyForRequest, soulForRequest, accountSettings, memoriesForRequest, options, suggestionsForSoul, isFromVoice);
            for await (const chunk of stream) {
                if (chunk.text) {
                    if (chunk.text.includes("[STATIC INTERFERENCE]")) {
                        fullText = chunk.text; // Replace, don't append
                        setMessages(prev => prev.map(m => 
                            m.id === aiResponseId ? { ...m, text: fullText } : m
                        ));
                        break; 
                    }
                    fullText += chunk.text;
                    setMessages(prev => prev.map(m => 
                        m.id === aiResponseId ? { ...m, text: fullText } : m
                    ));
                }
            }
        } else {
            const response = await generateGeminiResponse(apiText, historyForRequest, soulForRequest, accountSettings, memoriesForRequest, options, suggestionsForSoul, isFromVoice);
            fullText = response.text;
            setMessages(prev => prev.map(m => 
                m.id === aiResponseId ? { ...m, text: fullText } : m
            ));
        }

        await handleResponseCompletion(fullText, currentUser.id, activeSoul.id);

    } catch (error) {
       console.error("Failed to process Gemini response:", error);
       const errorMessageText = "Sorry, I had trouble generating a response. Please try again.";
       await handleResponseCompletion(errorMessageText, currentUser.id, activeSoul.id);
    } finally {
        setIsLoading(false);
    }
  }, [currentUser, activeSoul, activeChatBackstory, activeChatAdditionalContext, accountSettings, messages, consolidatedMemories, isMetaMode, regenerationSuggestions, handleStorageError, handleUpdateSoul, updateAndPersistSettings, setToast, setIsMetaMode, setMessages, setIsLoading, setSpeakingMessageId, cancelSpeech, speak]);
  
  const handleUnstuckSoul = useCallback(() => {
    setIsUnstuckModalOpen(true);
  }, []);
  
  const handleConfirmUnstuck = useCallback(async () => {
    if (!currentUser || !activeSoul) return;

    // Find the last user message and the AI placeholder
    const lastUserMessage = messages.slice().reverse().find(m => m.sender === 'user');
    const aiPlaceholder = messages.slice().reverse().find(m => m.sender === 'ai' && m.text === '');

    const messagesToDeleteIds = [];
    if (lastUserMessage) messagesToDeleteIds.push(lastUserMessage.id);
    if (aiPlaceholder) messagesToDeleteIds.push(aiPlaceholder.id);
    
    // Optimistically update UI by just removing the messages
    if (messagesToDeleteIds.length > 0) {
        setMessages(prev => prev.filter(m => !messagesToDeleteIds.includes(m.id)));
    }
    
    setIsLoading(false);
    setIsUnstuckModalOpen(false);

    // Asynchronously delete from DB
    for (const idToDelete of messagesToDeleteIds) {
        await deleteMessage(idToDelete, currentUser.id, activeSoul.id); 
    }
  }, [currentUser, activeSoul, messages]);

  // FIX: Add handlers for unlocking a soul for editing.
  const handleOpenUnlockModal = useCallback((soulId: string) => {
    const soul = accountSettings.souls.find(s => s.id === soulId);
    if (soul) {
        setSoulToUnlock(soul);
        setIsUnlockModalOpen(true);
    }
  }, [accountSettings.souls]);

  const handleConfirmUnlock = useCallback(() => {
    if (!soulToUnlock) return;
    
    updateAndPersistSettings(prev => {
        const newSouls = prev.souls.map(s => 
            s.id === soulToUnlock.id 
            ? { ...s, tradable: false } 
            : s
        );
        return { ...prev, souls: newSouls };
    });

    setToast({ title: "Soul Unlocked", message: `${soulToUnlock.name} is now fully editable. This change is permanent.` });
    setIsUnlockModalOpen(false);
    setSoulToUnlock(null);
  }, [soulToUnlock, updateAndPersistSettings, setToast]);
  
  const handleOpenUnlockTemplateModal = useCallback((instanceId: string, name: string) => {
    setTemplateToUnlock({ instanceId, name });
    setIsUnlockTemplateModalOpen(true);
  }, []);

  const handleConfirmUnlockTemplate = useCallback(() => {
    if (!templateToUnlock) return;

    updateAndPersistSettings(prev => {
        const newOwnedTemplates = (prev.ownedTemplates || []).map(t =>
            t.instanceId === templateToUnlock.instanceId
            ? { ...t, tradable: false }
            : t
        );
        return { ...prev, ownedTemplates: newOwnedTemplates };
    });

    setToast({ title: "Template Unlocked", message: `${templateToUnlock.name} is now fully editable once added to your dock. This change is permanent.` });
    setIsUnlockTemplateModalOpen(false);
    setTemplateToUnlock(null);
  }, [templateToUnlock, updateAndPersistSettings, setToast]);

  const handleReturnSoulToCollection = useCallback((soulId: string) => {
    const soul = accountSettings.souls.find(s => s.id === soulId);
    if (!soul || soul.templateName === undefined) {
        setToast({ title: "Error", message: "Cannot return a soul without a template." });
        return;
    }
    if (!isDockEditing) {
        setToast({ title: "Dock Locked", message: "Unlock the dock to return a Soul to your collection." });
        return;
    }
    setSoulToReturn(soul);
  }, [accountSettings.souls, isDockEditing, setToast]);

const handleConfirmReturnToCollection = useCallback(async () => {
    if (!soulToReturn || !currentUser) return;

    const soulId = soulToReturn.id;

    updateAndPersistSettings(prev => {
        const newOwnedTemplate = {
            name: soulToReturn.templateName!,
            quality: getQualityFromUpgrade(soulToReturn.upgrade),
            instanceId: crypto.randomUUID(),
            upgrade: soulToReturn.upgrade,
            tradable: soulToReturn.tradable,
        };
        const newSouls = prev.souls.filter(s => s.id !== soulId);
        const newDockedIds = (prev.dockedSoulIds || []).map(id => id === soulId ? null : id);

        let newActiveSoulId = prev.activeSoulId;
        if (prev.activeSoulId === soulId) {
            const firstDockedId = newDockedIds.find(id => id !== null);
            newActiveSoulId = firstDockedId || (newSouls.length > 0 ? newSouls[0].id : null);
        }
        const newQuickSwitchIds = (prev.quickSwitchSoulIds || []).filter(id => id !== soulId);

        return {
            ...prev,
            souls: newSouls,
            dockedSoulIds: newDockedIds,
            activeSoulId: newActiveSoulId,
            quickSwitchSoulIds: newQuickSwitchIds,
            ownedTemplates: [...(prev.ownedTemplates || []), newOwnedTemplate],
        };
    });

    await deleteMessagesForSoul(currentUser.id, soulId);
    await deleteMemoriesForSoul(currentUser.id, soulId);

    setToast({ title: "Soul Returned", message: `${soulToReturn.name} has been returned to your collection and its data has been deleted.` });
    setSoulToReturn(null);
}, [soulToReturn, currentUser, updateAndPersistSettings, setToast]);

  // --- START: NEW AND IMPROVED 'MAGIC WAND' LOGIC ---

    const lastAiMessage = useMemo(() => 
        messages.slice().reverse().find(msg => msg.sender === 'ai' && msg.text.trim() !== ''), 
        [messages]
    );

    const handleGenerateUserReply = useCallback(async (): Promise<string> => {
        console.log("DEBUG: Running handleGenerateUserReply.");
        
        if (!lastAiMessage) {
            console.error("DEBUG ERROR: lastAiMessage is missing. Cannot generate reply.");
            alert("I can't generate a reply because there is no AI message to respond to!"); 
            return '';
        }

        console.log("DEBUG: Found lastAiMessage. Calling service...");
        try {
            return await generateUserReplyInPersona(lastAiMessage, activeSoul!, accountSettings);
        } catch (error) {
            console.error("CRITICAL ERROR in generateUserReplyInPersona:", error);
            return '';
        }
    }, [lastAiMessage, activeSoul, accountSettings]);

    const handleContinueUserReply = useCallback(async (currentText: string): Promise<string> => {
        // Deactivated as per user request to fix bug.
        console.log(`DEBUG: Running handleContinueUserReply (deactivated).`);
        return currentText;
    }, []);
    
  // --- END: NEW AND IMPROVED 'MAGIC WAND' LOGIC ---
  
  const handleContinueMessage = useCallback(async (messageId: string) => {
    const messageToContinue = messages.find(m => m.id === messageId);
    if (!messageToContinue || !currentUser || !activeSoul || !accountSettings) return;

    const soulForRequest: Soul = {
        ...activeSoul,
        backstory: activeChatBackstory,
        additionalContext: activeChatAdditionalContext,
    };

    const isAdminBypass = accountSettings.adminMode && currentUser.email === 'gkryniecki@gmail.com';
    const currentTokens = Math.ceil(messageToContinue.text.length / APPROX_CHARS_PER_TOKEN);
    const remainingTokenBudget = TOTAL_MESSAGE_TOKEN_LIMIT - currentTokens;
    if (!isAdminBypass && remainingTokenBudget <= 0) {
        setToast({ title: "Token Limit Reached", message: `This message has reached the maximum length.` });
        return;
    }

    setIsLoading(true);
    try {
        const continuationText = await continueGeminiResponse(messageToContinue.text, messages, soulForRequest, accountSettings, consolidatedMemories);

        const trimmedContinuation = (continuationText || '').trim();

        if (trimmedContinuation === '') {
            setToast({ title: "It's Your Turn", message: `${activeSoul.name} seems to be waiting for your action.` });
        
        } else if (trimmedContinuation.startsWith("Sorry, I") || trimmedContinuation.startsWith("An internal error")) {
            setToast({ title: "Generation Error", message: trimmedContinuation });
        
        } else {
            const newText = messageToContinue.text + "\n\n" + trimmedContinuation;
            setMessages(prev => prev.map(m => 
                m.id === messageId ? { ...m, text: newText } : m
            ));
            await updateMessage(messageId, { text: newText }, currentUser.id, activeSoul.id).catch(e => handleStorageError(e, 'continuing message'));
        }
        
    } catch(error) {
        console.error("Failed to continue message:", error);
        setToast({ title: "Error", message: "An unexpected client-side error occurred while continuing the message." });
    } finally {
        setIsLoading(false);
    }
  }, [activeSoul, currentUser, accountSettings, messages, activeChatBackstory, activeChatAdditionalContext, consolidatedMemories, handleStorageError]);
  
  const handleTweakMessage = useCallback((messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setMessageToTweak(message);
      setIsTweakModalOpen(true);
    }
  }, [messages]);

  const handleSaveTweak = useCallback(async (messageId: string, newText: string) => {
    if (!currentUser || !activeSoul) return;
    const originalMessage = messages.find(m => m.id === messageId);
    if (!originalMessage) return;

    setMessageVersions(prev => {
        const existingEntry = prev[messageId];
        if (existingEntry) {
            if (existingEntry.versions.includes(newText)) return prev;
            const newVersions = [...existingEntry.versions, newText];
            return {
                ...prev,
                [messageId]: { versions: newVersions, currentIndex: newVersions.length - 1 }
            };
        } else {
            return {
                ...prev,
                [messageId]: { versions: [originalMessage.text, newText], currentIndex: 1 }
            };
        }
    });

    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: newText, isEdited: true } : m));
    await updateMessage(messageId, { text: newText, isEdited: true }, currentUser.id, activeSoul.id).catch(e => handleStorageError(e, 'tweaking AI message'));
    setIsTweakModalOpen(false);
    setMessageToTweak(null);
  }, [currentUser, activeSoul, messages, handleStorageError]);
  
  const handleOpenRegenerateModal = useCallback((messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setMessageToRegenerate(message);
      setIsRegenerateModalOpen(true);
    }
  }, [messages]);

  const handleRegenerate = useCallback(async (suggestion: string) => {
      if (!messageToRegenerate || !currentUser || !activeSoul) return;

      const soulForRequest: Soul = {
        ...activeSoul,
        backstory: activeChatBackstory,
        additionalContext: activeChatAdditionalContext,
      };

      setIsLoading(true);
      setIsRegenerateModalOpen(false);

      try {
          const historyForRequest = messages.slice(0, messages.findIndex(m => m.id === messageToRegenerate.id));
          
          const lastMemoryWipeIndex = historyForRequest.map(m => m.text).lastIndexOf('--- MEMORY WIPE ---');
          const lastChatBreakIndex = historyForRequest.map(m => m.text).lastIndexOf('--- Chat Break ---');
        
          let memoriesForRequest = activeSoul.memoryRecall ? consolidatedMemories : [];

          if (lastMemoryWipeIndex > lastChatBreakIndex) {
              const historySliceSinceWipe = historyForRequest.slice(lastMemoryWipeIndex + 1);
              const hasUserMessagesSinceWipe = historySliceSinceWipe.some(m => m.sender === 'user');
              if (!hasUserMessagesSinceWipe) {
                  memoriesForRequest = [];
              }
          }
          
          const aiText = await regenerateGeminiResponse(historyForRequest, suggestion, messageToRegenerate, soulForRequest, accountSettings, memoriesForRequest);
          
          if (aiText.startsWith("Sorry, I") || aiText.startsWith("I'm having a little trouble")) {
              setToast({ title: "Regeneration Error", message: aiText });
          } else {
              const newTimestamp = new Date().toISOString();
              const trimmedAiText = (aiText || '').trim();

              setMessageVersions(prev => {
                  const existingEntry = prev[messageToRegenerate.id];
                  if (existingEntry) {
                      if (existingEntry.versions.includes(trimmedAiText)) return prev;
                      const newVersions = [...existingEntry.versions, trimmedAiText];
                      return {
                          ...prev,
                          [messageToRegenerate.id]: { versions: newVersions, currentIndex: newVersions.length - 1 }
                      };
                  } else {
                      return {
                          ...prev,
                          [messageToRegenerate.id]: { versions: [messageToRegenerate.text, trimmedAiText], currentIndex: 1 }
                      };
                  }
              });

              setMessages(prev => prev.map(m => 
                  m.id === messageToRegenerate.id 
                  ? { ...m, text: trimmedAiText, isEdited: true, timestamp: newTimestamp } 
                  : m
              ));
              await updateMessage(messageToRegenerate.id, { text: trimmedAiText, isEdited: true, timestamp: newTimestamp }, currentUser.id, activeSoul.id).catch(e => handleStorageError(e, 'regenerating message'));

              if (suggestion.trim()) {
                  setRegenerationSuggestions(prev => {
                      const currentSuggestions = prev[activeSoul.id] || [];
                      const newSuggestions = [...currentSuggestions, suggestion.trim()].slice(-5);
                      return { ...prev, [activeSoul.id]: newSuggestions };
                  });
              }
          }

      } catch (error) {
          console.error("Client-side error during regeneration:", error);
          setToast({ title: "Error", message: "An unexpected error occurred during regeneration. Please try again." });
      } finally {
          setIsLoading(false);
          setMessageToRegenerate(null);
      }
  }, [messageToRegenerate, currentUser, activeSoul, activeChatBackstory, activeChatAdditionalContext, messages, consolidatedMemories, accountSettings, handleStorageError, setToast]);

  const handleCycleMessageVersion = useCallback(async (messageId: string, direction: 'prev' | 'next') => {
    if (!currentUser || !activeSoul) return;

    const entry = messageVersions[messageId];
    if (!entry) return;

    const { versions, currentIndex } = entry;
    let newIndex = currentIndex;

    if (direction === 'prev' && currentIndex > 0) {
        newIndex--;
    } else if (direction === 'next' && currentIndex < versions.length - 1) {
        newIndex++;
    }

    if (newIndex !== currentIndex) {
        const newText = versions[newIndex];

        setMessageVersions(prev => ({
            ...prev,
            [messageId]: { ...prev[messageId], currentIndex: newIndex }
        }));

        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: newText } : m));
        
        await updateMessage(messageId, { text: newText }, currentUser.id, activeSoul.id).catch(e => handleStorageError(e, 'cycling message version'));
    }
  }, [currentUser, activeSoul, messageVersions, handleStorageError]);

  const handleEditUserMessage = useCallback((messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && message.sender === 'user') {
        setUserMessageToTweak(message);
        setIsUserTweakModalOpen(true);
    }
  }, [messages]);

  const handleSaveUserTweak = useCallback(async (messageId: string, newText: string) => {
    if (!currentUser || !activeSoul) return;
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: newText, isEdited: true } : m));
    await updateMessage(messageId, { text: newText, isEdited: true }, currentUser.id, activeSoul.id).catch(e => handleStorageError(e, 'editing user message'));
    setIsUserTweakModalOpen(false);
    setUserMessageToTweak(null);
  }, [currentUser, activeSoul, handleStorageError]);

  const handleCloseUserTweakModal = useCallback(() => {
    setIsUserTweakModalOpen(false);
    setUserMessageToTweak(null);
  }, []);
  
  const handleOpenChatBreakModal = useCallback(() => {
    setIsChatBreakModalOpen(true);
  }, []);
  
  const handleChatBreak = useCallback(async (newGreeting: string, resetMemory: boolean) => {
    if (!currentUser || !activeSoul) return;
    
    lastConsolidationMsgIndexRef.current[activeSoul.id] = -1;
    setActiveChatBackstory(activeSoul.backstory);
    setActiveChatAdditionalContext(activeSoul.additionalContext || '');
    
    setIsLoading(false);

    setRegenerationSuggestions(prev => ({ ...prev, [activeSoul.id]: [] }));

    const greetingText = newGreeting.trim() 
        ? newGreeting 
        : activeSoul.greeting || `Hello, ${accountSettings.userName}! I am ${activeSoul.name}. How can I assist you today?`;
    
    const greetingMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: greetingText,
        timestamp: new Date().toISOString(),
    };

    if (resetMemory) { // This is the HARD reset (Memory Wipe)
        console.log("Performing HARD reset (Memory Wipe)...");
        setMessages([greetingMessage]);
        setConsolidatedMemories([]);

        await deleteMessagesForSoul(currentUser.id, activeSoul.id);
        await deleteMemoriesForSoul(currentUser.id, activeSoul.id);
        await addMessage({ ...greetingMessage, user_id: currentUser.id, soul_id: activeSoul.id });
        
    } else { // This is the SOFT reset
        console.log("Performing SOFT reset...");
        const messagesToDelete = messages.slice(-30);
        const newMessages = messages.slice(0, -30);

        setMessages([...newMessages, greetingMessage]);

        for (const msg of messagesToDelete) {
            await deleteMessage(msg.id, currentUser.id, activeSoul.id);
        }
        await addMessage({ ...greetingMessage, user_id: currentUser.id, soul_id: activeSoul.id });
    }

    setIsChatBreakModalOpen(false);
  }, [currentUser, activeSoul, accountSettings.userName, messages]);

  const handleShowConsolidatedMemories = useCallback(() => {
    setMemoriesForModal(consolidatedMemories);
    setIsMemoryModalOpen(true);
  }, [consolidatedMemories]);

  const handleStartCreationFromScratch = useCallback(() => {
      setNewSoulData(defaultSoul(accountSettings));
      setCreateSoulView('create-name');
  }, [accountSettings]);

  const handleUpdateNewSoul = useCallback((updates: Partial<Soul>) => {
    setNewSoulData(prev => ({...prev, ...updates}));
  }, []);

  const handleFinalizeSoulCreationFromScratch = useCallback(async () => {
    if (!currentUser) return;
    const soulName = newSoulData.name?.trim() || 'New Soul';
    const userName = accountSettings.userName;

    const benefits = getSubscriptionBenefits(accountSettings);
    const applyTruncation = (text: string, limit: number) => {
        if (!accountSettings.adminMode && text.length > limit) {
            return text.substring(0, limit);
        }
        return text;
    };

    const backstoryText = applyTruncation(newSoulData.backstory || '', benefits.soulBackstoryChars);
    const keyMemoriesText = applyTruncation(newSoulData.keyMemories || '', benefits.soulKeyMemoriesChars);
    const responseDirectiveText = applyTruncation(newSoulData.responseDirective || '', benefits.soulResponseDirectiveChars);
    
    const finalSoul: Soul = {
      ...defaultSoul(accountSettings),
      ...newSoulData,
      id: crypto.randomUUID(),
      name: soulName,
      username: soulName.toLowerCase().replace(/\s+/g, '_') || `soul_${Date.now()}`,
      bio: (newSoulData.bio || newSoulData.description || `A new soul created by ${userName}.`).replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
      backstory: backstoryText.replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
      responseDirective: responseDirectiveText.replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
      keyMemories: keyMemoriesText.replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
      characterSheet: (newSoulData.characterSheet || '').replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
      greeting: (newSoulData.greeting || '').replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
      exampleMessage: '',
      additionalContext: '',
      tradable: false,
    };
    
    const createdSoul = await createSoul(finalSoul, currentUser.id);

    if (createdSoul) {
        updateAndPersistSettings(prev => {
            const newSouls = [...prev.souls, createdSoul];
            const newDockedIds = [...(prev.dockedSoulIds || Array(20).fill(null))];
            
            const firstEmptyIndex = newDockedIds.findIndex(id => id === null);
            if (firstEmptyIndex !== -1 && firstEmptyIndex < benefits.soulSlots) {
                newDockedIds[firstEmptyIndex] = createdSoul.id;
            }
            
            return {
                ...prev,
                souls: newSouls,
                dockedSoulIds: newDockedIds,
                activeSoulId: createdSoul.id,
            };
        });
        setNewSoulData({});
        setCreateSoulView(null);
        setToast({ title: "Soul Created", message: `${createdSoul.name} is now ready to chat!` });
    } else {
        setToast({ title: "Creation Error", message: "Failed to save your new Soul to the database. Please try again." });
    }
  }, [currentUser, accountSettings, newSoulData, updateAndPersistSettings, setToast]);

  const createAndAddNewSoul = useCallback(async (template: SoulTemplate, instance?: { tradable?: boolean }, indexToInsert?: number) => {
    if (!currentUser) return;
    const soulName = template.name;
    const userName = accountSettings.userName;

    // --- Robust Character Sheet Fetching Logic ---
    let finalCharacterSheet = '';
    const sheetProperty = template.characterSheet || '';
    let urlToFetch = '';

    // Case 1: Is it a key in our links map?
    if (characterSheetLinks[sheetProperty]) {
        urlToFetch = characterSheetLinks[sheetProperty];
    } 
    // Case 2: Is it a URL itself? (Handles user's previous implementation)
    else if (sheetProperty.startsWith('https://')) {
        urlToFetch = sheetProperty;
    }
    // Case 3: Assume it's raw text content
    else {
        finalCharacterSheet = sheetProperty;
    }

    if (urlToFetch) {
        try {
            const response = await fetch(urlToFetch);
            if (!response.ok) {
                throw new Error(`Network response was not ok for ${urlToFetch}`);
            }
            finalCharacterSheet = await response.text();
        } catch (error) {
            console.error("Failed to fetch character sheet:", error);
            setToast({ title: "Loading Error", message: `Could not load character sheet for ${soulName}. It will be blank.` });
            finalCharacterSheet = `Error loading character sheet from URL: ${urlToFetch}`;
        }
    }
    // --- End of Fetching Logic ---
    
    const benefits = getSubscriptionBenefits(accountSettings);
    const applyTruncation = (text: string, limit: number) => {
        if (!accountSettings.adminMode && text.length > limit) {
            return text.substring(0, limit);
        }
        return text;
    };
    
    const processedBackstory = applyTruncation(template.backstory, benefits.soulBackstoryChars);
    const processedKeyMemories = applyTruncation(template.keyMemories, benefits.soulKeyMemoriesChars);
    const processedResponseDirective = applyTruncation(template.responseDirective, benefits.soulResponseDirectiveChars);

    const { model, enableThinking } = getDefaultModelForTier(accountSettings.subscriptionTier);
    
    const newSoul: Soul = {
      id: crypto.randomUUID(),
      name: soulName,
      description: template.title.replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
      model,
      enableThinking,
      gender: template.gender,
      avatar: template.smallAvatarUrl,
      backstory: processedBackstory.replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
      responseDirective: processedResponseDirective.replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
      keyMemories: processedKeyMemories.replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
      characterSheet: finalCharacterSheet.replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
      greeting: template.greeting.replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
      exampleMessage: '',
      voiceURI: 'Zephyr',
      mbti: template.mbti || null,
      enneagram: template.enneagram || null,
      dynamism: template.dynamism,
      thinkingBudget: 128,
      antiRepeatStrength: 0.00,
      memoryConsolidation: true,
      memoryRecall: true,
      maxTokens: 2048,
      roleplayStyle: 'Default',
      avatarStyle: 'Photoreal',
      physicalAppearanceDescription: template.longDescription,
      faceDetailEnhance: 0,
      faceDetailPrompt: '',
      enableNsfwSelfies: false,
      selfies: [],
      followersCount: 0,
      followingCount: 0,
      templateName: template.name,
      username: soulName.toLowerCase().replace(/\s+/g, '_'),
      bio: template.longDescription.replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
      profileBannerUrl: template.profileBannerUrl || null,
      posts: [],
      role: null,
      tiedPersonaId: null,
      additionalContext: '',
      soulId: template.soulId,
      shareCode: template.shareCode,
      edition: template.edition,
      upgrade: template.upgrade ?? getUpgradeLevelFromQuality(template.quality),
      tradable: instance?.tradable ?? (template.edition === 'Marvel' || template.edition === 'TVD'),
    };

     const createdSoul = await createSoul(newSoul, currentUser.id);
     if (createdSoul) {
         updateAndPersistSettings(prev => {
            const newSouls = [...prev.souls, createdSoul];
            const newDockedIds = [...(prev.dockedSoulIds || Array(20).fill(null))];
            
            if (indexToInsert !== undefined && indexToInsert >= 0 && indexToInsert < 20 && newDockedIds[indexToInsert] === null) {
                newDockedIds[indexToInsert] = createdSoul.id;
            } else {
                const firstEmptyIndex = newDockedIds.findIndex(id => id === null);
                if (firstEmptyIndex !== -1) {
                    newDockedIds[firstEmptyIndex] = createdSoul.id;
                }
            }
            
            const currentUnlocked = new Set(prev.unlockedTemplateNames || []);
            if (createdSoul.templateName) {
                currentUnlocked.add(createdSoul.templateName);
            }
            return {
                ...prev,
                souls: newSouls,
                dockedSoulIds: newDockedIds,
                activeSoulId: createdSoul.id,
                unlockedTemplateNames: Array.from(currentUnlocked),
            };
        });
        setToast({ title: "Soul Created", message: `${createdSoul.name} has joined your roster!` });
    } else {
        setToast({ title: "Creation Error", message: "Failed to create Soul from template. Please try again." });
    }
  }, [currentUser, accountSettings, updateAndPersistSettings, setToast]);

  const handleAutoSelfie = useCallback(async () => {
    if (!currentUser || !activeSoul) {
        console.error("Cannot generate selfie: User or Soul not available.");
        return;
    }
    
    // Simulating background selfie generation.
    console.log("Simulating background selfie generation...");
  }, [currentUser, activeSoul]);


  const handleToggleFavorite = useCallback((messageId: string) => {
    updateAndPersistSettings(prev => {
        const currentFavorites = prev.favoriteMessages || [];
        const isFavorited = currentFavorites.includes(messageId);
        const newFavorites = isFavorited
          ? currentFavorites.filter(id => id !== messageId)
          : [...currentFavorites, messageId];
        return { ...prev, favoriteMessages: newFavorites };
    });
  }, [updateAndPersistSettings]);


  const handleViewTemplate = useCallback((soulId: string) => {
    const soul = accountSettings.souls.find(s => s.id === soulId);
    if (soul) {
        setSoulToView(soul);
        setIsTemplateModalOpen(true);
    }
  }, [accountSettings.souls]);

  const handlePinSoul = useCallback((soulId: string) => {
      updateAndPersistSettings(prev => {
          const isPinned = prev.quickSwitchSoulIds.includes(soulId);
          const newQuickSwitchIds = isPinned
              ? prev.quickSwitchSoulIds.filter(id => id !== soulId)
              : [...prev.quickSwitchSoulIds, soulId];
          return { ...prev, quickSwitchSoulIds: newQuickSwitchIds };
      });
  }, [updateAndPersistSettings]);

  const handleOpenDeletionModal = useCallback((soulId: string) => {
      const soul = accountSettings.souls.find(s => s.id === soulId);
      if(soul) {
          setSoulToDelete(soul);
          setIsDeletionModalOpen(true);
      }
  }, [accountSettings.souls]);

  const handleConfirmDeletion = useCallback(() => {
      if (!soulToDelete) return;
      updateAndPersistSettings(prev => ({
          ...prev,
          souls: prev.souls.map(s => 
              s.id === soulToDelete.id 
              ? { ...s, deletionTimestamp: Date.now() + 24 * 60 * 60 * 1000 } 
              : s
          )
      }));
      setIsDeletionModalOpen(false);
      setSoulToDelete(null);
  }, [soulToDelete, updateAndPersistSettings]);
  
  const handleImmediateDelete = useCallback((soulId: string) => {
    if (!currentUser || !accountSettings.adminMode) return;
    // Admin action does not need confirmation here as it's in the context menu
    deleteSouls([soulId], currentUser.id).then(async success => {
        if (success) {
            // Optimistically update UI
            updateAndPersistSettings(prev => {
                const newSouls = prev.souls.filter(s => s.id !== soulId);
                const newDockedIds = (prev.dockedSoulIds || []).map(id => id === soulId ? null : id);
                const newActiveId = prev.activeSoulId === soulId
                    ? (newDockedIds.find(id => id !== null) || (newSouls.length > 0 ? newSouls[0].id : null))
                    : prev.activeSoulId;
                return {
                    ...prev,
                    souls: newSouls,
                    dockedSoulIds: newDockedIds,
                    activeSoulId: newActiveId
                };
            });
        } else {
            setToast({ title: "Error", message: "Failed to delete the Soul from storage." });
        }
    });
  }, [currentUser, accountSettings.adminMode, updateAndPersistSettings, setToast]);

  const handleCancelDeletion = useCallback((soulId: string) => {
       updateAndPersistSettings(prev => ({
          ...prev,
          souls: prev.souls.map(s => 
              s.id === soulId
              ? { ...s, deletionTimestamp: undefined } 
              : s
          )
      }));
  }, [updateAndPersistSettings]);
  
  const handleGoToMessage = useCallback(async (messageId: string) => {
    const messageExists = messages.some(m => m.id === messageId);
    if (!messageExists) {
        setToast({ title: "Navigation Error", message: "Cannot jump to this message as it is not currently loaded in the chat history." });
        return;
    }

    setIsFavoritesOpen(false);
    setHighlightedMessageId(messageId);
    
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messages.length - messageIndex > 5) { // Only show button if not near the end
         setShowScrollToBottom(true);
    }
  }, [messages, setToast]);

  // --- Onboarding & Soul Creation Flow Handlers ---
  const handleEmailSubmit = useCallback((email: string) => {
    setOnboardingEmail(email);
    setLocation('check-mail');
  }, []);
  
  const handleWelcomeNext = useCallback((data: { name: string, gender: Gender, avatar: string | null }) => {
    if (currentUser && isUsernameReserved(data.name, String(currentUser.email))) {
        setWelcomeError('This username is reserved and cannot be used.');
        return;
    }
    setWelcomeError('');
    updateAndPersistSettings(prev => ({ ...prev, userName: data.name, userGender: data.gender, userAvatar: data.avatar }));
    setIsMultiAccountWarningOpen(true);
  }, [currentUser, updateAndPersistSettings]);

  const handleMultiAccountConfirm = useCallback(() => {
      setIsMultiAccountWarningOpen(false);
      setLocation('app');
      setIsSurveyModalOpen(true);
  }, []);

  const handleSurveyComplete = useCallback((selection: string) => {
    console.log(`User survey selection: ${selection}`);
    updateAndPersistSettings(prev => ({
        ...prev,
        hasCompletedOnboardingSurvey: true,
    }));
    setIsSurveyModalOpen(false);
    setActiveModal('soulNotes');
  }, [updateAndPersistSettings]);

  const handleStartSoulCreation = useCallback((template: SoulTemplate) => {
    setOnboardingTemplate(template);
    setLocation('soul-hello');
  }, []);

  const handleFinalizeSoulCreation = useCallback(async () => {
      if (onboardingTemplate) {
          await createAndAddNewSoul(onboardingTemplate);
      }
      setOnboardingTemplate(null);
      setLocation('app');
  }, [onboardingTemplate, createAndAddNewSoul]);

  const handleCancelSoulCreation = useCallback(() => {
    setOnboardingTemplate(null);
    setLocation('discover-onboarding');
  }, []);
  

  const handleAdminDeleteMessage = useCallback(async (messageId: string) => {
    if (!currentUser || !activeSoul) return;
    
    // Optimistically update UI
    setMessages(prev => prev.filter(m => m.id !== messageId));

    // Asynchronously delete from storage
    await deleteMessage(messageId, currentUser.id, activeSoul.id);
  }, [currentUser, activeSoul]);
  
  const handleDeleteMemory = useCallback(async (memoryId: string) => {
    if (!currentUser || !activeSoul) return;
    const success = await deleteConsolidatedMemory(currentUser.id, activeSoul.id, memoryId);
    if (success) {
      const updatedMemories = consolidatedMemories.filter(m => m.id !== memoryId);
      setConsolidatedMemories(updatedMemories);
      setMemoriesForModal(updatedMemories); // also update the modal's view
    }
  }, [currentUser, activeSoul, consolidatedMemories]);

  const handleUpdateMemory = useCallback(async (memoryId: string, newSummary: string) => {
    if (!currentUser || !activeSoul) return;
    const updatedMemory = await updateConsolidatedMemory(currentUser.id, activeSoul.id, memoryId, newSummary).catch(e => handleStorageError(e, 'updating memory'));
    if (updatedMemory) {
        const updatedMemories = consolidatedMemories.map(m => m.id === memoryId ? updatedMemory : m);
        setConsolidatedMemories(updatedMemories);
        setMemoriesForModal(updatedMemories);
    }
  }, [currentUser, activeSoul, consolidatedMemories, handleStorageError]);
  
  const handleAddMemory = useCallback(async (summary: string) => {
    if (!currentUser || !activeSoul || !summary.trim()) return;

    try {
        const timestamp = new Date();
        const formattedDate = timestamp.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        const finalSummary = `${activeSoul.name}'s memory on ${formattedDate}: ${summary.trim()}`;

        const newMemory: LongTermMemory = {
            id: crypto.randomUUID(),
            user_id: currentUser.id,
            soul_id: activeSoul.id,
            summary: finalSummary,
            timestamp: timestamp.toISOString(),
        };
        
        await addConsolidatedMemory(newMemory);
        const newMemories = [...consolidatedMemories, newMemory];
        setConsolidatedMemories(newMemories);
        setMemoriesForModal(newMemories);
    } catch (e) {
        console.error("Failed to add manual memory:", e);
        handleStorageError(e, 'adding manual memory');
    }
  }, [currentUser, activeSoul, consolidatedMemories, handleStorageError]);

  const hasUnreadMail = useMemo(() => {
    return accountSettings.mailMessages?.some(m => !m.isRead) || false;
  }, [accountSettings.mailMessages]);

    const handleBuyBooster = (pack: BoosterPack, isDiscounted: boolean) => {
        updateAndPersistSettings(prev => {
            const price = isDiscounted ? Math.max(0, pack.cost - 100) : pack.cost;

            if ((prev.soulShards || 0) < price) {
                setToast({ title: "Insufficient Shards", message: "You don't have enough Soul Shards to purchase this pack." });
                return prev;
            }
            const newBoosters = [...(prev.boosterPacks || []), { ...pack, id: `booster-${Date.now()}` }];
            const newShards = (prev.soulShards || 0) - price;
            
            const newDailyState = { ...prev.dailyRewardState };
            if (isDiscounted) {
                newDailyState.dailyBoosterDiscountUsed = true;
            }
            
            setToast({ title: "Purchase Successful", message: `${pack.name} has been added to your collection.` });

            return { 
                ...prev, 
                soulShards: newShards, 
                boosterPacks: newBoosters,
                dailyRewardState: newDailyState,
            };
        });
    };

    const handleInitiateAuction = useCallback((card: GroupedTemplate) => {
        setCardForAuction(card);
        setInitialVaultTab('my-auctions');
        handleOpenModal('vault');
        setIsCollectionDrawerOpen(false);
    }, [handleOpenModal]);

    const handleFindInMarketplace = useCallback((template: SoulTemplate) => {
        if (!template.soulId) {
            setToast({ title: "Not Found", message: "This Soul does not have a unique ID and cannot be searched in the marketplace." });
            return;
        }
        setInitialMarketplaceSearch(`=soulid:${template.soulId}`);
        setInitialVaultTab('soul-search');
        handleOpenModal('vault');
    }, [setToast, handleOpenModal]);
    
    const handleAddNewlyCreatedSoul = useCallback((createdSoul: Soul) => {
        updateAndPersistSettings(prev => ({
            ...prev,
            souls: [...prev.souls, createdSoul],
            activeSoulId: createdSoul.id,
        }));
        handleOpenModal(null); // Close the explore modal
        setToast({ title: "Soul Created", message: `${createdSoul.name} is now ready to chat!` });
    }, [updateAndPersistSettings, handleOpenModal, setToast]);
    
    const handleCreateAndAddSoulToDock = useCallback((template: SoulTemplate, instanceId: string, index?: number) => {
        const benefits = getSubscriptionBenefits(accountSettings);
        const activeSoulsCount = (accountSettings.dockedSoulIds || []).filter(id => id !== null).length;

        if (activeSoulsCount >= benefits.soulSlots) {
            setToast({
                title: "No Soul Slots Available",
                message: "Please upgrade or free up a slot to add this Soul."
            });
            return;
        }
        
        const instance = accountSettings.ownedTemplates?.find(t => t.instanceId === instanceId);
        createAndAddNewSoul(template, instance, index);

        updateAndPersistSettings(prev => {
            const updatedOwnedTemplates = (prev.ownedTemplates || []).filter(t => t.instanceId !== instanceId);
            return { ...prev, ownedTemplates: updatedOwnedTemplates };
        });

    }, [accountSettings, createAndAddNewSoul, updateAndPersistSettings, setToast]);

    const handleUpdateDockOrder = useCallback((newDockedOrder: (string | null)[]) => {
        updateAndPersistSettings(prev => ({ ...prev, dockedSoulIds: newDockedOrder }));
    }, [updateAndPersistSettings]);

    const handleViewOlderMessages = useCallback(() => {
        if (displayedMessagesCount < messages.length) {
            setDisplayedMessagesCount(prev => Math.min(prev + MESSAGES_TO_REVEAL, messages.length));
        } else if (hasMoreMessages) {
            loadMoreMessages();
        }
    }, [displayedMessagesCount, messages.length, hasMoreMessages, loadMoreMessages]);

    if (!currentUser) {
        const nonAuthLocations = ['landing', 'login-options', 'login', 'check-mail', 'welcome', 'discover-onboarding', 'soul-hello', 'terms', 'user-guide'];
        if (!nonAuthLocations.some(l => location.startsWith(l))) {
            setLocation('landing');
        }
    }
    
    const visibleMessages = messages.slice(-displayedMessagesCount);
    const hasOlderMessagesToLoad = displayedMessagesCount < messages.length || hasMoreMessages;

    const appContent = useMemo(() => {
      const soulTemplate = allPredefinedSouls.find(t => t.name === activeSoul?.templateName);
      
      let soulTemplateImageUrl = soulTemplate?.bgImageUrls?.[0]
          ? (typeof soulTemplate.bgImageUrls[0] === 'string' ? soulTemplate.bgImageUrls[0] : soulTemplate.bgImageUrls[0].url)
          : null;
          
      if (!soulTemplateImageUrl) {
          soulTemplateImageUrl = activeSoul?.avatar || null;
      }
      
      return (
        <div className="relative flex flex-col h-full w-full text-white overflow-hidden" style={{ background: 'var(--bg-main)' }}>
            {isAvatarVisible && soulTemplateImageUrl && (
                <div
                    className="absolute inset-0 bg-cover bg-top transition-opacity duration-500 opacity-20 pointer-events-none z-0"
                    style={{ 
                        backgroundImage: `url(${soulTemplateImageUrl})`,
                    }}
                />
            )}

            <div className="relative z-10 flex flex-col h-full">
                <TopBarContainer
                    accountSettings={accountSettings}
                    activeSoul={activeSoul}
                    allPredefinedSouls={allPredefinedSouls}
                    hasUnreadMail={hasUnreadMail}
                    onOpenCollection={() => setIsCollectionDrawerOpen(prev => !prev)}
// FIX: The variable 'isCollectionOpen' does not exist. The correct state variable is 'isCollectionDrawerOpen'.
                    isCollectionOpen={isCollectionDrawerOpen}
                    onOpenSeason={() => handleOpenModal('seasonPass')}
                    onOpenSoulNotes={() => handleOpenModal('soulNotes')}
                    onOpenMarketplace={() => { setInitialVaultTab('store'); handleOpenModal('vault'); }}
                    onOpenSoulBoard={() => {
                        setSoulBoardInitialState({ view: 'feed', soulId: null });
                        handleOpenModal('soulBoard');
                    }}
                    onOpenCodex={() => handleOpenModal('homeMenu')}
                    onOpenSelfiePage={() => handleOpenModal('selfie')}
                    onOpenVoiceCall={() => handleOpenModal('voiceCall')}
                    onOpenInbox={() => handleOpenModal('inbox')}
                    onOpenMenu={() => handleOpenModal('menu')}
                />

                <div className="flex-1 flex flex-col min-h-0 pb-28">
                    <div>
                        {activeSoul && activeSoul.deletionTimestamp && <DeletionWarningBar soul={activeSoul} />}
                        {accountSettings.subscriptionTier === 'Free' && !accountSettings.adminMode && (
                            <SubscriptionBanner onUpgrade={() => setIsSubscriptionPageOpen(true)} />
                        )}
                        <MiddleBar
                            accountSettings={accountSettings}
                            activeSoul={activeSoul}
                            firstBotMessageExists={firstBotMessageExists}
                            isAvatarVisible={isAvatarVisible}
                            setIsAvatarVisible={setIsAvatarVisible}
                            hasFavorites={(accountSettings.favoriteMessages?.length || 0) > 0}
                            setIsSubscriptionPageOpen={setIsSubscriptionPageOpen}
                            setIsModelSelectorOpen={setIsModelSelectorOpen}
                            setIsStyleSelectorOpen={setIsStyleSelectorOpen}
                            setIsFavoritesOpen={setIsFavoritesOpen}
                            setSoulBoardInitialState={setSoulBoardInitialState}
                            onOpenModal={handleOpenModal}
                        />
                    </div>

                    <div className="flex-1 flex items-center justify-center min-h-0">
                      {activeSoul ? (
                         <ChatPanel
                            messages={visibleMessages}
                            onSendMessage={handleSendMessage}
                            isLoading={isLoading}
                            onContinueMessage={handleContinueMessage}
                            onTweakMessage={handleTweakMessage}
                            onRegenerateMessage={handleOpenRegenerateModal}
                            onOpenChatBreakModal={handleOpenChatBreakModal}
                            onShowMemory={handleShowConsolidatedMemories}
                            activeSoul={activeSoul}
                            accountSettings={accountSettings}
                            onGenerateUserReply={handleGenerateUserReply}
                            onContinueUserReply={handleContinueUserReply}
                            onToggleFavorite={handleToggleFavorite}
                            onEditUserMessage={handleEditUserMessage}
                            onAutoSelfie={handleAutoSelfie}
                            hasOlderMessagesToLoad={hasOlderMessagesToLoad}
                            onViewOlderMessages={handleViewOlderMessages}
                            isLoadingMoreMessages={isLoadingMoreMessages}
                            isInitialLoading={isInitialLoadRef.current && isLoading}
                            onUnstuckSoul={handleUnstuckSoul}
                            highlightedMessageId={highlightedMessageId}
                            setHighlightedMessageId={setHighlightedMessageId}
                            showScrollToBottom={showScrollToBottom}
                            setShowScrollToBottom={setShowScrollToBottom}
                            speakingMessageId={speakingMessageId}
                            onPlayPauseSpeech={handlePlayPauseSpeech}
                            messageVersions={messageVersions}
                            onCycleMessageVersion={handleCycleMessageVersion}
                         />
                      ) : (
                          <div className="text-center text-neutral-500">
                              <p>No Soul selected. Create a new Soul or select one from your dock.</p>
                          </div>
                      )}
                    </div>
                </div>

                <Dock
                    accountSettings={accountSettings}
                    setAccountSettings={updateAndPersistSettings}
                    isDockEditing={isDockEditing}
                    setIsDockEditing={setIsDockEditing}
                    onOpenCreateModal={() => handleOpenModal('explore')}
                    onViewTemplate={handleViewTemplate}
                    onOpenDeletionModal={handleOpenDeletionModal}
                    onImmediateDelete={handleImmediateDelete}
                    onCancelDeletion={handleCancelDeletion}
                    onUpdateDockOrder={handleUpdateDockOrder}
                    onCreateSoulFromTemplate={handleCreateAndAddSoulToDock}
                    onCreateSoulFromScratch={handleStartCreationFromScratch}
                    onReturnSoulToCollection={handleReturnSoulToCollection}
                    onOpenManageDock={() => setIsManageDockOpen(true)}
                    onOpenManageDocks={() => setIsManageDocksOpen(true)}
                    dnd={dnd}
                />
            </div>
        </div>
    );
  }, [
    accountSettings, activeSoul, allPredefinedSouls, hasUnreadMail, isCollectionDrawerOpen, 
    isDockEditing, firstBotMessageExists, isAvatarVisible, isLoading, 
    isLoadingMoreMessages, highlightedMessageId, 
    showScrollToBottom, speakingMessageId, messageVersions, handlePlayPauseSpeech, 
    handleGenerateUserReply, handleContinueUserReply, 
    updateAndPersistSettings, handleCreateAndAddSoulToDock, handleUpdateDockOrder, 
    handleViewTemplate, handleOpenDeletionModal, handleImmediateDelete, handleCancelDeletion, 
    handleStartCreationFromScratch, handleReturnSoulToCollection, visibleMessages, 
    hasOlderMessagesToLoad, handleViewOlderMessages, dnd, handleOpenModal, handleSendMessage, 
    handleContinueMessage, handleTweakMessage, handleOpenRegenerateModal, handleOpenChatBreakModal, 
    handleShowConsolidatedMemories, handleToggleFavorite, handleEditUserMessage, handleAutoSelfie, 
    handleUnstuckSoul, handleCycleMessageVersion, setIsAvatarVisible, setIsSubscriptionPageOpen, 
    setIsModelSelectorOpen, setIsStyleSelectorOpen, setIsFavoritesOpen, setSoulBoardInitialState, 
    setIsCollectionDrawerOpen, setIsManageDockOpen, setIsManageDocksOpen, setHighlightedMessageId, 
    setShowScrollToBottom
  ]);

  const mainContent = useMemo(() => {
    switch (location) {
        case 'landing':
            return <LandingPage onNavigate={() => setLocation('login-options')} />;
        case 'login-options':
            return <LoginOptions onNavigate={(location) => setLocation(location)} />;
        case 'login':
            return <LoginScreen onEmailSubmit={handleEmailSubmit} onNavigateBack={() => setLocation('login-options')} />;
        case 'check-mail':
            return <CheckMail email={onboardingEmail} onSendAgain={() => setLocation('login')} onNavigateToTerms={() => setLocation('terms')} />;
        case 'welcome':
            return <Welcome onNext={handleWelcomeNext} onExit={() => { logout(); setLocation('landing'); }} error={welcomeError} clearError={() => setWelcomeError('')} />;
        case 'discover-onboarding':
            return <DiscoverPage isOpen={true} onClose={() => {}} onOpenCreateModal={handleStartCreationFromScratch} onCreateFromTemplate={handleStartSoulCreation} isMandatory={true} accountSettings={accountSettings} templates={discoverableSouls} />;
        case 'soul-hello':
            return onboardingTemplate ? <SoulHello template={onboardingTemplate} userName={accountSettings.userName} onFinish={handleFinalizeSoulCreation} onBack={handleCancelSoulCreation} onClose={handleCancelSoulCreation} /> : <LandingPage onNavigate={() => setLocation('login-options')}/>;
        case 'terms':
            return <TermsPage onBack={() => setLocation(currentUser ? 'app' : 'landing')} />;
        case 'user-guide':
            return <UserGuide onBack={() => setLocation('app')} accountSettings={accountSettings} setAccountSettings={updateAndPersistSettings} />;
        case 'app':
            return appContent;
        default:
            return <LandingPage onNavigate={() => setLocation('login-options')} />;
    }
  }, [
      location, currentUser, onboardingEmail, accountSettings, welcomeError,
      onboardingTemplate, discoverableSouls, appContent,
      handleEmailSubmit, handleWelcomeNext, handleStartCreationFromScratch, handleStartSoulCreation, handleFinalizeSoulCreation, handleCancelSoulCreation, logout, updateAndPersistSettings
  ]);

  return (
    <>
        <DragLayer 
            draggedItem={dnd.draggedItem}
            draggedItemType={dnd.draggedItemType}
            draggedPosition={dnd.draggedPosition}
        />
        {mainContent}
        
        {/* {location === 'app' && !isMobile && <GlobalLiveChat />} */}

        {location === 'app' && accountSettings.adminMode && activeSoul && <DebugStats messages={messages} consolidatedMemories={consolidatedMemories} accountSettings={accountSettings} activeSoul={activeSoul} />}
        
        {toast && (
            <ToastNotification
                title={toast.title}
                message={toast.message}
                onClose={() => setToast(null)}
            />
        )}
        
        {/* --- Centralized Modals & Drawers --- */}

        {/* 1. Collection */}
        <CollectionDrawer
            isOpen={isCollectionDrawerOpen}
            onClose={() => setIsCollectionDrawerOpen(false)}
            accountSettings={accountSettings}
            setAccountSettings={updateAndPersistSettings}
            setToast={setToast}
            templates={allPredefinedSouls}
            onOpenDiscoverModal={() => handleOpenModal('explore')}
            onViewTemplate={handleViewTemplate}
            onPinSoul={handlePinSoul}
            onOpenDeletionModal={handleOpenDeletionModal}
            onCancelDeletion={handleCancelDeletion}
            onImmediateDelete={handleImmediateDelete}
            onInitiateAuction={handleInitiateAuction}
            onFindInMarketplace={handleFindInMarketplace}
            onCreateSoulFromTemplate={handleCreateAndAddSoulToDock}
            isDockEditing={isDockEditing}
            onReturnSoulToCollection={handleReturnSoulToCollection}
            onUnlockTemplate={handleOpenUnlockTemplateModal}
            dnd={dnd}
        />

        {/* 2. Season Pass (formerly Daily Rewards) */}
        <ResponsiveFunctionWindow isOpen={activeModal === 'seasonPass'} onClose={() => handleOpenModal(null)} title="Season Pass" functionName="seasonPass">
            <DailyRewardsModal isOpen={activeModal === 'seasonPass'} onClose={() => handleOpenModal(null)} accountSettings={accountSettings} setAccountSettings={updateAndPersistSettings} setToast={setToast} currentUser={currentUser} />
        </ResponsiveFunctionWindow>

        {/* 3. Community (formerly Soul Notes/News) */}
         <ResponsiveFunctionWindow isOpen={activeModal === 'soulNotes'} onClose={() => handleOpenModal(null)} title=" " functionName="soulNotes">
             <SoulNotesPage isOpen={activeModal === 'soulNotes'} onClose={() => handleOpenModal(null)} onNavigate={setLocation} />
        </ResponsiveFunctionWindow>

        {/* 4. Vault of Essence (formerly Marketplace) */}
        <ResponsiveFunctionWindow isOpen={activeModal === 'vault'} onClose={() => handleOpenModal(null)} title="Vault of Essence" functionName="vault">
            <VaultOfEssence 
                isOpen={activeModal === 'vault'} 
                onClose={() => handleOpenModal(null)} 
                accountSettings={accountSettings}
                onBuyBooster={handleBuyBooster}
                setToast={setToast}
                setAccountSettings={updateAndPersistSettings}
                cardForAuction={cardForAuction}
                setCardForAuction={setCardForAuction}
                initialTab={initialVaultTab}
                initialSearch={initialMarketplaceSearch}
                allSouls={allPredefinedSouls}
            />
        </ResponsiveFunctionWindow>

        <ResponsiveFunctionWindow isOpen={activeModal === 'forgeOfEssence'} onClose={() => handleOpenModal(null)} title="Forge of Essence" functionName="vault">
            <ForgeOfEssence isOpen={activeModal === 'forgeOfEssence'} onClose={() => handleOpenModal(null)} />
        </ResponsiveFunctionWindow>

        <ResponsiveFunctionWindow isOpen={activeModal === 'storytellersGuild'} onClose={() => handleOpenModal(null)} title="Storyteller's Guild" functionName="vault">
          <div className="h-full flex items-center justify-center text-neutral-500">Coming Soon</div>
        </ResponsiveFunctionWindow>
        
        {/* 5. SoulBoard */}
        <ResponsiveFunctionWindow isOpen={activeModal === 'soulBoard'} onClose={() => handleOpenModal(null)} title="SoulBoard" functionName="soulBoard">
            <SoulBoardPage isOpen={activeModal === 'soulBoard'} onClose={() => handleOpenModal(null)} accountSettings={accountSettings} setAccountSettings={setAccountSettings} initialState={soulBoardInitialState} soulTemplates={allPredefinedSouls} />
        </ResponsiveFunctionWindow>
        
        {/* 6. Codex (formerly Home Menu) */}
        <ResponsiveFunctionWindow isOpen={activeModal === 'homeMenu'} onClose={() => handleOpenModal(null)} title="" transparentBg={true} functionName="homeMenu">
            <HomeMenuWrapper
                isOpen={activeModal === 'homeMenu'}
                onClose={() => handleOpenModal(null)}
                accountSettings={accountSettings}
                setAccountSettings={setAccountSettings}
                activeSoul={activeSoul}
                setActiveSoul={handleUpdateSoul}
                onOpenCreateModal={() => handleOpenModal('explore')}
                onOpenDiscoverModal={() => handleOpenModal('explore')}
                onViewTemplate={handleViewTemplate}
                onPinSoul={handlePinSoul}
                onOpenDeletionModal={handleOpenDeletionModal}
                onCancelDeletion={handleCancelDeletion}
                onImmediateDelete={handleImmediateDelete}
                setToast={setToast}
                applyPersona={applyPersona}
                onOpenSubscriptionPage={() => setIsSubscriptionPageOpen(true)}
                onOpenUnlockModal={handleOpenUnlockModal}
                onOpenJournalModal={() => setIsJournalModalOpen(true)}
            />
        </ResponsiveFunctionWindow>

        {/* 7. Explore & Soul Creation Flow */}
        <ExplorePage
            isOpen={activeModal === 'explore'}
            onClose={() => handleOpenModal(null)}
            accountSettings={accountSettings}
            templates={discoverableSouls}
            onSoulCreated={handleAddNewlyCreatedSoul}
            setToast={setToast}
            currentUser={currentUser}
        />
        
        {/* 8. Selfie */}
        <ResponsiveFunctionWindow isOpen={activeModal === 'selfie'} onClose={() => handleOpenModal(null)} title="Selfie & Scene Generator" functionName="selfie">
            <SelfiePage isOpen={activeModal === 'selfie'} onClose={() => handleOpenModal(null)} activeSoul={activeSoul} onUpdateSoul={handleUpdateSoul} messages={messages} accountSettings={accountSettings} isLoading={isLoading} setToast={setToast} />
        </ResponsiveFunctionWindow>

        {/* 9. General Settings */}
        <GeneralSettingsWrapper 
            isOpen={activeModal === 'generalSettings'} 
            onClose={() => handleOpenModal(null)} 
            accountSettings={accountSettings}
            setAccountSettings={updateAndPersistSettings}
            setPreviewTheme={setPreviewTheme}
            currentUser={currentUser}
            onOpenJournalModal={() => setIsJournalModalOpen(true)}
        />

        <MenuPrompt
            isOpen={activeModal === 'menu'}
            onClose={() => handleOpenModal(null)}
            onOpenOptions={() => {
                handleOpenModal(null); // Close menu prompt
                handleOpenModal('generalSettings');
            }}
            onOpenSupport={() => {
                setLocation('user-guide');
                handleOpenModal(null);
            }}
            onLogout={() => {
                logout();
                handleOpenModal(null);
            }}
        />

        {/* 10. Voice Call */}
        <ResponsiveFunctionWindow isOpen={activeModal === 'voiceCall'} onClose={() => handleOpenModal(null)} title="Voice Call" functionName="voiceCall">
             <VoiceCallOverlay 
                isOpen={activeModal === 'voiceCall'} 
                onClose={() => handleOpenModal(null)} 
                onOpenSettings={() => setIsVoiceCallSettingsOpen(true)}
                onSendMessage={(text, isFromVoice) => handleSendMessage(text, {}, isFromVoice)}
                activeSoul={activeSoul}
                accountSettings={accountSettings}
                isLoading={isLoading}
                isSpeaking={isSpeaking}
                setAccountSettings={updateAndPersistSettings}
                setToast={setToast}
             />
        </ResponsiveFunctionWindow>
        
        {/* 11. Inbox */}
        <ResponsiveFunctionWindow isOpen={activeModal === 'inbox'} onClose={() => handleOpenModal(null)} title="Inbox" functionName="inbox">
            <InboxModal 
                accountSettings={accountSettings}
                setAccountSettings={updateAndPersistSettings}
                setToast={setToast}
                currentUser={currentUser}
                allPredefinedSouls={allPredefinedSouls}
            />
        </ResponsiveFunctionWindow>
        
        <FunctionWindow isOpen={isManageDockOpen} onClose={() => setIsManageDockOpen(false)} title="New Dock">
            <ManageDock />
        </FunctionWindow>
        <FunctionWindow isOpen={isManageDocksOpen} onClose={() => setIsManageDocksOpen(false)} title="Manage Docks">
            <ManageDocks />
        </FunctionWindow>


        {/* --- Create Soul from Scratch Modal --- */}
        {createSoulView && (
            <ResponsiveFunctionWindow isOpen={true} onClose={() => setCreateSoulView(null)} title="Create a New Soul" transparentBg={createSoulView === 'create-hello'} functionName="createSoul">
                {createSoulView === 'create-name' && <NameYourSoul data={newSoulData} onUpdate={handleUpdateNewSoul} onNext={() => setCreateSoulView('create-look')} onBack={() => setCreateSoulView(null)} onClose={() => setCreateSoulView(null)} />}
                {createSoulView === 'create-look' && <LookYourSoul data={newSoulData} onUpdate={handleUpdateNewSoul} onNext={() => setCreateSoulView('create-what')} onBack={() => setCreateSoulView('create-name')} onClose={() => setCreateSoulView(null)} setToast={setToast}/>}
                {createSoulView === 'create-what' && <WhatYourSoul data={newSoulData} onUpdate={handleUpdateNewSoul} onNext={() => setCreateSoulView('create-hello')} onBack={() => setCreateSoulView('create-look')} onClose={() => setCreateSoulView(null)} accountSettings={accountSettings} />}
                {createSoulView === 'create-hello' && <HelloYourSoul data={newSoulData} onFinish={handleFinalizeSoulCreationFromScratch} onBack={() => setCreateSoulView('create-what')} onClose={() => setCreateSoulView(null)} />}
            </ResponsiveFunctionWindow>
        )}

        {/* --- Standalone Modals (not in FunctionWindow) --- */}
        <UserAvatarModal
            isOpen={activeModal === 'userAvatar'}
            onClose={() => handleOpenModal(null)}
            onSave={(avatarData) => {
                updateAndPersistSettings(prev => ({...prev, ...avatarData}));
                handleOpenModal(null);
            }}
            accountSettings={accountSettings}
        />
        
        {isTweakModalOpen && messageToTweak && (
            <Modal isOpen={isTweakModalOpen} onClose={() => setIsTweakModalOpen(false)} title="Tweak AI Message" closeOnBackdropClick={false}>
                <TweakMessageModal
                    message={messageToTweak}
                    onSave={handleSaveTweak}
                    onClose={() => setIsTweakModalOpen(false)}
                    accountSettings={accountSettings}
                />
            </Modal>
        )}
        
         {isUserTweakModalOpen && userMessageToTweak && (
            <Modal isOpen={isUserTweakModalOpen} onClose={handleCloseUserTweakModal} title="Edit Your Message">
                <TweakMessageModal
                    message={userMessageToTweak}
                    onSave={handleSaveUserTweak}
                    onClose={handleCloseUserTweakModal}
                    accountSettings={accountSettings}
                />
            </Modal>
        )}

        <RegenerateModal 
            isOpen={isRegenerateModalOpen}
            onClose={() => setIsRegenerateModalOpen(false)}
            onRegenerate={handleRegenerate}
            originalMessageText={messageToRegenerate?.text || ''}
        />
        
        {isMemoryModalOpen && (
            <MemoryRecallModal
                isOpen={isMemoryModalOpen}
                onClose={() => setIsMemoryModalOpen(false)}
                soul={activeSoul}
                memories={memoriesForModal}
                onDeleteMemory={handleDeleteMemory}
                onUpdateMemory={handleUpdateMemory}
                onAddMemory={handleAddMemory}
            />
        )}
        
        {activeSoul && (
            <JournalModal
                isOpen={isJournalModalOpen}
                onClose={() => setIsJournalModalOpen(false)}
                soulName={activeSoul.name}
                journalEntries={activeSoul.journalEntries || []}
                onUpdateEntries={(newEntries) => handleUpdateSoul({ journalEntries: newEntries })}
            />
        )}
        
        {isChatBreakModalOpen && (
            <ChatBreakModal
                isOpen={isChatBreakModalOpen}
                onClose={() => setIsChatBreakModalOpen(false)}
                onConfirm={handleChatBreak}
                soulName={activeSoul?.name || "your Soul"}
            />
        )}
        
        {isVoiceCallSettingsOpen && (
            <VoiceCallSettingsModal
                isOpen={isVoiceCallSettingsOpen}
                onClose={() => setIsVoiceCallSettingsOpen(false)}
                accountSettings={accountSettings}
                setAccountSettings={updateAndPersistSettings}
                onChatBreak={handleOpenChatBreakModal}
            />
        )}

        <SubscriptionPage 
            isOpen={isSubscriptionPageOpen}
            onClose={() => setIsSubscriptionPageOpen(false)}
            onStartSubscription={() => alert('Subscription flow not implemented.')}
            onNavigate={setLocation}
        />

        {isTemplateModalOpen && soulToView && (
            <SoulTemplateModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                soul={soulToView}
                position="top"
            />
        )}

        {isDeletionModalOpen && soulToDelete && (
            <ScheduleForDeletionModal
                isOpen={isDeletionModalOpen}
                onClose={() => setIsDeletionModalOpen(false)}
                onConfirm={handleConfirmDeletion}
                soulName={soulToDelete.name}
            />
        )}
        
        <AudioPermissionModal
            isOpen={showAudioPermissionModal}
            onAllow={handleAllowAudio}
            onDeny={handleDenyAudio}
        />
        
        <UnstuckSoulModal 
            isOpen={isUnstuckModalOpen}
            onClose={() => setIsUnstuckModalOpen(false)}
            onConfirm={handleConfirmUnstuck}
        />
        
        {isUnlockModalOpen && soulToUnlock && (
            <Modal
                isOpen={isUnlockModalOpen}
                onClose={() => setIsUnlockModalOpen(false)}
                title={`Unlock ${soulToUnlock.name} for editing?`}
                maxWidth="max-w-lg"
            >
                <div className="p-6 space-y-4">
                    <p className="text-sm text-red-400">
                        Unlocking a collectible Soul will make it fully editable, but you will permanently lose its collectible status and it will no longer be tradable. This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button onClick={() => setIsUnlockModalOpen(false)} className="py-2 px-6 rounded-md text-sm font-medium transition-colors bg-neutral-700 hover:bg-neutral-600">
                            Cancel
                        </button>
                        <button onClick={handleConfirmUnlock} className="py-2 px-6 rounded-md text-sm font-medium transition-colors bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-90">
                            Unlock
                        </button>
                    </div>
                </div>
            </Modal>
        )}

        {isUnlockTemplateModalOpen && templateToUnlock && (
            <Modal
                isOpen={isUnlockTemplateModalOpen}
                onClose={() => setIsUnlockTemplateModalOpen(false)}
                title={`Unlock ${templateToUnlock.name} for editing?`}
                maxWidth="max-w-lg"
            >
                <div className="p-6 space-y-4">
                    <p className="text-sm text-red-400">
                        Unlocking a collectible Soul Template will make it fully editable once added to your dock, but you will permanently lose its collectible status and it will no longer be tradable or sellable. This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button onClick={() => setIsUnlockTemplateModalOpen(false)} className="py-2 px-6 rounded-md text-sm font-medium transition-colors bg-neutral-700 hover:bg-neutral-600">
                            Cancel
                        </button>
                        <button onClick={handleConfirmUnlockTemplate} className="py-2 px-6 rounded-md text-sm font-medium transition-colors bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-90">
                            Unlock
                        </button>
                    </div>
                </div>
            </Modal>
        )}

        {soulToReturn && (
            <ReturnToCollectionModal
                isOpen={!!soulToReturn}
                onClose={() => setSoulToReturn(null)}
                onConfirm={handleConfirmReturnToCollection}
                soul={soulToReturn}
            />
        )}

        <AdminDeleteMessagesModal
            isOpen={isAdminDeleteModalOpen}
            onClose={() => setIsAdminDeleteModalOpen(false)}
            messages={messages}
            onDeleteMessage={handleAdminDeleteMessage}
            soulName={activeSoul?.name || 'Soul'}
            userName={accountSettings.userName}
        />
        
        <MultiaccountWarningModal 
            isOpen={isMultiAccountWarningOpen}
            onClose={() => setIsMultiAccountWarningOpen(false)}
            onConfirm={handleMultiAccountConfirm}
        />
        <Modal 
            isOpen={isSurveyModalOpen} 
            onClose={() => { /* Prevent closing */ }} 
            title=""
            closeOnBackdropClick={false}
            maxWidth="max-w-md"
        >
            <OnboardingSurvey onComplete={handleSurveyComplete} />
        </Modal>

        {/* --- Panels --- */}
        <FloatingPanel
            isOpen={isModelSelectorOpen}
            onClose={() => setIsModelSelectorOpen(false)}
            title="Select AI Model"
            maxWidth="max-w-sm"
        >
            <ModelSelectorPanel activeSoul={activeSoul} onUpdateSoul={handleUpdateSoul} accountSettings={accountSettings} />
        </FloatingPanel>

        <FloatingPanel
            isOpen={isStyleSelectorOpen}
            onClose={() => setIsStyleSelectorOpen(false)}
            title="Select Roleplay Style"
            maxWidth="max-w-md"
        >
            <StyleSelectorPanel activeSoul={activeSoul} onUpdateSoul={handleUpdateSoul} />
        </FloatingPanel>

        <FloatingPanel
            isOpen={isFavoritesOpen}
            onClose={() => setIsFavoritesOpen(false)}
            title="Favorite Messages"
            maxWidth="max-w-md"
        >
            <FavoritesPanel messages={messages} accountSettings={accountSettings} activeSoul={activeSoul} onGoToMessage={handleGoToMessage} />
        </FloatingPanel>
    </>
  );
};

export default App;