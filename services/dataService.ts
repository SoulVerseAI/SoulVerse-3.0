
import { AccountSettings, Soul, ChatMessage, LongTermMemory, SharedSoul, MailMessage } from '../types';

// List of admin emails
const ADMIN_EMAILS = [
  'soulverseai@gmail.com',
  'gkryniecki@gmail.com',
];

const TESTER_EMAILS = [
  'krzychu02209@gmail.com',
  'zdzieedy@gmail.com',
  'savitar@soulverse.ai',
  'caro@soulverse.ai',
  'da.cz@o2.pl',
];

// --- Local Storage Core ---

const LS_SETTINGS_PREFIX = 'soulverse_settings_';
const LS_MESSAGES_PREFIX = 'soulverse_messages_';
const LS_MEMORIES_PREFIX = 'soulverse_memories_';

// Helper to get all keys with a specific prefix
const getKeysByPrefix = (prefix: string): string[] => {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
            keys.push(key);
        }
    }
    return keys;
};

// Pruning function to clear oldest data
const pruneLocalStorage = () => {
    console.warn("LocalStorage quota exceeded. Pruning oldest messages.");

    let allMessages: (ChatMessage & { storageKey: string })[] = [];
    const messageKeys = getKeysByPrefix(LS_MESSAGES_PREFIX);
    messageKeys.forEach(key => {
        try {
            const messages: ChatMessage[] = JSON.parse(localStorage.getItem(key) || '[]');
            allMessages.push(...messages.map(m => ({ ...m, storageKey: key })));
        } catch (e) { console.error(`Failed to parse messages from ${key}`, e); }
    });
    
    // Sort oldest first
    allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Remove 20% of the oldest messages
    const messagesToRemoveCount = Math.ceil(allMessages.length * 0.2);
    const messagesToRemove = allMessages.slice(0, messagesToRemoveCount);

    // Group by storageKey to reduce localStorage reads/writes
    const messagesGroupedByKey: Record<string, ChatMessage[]> = {};
    messageKeys.forEach(key => messagesGroupedByKey[key] = JSON.parse(localStorage.getItem(key) || '[]'));
    
    messagesToRemove.forEach(msg => {
        const index = messagesGroupedByKey[msg.storageKey].findIndex(m => m.id === msg.id);
        if (index > -1) {
            messagesGroupedByKey[msg.storageKey].splice(index, 1);
        }
    });

    Object.entries(messagesGroupedByKey).forEach(([key, messages]) => {
        try {
            localStorage.setItem(key, JSON.stringify(messages));
        } catch (e) { /* ignore subsequent errors during pruning */ }
    });
    
    console.log(`Pruned ${messagesToRemove.length} messages to free up space. Consolidated memories were not affected.`);
};

// Generic save/get with error handling and pruning
const saveItem = (key: string, value: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        const isQuotaError = error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED');
        if (isQuotaError) {
            pruneLocalStorage();
            try {
                // Retry saving after pruning
                localStorage.setItem(key, JSON.stringify(value));
            } catch (retryError) {
                console.error(`Failed to save item '${key}' even after pruning.`, retryError);
                throw retryError; // re-throw to be caught by caller
            }
        } else {
            console.error(`Failed to save item '${key}'.`, error);
            throw error; // re-throw
        }
    }
};

const getItem = <T>(key: string): T | null => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error(`Failed to get item '${key}'.`, error);
        return null;
    }
};

const getDefaultAccountSettings = (email: string): AccountSettings => ({
    userName: email.split('@')[0] || "User",
    userGender: null,
    userBackstory: "",
    userAvatar: null,
    userAvatarStyle: 'Photoreal',
    userAvatarDescription: '',
    userAvatarFaceDetailEnhance: 0.3,
    userAvatarFaceDetailPrompt: '',
    personas: [],
    souls: [],
    activeSoulId: null,
    dockedSoulIds: Array(20).fill(null),
    quickSwitchSoulIds: [],
    favoriteMessages: [],
    textStreaming: true,
    autoPlayAudio: false,
    lightMode: false,
    directWritingStyle: true,
    enableNsfwMode: true,
    multiParagraphResponses: true,
    adminMode: false,
    betaTesterMode: false,
    subscriptionTier: 'Free',
    dailyRewardState: { streak: 0, lastClaimTimestamp: null, claimedMissedDays: [] },
    referralEssence: 0,
    soulShards: 0,
    unlockedTemplateNames: [],
    boosterPacks: [],
    mailMessages: [],
    pityTimers: {},
    voiceCallUnifiedHistory: true,
    voiceCallPushToTalk: true,
    voiceCallSpontaneousResponse: false,
    voiceCallPreferNarration: false,
    followedSoulsIds: [],
    likedPostIds: [],
    themeOverrides: {},
    activeTheme: 'Default',
    googleSheetsId: null,
    isGoogleSheetsLoggingEnabled: false,
    isTesterPlanActive: false,
    testerRewardsApplied_v1: false,
    redeemedCodes: [],
    hasCompletedOnboardingSurvey: false,
});


