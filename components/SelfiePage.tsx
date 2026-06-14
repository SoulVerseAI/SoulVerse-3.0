import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Soul, ChatMessage, Post, AccountSettings, Selfie, VideoSelfie } from '../types';
import { ArrowLeftIcon, WandSparklesIcon, ClockIcon, CheckIcon, PlusIcon, XMarkIcon, LoadingSpinner, ExclamationTriangleIcon } from './icons/Icons';
import { 
    generateImage, 
    generatePostCaption, 
    getConversationContext,
    generateSimpleScenePrompt,
    generateSelfiePrompt,
    generateVideo,
    generateVideoSelfiePrompt,
    generateRandomSelfiePrompt
} from '../services/geminiService';
import { Modal } from './ui/Modal';
import { Toggle } from './ui/Toggle';
import { CollapsibleSection } from './ui/CollapsibleSection';

const selfiePoses = [
    { name: "Face Close-Up", description: "Pose reference, single character, close-up on face, holding phone near cheek, neutral background." },
    { name: "Half-Body Standing", description: "Pose reference, single character, upper body view, arm slightly bent holding phone in front, relaxed pose, no background." },
    { name: "Full Standing Casual", description: "Pose reference, full-body, standing straight, one leg slightly bent, one arm down, other holding phone forward, lineart style." },
    { name: "Sitting Selfie", description: "Pose reference, single character sitting on chair, leaning forward, holding phone at arm’s length, simple mannequin figure." },
    { name: "Mirror Selfie Standing", description: "Pose reference, full-body standing in front view, one arm raised holding phone in front of face, other arm resting on hip." },
    { name: "High-Angle Selfie", description: "Pose reference, upper body, character holding phone above head angled downward, head tilted upward, no background." },
    { name: "Low-Angle Selfie", description: "Pose reference, half-body, character holding phone near waist angled upward, head tilted down at camera." },
    { name: "Dynamic Lean Pose", description: "Pose reference, full-body leaning sideways, arm stretched with phone for selfie, casual dynamic stance." },
    { name: "Sitting Cross-Legged Selfie", description: "Pose reference, character seated cross-legged on floor, arm extended holding phone, relaxed expression, simple outline." },
    { name: "Stylized Over-Shoulder Selfie", description: "Pose reference, single character, upper body, holding phone slightly to side, turning head toward camera over shoulder." }
];

const scenePoses = [
    { name: "Two Characters Side-by-Side", description: "Pose reference, two characters standing close, one holding phone forward, both facing camera." },
    { name: "Shoulder-to-Shoulder", description: "Pose reference, two characters upper body, shoulders touching, one arm extended with phone, both looking at camera." },
    { name: "Standing Casual", description: "Pose reference, characters standing in row, middle character holding phone up front, all facing camera." },
    { name: "Sitting Group Selfie", description: "Pose reference, two characters sitting on bench, one holding phone, both leaning slightly together for selfie." },
    { name: "Overhead Group Selfie", description: "Pose reference, two or three characters looking up, phone held high above heads, clustered pose." },
    { name: "Fun Dynamic Selfie", description: "Pose reference, two characters making playful poses, one sticking tongue out, other holding phone forward." },
    { name: "Back-to-Back Selfie", description: "Pose reference, two characters standing back-to-back, one twisting torso to hold phone in front capturing both." },
    { name: "Group Hug Selfie", description: "Pose reference, three characters with arms around shoulders, one holding phone forward, friendly pose." },
    { name: "Crowded Selfie", description: "Pose reference, four characters close together, faces leaning in toward camera, phone held at arm’s length." },
    { name: "Mixed Sitting/Standing Selfie", description: "Pose reference, one character sitting on chair, another standing close behind, both looking into phone camera." }
];


interface SelfiePageProps {
  isOpen: boolean;
  onClose: () => void;
  activeSoul: Soul | null;
  onUpdateSoul: (updater: Partial<Soul> | ((prevSoul: Soul) => Partial<Soul>)) => void;
  messages: ChatMessage[];
  accountSettings: AccountSettings;
  isLoading: boolean;
  setToast: (toast: { title: string; message: React.ReactNode } | null) => void;
}

const VideoGenerationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    statusMessages: string[];
}> = ({ isOpen, statusMessages, onClose }) => {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (!isOpen) {
            setCurrentMessageIndex(0);
        }
    }

    useEffect(() => {
        if (!isOpen) return;

        const interval = setInterval(() => {
            setCurrentMessageIndex(prev => (prev + 1) % statusMessages.length);
        }, 4000); // Change message every 4 seconds

        return () => clearInterval(interval);
    }, [isOpen, statusMessages.length]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Generating Video Selfie">
            <div className="p-8 text-center space-y-4">
                <LoadingSpinner className="w-12 h-12 text-purple-400 mx-auto" />
                <p className="text-white font-semibold">Please wait, this can take a few minutes.</p>
                <p className="text-sm text-neutral-400 h-10 transition-opacity duration-500">
                    {statusMessages[currentMessageIndex]}
                </p>
            </div>
        </Modal>
    );
};

const MediaViewerModal: React.FC<{ imageUrl: string | null; onClose: () => void }> = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `soulverse-selfie-${Date.now()}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <img src={imageUrl} alt="Zoomed content" className="w-full h-auto max-h-[90vh] object-contain rounded-lg" />
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <button onClick={handleDownload} className="p-2 rounded-full bg-black/50 hover:bg-black/70" title="Download Image">
                    <ArrowDownTrayIcon className="w-6 h-6 text-white" />
                </button>
                <button onClick={onClose} className="p-2 rounded-full bg-black/50 hover:bg-black/70">
                    <XMarkIcon className="w-6 h-6 text-white" />
                </button>
            </div>
        </div>
    );
};

const GeneratorView: React.FC<{
  type: 'selfie' | 'scene';
  soul: Soul;
  messages: ChatMessage[];
  accountSettings: AccountSettings;
  onGenerate: (prompt: string, aspectRatio: '1:1' | '4:3' | '3:4', useNsfw: boolean, pose: { name: string; description: string } | null) => void;
  isGenerating: boolean;
  onBack: () => void;
}> = ({ type, soul, messages, accountSettings, onGenerate, isGenerating, onBack }) => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:3' | '3:4'>('1:1');
    const [showAdditionalControls, setShowAdditionalControls] = useState(false);
    const [useNsfw, setUseNsfw] = useState(soul.enableNsfwSelfies);
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [selectedPose, setSelectedPose] = useState<{ name: string; description: string } | null>(null);
    const [isPoseMenuOpen, setIsPoseMenuOpen] = useState(false);
    const poseMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (poseMenuRef.current && !poseMenuRef.current.contains(event.target as Node)) {
                setIsPoseMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [poseMenuRef]);

    const handleGenerateRandomPrompt = async () => {
        setIsGeneratingPrompt(true);
        try {
            const randomPrompt = await generateRandomSelfiePrompt(soul.name, soul.physicalAppearanceDescription, type);
            setPrompt(randomPrompt);
        } catch (e) {
            console.error("Failed to generate random prompt", e);
        } finally {
            setIsGeneratingPrompt(false);
        }
    };
    
    const buttonText = isGenerating ? 'Generating...' : (type === 'selfie' ? 'Request Selfie' : 'Generate Scene');
    const poses = type === 'selfie' ? selfiePoses : scenePoses;

    const handlePoseSelect = (pose: { name: string, description: string }) => {
        setSelectedPose(pose);
        setIsPoseMenuOpen(false);
    };

    return (
        <div className="flex-1 flex flex-col min-h-0">
             <header className="flex-shrink-0 p-4 border-b border-neutral-800 flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-neutral-800">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-white">
                    {type === 'selfie' ? 'Request Selfie' : 'Generate Scene'}
                </h2>
            </header>
            <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar px-4 pr-6 py-4">
                <p className="text-sm text-neutral-300">
                    Tell {soul.name} how to take their {type === 'selfie' ? 'single-person selfie' : 'scene photo'}. Include descriptors like backdrop, clothes, and image details. Selfies will make use of your <a href="#" className="text-blue-400 underline">avatar settings</a>. See our user guide for more tips on selfies.
                </p>
                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        maxLength={2000}
                        rows={5}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                        placeholder={`Walking in a park in the afternoon, wearing a casual shirt and jeans, smiling...`}
                    />
                    <button 
                        onClick={handleGenerateRandomPrompt} 
                        disabled={isGeneratingPrompt}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-neutral-700/80 text-neutral-300 hover:bg-neutral-600/80 disabled:opacity-50"
                    >
                        <WandSparklesIcon className={`w-5 h-5 ${isGeneratingPrompt ? 'animate-pulse' : ''}`} />
                    </button>
                    <p className="text-xs text-neutral-500 mt-1 text-right">{prompt.length} / 2000 chars</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative w-40">
                         <select
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value as '1:1' | '4:3' | '3:4')}
                            className="w-full appearance-none bg-neutral-800 border border-neutral-700 rounded-md py-2 px-3 pr-8 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                            <option value="1:1">Square (1:1)</option>
                            <option value="3:4">Portrait (3:4)</option>
                            <option value="4:3">Landscape (4:3)</option>
                        </select>
                        <ChevronDownIcon className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
                    </div>
                    <div className="relative w-48" ref={poseMenuRef}>
                        <button
                            onClick={() => setIsPoseMenuOpen(p => !p)}
                            className="w-full flex items-center justify-between bg-neutral-800 border border-neutral-700 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-purple-500 text-left"
                        >
                            <span className="truncate text-sm">{selectedPose?.name || 'Pose Reference'}</span>
                            <ChevronDownIcon className={`w-4 h-4 text-neutral-400 transition-transform ${isPoseMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isPoseMenuOpen && (
                            <div className="absolute z-10 mt-1 w-full bg-neutral-900 border border-neutral-700 rounded-md shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
                                {poses.map((pose) => (
                                    <button
                                        key={pose.name}
                                        onClick={() => handlePoseSelect(pose)}
                                        className="block w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
                                    >
                                        {pose.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="text-sm font-medium text-neutral-300 hover:text-white">+ Style Reference</button>
                </div>
                <div>
                    <button onClick={() => setShowAdditionalControls(p => !p)} className="flex items-center gap-1 text-sm text-neutral-400 hover:text-white">
                        Additional controls
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${showAdditionalControls ? 'rotate-180' : ''}`} />
                    </button>
                    {showAdditionalControls && (
                        <div className="mt-4 space-y-4 p-4 bg-neutral-800/50 rounded-lg">
                            <div>
                                <label className="flex items-center justify-between text-sm">
                                    <span className="font-semibold text-white">Use NSFW engine</span>
                                    <Toggle checked={useNsfw} onChange={setUseNsfw} />
                                </label>
                                <p className="text-xs text-neutral-400 mt-1">
                                    NSFW engine optimizes anatomy in NSFW prompts but may generate different visual styles with potentially lower overall image quality.
                                </p>
                            </div>

                        </div>
                    )}
                </div>
            </div>
            <div className="flex-shrink-0 p-4 border-t border-neutral-800">
                <button
                    onClick={() => onGenerate(prompt, aspectRatio, useNsfw, selectedPose)}
                    disabled={isGenerating}
                    className="w-full py-4 font-semibold rounded-full text-white bg-gradient-cyan-purple hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

const VideoGeneratorView: React.FC<{
  soul: Soul;
  onGenerate: () => void;
  isGenerating: boolean;
  onBack: () => void;
}> = ({ soul, onGenerate, isGenerating, onBack }) => {
    
    return (
        <div className="flex-1 flex flex-col min-h-0">
            <header className="flex-shrink-0 p-4 border-b border-neutral-800 flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-neutral-800">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-white">
                    Request Video
                </h2>
            </header>
            <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar px-4 pr-6 py-4">
                <p className="text-sm text-neutral-300">
                    A video scene will be generated based on the current conversation context, featuring {soul.name} and your character.
                </p>
                <div className="relative">
                    <textarea
                        value=""
                        readOnly
                        disabled
                        maxLength={2000}
                        rows={5}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none disabled:opacity-70"
                        placeholder={`The prompt will be generated automatically from your recent chat history.`}
                    />
                    <p className="text-xs text-neutral-500 mt-1 text-right">0 / 2000 chars</p>
                </div>
            </div>
            <div className="flex-shrink-0 p-4 border-t border-neutral-800">
                <button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="w-full py-4 font-semibold rounded-full text-white bg-gradient-cyan-purple hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {isGenerating ? 'Generating...' : 'Request Video'}
                </button>
            </div>
        </div>
    );
};


const SelfieGallery: React.FC<{
    soul: Soul;
    onGenerateSelfie: () => void;
    onGenerateScene: () => void;
    onRequestVideo: () => void;
    isGenerating: boolean;
    onImageClick: (url: string) => void;
}> = ({ soul, onGenerateSelfie, onGenerateScene, onRequestVideo, isGenerating, onImageClick }) => {
    const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');

    const selfies = soul.selfies || [];
    const videoSelfies = soul.videoSelfies || [];

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-shrink-0 border-b border-neutral-800 flex">
                <button onClick={() => setActiveTab('photos')} className={`flex-1 py-3 text-sm font-semibold border-b-2 ${activeTab === 'photos' ? 'border-white text-white' : 'border-transparent text-neutral-500'}`}>Photos</button>
                <button onClick={() => setActiveTab('videos')} className={`flex-1 py-3 text-sm font-semibold border-b-2 ${activeTab === 'videos' ? 'border-white text-white' : 'border-transparent text-neutral-500'}`}>Videos</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'photos' && (
                    selfies.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-neutral-500">No photos in gallery</div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {selfies.map((selfie) => (
                                <div key={selfie.id} className="aspect-square bg-neutral-800 rounded-lg overflow-hidden">
                                    {selfie.status === 'pending' ? (
                                        <div className="w-full h-full bg-neutral-900/50 flex flex-col items-center justify-center text-white">
                                            <LoadingSpinner className="w-8 h-8" />
                                            <span className="mt-2 text-lg font-bold">{selfie.progress || 0}%</span>
                                        </div>
                                    ) : selfie.status === 'failed' ? (
                                        <div className="w-full h-full bg-red-900/50 flex flex-col items-center justify-center text-red-300 p-2 text-center">
                                            <ExclamationTriangleIcon className="w-8 h-8" />
                                            <span className="mt-2 text-xs font-semibold">Generation Failed</span>
                                        </div>
                                    ) : (
                                        <button onClick={() => onImageClick(selfie.url)} className="w-full h-full">
                                            <img src={selfie.url} alt="Selfie" className="w-full h-full object-cover" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                )}
                {activeTab === 'videos' && (
                    videoSelfies.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-neutral-500">No videos in gallery</div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {videoSelfies.map((video) => (
                                <div key={video.id} className="aspect-square bg-neutral-800 rounded-lg overflow-hidden relative group">
                                    <video src={video.url} className="w-full h-full object-cover" loop muted onMouseEnter={e => e.currentTarget.play().catch(()=>{})} onMouseLeave={e => e.currentTarget.pause()}/>
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <PlayCircleIcon className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
            <footer className="flex-shrink-0 p-4 text-center border-t border-neutral-800">
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                    {activeTab === 'photos' ? (
                        <>
                            <button onClick={onGenerateSelfie} disabled={isGenerating} className="px-8 py-4 flex-1 font-semibold rounded-full text-white bg-gradient-cyan-purple hover:opacity-90 transition-opacity disabled:opacity-50">
                                Request Selfie
                            </button>
                            <button onClick={onGenerateScene} disabled={isGenerating} className="px-8 py-4 flex-1 font-semibold rounded-full text-white bg-gradient-cyan-purple hover:opacity-90 transition-opacity disabled:opacity-50">
                                Generate Scene
                            </button>
                        </>
                    ) : (
                        <button onClick={onRequestVideo} disabled={isGenerating} className="px-8 py-4 flex-1 font-semibold rounded-full text-white bg-gradient-cyan-purple hover:opacity-90 transition-opacity disabled:opacity-50">
                            Request Video
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};


const SelfieMiddleBar: React.FC<{ soulName: string }> = ({ soulName }) => (
    <div className="p-4 border-b border-neutral-800">
        <h2 className="text-xl font-bold text-white mb-2">{soulName} Selfies</h2>
        <p className="text-xs text-neutral-400">
            Standard selfie essence: 31. Paid selfie essence: 0. At standard selfie essence cap (2), Subscribers get to make 10x more selfies and have access to video & group selfies. <button className="underline">Subscribe here</button>
        </p>
    </div>
);


export const SelfiePage: React.FC<SelfiePageProps> = ({ isOpen, onClose, activeSoul, onUpdateSoul, messages, accountSettings, isLoading: isAppLoading, setToast }) => {
    const [viewMode, setViewMode] = useState<'gallery' | 'generator' | 'videoGenerator'>('gallery');
    const [generatorType, setGeneratorType] = useState<'selfie' | 'scene'>('selfie');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [isVideoGenModalOpen, setIsVideoGenModalOpen] = useState(false);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    const progressIntervalRef = useRef<number | null>(null);

    const videoStatusMessages = [
        "Contacting the video generation servers...",
        "Warming up the VEO-2 model...",
        "Analyzing the prompt and context...",
        "Rendering initial frames...",
        "Compositing the video sequence...",
        "Applying post-processing effects...",
        "Finalizing the output, almost there..."
    ];

    if (!activeSoul) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-white">
                <p>No active soul selected.</p>
            </div>
        );
    }
    
    const handleEnterGenerator = (type: 'selfie' | 'scene') => {
        setGeneratorType(type);
        setViewMode('generator');
    };
    
    const handleRequestVideo = () => {
        setViewMode('videoGenerator');
    };

    const handleGenerateVideo = async () => {
        if (!activeSoul) return;
        setIsGeneratingVideo(true);
        setIsVideoGenModalOpen(true);

        try {
            const lastMessagesContext = getConversationContext(messages, 1000, activeSoul.name, accountSettings.userName);
            const finalPrompt = await generateVideoSelfiePrompt(lastMessagesContext, activeSoul.physicalAppearanceDescription, activeSoul.name);
            
            const videoUrl = await generateVideo(finalPrompt);

            const newVideoSelfie: VideoSelfie = {
                id: `video-${Date.now()}`,
                url: videoUrl,
                tags: [],
                timestamp: new Date().toISOString(),
            };

            onUpdateSoul(prevSoul => ({
                videoSelfies: [newVideoSelfie, ...(prevSoul.videoSelfies || [])],
            }));
            
            setViewMode('gallery');
            
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setToast({ title: "Video Generation Failed", message: `Error: ${errorMessage}` });
        } finally {
            setIsGeneratingVideo(false);
            setIsVideoGenModalOpen(false);
        }
    };

    const handleGeneration = async (prompt: string, aspectRatio: '1:1' | '4:3' | '3:4', useNsfw: boolean, pose: { name: string; description: string } | null) => {
        setIsGeneratingImage(true);
        setViewMode('gallery');

        const pendingSelfie: Selfie = {
            id: `pending-${Date.now()}`,
            url: '',
            tags: [],
            timestamp: new Date().toISOString(),
            status: 'pending',
            progress: 0,
        };

        onUpdateSoul(prevSoul => ({
            selfies: [pendingSelfie, ...(prevSoul?.selfies || [])]
        }));
        
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

        progressIntervalRef.current = window.setInterval(() => {
            onUpdateSoul(prevSoul => {
                const currentSelfies = prevSoul.selfies || [];
                const selfieToUpdate = currentSelfies.find(s => s.id === pendingSelfie.id);
        
                if (!selfieToUpdate || selfieToUpdate.status !== 'pending') {
                    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
                    return {}; 
                }
        
                return {
                    selfies: currentSelfies.map(s =>
                        s.id === pendingSelfie.id ? { ...s, progress: Math.min((s.progress || 0) + 5, 99) } : s
                    )
                };
            });
        }, 150);

        try {
            const lastMessagesContext = getConversationContext(messages, 1000, activeSoul.name, accountSettings.userName);
            let prompts;

            if (generatorType === 'selfie') {
                prompts = await generateSelfiePrompt(lastMessagesContext, activeSoul.physicalAppearanceDescription, activeSoul.avatarStyle, activeSoul.name, activeSoul.gender, prompt, pose?.description, useNsfw);
            } else { // scene
                prompts = await generateSimpleScenePrompt(messages, activeSoul, accountSettings, useNsfw, prompt, pose?.description);
            }

            const dataUrl = await generateImage(prompts.positive, aspectRatio , useNsfw);
            const caption = await generatePostCaption(activeSoul, lastMessagesContext, accountSettings.userName, generatorType === 'scene');
            
            const newPost: Post = {
                id: `post-${generatorType}-${Date.now()}`,
                imageUrl: dataUrl,
                mediaType: 'image',
                caption: caption,
                likes: 0,
                comments: [],
                timestamp: new Date().toISOString(),
            };
            
            onUpdateSoul(prevSoul => ({
                selfies: (prevSoul.selfies || []).map(s => 
                    s.id === pendingSelfie.id ? { ...s, status: 'completed', url: dataUrl, progress: 100 } : s
                ),
                posts: [newPost, ...(prevSoul.posts || [])]
            }));

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setToast({ title: "Generation Failed", message: `Error: ${errorMessage}` });
            onUpdateSoul(prevSoul => ({
                selfies: (prevSoul.selfies || []).map(s =>
                    s.id === pendingSelfie.id ? { ...s, status: 'failed' } : s
                )
            }));
        } finally {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            setIsGeneratingImage(false);
        }
    };

    return (
        <>
            <VideoGenerationModal
                isOpen={isVideoGenModalOpen}
                onClose={() => setIsVideoGenModalOpen(false)}
                statusMessages={videoStatusMessages}
            />
            <MediaViewerModal imageUrl={zoomedImage} onClose={() => setZoomedImage(null)} />

            <div className="w-full h-full flex flex-col text-white bg-transparent">
                <div className="flex-1 flex flex-col items-center min-h-0">
                    <div className="w-full max-w-5xl mx-auto flex flex-col flex-1 min-h-0">
                        <div className="flex-shrink-0">
                            <SelfieMiddleBar soulName={activeSoul.name} />
                        </div>
                        <div className="flex-1 flex flex-col min-h-0">
                            {viewMode === 'gallery' ? (
                                <SelfieGallery
                                    soul={activeSoul}
                                    onGenerateSelfie={() => handleEnterGenerator('selfie')}
                                    onGenerateScene={() => handleEnterGenerator('scene')}
                                    onRequestVideo={handleRequestVideo}
                                    isGenerating={isGeneratingImage || isGeneratingVideo || isAppLoading}
                                    onImageClick={(url) => setZoomedImage(url)}
                                />
                            ) : viewMode === 'generator' ? (
                                <GeneratorView
                                    type={generatorType}
                                    soul={activeSoul}
                                    messages={messages}
                                    accountSettings={accountSettings}
                                    onGenerate={handleGeneration}
                                    isGenerating={isGeneratingImage || isAppLoading}
                                    onBack={() => setViewMode('gallery')}
                                />
                            ) : (
                                <VideoGeneratorView
                                    soul={activeSoul}
                                    onGenerate={handleGenerateVideo}
                                    isGenerating={isGeneratingVideo || isAppLoading}
                                    onBack={() => setViewMode('gallery')}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};