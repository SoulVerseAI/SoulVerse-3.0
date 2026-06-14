import { AccountSettings, SubscriptionTier, SubscriptionBenefits } from '../types';

export const benefits: Record<SubscriptionTier, SubscriptionBenefits> = {
    Free: {
        soulSlots: 2,
        userBackstoryChars: 250,
        soulBackstoryChars: 1000,
        soulKeyMemoriesChars: 500,
        soulResponseDirectiveChars: 50,
        conversationContextChars: 8000,
        additionalBackstoryChars: 0,
    },
    Premium: {
        soulSlots: 10,
        userBackstoryChars: 500,
        soulBackstoryChars: 2500,
        soulKeyMemoriesChars: 1000,
        soulResponseDirectiveChars: 150,
        conversationContextChars: 340000,
        additionalBackstoryChars: 0,
    },
    Ultra: {
        soulSlots: 15,
        userBackstoryChars: 1000,
        soulBackstoryChars: 5000,
        soulKeyMemoriesChars: 2000,
        soulResponseDirectiveChars: 300,
        conversationContextChars: 1050000,
        additionalBackstoryChars: 2500,
    },
    Max: {
        soulSlots: 20,
        userBackstoryChars: 2000,
        soulBackstoryChars: 7500,
        soulKeyMemoriesChars: 4000,
        soulResponseDirectiveChars: 500,
        conversationContextChars: 2600000,
        additionalBackstoryChars: 5000,
    },
};

export const getSubscriptionBenefits = (accountSettings: AccountSettings): SubscriptionBenefits => {
    // Admins see Max limits for display purposes, but can exceed them.
    // The actual enforcement (or lack thereof) is handled in the components.
    if (accountSettings.adminMode) {
        return {
            ...benefits.Max,
            soulSlots: 99, // Admins still get more slots
        };
    }
    // Add a fallback to 'Free' if the subscriptionTier is invalid or not found in the benefits object.
    const tier = accountSettings.subscriptionTier;
    return benefits[tier] || benefits.Free;
};

export const getDefaultModelForTier = (tier: SubscriptionTier): { model: string; enableThinking: boolean } => {
    switch (tier) {
        case 'Free':
            return { model: 'gemini-2.5-flash-lite', enableThinking: false };
        case 'Max':
            return { model: 'gemini-2.5-pro', enableThinking: true }; // V4
        case 'Premium':
        case 'Ultra':
        default:
            return { model: 'gemini-2.5-flash', enableThinking: false }; // V3
    }
};
