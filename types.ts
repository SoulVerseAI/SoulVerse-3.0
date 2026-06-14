
export enum SoulRole {
    CHARACTER = 'Character',
    NARRATOR = 'Narrator',
    SCENARIO = 'Scenario',
    ASSISTANT = 'Assistant',
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  imageUrl?: string; // For UI display (can be blob URL)
  image?: { mimeType: string; data: string }; // For API (base64)
  isEdited?: boolean;
  isMeta?: boolean; // Flag for meta-conversation messages
  aiMessageIndexInSegment?: number;
}

export type Gender = 'Male' | 'Female' | 'Nonbinary' | null;
export type RoleplayStyle = 'Default' | 'Script' | 'Novel' | 'Star' | 'Short';

export interface Comment {
  id: string;
  username: string;
  avatar: string | null;
  text: string;
}

export interface Post {
  id: string;
  imageUrl?: string; 
  videoUrl?: string;
  mediaType?: 'image' | 'video';
  media?: {
    type: 'image' | 'video';
    url: string;
    aspectRatio: 'portrait' | 'landscape' | 'square';
    thumbnailUrl?: string;
  }[];
  caption: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Selfie {
  id: string;
  url: string;
  tags: string[]; // array of tag IDs
  timestamp: string;
  status?: 'pending' | 'completed' | 'failed';
  progress?: number;
}

export interface VideoSelfie {
  id: string;
  url: string;
  tags: string[]; // array of tag IDs
  timestamp: string;
}

export interface JournalEntry {
    id: string;
    keywords: string[];
    description: string;
}

export interface Soul {
  id: string;
  name: string;
  description: string;
  model: string;
  gender: Gender;
  avatar: string | null;
  // from BackstorySettings
  backstory: string;
  responseDirective: string;
  keyMemories: string;
  characterSheet?: string;
  greeting: string;
  exampleMessage: string;
  voiceURI: string | null;
  mbti: string | null;
  enneagram: string | null;
  // from GeneralSettings
  dynamism: number;
  thinkingBudget?: number;
  reasoningEffort?: number;
  antiRepeatStrength: number;
  memoryConsolidation: boolean;
  memoryRecall: boolean;
  maxTokens: number;
  roleplayStyle?: RoleplayStyle;
  // from Avatar Settings
  avatarStyle: 'Photoreal' | 'Anime';
  physicalAppearanceDescription: string;
  faceDetailEnhance: number; // 0 to 1
  faceDetailPrompt: string;
  enableNsfwSelfies: boolean;
  selfies: Selfie[];
  videoSelfies?: VideoSelfie[];
  selfieTags?: Tag[];
  followersCount: number;
  followingCount: number;

  // New SoulBoard fields
  username: string;
  bio: string;
  profileBannerUrl: string | null;
  posts: Post[];
  role?: SoulRole | null;

  templateName?: string;
  deletionTimestamp?: number;
  tiedPersonaId?: string | null;
  enableThinking?: boolean;
  journalEntries?: JournalEntry[];
  additionalContext?: string;
  
  // New properties
  soulId?: number;
  shareCode?: string;
  edition?: string;
  upgrade?: number;
  tradable?: boolean;
}

export interface Persona {
    id: string;
    name: string;
    userName: string;
    userGender: Gender;
    userBackstory: string;
    userAvatar: string | null;
    userAvatarStyle?: 'Photoreal' | 'Anime';
    userAvatarDescription?: string;
    userAvatarFaceDetailEnhance?: number;
    userAvatarFaceDetailPrompt?: string;
}

export interface SharedSoul {
  id: string;
  sourceSoulId: string;
  tagline: string;
  greetingMessage: string;
  name: string;
  gender: Gender;
  backstory: string;
  keyMemories: string;
  responseDirective: string;
  dynamism: number;
  avatar: string | null;
  shareCode: string;
  createdAt: string;
  referralCount: number;
  creatorName: string;
  isPublic: boolean;
}

export type SubscriptionTier = 'Free' | 'Premium' | 'Ultra' | 'Max';
export type TemplateQuality = 'Wisp' | 'Spirit' | 'Ascend' | 'Eternal';

// FIX: Moved SubscriptionBenefits interface here from subscriptionService.ts to be globally available.
export interface SubscriptionBenefits {
    soulSlots: number;
    userBackstoryChars: number;
    soulBackstoryChars: number;
    soulKeyMemoriesChars: number;
    soulResponseDirectiveChars: number;
    conversationContextChars: number;
    additionalBackstoryChars: number;
}

export interface MailMessage {
    id: string;
    from: string;
    title: string;
    body: string;
    timestamp: string;
    isRead: boolean;
    hasClaimable: boolean;
    claimableEssence?: number;
    claimableSoulShards?: number;
    attachedTemplate?: {
        name: string;
        quality: TemplateQuality;
    };
    isClaimed: boolean;
}

export interface StorePack {
    id: string;
    name: string;
    description: string;
    edition: string;
    price: number;
    imageUrl: string;
}

export interface BoosterPack {
    id: string;
    name: string;
    imageUrl: string;
    cost: number;
    description?: string;
    cardBackUrl?: string;
    pool?: 'marvel' | 'tvd' | 'starter' | 'tome';
}

export interface Auction {
    id: string;
    itemId: string;
    itemName: string;
    itemType: 'Blueprint' | 'Memory Pack';
    imageUrl: string | null;
    sellerName: string;
    startBid: number;
    buyoutPrice: number | null;
    currentBid: number;
    topBidderName: string | null;
    endTime: number; // timestamp
    quality: TemplateQuality;
    role: SoulRole | null;
    edition: string;
    template: SoulTemplate;
}

export interface Hotkey {
  command: string;
  label: string;
  key: string;
}

export interface AccountSettings {
    // My Profile
    userName: string;
    userGender: Gender;
    userBackstory: string;
    userAvatar: string | null;
    userAvatarStyle?: 'Photoreal' | 'Anime';
    userAvatarDescription?: string;
    userAvatarFaceDetailEnhance?: number;
    userAvatarFaceDetailPrompt?: string;

