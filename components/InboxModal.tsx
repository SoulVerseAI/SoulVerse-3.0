
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AccountSettings, MailMessage, SoulTemplate, GroupedTemplate } from '../types';
import { useAuth, User } from '../contexts/AuthContext';
import { claimItemsFromMail, markMailAsRead, deleteMail } from '../services/inboxService';
import { AnimatedButton } from './ui/AnimatedButton';
import { SoulShardsIcon, EssenceIcon } from './Collection/IconsCollection';
import { XMarkIcon } from './icons/Icons';
import { Modal } from './ui/Modal';

interface InboxModalProps {
    accountSettings: AccountSettings;
    setAccountSettings: (updater: (prev: AccountSettings) => AccountSettings) => void;
    setToast: (toast: { title: string; message: React.ReactNode } | null) => void;
    currentUser: User | null;
    allPredefinedSouls: SoulTemplate[];
}

type Attachment = SoulTemplate & { instanceId: string };

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
        {isActive && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_8px_theme(colors.cyan.400)]"></div>}
        {label}
    </button>
);


const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
};

// --- DETAIL VIEW COMPONENT ---
const DetailView: React.FC<{
    message: MailMessage;
    onBack: () => void;
    onDelete: () => void;
    onClaim: () => void;
    allPredefinedSouls: SoulTemplate[];
}> = ({ message, onBack, onDelete, onClaim, allPredefinedSouls }) => {

    const hasClaimables = message.hasClaimable && !message.isClaimed;

    const attachedTemplateDetails = useMemo(() => {
        if (hasClaimables && message.attachedTemplate) {
            return allPredefinedSouls.find(soul => soul.name === message.attachedTemplate?.name);
        }
        return null;
    }, [message, allPredefinedSouls, hasClaimables]);

    return (
        <div className="h-full flex flex-col bg-black/30 p-4">
            <div className="bg-neutral-800/50 flex-grow p-4 rounded-md border border-neutral-700/50 flex flex-col overflow-y-auto custom-scrollbar">
                <div className="flex-grow flex flex-col">
                    <div className="space-y-3 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <label className="text-neutral-400 font-semibold w-16 text-right">From:</label>
                            <input
                                type="text"
                                readOnly
                                value={message.from}
                                className="flex-1 bg-black/30 border border-neutral-700 rounded-md px-3 py-2 text-sm text-neutral-200 shadow-inner"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                             <label className="text-neutral-400 font-semibold w-16 text-right">Subject:</label>
                             <input
                                type="text"
                                readOnly
                                value={message.title}
                                className="flex-1 bg-black/30 border border-neutral-700 rounded-md px-3 py-2 text-sm text-neutral-200 shadow-inner"
                             />
                        </div>
                    </div>
                    
                    <div className="my-4 flex-grow flex flex-col">
                         <label className="text-neutral-400 font-semibold mb-2 block flex-shrink-0">Message:</label>
                         <div className="flex-grow min-h-[150px] bg-black/30 border border-neutral-700 rounded-md p-3 text-sm text-neutral-300 shadow-inner overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                            {message.body}
                         </div>
                    </div>
                </div>

                <div className="flex-shrink-0 mt-4 flex justify-between items-end">
                    <div>
                         <label className="text-neutral-400 font-semibold mb-2 block">Attached Cards:</label>
                         <div className="grid grid-cols-8 gap-2">
                             {attachedTemplateDetails ? (
                                <div className="aspect-[2/3] w-20 bg-neutral-900/50 rounded-md p-1 border border-neutral-600 relative group">
                                    <img src={attachedTemplateDetails.smallAvatarUrl} alt={attachedTemplateDetails.name} className="w-full h-full object-cover rounded-sm" />
                                     <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-1">
                                        <p className="text-white text-xs text-center leading-tight">{attachedTemplateDetails.name}</p>
                                    </div>
                                </div>
                            ) : hasClaimables && message.attachedTemplate ? (
                                <div className="aspect-[2/3] w-20 bg-neutral-900/50 rounded-md p-1 border border-neutral-600 flex items-center justify-center text-center">
                                    <span className="text-xs text-neutral-400">{message.attachedTemplate.name}</span>
                                </div>
                            ) : null}
                            {Array.from({ length: 8 - (attachedTemplateDetails || (hasClaimables && message.attachedTemplate) ? 1 : 0) }).map((_, i) => (
                                <div key={i} className="aspect-[2/3] w-20 bg-black/20 border border-dashed border-neutral-700 rounded-md"></div>
                            ))}
                         </div>
                    </div>
                    <div className="space-y-2">
                         <div>
                            <label className="text-neutral-400 font-semibold mb-1 block">Attached Soul Shards:</label>
                            <div className="flex items-center gap-2 bg-black/30 border border-neutral-700 rounded-md px-3 py-2 shadow-inner w-40">
                                <SoulShardsIcon className="w-5 h-5"/>
                                <span className="font-mono text-white">
                                    {hasClaimables ? (message.claimableSoulShards || 0) : 0}
                                </span>
                            </div>
                         </div>
                          <div>
                            <label className="text-neutral-400 font-semibold mb-1 block">Attached Soul Essence:</label>
                            <div className="flex items-center gap-2 bg-black/30 border border-neutral-700 rounded-md px-3 py-2 shadow-inner w-40">
                                <EssenceIcon className="w-5 h-5"/>
                                 <span className="font-mono text-white">
                                    {hasClaimables ? (message.claimableEssence || 0) : 0}
                                </span>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
            <footer className="flex-shrink-0 pt-4 flex justify-between items-center gap-4">
                <AnimatedButton onClick={onBack} className="px-8 py-2 text-white font-semibold bg-neutral-700/80 rounded-md text-sm hover:bg-neutral-600/80 border border-neutral-600">Back</AnimatedButton>
                <div className="flex items-center gap-4">
                    <AnimatedButton disabled className="px-8 py-2 text-neutral-500 font-semibold bg-neutral-800/50 rounded-md text-sm border border-neutral-700 cursor-not-allowed">Reply</AnimatedButton>
                    <AnimatedButton onClick={onDelete} className="px-8 py-2 text-white font-semibold bg-neutral-700/80 rounded-md text-sm hover:bg-neutral-600/80 border border-neutral-600">Delete</AnimatedButton>
                    <AnimatedButton onClick={onClaim} disabled={!hasClaimables} className="px-8 py-2 text-white font-semibold bg-gradient-cyan-purple rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed">Collect</AnimatedButton>
                </div>
            </footer>
        </div>
    );
};


