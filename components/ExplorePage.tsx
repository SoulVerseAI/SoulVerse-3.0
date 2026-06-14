import React, { useState } from 'react';
import { FunctionWindow } from './ui/FunctionWindow';
import { DiscoverPage } from './SoulsTemplates/DiscoverPage';
import { NameYourSoul } from './onboarding/NameYourSoul';
import { LookYourSoul } from './onboarding/LookYourSoul';
import { WhatYourSoul } from './onboarding/WhatYourSoul';
import { HelloYourSoul } from './onboarding/HelloYourSoul';
import { SoulHello } from './onboarding/SoulHello';
import { Soul, AccountSettings, SoulTemplate } from '../types';
import { User } from '../contexts/AuthContext';
import { createSoul } from '../services/dataService';
import { defaultSoul } from '../App';
import { getSubscriptionBenefits } from '../services/subscriptionService';

type CreationModalView = 'discover' | 'create-name' | 'create-look' | 'create-what' | 'create-hello' | 'template-hello';

interface ExplorePageProps {
    isOpen: boolean;
    onClose: () => void;
    accountSettings: AccountSettings;
    templates: SoulTemplate[];
    onSoulCreated: (newSoul: Soul) => void;
    setToast: (toast: { title: string; message: React.ReactNode } | null) => void;
    currentUser: User | null;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
    isOpen,
    onClose,
    accountSettings,
    templates,
    onSoulCreated,
    setToast,
    currentUser,
}) => {
    const [creationModalView, setCreationModalView] = useState<CreationModalView>('discover');
    const [newSoulData, setNewSoulData] = useState<Partial<Soul>>({});
    const [onboardingTemplate, setOnboardingTemplate] = useState<SoulTemplate | null>(null);

    const resetCreationFlow = () => {
        setCreationModalView('discover');
        setNewSoulData({});
        setOnboardingTemplate(null);
    };
    
    const handleClose = () => {
        resetCreationFlow();
        onClose();
    };
    
    const handleStartCreationFromScratch = () => {
        setNewSoulData(defaultSoul(accountSettings));
        setCreationModalView('create-name');
    };
    
    const handleStartSoulCreation = (template: SoulTemplate) => {
        setOnboardingTemplate(template);
        setCreationModalView('template-hello');
    };

    const handleUpdateNewSoul = (updates: Partial<Soul>) => {
        setNewSoulData(prev => ({ ...prev, ...updates }));
    };

    const handleFinalizeSoulCreationFromScratch = async () => {
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
        };

        const createdSoul = await createSoul(finalSoul, currentUser.id);
        if (createdSoul) {
            onSoulCreated(createdSoul);
            resetCreationFlow();
        } else {
            setToast({ title: "Creation Error", message: "Failed to save your new Soul to the database. Please try again." });
        }
    };
    
    const handleFinalizeSoulCreationFromTemplate = async () => {
        if (!currentUser || !onboardingTemplate) return;
        
        const soulName = onboardingTemplate.name;
        const userName = accountSettings.userName;

        const benefits = getSubscriptionBenefits(accountSettings);
        const applyTruncation = (text: string, limit: number) => {
            if (!accountSettings.adminMode && text.length > limit) {
                return text.substring(0, limit);
            }
            return text;
        };
        
        const processedBackstory = applyTruncation(onboardingTemplate.backstory, benefits.soulBackstoryChars);
        const processedKeyMemories = applyTruncation(onboardingTemplate.keyMemories, benefits.soulKeyMemoriesChars);
        const processedResponseDirective = applyTruncation(onboardingTemplate.responseDirective, benefits.soulResponseDirectiveChars);

        const createdSoul = await createSoul({
            ...defaultSoul(accountSettings),
            id: crypto.randomUUID(),
            name: soulName,
            description: onboardingTemplate.title.replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
            gender: onboardingTemplate.gender,
            avatar: onboardingTemplate.smallAvatarUrl,
            backstory: processedBackstory.replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
            responseDirective: processedResponseDirective.replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
            keyMemories: processedKeyMemories.replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
            characterSheet: (onboardingTemplate.characterSheet || '').replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
            greeting: onboardingTemplate.greeting.replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
            mbti: onboardingTemplate.mbti,
            enneagram: onboardingTemplate.enneagram,
            dynamism: onboardingTemplate.dynamism,
            physicalAppearanceDescription: onboardingTemplate.longDescription,
            templateName: onboardingTemplate.name,
            username: soulName.toLowerCase().replace(/\s+/g, '_'),
            bio: onboardingTemplate.longDescription.replace(/\{soul\}/gi, soulName).replace(/\{user\}/gi, userName),
            profileBannerUrl: onboardingTemplate.profileBannerUrl,
            posts: onboardingTemplate.posts || [],
            role: onboardingTemplate.role,
            soulId: onboardingTemplate.soulId,
            shareCode: onboardingTemplate.shareCode,
            edition: onboardingTemplate.edition,
        }, currentUser.id);
        
        if(createdSoul) {
            onSoulCreated(createdSoul);
            resetCreationFlow();
        } else {
            setToast({ title: "Creation Error", message: "Failed to create Soul from template. Please try again." });
        }
    };
    
    const renderContent = () => {
        switch (creationModalView) {
            case 'discover':
                return <DiscoverPage isOpen={isOpen} onClose={handleClose} onOpenCreateModal={handleStartCreationFromScratch} onCreateFromTemplate={handleStartSoulCreation} accountSettings={accountSettings} templates={templates} />;
            case 'create-name':
                return <NameYourSoul data={newSoulData} onUpdate={handleUpdateNewSoul} onNext={() => setCreationModalView('create-look')} onBack={() => setCreationModalView('discover')} onClose={handleClose} />;
            case 'create-look':
                return <LookYourSoul data={newSoulData} onUpdate={handleUpdateNewSoul} onNext={() => setCreationModalView('create-what')} onBack={() => setCreationModalView('create-name')} onClose={handleClose} setToast={setToast}/>;
            case 'create-what':
                return <WhatYourSoul data={newSoulData} onUpdate={handleUpdateNewSoul} onNext={() => setCreationModalView('create-hello')} onBack={() => setCreationModalView('create-look')} onClose={handleClose} accountSettings={accountSettings} />;
            case 'create-hello':
                return <HelloYourSoul data={newSoulData} onFinish={handleFinalizeSoulCreationFromScratch} onBack={() => setCreationModalView('create-what')} onClose={handleClose} />;
            case 'template-hello':
// FIX: Added the missing `onClose` prop to the `SoulHello` component to match its prop types.
                return onboardingTemplate ? <SoulHello template={onboardingTemplate} userName={accountSettings.userName} onFinish={handleFinalizeSoulCreationFromTemplate} onBack={() => setCreationModalView('discover')} onClose={handleClose} /> : null;
            default:
                return null;
        }
    };
    
    const title = creationModalView === 'discover' ? "Explore Souls" : "Create Your Soul";
    
    return (
        <FunctionWindow isOpen={isOpen} onClose={handleClose} title={title}>
            {renderContent()}
        </FunctionWindow>
    );
};