    // Souls
    souls: Soul[];
    activeSoulId: string | null;
    dockedSoulIds?: (string | null)[];
    quickSwitchSoulIds: string[];
    favoriteMessages: string[];

    // Personas
    personas: Persona[];
    // Global UI Toggles
    textStreaming: boolean;
    autoPlayAudio: boolean;
    directWritingStyle: boolean;
    enableNsfwMode: boolean;
    multiParagraphResponses: boolean;
    lightMode: boolean;
    gameMode?: boolean;
    
    // Beta/Admin Toggles
    adminMode: boolean;
    betaTesterMode: boolean;

    // Subscription & Rewards
    subscriptionTier: SubscriptionTier;
    dailyRewardState: {
        streak: number;
        lastClaimTimestamp: number | null; // Unix timestamp (ms) of the last claim
        claimedMissedDays?: string[]; // YYYY-MM-DD
        lastMessageCountReset?: number | null;
        dailyBoosterDiscountUsed?: boolean;
        seasonPoints?: number;
        claimedSeasonRewards?: number[];
    };
    referralEssence: number;
    soulShards: number;
    mailMessages?: MailMessage[];
    boosterPacks?: BoosterPack[];
    unlockedTemplateNames?: string[];
    ownedTemplates?: { name: string; quality: TemplateQuality; instanceId: string; upgrade?: number; tradable?: boolean; }[];
    pityTimers?: Record<string, any>;
    dailyMessageCount?: number;

    // Voice Call Settings
    voiceCallUnifiedHistory: boolean;
    voiceCallPushToTalk: boolean;
    voiceCallSpontaneousResponse: boolean;
    voiceCallPreferNarration: boolean;

    sharedSouls?: SharedSoul[];
    followedSoulsIds: string[];
    likedPostIds: string[];
    
    // Admin settings
    themeOverrides?: { [key: string]: string };
    activeTheme?: string;
    customBackgroundUrl?: string | null;
    isTesterPlanActive?: boolean; // For "SoulVerseTesting" password
    // Fix: Add missing properties for Google Sheets integration.
    googleSheetsId?: string | null;
    isGoogleSheetsLoggingEnabled?: boolean;
    testerRewardsApplied_v1?: boolean;
    redeemedCodes?: string[];
    hotkeys?: Hotkey[];
    displayHotkeys?: boolean;
    hasCompletedOnboardingSurvey?: boolean;
}

export interface GoogleAuthState {
    isSignedIn: boolean;
    userEmail: string | null;
    error: string | null;
}

export type DrawerContent = 'main-menu' | 'my-souls' | 'collection' | 'general-settings' | 'backstory' | 'voice' | 'avatar' | 'billing' | 'admin-panel' | 'sharing-referrals';
export interface JournalEntry {
  id: string;
  user_id: string;
  soul_id: string | null; // null for global entries
  keyphrases: string[];
  content: string;
}

export interface LongTermMemory {
  id: string;
  user_id: string;
  soul_id: string;
  summary: string;
  timestamp: string;
}

export interface SoulTemplate {
  name: string; 
  title: string; 
  longDescription: string; 
  gender: Gender;
  tags: string[];
  mainCategory?: 'Companions & Partners' | 'Interactive Adventures' | 'RPG' | 'Assistants & Learning';
  backstory: string;
  responseDirective: string;
  keyMemories: string;
  characterSheet?: string;
  greeting: string;
  exampleMessage?: string;
  bgImageUrls: any[];
  bgVideoUrl?: string;
  smallAvatarUrl: string;
  dynamism: number;
  mbti?: string | null;
  enneagram?: string | null;
  profileBannerUrl?: string | null;
  posts?: Post[];
  role?: SoulRole;
  creatorName?: string;
  label?: string;
  quality?: TemplateQuality;
  // New properties
  soulId?: number;
  shareCode?: string;
  edition: string;
  tradable?: boolean;
  upgrade?: number;
  // FIX: Add missing aimodel property to the SoulTemplate interface.
  aimodel?: string;
}

export interface GroupedTemplate {
    template: SoulTemplate;
    instances: { quality: TemplateQuality; instanceId: string; tradable?: boolean; }[];
}

export type VaultTab = 'store' | 'soul-search' | 'my-auctions' | 'currency' | 'watch-list' | 'billing';
// FIX: Add Card and GameState types for the card game feature.
export type CardFaction = 'Solari' | 'Shadow';

export interface Card {
    id: string;
    instanceId?: string;
    name: string;
    cost: number;
    power: number;
    health: number;
    imageUrl: string;
    faction: CardFaction;
    cardType: string;
}

export interface PlayerState {
    hp: number;
    mana: number;
    maxMana: number;
    deck: Card[];
    hand: Card[];
    board: (Card | null)[];
}

export interface GameState {
    phase: 'DECK_BUILDING' | 'IN_GAME' | 'GAME_OVER';
    player: PlayerState;
    ai: PlayerState;
    turn: 'PLAYER' | 'AI';
    winner: 'PLAYER' | 'AI' | null;
}