// --- Data Service API ---

export const fetchAccountSettings = async (userId: string, email: string): Promise<AccountSettings | null> => {
    let settings = getItem<AccountSettings>(LS_SETTINGS_PREFIX + userId);
    let settingsChanged = false;

    if (!settings) {
        settings = getDefaultAccountSettings(email);
        settingsChanged = true;
    } else {
        // Migration for existing users
        const defaults = getDefaultAccountSettings(email);
        if (settings.soulShards === undefined || settings.soulShards === null) {
            settings.soulShards = defaults.soulShards;
            settingsChanged = true;
        }
        if (settings.boosterPacks === undefined || settings.boosterPacks === null) {
            settings.boosterPacks = defaults.boosterPacks;
            settingsChanged = true;
        }
        if (settings.unlockedTemplateNames === undefined || settings.unlockedTemplateNames === null) {
            settings.unlockedTemplateNames = defaults.unlockedTemplateNames;
            settingsChanged = true;
        }
        if (settings.pityTimers === undefined || settings.pityTimers === null) {
            settings.pityTimers = defaults.pityTimers;
            settingsChanged = true;
        }
        // FIX: Removed deprecated `bondTokens` property.
        if (settings.redeemedCodes === undefined) {
            settings.redeemedCodes = [];
            settingsChanged = true;
        }
        if (settings.hasCompletedOnboardingSurvey === undefined) {
            settings.hasCompletedOnboardingSurvey = true;
            settingsChanged = true;
        }
    }

    if (settings.dockedSoulIds === undefined) {
        const newDockedIds: (string | null)[] = Array(20).fill(null);
        const activeSouls = settings.souls.filter(s => !s.deletionTimestamp);
        activeSouls.forEach((soul, index) => {
            if (index < 20) {
                newDockedIds[index] = soul.id;
            }
        });
        settings.dockedSoulIds = newDockedIds;
        settingsChanged = true;
    }

    const isAdmin = email ? ADMIN_EMAILS.includes(email.toLowerCase()) : false;
    const isTester = email ? TESTER_EMAILS.includes(email.toLowerCase()) : false;

    if (settings.adminMode !== isAdmin) {
        settings.adminMode = isAdmin;
        settingsChanged = true;
    }

    if (isAdmin) {
        settings.subscriptionTier = 'Max';
        settings.soulShards = 99999;
        settings.referralEssence = 999999; // Essence
        // FIX: Removed deprecated `bondTokens` property.

        if (email.toLowerCase() === 'soulverseai@gmail.com') {
            if (!settings.dailyRewardState) {
                settings.dailyRewardState = { 
                    streak: 0, 
                    lastClaimTimestamp: null
                };
            }
            settings.dailyRewardState.seasonPoints = 800;
        }

        // Mark as changed to ensure it saves. This effectively resets admin currency on each load.
        settingsChanged = true;
    } else if (isTester) {
        // Upgrade testers to Premium if they are on Free
        if (settings.subscriptionTier === 'Free') {
            settings.subscriptionTier = 'Premium';
            settingsChanged = true;
        }

        // One-time grant of currency and season points for testers
        if (!settings.testerRewardsApplied_v1) {
            settings.soulShards = 3000;
            settings.referralEssence = 10000; // Essence
            // FIX: Removed deprecated `bondTokens` property.
            
            if (!settings.dailyRewardState) {
                settings.dailyRewardState = { 
                    streak: 0, 
                    lastClaimTimestamp: null
                };
            }
            settings.dailyRewardState.seasonPoints = 300;
            
            settings.testerRewardsApplied_v1 = true;
            settingsChanged = true;
        }
    }
    
    if ((!settings.userName || settings.userName === "User") && email) {
        settings.userName = email.split('@')[0];
        settingsChanged = true;
    }
    
    if(settingsChanged) {
        saveItem(LS_SETTINGS_PREFIX + userId, settings);
    }
    
    return Promise.resolve(settings);
};

