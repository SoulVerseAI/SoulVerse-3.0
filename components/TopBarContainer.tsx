import React from 'react';
import { TopBar } from './TopBar';
import { AccountSettings, Soul, SoulTemplate, ChatMessage } from '../types';

interface TopBarContainerProps {
    accountSettings: AccountSettings;
    activeSoul: Soul | null;
    allPredefinedSouls: SoulTemplate[];
    hasUnreadMail: boolean;
    onOpenCollection: () => void;
    isCollectionOpen: boolean;
    onOpenSeason: () => void;
    onOpenSoulNotes: () => void;
    onOpenMarketplace: () => void;
    onOpenSoulBoard: () => void;
    onOpenCodex: () => void;
    onOpenSelfiePage: () => void;
    onOpenVoiceCall: () => void;
    onOpenInbox: () => void;
    onOpenMenu: () => void;
}

export const TopBarContainer: React.FC<TopBarContainerProps> = (props) => {
    return (
        <TopBar
            onOpenCollection={props.onOpenCollection}
            isCollectionOpen={props.isCollectionOpen}
            onOpenSeason={props.onOpenSeason}
            onOpenSoulNotes={props.onOpenSoulNotes}
            onOpenMarketplace={props.onOpenMarketplace}
            onOpenSoulBoard={props.onOpenSoulBoard}
            onOpenHomeMenu={props.onOpenCodex}
            onOpenSelfiePage={props.onOpenSelfiePage}
            onOpenVoiceCall={props.onOpenVoiceCall}
            onOpenInbox={props.onOpenInbox}
            onOpenMenu={props.onOpenMenu}
            hasUnreadMail={props.hasUnreadMail}
        />
    );
};