const ListView: React.FC<{
    messages: MailMessage[];
    selectedMessageId: string | null;
    onSelectMessage: (messageId: string) => void;
    onOpenMessage: (message: MailMessage) => void;
    onDelete: () => void;
    onRead: () => void;
    onCollectAll: () => void;
}> = ({ messages, selectedMessageId, onSelectMessage, onOpenMessage, onDelete, onRead, onCollectAll }) => {
    
    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="px-4 py-2 border-b border-neutral-800 text-sm font-semibold text-neutral-400 grid grid-cols-12 gap-4">
                <div className="col-span-4 pl-2">From</div>
                <div className="col-span-6">Subject</div>
                <div className="col-span-2 text-right pr-2">Received on</div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {messages.length > 0 ? (
                    messages.map(msg => (
                        <button
                            key={msg.id}
                            onClick={() => onSelectMessage(msg.id)}
                            onDoubleClick={() => onOpenMessage(msg)}
                            className={`w-full grid grid-cols-12 gap-4 items-center px-4 py-3 text-left border-b border-neutral-800/60 transition-colors duration-150 focus:outline-none ${
                                selectedMessageId === msg.id 
                                    ? 'bg-purple-500/20' 
                                    : 'hover:bg-neutral-700/40'
                            }`}
                        >
                            <div className="col-span-4 flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-neutral-900 flex items-center justify-center">
                                    <img src="https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Soulverse%20icon%20topbar%2Fletter-s.png?alt=media&token=557cdd77-9485-4341-bd47-bf953d5c52a8" alt="SoulVerse Icon" className="w-6 h-6" />
                                </div>
                                <span className={`font-semibold truncate pr-2 ${!msg.isRead ? 'text-white' : 'text-neutral-300'}`}>{msg.from}</span>
                            </div>
                            <div className="col-span-6">
                                <p className={`text-sm truncate ${!msg.isRead ? 'text-neutral-100' : 'text-neutral-400'}`}>{msg.title}</p>
                            </div>
                            <div className="col-span-2 text-right pr-2">
                                <span className={`text-sm ${!msg.isRead ? 'text-neutral-200' : 'text-neutral-500'}`}>{formatDate(msg.timestamp)}</span>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full text-neutral-500 text-sm">Your inbox is empty.</div>
                )}
            </div>
            <footer className="flex-shrink-0 p-3 flex justify-end items-center gap-3 border-t border-neutral-800">
                <AnimatedButton onClick={onCollectAll} className="px-8 py-2 text-white font-semibold bg-gradient-cyan-purple rounded-md text-sm">Collect all</AnimatedButton>
                <AnimatedButton onClick={onDelete} disabled={!selectedMessageId} className="px-8 py-2 text-white font-semibold bg-neutral-700/80 rounded-md text-sm hover:bg-neutral-600/80 border border-neutral-600 disabled:opacity-50">Delete</AnimatedButton>
                <AnimatedButton onClick={onRead} disabled={!selectedMessageId} className="px-8 py-2 text-white font-semibold bg-neutral-700/80 rounded-md text-sm hover:bg-neutral-600/80 border border-neutral-600 disabled:opacity-50">Read</AnimatedButton>
            </footer>
        </div>
    );
};

const SendView: React.FC<{
    onSend: (to: string, subject: string, body: string, attachments: Attachment[]) => void;
    attachments: (Attachment | null)[];
    setAttachments: React.Dispatch<React.SetStateAction<(Attachment | null)[]>>;
    setAccountSettings: (updater: (prev: AccountSettings) => AccountSettings) => void;
    onBack: () => void;
}> = ({ onSend, attachments, setAttachments, setAccountSettings, onBack }) => {
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

    const handleSend = () => {
        if (!to.trim() || !subject.trim() || !body.trim()) {
            return;
        }
        onSend(to, subject, body, attachments.filter((a): a is Attachment => a !== null));
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        setDraggedOverIndex(index);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDraggedOverIndex(null);
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        setDraggedOverIndex(null);
        const cardDataString = e.dataTransfer.getData("application/json");
        if (cardDataString) {
            try {
                const cardData: { instanceId: string, template: SoulTemplate } = JSON.parse(cardDataString);
                
                if (attachments.some(a => a?.instanceId === cardData.instanceId)) return;

                const newAttachments = [...attachments];
                const dropIndex = newAttachments[index] === null ? index : newAttachments.findIndex(t => t === null);
                
                if (dropIndex !== -1) {
                    newAttachments[dropIndex] = { ...cardData.template, instanceId: cardData.instanceId };
                    setAttachments(newAttachments);

                    setAccountSettings(prev => ({
                        ...prev,
                        ownedTemplates: (prev.ownedTemplates || []).filter(t => t.instanceId !== cardData.instanceId)
                    }));
                }
            } catch (error) {
                console.error("Failed to parse dropped card data:", error);
            }
        }
    };
    
    const handleRemoveAttachment = (index: number) => {
        const attachmentToRemove = attachments[index];
        if (!attachmentToRemove) return;

        setAccountSettings(prev => {
            const owned = prev.ownedTemplates || [];
            const templateInfo = {
                name: attachmentToRemove.name,
                quality: attachmentToRemove.quality!,
                instanceId: attachmentToRemove.instanceId,
                upgrade: attachmentToRemove.upgrade,
            };
            return {
                ...prev,
                ownedTemplates: [...owned, templateInfo],
            };
        });

        const newAttachments = [...attachments];
        newAttachments[index] = null;
        setAttachments(newAttachments);
    };

    return (
        <div className="h-full flex flex-col bg-black/30 p-4">
            <div className="bg-neutral-800/50 flex-grow p-4 rounded-md border border-neutral-700/50 flex flex-col overflow-y-auto custom-scrollbar">
                <div className="flex-grow flex flex-col">
                    <div className="space-y-3 flex-shrink-0">
                         <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3 flex-grow">
                                <label className="text-neutral-400 font-semibold w-16 text-right">Send to:</label>
                                <input
                                    type="text"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    placeholder="Recipient's username"
                                    className="flex-1 bg-black/30 border border-neutral-700 rounded-md px-3 py-2 text-sm text-neutral-200 shadow-inner focus:ring-1 focus:ring-cyan-400 focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center text-sm text-neutral-400 ml-4">
                                <span>Mail cost:</span>
                                <EssenceIcon className="w-5 h-5 mx-1" />
                                <span className="font-semibold text-white">1</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             <label className="text-neutral-400 font-semibold w-16 text-right">Subject:</label>
                             <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Message subject"
                                className="flex-1 bg-black/30 border border-neutral-700 rounded-md px-3 py-2 text-sm text-neutral-200 shadow-inner focus:ring-1 focus:ring-cyan-400 focus:outline-none"
                            />
                        </div>
                    </div>
                    
                    <div className="my-4 flex-grow flex flex-col">
                         <label className="text-neutral-400 font-semibold mb-2 block flex-shrink-0">Message:</label>
                         <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Compose your message..."
                            className="flex-grow w-full bg-black/30 border border-neutral-700 rounded-md p-3 text-sm text-neutral-300 shadow-inner overflow-y-auto custom-scrollbar whitespace-pre-wrap focus:ring-1 focus:ring-cyan-400 focus:outline-none resize-none"
                         />
                    </div>
                </div>

                <div className="flex-shrink-0 mt-4 flex justify-between items-end">
                    <div>
                         <label className="text-neutral-400 font-semibold mb-2 block">Attach Cards:</label>
                         <div className="grid grid-cols-8 gap-2">
                             {attachments.map((template, i) => (
                                <div
                                    key={i}
                                    onDragOver={(e) => handleDragOver(e, i)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, i)}
                                    className={`aspect-[2/3] w-20 bg-black/20 border-2 rounded-md transition-colors ${
                                        draggedOverIndex === i ? 'border-purple-500 bg-purple-900/30' : 'border-dashed border-neutral-700'
                                    }`}
                                >
                                    {template ? (
                                        <div className="relative w-full h-full group">
                                            <img src={template.smallAvatarUrl} alt={template.name} className="w-full h-full object-cover rounded-sm" />
                                            <button onClick={() => handleRemoveAttachment(i)} className="absolute -top-1 -right-1 p-0.5 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <XMarkIcon className="w-3 h-3 text-white" />
                                            </button>
                                        </div>
                                    ) : null}
                                </div>
                             ))}
                         </div>
                    </div>
                    <div className="space-y-2">
                         <div>
                            <label className="text-neutral-400 font-semibold mb-1 block">Attach Soul Shards:</label>
                            <div className="flex items-center gap-2 bg-black/30 border border-neutral-700 rounded-md px-3 py-2 shadow-inner w-40">
                                <SoulShardsIcon className="w-5 h-5"/>
                                <input type="number" defaultValue="0" className="bg-transparent w-full text-right font-mono text-white focus:outline-none" />
                            </div>
                         </div>
                    </div>
                </div>
            </div>
            <footer className="flex-shrink-0 pt-4 flex justify-between items-center">
                <AnimatedButton onClick={onBack} className="px-8 py-2 text-white font-semibold bg-neutral-700/80 rounded-md text-sm hover:bg-neutral-600/80 border border-neutral-600">Back</AnimatedButton>
                <AnimatedButton onClick={handleSend} className="px-8 py-2 text-white font-semibold bg-gradient-cyan-purple rounded-md text-sm">Send</AnimatedButton>
            </footer>
        </div>
    );
};