export const updateAccountSettings = async (userId: string, settings: AccountSettings): Promise<boolean> => {
    try {
        saveItem(LS_SETTINGS_PREFIX + userId, settings);
        return Promise.resolve(true);
    } catch (e) {
        console.error("Failed to update account settings in localStorage", e);
        return Promise.resolve(false);
    }
};

export const createSoul = async (soul: Soul, userId: string): Promise<Soul | null> => {
    const settings = getItem<AccountSettings>(LS_SETTINGS_PREFIX + userId);
    if (!settings) return null;

    const existingIndex = settings.souls.findIndex(s => s.id === soul.id);
    if (existingIndex > -1) {
        settings.souls[existingIndex] = soul;
    } else {
        settings.souls.push(soul);
    }
    saveItem(LS_SETTINGS_PREFIX + userId, settings);
    return Promise.resolve(soul);
};

export const deleteSouls = async (soulIds: string[], userId: string): Promise<boolean> => {
    const settings = getItem<AccountSettings>(LS_SETTINGS_PREFIX + userId);
    if (!settings) return false;

    const initialLength = settings.souls.length;
    settings.souls = settings.souls.filter(s => !soulIds.includes(s.id));
    
    soulIds.forEach(id => {
        localStorage.removeItem(`${LS_MESSAGES_PREFIX}${userId}_${id}`);
        localStorage.removeItem(`${LS_MEMORIES_PREFIX}${userId}_${id}`);
    });

    saveItem(LS_SETTINGS_PREFIX + userId, settings);
    return Promise.resolve(settings.souls.length < initialLength);
};

export const fetchMessages = async (userId: string, soulId: string, page: number, pageSize: number): Promise<ChatMessage[] | null> => {
    const key = `${LS_MESSAGES_PREFIX}${userId}_${soulId}`;
    const soulMessages = getItem<any[]>(key) || []; // Get as any[] to be safe with old data

    // Clean up messages on read to handle old data format and ensure type consistency.
    const cleanedMessages: ChatMessage[] = soulMessages.map(msg => {
        const { user_id, soul_id, ...chatMessageData } = msg;
        return chatMessageData;
    });
    
    const sortedMessages = [...cleanedMessages].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    const start = page * pageSize;
    const end = start + pageSize;
    const paginatedMessages = sortedMessages.slice(start, end);
    
    return Promise.resolve(paginatedMessages.reverse());
};

export const addMessage = async (message: ChatMessage & { user_id: string, soul_id: string }): Promise<void> => {
    const key = `${LS_MESSAGES_PREFIX}${message.user_id}_${message.soul_id}`;
    const messages = getItem<ChatMessage[]>(key) || [];
    const { user_id, soul_id, ...chatMessageData } = message;
    messages.push(chatMessageData);
    saveItem(key, messages);
    return Promise.resolve();
};

export const updateMessage = async (messageId: string, updates: Partial<ChatMessage>, userId: string, soulId: string): Promise<void> => {
    const key = `${LS_MESSAGES_PREFIX}${userId}_${soulId}`;
    const messages = getItem<ChatMessage[]>(key) || [];
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex > -1) {
        messages[messageIndex] = { ...messages[messageIndex], ...updates };
        saveItem(key, messages);
    }
    return Promise.resolve();
};

export const deleteMessage = async (messageId: string, userId: string, soulId: string): Promise<void> => {
    const key = `${LS_MESSAGES_PREFIX}${userId}_${soulId}`;
    let messages = getItem<ChatMessage[]>(key) || [];
    messages = messages.filter(m => m.id !== messageId);
    saveItem(key, messages);
    return Promise.resolve();
};

export const deleteMessagesForSoul = async (userId: string, soulId: string): Promise<void> => {
    const key = `${LS_MESSAGES_PREFIX}${userId}_${soulId}`;
    localStorage.removeItem(key);
    return Promise.resolve();
};

