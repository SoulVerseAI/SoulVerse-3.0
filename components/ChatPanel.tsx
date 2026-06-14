import React, { useState, useRef, useEffect, useMemo, useCallback, useLayoutEffect } from 'react';
import { ChatMessage, Soul, AccountSettings } from '../types';
import { SparklesIcon, BrainIcon, PlusIcon, WandSparklesIcon, MicrophoneIcon, HeartIcon, RegenerateIcon, PencilIcon, SendIcon, ChevronLeftIcon, PhotoIcon, GlobeAltIcon, LinkIcon, XMarkIcon, LoadingSpinner, ArrowDownIcon, SpeakerWaveIcon, ArrowLeftIconV2, ArrowRightIconV2 } from './icons/Icons';
import { ChatMessageActions } from './ChatMessageActions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SendMessageOptions } from '../App';
import { LoaderContextMenu } from './ui/LoaderContextMenu';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, options?: SendMessageOptions) => void;
  isLoading: boolean;
  onContinueMessage: (messageId: string) => void;
  onTweakMessage: (messageId: string) => void;
  onRegenerateMessage: (messageId: string) => void;
  onOpenChatBreakModal: () => void;
  onShowMemory: () => void;
  activeSoul: Soul;
  accountSettings: AccountSettings;
  onGenerateUserReply: () => Promise<string>;
  onContinueUserReply: (currentText: string) => Promise<string>;
  onToggleFavorite: (id: string) => void;
  onEditUserMessage: (messageId: string) => void;
  onAutoSelfie: () => void;
  hasOlderMessagesToLoad: boolean;
  onViewOlderMessages: () => void;
  isLoadingMoreMessages: boolean;
  isInitialLoading: boolean;
  onUnstuckSoul: () => void;
  highlightedMessageId: string | null;
  setHighlightedMessageId: (id: string | null) => void;
  showScrollToBottom: boolean;
  setShowScrollToBottom: (show: boolean) => void;
  speakingMessageId: string | null;
  onPlayPauseSpeech: (messageId: string, text: string) => void;
  messageVersions: Record<string, { versions: string[], currentIndex: number }>;
  onCycleMessageVersion: (messageId: string, direction: 'prev' | 'next') => void;
}

// Extend window type for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: unknown;
    webkitSpeechRecognition: unknown;
  }
}

const ChatBreakMessage: React.FC = () => (
    <div className="flex items-center justify-center my-4 space-x-3 text-sm text-neutral-500">
        <SparklesIcon className="w-5 h-5" />
        <span className="font-semibold">Chat Break</span>
        <SparklesIcon className="w-5 h-5" />
    </div>
);

const MetaMessage: React.FC<{ message: ChatMessage }> = ({ message }) => (
    <div className="w-full flex justify-center my-2">
        <div className="w-full max-w-[864px] bg-neutral-800/40 border border-dashed border-neutral-700 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-yellow-400 bg-yellow-900/30 px-2 py-0.5 rounded-md">[META]</span>
                <span className="text-sm font-semibold text-neutral-300">
                    {message.sender === 'user' ? 'Admin' : 'Meta Assistant'}
                </span>
            </div>
            <div className="text-neutral-300 text-sm font-mono whitespace-pre-wrap break-words">
                <MessageContent text={message.text} />
            </div>
        </div>
    </div>
);

const MessageContent: React.FC<{ text: string }> = ({ text }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                p: ({ ...props }) => <p className="mt-0 mb-4 last:mb-0" {...props} />,
                em: ({ ...props }) => <em className="italic text-italic" {...props} />,
                // The AI is now instructed via system prompt not to use bold formatting.
                // The 'strong' override has been removed to simplify the code and rely on the prompt-based solution.
            }}
        >
            {text}
        </ReactMarkdown>
    );
};


