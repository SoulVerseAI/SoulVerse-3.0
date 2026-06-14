
import { Auction, GroupedTemplate, SoulTemplate, TemplateQuality } from '../types';

const AUCTIONS_STORAGE_KEY = 'soulverse_auctions';

// Simulates fetching all auctions.
export const getAuctions = (): Auction[] => {
    const auctionsJson = localStorage.getItem(AUCTIONS_STORAGE_KEY);
    return auctionsJson ? JSON.parse(auctionsJson) : [];
};

// Simulates creating a new auction.
export const createAuction = (
    newAuctionData: {
        card: GroupedTemplate,
        sellerName: string,
        startBid: number | null,
        buyoutPrice: number | null,
        duration: string // e.g., '48h'
    }
): Auction => {
    const { card, sellerName, startBid, buyoutPrice, duration } = newAuctionData;
    
    const getEndTime = (duration: string): number => {
        const hours = parseInt(duration.replace('h', ''), 10);
        return Date.now() + hours * 60 * 60 * 1000;
    };
    
    // For simplicity, we assume the first instance's quality represents the card.
    // A more complex system might allow choosing which instance to sell.
    const quality = card.instances[0]?.quality || 'Wisp';

    const newAuction: Auction = {
        id: crypto.randomUUID(),
        itemId: card.template.shareCode, // Using shareCode as a unique item ID
        itemName: card.template.name,
        itemType: 'Blueprint', // Assuming all are blueprints for now
        imageUrl: card.template.smallAvatarUrl,
        sellerName: sellerName,
        startBid: startBid || 0,
        buyoutPrice: buyoutPrice || null,
        currentBid: startBid || 0,
        topBidderName: null,
        endTime: getEndTime(duration),
        quality: quality,
        role: card.template.role || null,
        edition: card.template.edition,
        template: card.template,
    };

    const existingAuctions = getAuctions();
    const updatedAuctions = [...existingAuctions, newAuction];
    localStorage.setItem(AUCTIONS_STORAGE_KEY, JSON.stringify(updatedAuctions));
    
    return newAuction;
};

// Other functions like placeBid, cancelAuction etc. would go here in a real implementation.