export const deleteMemoriesForSoul = async (userId: string, soulId: string): Promise<void> => {
    const key = `${LS_MEMORIES_PREFIX}${userId}_${soulId}`;
    localStorage.removeItem(key);
    return Promise.resolve();
};

export const fetchConsolidatedMemories = async (userId: string, soulId: string): Promise<LongTermMemory[] | null> => {
    const key = `${LS_MEMORIES_PREFIX}${userId}_${soulId}`;
    const soulMemories = getItem<LongTermMemory[]>(key) || [];
    return Promise.resolve(soulMemories);
};

export const addConsolidatedMemory = async (memory: LongTermMemory): Promise<void> => {
    const key = `${LS_MEMORIES_PREFIX}${memory.user_id}_${memory.soul_id}`;
    const memories = getItem<LongTermMemory[]>(key) || [];
    memories.push(memory);
    saveItem(key, memories);
    return Promise.resolve();
};

export const updateConsolidatedMemory = async (userId: string, soulId: string, memoryId: string, newSummary: string): Promise<LongTermMemory | null> => {
    const key = `${LS_MEMORIES_PREFIX}${userId}_${soulId}`;
    const memories = getItem<LongTermMemory[]>(key) || [];
    const memoryIndex = memories.findIndex(m => m.id === memoryId);
    if (memoryIndex > -1) {
        memories[memoryIndex].summary = newSummary;
        saveItem(key, memories);
        return Promise.resolve(memories[memoryIndex]);
    }
    return Promise.resolve(null);
};

export const deleteConsolidatedMemory = async (userId: string, soulId: string, memoryId: string): Promise<boolean> => {
    const key = `${LS_MEMORIES_PREFIX}${userId}_${soulId}`;
    let memories = getItem<LongTermMemory[]>(key) || [];
    const initialLength = memories.length;
    memories = memories.filter(m => m.id !== memoryId);
    if (memories.length < initialLength) {
        saveItem(key, memories);
        return Promise.resolve(true);
    }
    return Promise.resolve(false);
};

export const createSharedSoul = async (sharedSoulData: Omit<SharedSoul, 'id' | 'createdAt' | 'referralCount'> & { shareCode: string }, userId: string): Promise<SharedSoul | null> => {
    const settings = getItem<AccountSettings>(LS_SETTINGS_PREFIX + userId);
    if (!settings) return null;

    const newSharedSoul: SharedSoul = {
        ...sharedSoulData,
        id: `shared-${Date.now()}`,
        createdAt: new Date().toISOString(),
        referralCount: 0,
    };

    if (!settings.sharedSouls) {
        settings.sharedSouls = [];
    }
    settings.sharedSouls.push(newSharedSoul);
    saveItem(LS_SETTINGS_PREFIX + userId, settings);
    return Promise.resolve(newSharedSoul);
};

export const updateSharedSoul = async (sharedSoulId: string, updates: Partial<SharedSoul>, userId: string): Promise<SharedSoul | null> => {
    const settings = getItem<AccountSettings>(LS_SETTINGS_PREFIX + userId);
    if (!settings || !settings.sharedSouls) return null;

    const soulIndex = settings.sharedSouls.findIndex(s => s.id === sharedSoulId);
    if (soulIndex > -1) {
        settings.sharedSouls[soulIndex] = { ...settings.sharedSouls[soulIndex], ...updates };
        saveItem(LS_SETTINGS_PREFIX + userId, settings);
        return Promise.resolve(settings.sharedSouls[soulIndex]);
    }
    return Promise.resolve(null);
};

export const deleteSharedSoul = async (sharedSoulId: string, userId: string): Promise<boolean> => {
    const settings = getItem<AccountSettings>(LS_SETTINGS_PREFIX + userId);
    if (!settings || !settings.sharedSouls) return false;

    const initialLength = settings.sharedSouls.length;
    settings.sharedSouls = settings.sharedSouls.filter(s => s.id !== sharedSoulId);

    if (settings.sharedSouls.length < initialLength) {
        saveItem(LS_SETTINGS_PREFIX + userId, settings);
        return Promise.resolve(true);
    }
    return Promise.resolve(false);
};