const MinimalLoadingIndicator: React.FC = () => {
    const bgClass = 'bg-stone-900/70 backdrop-blur-sm border border-white/10';
    return (
        <div className={`rounded-2xl px-5 py-4 shadow-lg ${bgClass}`}>
            <div className="flex items-center justify-start space-x-1.5 h-5 py-1">
                <span className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></span>
            </div>
        </div>
    );
};

export const ChatPanel: React.FC<ChatPanelProps> = ({ 
    messages, 
    onSendMessage, 
    isLoading, 
    onContinueMessage, 
    onTweakMessage, 
    onRegenerateMessage,
    onOpenChatBreakModal,
    onShowMemory,
    activeSoul,
    accountSettings,
    onGenerateUserReply,
    onContinueUserReply,
    onToggleFavorite,
    onEditUserMessage,
    onAutoSelfie,
    hasOlderMessagesToLoad,
    onViewOlderMessages,
    isLoadingMoreMessages,
    isInitialLoading,
    onUnstuckSoul,
    highlightedMessageId,
    setHighlightedMessageId,
    showScrollToBottom,
    setShowScrollToBottom,
    speakingMessageId,
    onPlayPauseSpeech,
    messageVersions,
    onCycleMessageVersion,
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isWandLoading, setIsWandLoading] = useState(false);
  
  // States for new attachment features
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [isInternetSearchEnabled, setIsInternetSearchEnabled] = useState(false);
  const [isLinkBrowsingEnabled, setIsLinkBrowsingEnabled] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageAttachment, setImageAttachment] = useState<{ file: File; dataUrl: string } | null>(null);

  const recognitionRef = useRef<unknown>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const oldScrollHeightRef = useRef(0);
  const isAtBottomRef = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const bottomOfChatRef = useRef<HTMLDivElement>(null);
  const fallbackLoaderRef = useRef<HTMLDivElement>(null);
  const prevIsLoading = useRef(isLoading);

  const isMobile = useMemo(() => /Mobi|Android/i.test(navigator.userAgent), []);
  const isSpeechRecognitionSupported = useMemo(() => 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window, []);
  // FIX: Changed comparison from 'Wisp' to 'Free' to match SubscriptionTier type.
  const isFreeUser = accountSettings.subscriptionTier === 'Free' && !accountSettings.adminMode;

  const lastAiMsgId = useMemo(() => {
    return messages.slice().reverse().find(m => m.sender === 'ai')?.id;
  }, [messages]);

  const lastUserMsgId = useMemo(() => {
    return messages.slice().reverse().find(m => m.sender === 'user')?.id;
  }, [messages]);
  
  useEffect(() => {
    if(textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 192)}px`; // max-h-48
    }
  }, [input]);

  const handleScroll = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 5;
    if (isScrolledToBottom && showScrollToBottom) {
        setShowScrollToBottom(false);
    }
    isAtBottomRef.current = isScrolledToBottom;

  }, [showScrollToBottom, setShowScrollToBottom]);

  useEffect(() => {
      const container = chatContainerRef.current;
      if (container) {
          container.addEventListener('scroll', handleScroll, { passive: true });
          return () => {
              container.removeEventListener('scroll', handleScroll);
          };
      }
  }, [handleScroll]);

  useLayoutEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    // This part MUST be in useLayoutEffect to prevent flicker when loading older messages.
    // It adjusts scroll position synchronously before the browser paints.
    if (oldScrollHeightRef.current > 0 && !isLoadingMoreMessages) {
      const newScrollTop = container.scrollHeight - oldScrollHeightRef.current;
      container.scrollTop = newScrollTop;
      oldScrollHeightRef.current = 0;
    }
  }, [messages, isLoadingMoreMessages]);
  
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const justFinishedLoading = prevIsLoading.current && !isLoading;
    const isNewMessage = messages.length > 0 && messageRefs.current[messages[messages.length - 1].id];

    // We scroll to the bottom if:
    // 1. The user was already at the bottom and a new message is added (covers user message, loader, and streaming).
    // 2. A response just finished loading (covers the non-streaming AI response case, even if user scrolled up).
    if ((isAtBottomRef.current && isNewMessage && !isLoadingMoreMessages) || justFinishedLoading) {
        bottomOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    prevIsLoading.current = isLoading;
  }, [messages, isLoading, isLoadingMoreMessages]);
  
    useEffect(() => {
        if (highlightedMessageId) {
            const el = messageRefs.current[highlightedMessageId];
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            const timer = setTimeout(() => {
                setHighlightedMessageId(null);
            }, 2500);
            
            return () => clearTimeout(timer);
        }
    }, [highlightedMessageId, setHighlightedMessageId]);

  useEffect(() => {
    if (isLoading && !messages.some(m => m.sender === 'ai' && m.text === '')) {
      fallbackLoaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [isLoading, messages]);

  const fileToGenerativePart = async (file: File) => {
    const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
    return {
        mimeType: file.type,
        data: base64,
    };
  };

  const handleToggleInternetSearch = () => {
    const isCurrentlyEnabled = isInternetSearchEnabled;
    setIsInternetSearchEnabled(!isCurrentlyEnabled);
    if (!isCurrentlyEnabled) {
        setIsLinkBrowsingEnabled(false);
        setImageAttachment(null);
    }
  };

  const handleToggleLinkBrowsing = () => {
      const isCurrentlyEnabled = isLinkBrowsingEnabled;
      setIsLinkBrowsingEnabled(!isCurrentlyEnabled);
      if (!isCurrentlyEnabled) {
          setIsInternetSearchEnabled(false);
          setImageAttachment(null);
      }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            setImageAttachment({ file, dataUrl });
            setIsInternetSearchEnabled(false);
            setIsLinkBrowsingEnabled(false);
            setIsAttachmentMenuOpen(false);
        };
        reader.readAsDataURL(file);
    }
};

  const handleRemoveImage = () => {
    setImageAttachment(null);
    if (imageInputRef.current) {
        imageInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if ((input.trim() || imageAttachment) && !isLoading) {
        isAtBottomRef.current = true;
        let imagePart;
        if (imageAttachment) {
            imagePart = await fileToGenerativePart(imageAttachment.file);
        }

        onSendMessage(input.trim(), {
            useInternet: isInternetSearchEnabled,
            linkUrl: isLinkBrowsingEnabled ? linkUrl : undefined,
            image: imagePart,
            imageUrlForUi: imageAttachment ? imageAttachment.dataUrl : undefined,
        });

        setInput('');
        handleRemoveImage();
        setIsInternetSearchEnabled(false);
        setIsLinkBrowsingEnabled(false);
        setLinkUrl('');
    }
  };
  
  const handleMicClick = () => {
    if (!isSpeechRecognitionSupported) {
        console.error('Voice recognition isn\'t supported by this browser. Please try Chrome, Edge, or Firefox.');
        return;
    }

    const SpeechRecognition = (window.SpeechRecognition || window.webkitSpeechRecognition) as any;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };
  
const handleWandClick = async () => {
    if (isWandLoading || isLoading) return;

    setIsWandLoading(true);
    try {
        if (input.trim() === '') {
            const newSuggestion = await onGenerateUserReply();
            setInput(newSuggestion);
        } else {
            const continuedSuggestion = await onContinueUserReply(input);
            setInput(continuedSuggestion);
        }
    } catch (error) {
        console.error("Error during wand click action:", error);
    } finally {
        setIsWandLoading(false);
    }
};

  const formatFullTimestamp = (ts: string) => {
    if (!ts || ts === '0') return '';
    return new Date(ts).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
  }
  
  const handleMessageClick = (messageId: string) => {
    if (window.getSelection()?.toString() === '') {
        setSelectedMessageId(prev => prev === messageId ? null : messageId);
    }
  };

  const scrollToBottom = () => {
      bottomOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleLoadOlderClick = () => {
    const container = chatContainerRef.current;
    if (container) {
      oldScrollHeightRef.current = container.scrollHeight;
    }
    onViewOlderMessages();
  };

  const characterLimit = 2000;

  const LoadingIndicatorWithMenu = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);

    const menuItems = [
        { label: 'My Soul is stuck!', action: () => { onUnstuckSoul(); setIsMenuOpen(false); } },
        { label: 'Chat break', action: () => { onOpenChatBreakModal(); setIsMenuOpen(false); } },
    ];

    return (
        <div className="relative inline-block" ref={triggerRef}>
            <div onClick={() => setIsMenuOpen(p => !p)} className="cursor-pointer">
                <MinimalLoadingIndicator />
            </div>
            <LoaderContextMenu
                isOpen={isMenuOpen}
                items={menuItems}
                onClose={() => setIsMenuOpen(false)}
                triggerRef={triggerRef}
            />
        </div>
    );
  };

  const showAttachmentArea = (isInternetSearchEnabled || isLinkBrowsingEnabled || imageAttachment) && !isFreeUser;

  const aiMessageBg = 'bg-stone-900/70 backdrop-blur-sm border border-white/10';
  const userMessageBg = 'bg-indigo-950/70 backdrop-blur-sm border border-white/10';

  return (
    <div className="flex flex-col w-full h-full bg-transparent">
        {isAttachmentMenuOpen && isMobile && !isFreeUser && (
            <div 
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" 
                onClick={() => setIsAttachmentMenuOpen(false)}
            >
                <div 
                    className="bg-neutral-800 rounded-xl shadow-lg p-4 space-y-2 w-full max-w-xs" 
                    onClick={e => e.stopPropagation()}
                >
                    <h3 className="font-semibold text-white text-lg mb-2 text-center">Add Attachment</h3>
                    <button 
                        type="button" 
                        onClick={() => { imageInputRef.current?.click(); setIsAttachmentMenuOpen(false); }} 
                        disabled={isInternetSearchEnabled || isLinkBrowsingEnabled} 
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-700/60 disabled:text-neutral-600 disabled:cursor-not-allowed"
                    >
                        <PhotoIcon className="w-6 h-6"/> Upload Image
                    </button>
                    <button 
                        type="button" 
                        onClick={() => { handleToggleInternetSearch(); setIsAttachmentMenuOpen(false); }} 
                        disabled={!!imageAttachment} 
                        className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-700/60 disabled:text-neutral-600 disabled:cursor-not-allowed ${isInternetSearchEnabled ? 'text-cyan-400' : ''}`}
                    >
                        <GlobeAltIcon className="w-6 h-6"/> Internet Search
                    </button>
                    <button 
                        type="button" 
                        onClick={() => { handleToggleLinkBrowsing(); setIsAttachmentMenuOpen(false); }} 
                        disabled={!!imageAttachment} 
                        className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-700/60 disabled:text-neutral-600 disabled:cursor-not-allowed ${isLinkBrowsingEnabled ? 'text-cyan-400' : ''}`}
                    >
                        <LinkIcon className="w-6 h-6"/> Link Browsing
                    </button>
                </div>
            </div>
        )}
        <div className="flex-1 flex flex-row min-h-0 w-full md:w-[984px] lg:max-w-[1080px] mx-auto">
            <div className="flex-1 relative min-w-0">
                <div ref={chatContainerRef} onMouseDown={() => setSelectedMessageId(null)} className="absolute inset-0 overflow-y-auto p-4 md:p-6">
                    <div className="flex flex-col space-y-4">
                        {isInitialLoading ? (
                            <div className="flex-1 flex items-center justify-center h-full">
                                <div className="flex items-center justify-center space-x-1 h-5">
                                    <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {hasOlderMessagesToLoad && (
                                    <div className="w-full flex justify-center py-2">
                                        {isLoadingMoreMessages ? (
                                            <div className="flex items-center justify-center space-x-1 h-5">
                                                <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce"></span>
                                            </div>
                                        ) : (
                                            <button onClick={handleLoadOlderClick} className="text-sm text-neutral-400 underline hover:text-white transition-colors">
                                                Load older messages
                                            </button>
                                        )}
                                    </div>
                                )}

                                {messages.map((msg, index) => {
                                    if (msg.isMeta) return <MetaMessage key={msg.id} message={msg} />;
                                    if (msg.text === '--- Chat Break ---') return <ChatBreakMessage key={msg.id} />;
                                    
                                    const isBot = msg.sender === 'ai';
                                    const isHighlighted = highlightedMessageId === msg.id;
                                    
                                    if (isBot) {
                                        if (msg.text === '') {
                                            return <div key={msg.id} className="w-full flex justify-start"><LoadingIndicatorWithMenu /></div>;
                                        }
                                        
                                        const showBrainButton = isBot && msg.text.trim() && !msg.isMeta && msg.timestamp !== '0';
                                        const versionInfo = messageVersions[msg.id];
                                        const showVersionSwitcher = msg.id === lastAiMsgId && versionInfo && versionInfo.versions.length > 1;
                                        
                                        return (
                                          <div key={msg.id} ref={el => { messageRefs.current[msg.id] = el }} className="w-full flex justify-start">
                                              <div className="flex items-end gap-2 max-w-[864px]">
                                                  <div className="flex-1 min-w-0" onMouseDown={e => e.stopPropagation()} onClick={() => handleMessageClick(msg.id)}>
                                                      <div className={`rounded-2xl px-4 md:px-5 py-3 md:py-4 shadow-lg relative transition-all ${aiMessageBg} ${isHighlighted ? 'bg-blue-600/20 border border-blue-500/50' : ''}`}>
                                                          {selectedMessageId === msg.id && msg.timestamp !== '0' && ( <div className="text-center text-[10px] text-neutral-400 mb-2">{formatFullTimestamp(msg.timestamp)}</div> )}
                                                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                                                              {showBrainButton && ( <button onClick={onShowMemory} className="p-1 rounded-full text-purple-400" aria-label="View memories"><BrainIcon className="w-5 h-5" /></button> )}
                                                              {selectedMessageId === msg.id && ( <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(msg.id); }} className="p-1 rounded-full text-pink-500 hover:opacity-80 transition-opacity" aria-label={accountSettings.favoriteMessages.includes(msg.id) ? "Unfavorite message" : "Favorite message"}><HeartIcon filled={accountSettings.favoriteMessages.includes(msg.id)} className="w-5 h-5" /></button> )}
                                                          </div>
                                                          <div className="font-semibold text-base md:text-lg mb-3 flex items-center gap-2">
                                                              <span className="text-soul-name">{activeSoul.name}</span>
                                                              <button onClick={(e) => { e.stopPropagation(); onPlayPauseSpeech(msg.id, msg.text); }} className={`p-1 rounded-full transition-colors ${speakingMessageId === msg.id ? 'text-purple-400 animate-pulse' : 'text-neutral-400 hover:text-white'}`} aria-label={speakingMessageId === msg.id ? "Stop reading aloud" : "Read message aloud"}><SpeakerWaveIcon className="w-5 h-5" /></button>
                                                              {msg.isEdited && <span className="text-xs ml-2 text-neutral-500 font-normal">(edited)</span>}
                                                          </div>
                                                          <div className="text-white text-base md:text-lg leading-relaxed prose prose-invert max-w-none prose-p:whitespace-pre-wrap break-words pb-8"><MessageContent text={msg.text} /></div>
                                                          <div className="absolute bottom-2 right-2 flex items-center gap-2">
                                                              {showVersionSwitcher && (
                                                                  <div className="flex items-center gap-1 text-xs text-neutral-400 font-mono bg-neutral-800/60 border border-neutral-700/60 rounded-full px-2 py-0.5">
                                                                      <button onClick={() => onCycleMessageVersion(msg.id, 'prev')} disabled={versionInfo.currentIndex === 0} className="disabled:opacity-30">
                                                                          <ArrowLeftIconV2 className="w-4 h-4" />
                                                                      </button>
                                                                      <span>{versionInfo.currentIndex + 1}/{versionInfo.versions.length}</span>
                                                                      <button onClick={() => onCycleMessageVersion(msg.id, 'next')} disabled={versionInfo.currentIndex === versionInfo.versions.length - 1} className="disabled:opacity-30">
                                                                          <ArrowRightIconV2 className="w-4 h-4" />
                                                                      </button>
                                                                  </div>
                                                              )}
                                                              {msg.id === lastAiMsgId && !isLoading && (
                                                                  <button
                                                                      onClick={() => onContinueMessage(msg.id)}
                                                                      className="p-1 rounded-full text-neutral-400 bg-neutral-800/60 border border-neutral-700/60 hover:bg-neutral-700/80 transition-opacity"
                                                                      aria-label="Continue message"
                                                                      title="Continue cut-off message"
                                                                  >
                                                                      <img
                                                                          src="https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Soulverse%20icon%20topbar%2Fchevron.png?alt=media&token=2ff15e19-23c9-4c1d-b611-2d0a34f19a3c"
                                                                          alt="Continue"
                                                                          className="w-5 h-5"
                                                                      />
                                                                  </button>
                                                              )}
                                                          </div>
                                                      </div>
                                                  </div>
                                                  <div className={`flex-shrink-0 flex items-center space-x-1 pb-6 transition-opacity duration-200 ${msg.id === lastAiMsgId && (!isLoading || index === messages.length -1) ? 'opacity-100' : 'opacity-0 invisible'}`}>
                                                      <button onClick={() => onRegenerateMessage(msg.id)} className="p-1 rounded-full text-neutral-400" aria-label="Regenerate/Suggest Change"><RegenerateIcon className="w-8 h-8" /></button>
                                                      <ChatMessageActions messageId={msg.id} onContinue={onContinueMessage} onTweak={onTweakMessage} onOpenChatBreakModal={onOpenChatBreakModal} onAutoSelfie={onAutoSelfie} />
                                                  </div>
                                              </div>
                                          </div>
                                        );
                                    }

                                    return (
                                       <div key={msg.id} ref={el => { messageRefs.current[msg.id] = el }} className="w-full flex justify-end">
                                          <div className="max-w-[864px] flex items-end gap-2">
                                              {!isLoading && msg.id === lastUserMsgId && ( <div className="w-8 flex-shrink-0 flex flex-col items-center pb-2"><button onClick={() => onEditUserMessage(msg.id)} className="p-1.5 rounded-full text-neutral-400" aria-label="Edit message"><PencilIcon className="w-5 h-5" /></button></div> )}
                                              <div className="flex-1 min-w-0" onMouseDown={e => e.stopPropagation()} onClick={() => handleMessageClick(msg.id)}>
                                                  <div className={`relative rounded-2xl px-4 md:px-5 py-3 shadow-lg transition-all ${userMessageBg} ${isHighlighted ? 'bg-blue-600/20 border-blue-500/50' : 'border border-transparent'}`}>
                                                       {selectedMessageId === msg.id && msg.timestamp !== '0' && ( <div className="text-center text-[10px] text-neutral-400 mb-2">{formatFullTimestamp(msg.timestamp)}</div> )}
                                                      <div className="absolute top-1 right-2 flex items-center gap-1"> {selectedMessageId === msg.id && ( <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(msg.id); }} className="p-1 rounded-full text-pink-500 hover:opacity-80 transition-opacity" aria-label={accountSettings.favoriteMessages.includes(msg.id) ? "Unfavorite message" : "Favorite message"}><HeartIcon filled={accountSettings.favoriteMessages.includes(msg.id)} className="w-5 h-5" /></button> )}</div>
                                                      <div className="text-base md:text-lg mb-2 flex items-center gap-2"><span className="text-user-name font-medium">{accountSettings.userName}</span>{msg.isEdited && <span className="text-xs text-neutral-500 font-normal">(edited)</span>}</div>
                                                      {msg.imageUrl && (<img src={msg.imageUrl} alt="User upload" className="my-2 rounded-lg max-h-64" />)}
                                                      <div className="text-white text-base md:text-lg leading-relaxed prose prose-invert max-w-none prose-p:whitespace-pre-wrap break-words"><MessageContent text={msg.text} /></div>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                    );
                                })}
                                 {isLoading && !messages.some(m => m.sender === 'ai' && m.text === '') && ( <div ref={fallbackLoaderRef} className="w-full flex justify-start"><LoadingIndicatorWithMenu /></div> )}
                                 <div ref={bottomOfChatRef} />
                            </>
                        )}
                    </div>
                </div>
                 {showScrollToBottom && ( <button onClick={scrollToBottom} className="absolute bottom-4 right-8 z-20 p-3 bg-neutral-800/80 backdrop-blur-sm rounded-full text-white hover:bg-neutral-700/80 transition-all shadow-lg" aria-label="Scroll to bottom"><ArrowDownIcon className="w-6 h-6" /></button> )}
            </div>
        </div>
        
        <div className="flex-shrink-0 z-10">
            <div className="w-full max-w-[840px] mx-auto px-4 pt-2 pb-2">
                <form onSubmit={handleSubmit} className="flex flex-col">
                    {showAttachmentArea && (
                        <div className="mb-2 w-full space-y-2">
                            {isInternetSearchEnabled && !isFreeUser && ( <div className="text-xs text-neutral-400 p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex justify-between items-center max-w-[720px] mx-auto"><span>Internet connection enabled - your Soul will look for up-to-date information when replying to your current message.</span><button onClick={() => setIsInternetSearchEnabled(false)} className="underline font-semibold ml-2 flex-shrink-0">Disable</button></div> )}
                            {isLinkBrowsingEnabled && !isFreeUser && ( <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2 max-w-[720px] mx-auto"><div className="text-xs text-neutral-400 flex justify-between items-center"><span>Link browsing enabled - your Soul will be able to understand the text of the link you send and use it in their reply.</span><button onClick={() => setIsLinkBrowsingEnabled(false)} className="underline font-semibold ml-2 flex-shrink-0">Disable</button></div><input type="text" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://soulverse.ai" className="w-full bg-neutral-800 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"/></div> )}
                            {imageAttachment && !isFreeUser && ( <div className="relative w-24 h-24"><img src={imageAttachment.dataUrl} alt="Attachment preview" className="w-full h-full object-cover rounded-lg" /><button onClick={handleRemoveImage} className="absolute -top-1.5 -right-1.5 bg-neutral-800 border-2 border-neutral-900 rounded-full p-0.5"><XMarkIcon className="w-4 h-4 text-white" /></button></div> )}
                        </div>
                    )}
                    <div className="w-full">
                        <div className="flex items-end space-x-2">
                            {!isFreeUser && (
                                <>
                                    <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                                    <div className="hidden md:flex items-center self-end">
                                        {isAttachmentMenuOpen ? (
                                            <div className="flex items-center gap-0">
                                                <button type="button" onClick={() => setIsAttachmentMenuOpen(false)} className="p-1.5 md:p-2 text-neutral-400 hover:text-white"><ChevronLeftIcon className="w-6 h-6 md:w-7 md:h-7"/></button>
                                                <button type="button" onClick={() => imageInputRef.current?.click()} disabled={isInternetSearchEnabled || isLinkBrowsingEnabled} className="p-1.5 md:p-2 text-neutral-400 hover:text-white disabled:text-neutral-600 disabled:cursor-not-allowed" title="Upload Image"><PhotoIcon className="w-6 h-6 md:w-7 md:h-7"/></button>
                                                <button type="button" onClick={handleToggleInternetSearch} disabled={!!imageAttachment} className={`p-1.5 md:p-2 transition-colors ${isInternetSearchEnabled ? 'text-cyan-400' : 'text-neutral-400 hover:text-white'} disabled:text-neutral-600 disabled:cursor-not-allowed`} title="Enable Internet Search"><GlobeAltIcon className="w-6 h-6 md:w-7 md:h-7"/></button>
                                                <button type="button" onClick={handleToggleLinkBrowsing} disabled={!!imageAttachment} className={`p-1.5 md:p-2 transition-colors ${isLinkBrowsingEnabled ? 'text-cyan-400' : 'text-neutral-400 hover:text-white'} disabled:text-neutral-600 disabled:cursor-not-allowed`} title="Enable Link Browsing"><LinkIcon className="w-6 h-6 md:w-7 md:h-7"/></button>
                                            </div>
                                        ) : (
                                            <button type="button" onClick={() => setIsAttachmentMenuOpen(true)} className="p-1.5 md:p-2 text-neutral-400 hover:text-white flex-shrink-0"><PlusIcon className="w-6 h-6 md:w-7 md:h-7"/></button>
                                        )}
                                    </div>
                                    <button type="button" onClick={() => setIsAttachmentMenuOpen(p => !p)} className="p-2 text-neutral-400 hover:text-white flex-shrink-0 md:hidden"><PlusIcon className="w-7 h-7"/></button>
                                </>
                            )}

                            <div className="relative flex-1 flex items-end bg-neutral-800 rounded-2xl border border-transparent transition-all">
                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (isMobile) return;
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                    placeholder="Message"
                                    rows={1}
                                    maxLength={accountSettings.adminMode ? undefined : characterLimit}
                                    className="w-full bg-transparent py-3 px-4 pr-12 resize-none focus:outline-none disabled:opacity-50 text-base md:text-lg max-h-48"
                                    disabled={isLoading}
                                />
                                <div className="absolute right-3 bottom-3 flex items-center">
                                    {isWandLoading ? ( 
                                        <LoadingSpinner className="w-6 h-6 text-neutral-400" /> 
                                    ) : ( 
                                        <button 
                                            type="button" 
                                            onClick={handleWandClick} 
                                            className="text-neutral-400 disabled:text-neutral-600" 
                                            disabled={isLoading || isWandLoading}
                                        >
                                            <WandSparklesIcon className="w-6 h-6"/>
                                        </button> 
                                    )}
                                </div>
                            </div>

                            <div className="flex-shrink-0 self-end">
                                {input.trim() || imageAttachment ? (
                                     <button type="submit" className="w-12 h-12 md:w-[52px] md:h-[52px] flex items-center justify-center rounded-full transition-opacity disabled:opacity-50 text-white bg-gradient-cyan-purple hover:opacity-90" disabled={isLoading} aria-label="Send message"><SendIcon className="w-6 h-6" /></button> 
                                ) : ( 
                                     <button type="button" onClick={handleMicClick} className={`w-12 h-12 md:w-[52px] md:h-[52px] flex items-center justify-center rounded-full text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isListening ? 'bg-blue-600 animate-pulse' : 'bg-gradient-cyan-purple hover:opacity-90'}`} disabled={isLoading || !isSpeechRecognitionSupported} aria-label={isSpeechRecognitionSupported ? "Send voice message" : "Voice input not supported by your browser"} title={isSpeechRecognitionSupported ? "Send voice message" : "Voice input not supported by your browser"}><MicrophoneIcon className="w-6 h-6" /></button> 
                                )}
                            </div>
                        </div>
                        <p className="text-center md:text-left text-xs text-neutral-500 pt-1 md:pl-[52px]">Chatting as {accountSettings.userName}</p>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};