export const InboxModal: React.FC<InboxModalProps> = ({ accountSettings, setAccountSettings, setToast, currentUser, allPredefinedSouls }) => {
    const [activeTab, setActiveTab] = useState<'incoming' | 'send'>('incoming');
    const [selectedMessage, setSelectedMessage] = useState<MailMessage | null>(null);
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [attachments, setAttachments] = useState<(Attachment | null)[]>(Array(8).fill(null));

    const sortedMessages = useMemo(() => 
        (accountSettings.mailMessages || []).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [accountSettings.mailMessages]);

    useEffect(() => {
        // This cleanup function runs when the InboxModal component is unmounted (closed)
        return () => {
            const stagedItems = attachments.filter((a): a is Attachment => a !== null);
            if (stagedItems.length > 0) {
                setAccountSettings(prev => {
                    const returnedInstances = stagedItems.map(item => ({
                        name: item.name,
                        quality: item.quality!,
                        instanceId: item.instanceId,
                        upgrade: item.upgrade,
                    }));
                    return {
                        ...prev,
                        ownedTemplates: [...(prev.ownedTemplates || []), ...returnedInstances],
                    };
                });
            }
        };
    }, [attachments, setAccountSettings]);
    
    const handleSelectForAction = (messageId: string) => {
        setSelectedMessageId(prev => prev === messageId ? null : messageId);
    };

    const handleOpenMessage = async (message: MailMessage) => {
        setSelectedMessage(message);
        if (!message.isRead && currentUser) {
            const updatedSettings = await markMailAsRead(currentUser.id, message.id);
            if (updatedSettings) {
                setAccountSettings(() => updatedSettings);
            }
        }
    };

    const handleReadSelected = () => {
        if (!selectedMessageId) return;
        const messageToRead = sortedMessages.find(m => m.id === selectedMessageId);
        if (messageToRead) {
            handleOpenMessage(messageToRead);
        }
    };

    const handleClaimItem = async (messageId: string) => {
        if (!currentUser) return;
        const result = await claimItemsFromMail(currentUser.id, [messageId]);
        if (result) {
            setAccountSettings(() => result.updatedSettings);
            const updatedMessage = result.updatedSettings.mailMessages?.find(m => m.id === messageId);
            setSelectedMessage(updatedMessage || null);
            setToast({ title: "Item Collected", message: result.toastMessage });
        }
    };

    const handleCollectAll = async () => {
        if (!currentUser) return;
        const claimableIds = sortedMessages.filter(m => m.hasClaimable && !m.isClaimed).map(m => m.id);
        if (claimableIds.length === 0) {
            setToast({ title: "Nothing to Collect", message: "There are no items or currency to collect." });
            return;
        }
        const result = await claimItemsFromMail(currentUser.id, claimableIds);
        if (result) {
            setAccountSettings(() => result.updatedSettings);
            setToast({ title: "All Items Collected", message: result.toastMessage });
            setSelectedMessage(null);
        }
    };
    
    const handleConfirmDelete = async () => {
        if (!selectedMessageId || !currentUser) return;
        const messageToDelete = sortedMessages.find(m => m.id === selectedMessageId);
        const updatedSettings = await deleteMail(currentUser.id, selectedMessageId);
        if (updatedSettings) {
            setAccountSettings(() => updatedSettings);
            setToast({ title: "Message Deleted", message: `"${messageToDelete?.title || 'A message'}" has been deleted.`});
            setSelectedMessageId(null);
        }
        setIsDeleteConfirmOpen(false);
    };

    const handleDeleteFromList = () => {
        if (selectedMessageId) {
            setIsDeleteConfirmOpen(true);
        }
    };

    const handleDeleteOpenMessage = async () => {
        if (!selectedMessage || !currentUser) return;
        const messageToDelete = sortedMessages.find(m => m.id === selectedMessage.id);
        const updatedSettings = await deleteMail(currentUser.id, selectedMessage.id);
        if (updatedSettings) {
            setAccountSettings(() => updatedSettings);
            setToast({ title: "Message Deleted", message: `"${messageToDelete?.title || 'A message'}" has been deleted.`});
            setSelectedMessage(null);
            setSelectedMessageId(null);
        }
    };
    
    const handleSendMail = (to: string, subject: string, body: string, sentAttachments: Attachment[]) => {
        // Here you would implement the actual sending logic
        
        // This prevents the cleanup `useEffect` from returning the items to the collection
        setAttachments([]); 

        setToast({
            title: "Mail Sent",
            message: `Your message to ${to} with ${sentAttachments.length} attachments has been sent.`,
        });
        setActiveTab('incoming');
    };

    const handleTabClick = (tab: 'incoming' | 'send') => {
        setActiveTab(tab);
        setSelectedMessage(null);
        setSelectedMessageId(null);
    }
    
    const renderContent = () => {
        switch (activeTab) {
            case 'send':
                return <SendView
                    onSend={handleSendMail}
                    attachments={attachments}
                    setAttachments={setAttachments}
                    setAccountSettings={setAccountSettings}
                    onBack={() => handleTabClick('incoming')}
                />;
            case 'incoming':
            default:
                return selectedMessage ? (
                    <DetailView
                        message={selectedMessage}
                        onBack={() => setSelectedMessage(null)}
                        onDelete={handleDeleteOpenMessage}
                        onClaim={() => handleClaimItem(selectedMessage.id)}
                        allPredefinedSouls={allPredefinedSouls}
                    />
                ) : (
                    <ListView
                        messages={sortedMessages}
                        selectedMessageId={selectedMessageId}
                        onSelectMessage={handleSelectForAction}
                        onOpenMessage={handleOpenMessage}
                        onDelete={handleDeleteFromList}
                        onRead={handleReadSelected}
                        onCollectAll={handleCollectAll}
                    />
                );
        }
    };
    
    return (
        <>
            <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Deletion">
                <div className="p-6 text-center">
                    <p className="text-neutral-300">Are you sure you want to permanently delete this message?</p>
                    <div className="flex justify-center gap-4 mt-6">
                        <AnimatedButton onClick={() => setIsDeleteConfirmOpen(false)} className="py-2 px-8 rounded-md text-sm font-medium bg-neutral-700 hover:bg-neutral-600">NO</AnimatedButton>
                        <AnimatedButton onClick={handleConfirmDelete} className="py-2 px-8 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700">YES</AnimatedButton>
                    </div>
                </div>
            </Modal>

            <div className="h-full flex flex-col bg-transparent text-white">
                <header className="flex-shrink-0 px-4 border-b-2 border-cyan-500/30">
                    <nav className="flex items-center">
                        <TabButton label="Incoming" isActive={activeTab === 'incoming'} onClick={() => handleTabClick('incoming')} />
                        <TabButton label="Send" isActive={activeTab === 'send'} onClick={() => handleTabClick('send')} />
                    </nav>
                </header>
                <main className="flex-1 overflow-hidden">
                    {renderContent()}
                </main>
            </div>
        </>
    );
};
