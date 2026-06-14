import { AccountSettings, MailMessage } from '../types';
import { fetchAccountSettings, updateAccountSettings } from './dataService';

export const claimItemsFromMail = async (userId: string, mailIds: string[]): Promise<{ updatedSettings: AccountSettings; toastMessage: string } | null> => {
    const settings = await fetchAccountSettings(userId, '');
    if (!settings || !settings.mailMessages) return null;

    let totalEssenceClaimed = 0;
    let totalShardsClaimed = 0;
    let itemsClaimedCount = 0;
    let itemsSkippedCount = 0;
    let skippedItemNames: string[] = [];
    const newOwnedTemplates = [...(settings.ownedTemplates || [])];

    const currentOwnedCounts: Record<string, number> = (settings.ownedTemplates || []).reduce((acc, t) => {
        acc[t.name] = (acc[t.name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const updatedMailMessages = settings.mailMessages.map(message => {
        if (mailIds.includes(message.id) && message.hasClaimable && !message.isClaimed) {
            if (message.attachedTemplate) {
                const currentCount = currentOwnedCounts[message.attachedTemplate.name] || 0;
                if (currentCount >= 4) {
                    itemsSkippedCount++;
                    if (!skippedItemNames.includes(message.attachedTemplate.name)) {
                        skippedItemNames.push(message.attachedTemplate.name);
                    }
                    return message; // Don't claim this message, return it as is
                }
            }

            // If we reach here, the mail can be claimed
            totalEssenceClaimed += message.claimableEssence || 0;
            totalShardsClaimed += message.claimableSoulShards || 0;
            
            if (message.attachedTemplate) {
                itemsClaimedCount++;
                newOwnedTemplates.push({
                    name: message.attachedTemplate.name,
                    quality: message.attachedTemplate.quality,
                    instanceId: crypto.randomUUID(),
                });
                // We need to update the count for subsequent claims in the same batch
                currentOwnedCounts[message.attachedTemplate.name] = (currentOwnedCounts[message.attachedTemplate.name] || 0) + 1;
            }
            return { ...message, isClaimed: true, isRead: true };
        }
        return message;
    });

    const updatedSettings: AccountSettings = {
        ...settings,
        referralEssence: (settings.referralEssence || 0) + totalEssenceClaimed,
        soulShards: (settings.soulShards || 0) + totalShardsClaimed,
        ownedTemplates: newOwnedTemplates,
        mailMessages: updatedMailMessages,
    };

    await updateAccountSettings(userId, updatedSettings);

    let toastMessage = `Collected ${itemsClaimedCount} item(s), ${totalShardsClaimed} Shards, and ${totalEssenceClaimed} Essence.`;
    if (itemsClaimedCount === 0 && (totalEssenceClaimed > 0 || totalShardsClaimed > 0)) {
         toastMessage = `Collected ${totalShardsClaimed} Shards and ${totalEssenceClaimed} Essence.`;
    }

    if (itemsSkippedCount > 0) {
        toastMessage += ` Skipped ${itemsSkippedCount} item(s) from mail due to full collection: ${[...new Set(skippedItemNames)].join(', ')}.`;
    }

    return { updatedSettings, toastMessage };
};

export const markMailAsRead = async (userId: string, messageId: string): Promise<AccountSettings | null> => {
    const settings = await fetchAccountSettings(userId, '');
    if (!settings || !settings.mailMessages) return settings;
    
    const newMailMessages = settings.mailMessages.map(m =>
        m.id === messageId ? { ...m, isRead: true } : m
    );
    
    const updatedSettings = { ...settings, mailMessages: newMailMessages };
    await updateAccountSettings(userId, updatedSettings);
    return updatedSettings;
};

export const deleteMail = async (userId: string, messageId: string): Promise<AccountSettings | null> => {
    const settings = await fetchAccountSettings(userId, '');
    if (!settings || !settings.mailMessages) return settings;

    const updatedMailMessages = settings.mailMessages.filter(m => m.id !== messageId);
    
    const updatedSettings = { ...settings, mailMessages: updatedMailMessages };
    await updateAccountSettings(userId, updatedSettings);
    return updatedSettings;
};
