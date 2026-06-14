
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Soul, AccountSettings, Post, Comment, SoulRole, Gender } from '../types';
import { UserCircleIcon, GridIcon, HeartIcon, ChatBubbleBottomCenterTextIcon, EllipsisVerticalIcon, XMarkIcon, CheckIcon, CogIcon, PlayCircleIcon, BookmarkIcon, ArrowLeftIcon, BellIcon, UserIcon as UserIconSolid, VerifiedIcon, ArrowDownTrayIcon } from './icons/Icons';
import { Modal } from './ui/Modal';
// FIX: Corrected import path for SoulTemplate.
import { SoulTemplate } from '../types';

const defaultSoulData: Omit<Soul, 'id' | 'name'> = {
    description: '', model: 'gemini-2.5-flash', gender: 'Female', avatar: null,
    backstory: '', responseDirective: '', keyMemories: '', greeting: '',
    exampleMessage: '', voiceURI: null, mbti: null, enneagram: null, dynamism: 0.95,
    antiRepeatStrength: 0, memoryConsolidation: true, memoryRecall: true,
    maxTokens: 2048, avatarStyle: 'Photoreal', physicalAppearanceDescription: '',
    faceDetailEnhance: 0, faceDetailPrompt: '', enableNsfwSelfies: false, selfies: [],
    followersCount: 0, followingCount: 0, username: '', bio: '', profileBannerUrl: null,
    posts: [],
};

const hydrateSoulsWithSocialData = (souls: (Soul | SoulTemplate)[]): Soul[] => {
    return souls.map((soul, index) => {
        const isTemplate = !('id' in soul);

        let soulForHydration: Soul;
        if (isTemplate) {
            const template = soul as SoulTemplate;
            soulForHydration = {
                ...defaultSoulData,
                id: `template-${template.name.replace(/\s+/g, '-')}-${index}`,
                name: template.name,
                description: template.title,
                model: 'gemini-2.5-flash',
                gender: template.gender as Gender,
                avatar: template.smallAvatarUrl,
                backstory: template.backstory,
                responseDirective: template.responseDirective,
                keyMemories: template.keyMemories,
                greeting: template.greeting,
                exampleMessage: template.exampleMessage || template.greeting,
                dynamism: template.dynamism,
                mbti: template.mbti,
                enneagram: template.enneagram,
                avatarStyle: 'Photoreal',
                physicalAppearanceDescription: template.longDescription,
                username: template.name.toLowerCase().replace(/\s+/g, '_'),
                bio: template.longDescription,
                profileBannerUrl: template.profileBannerUrl,
                posts: template.posts || [],
                role: template.role || SoulRole.CHARACTER,
                templateName: template.name,
            };
        } else {
            soulForHydration = soul as Soul;
        }

        if (soulForHydration.posts && soulForHydration.posts.length > 0) {
             soulForHydration.posts = soulForHydration.posts.map(p => ({
                ...p,
                media: p.media || (p.imageUrl ? [{ type: 'image', url: p.imageUrl, aspectRatio: 'portrait' }] : [])
             }));
        } else {
            const newPosts: Post[] = [];
            const postImageSource = (isTemplate ? (soul as SoulTemplate).bgImageUrls : soulForHydration.selfies.map(s => s.url)) || [];
            const hasVideo = isTemplate && !!(soul as SoulTemplate).bgVideoUrl;

            const getThematicCaption = (): string => {
                const description = soulForHydration.description.toLowerCase();
                const name = soulForHydration.name;
                if (description.includes("jigsaw") || description.includes("horror")) {
                    return `Do you want to play a game? The choice is yours. #Jigsaw #GameTime #MakeYourChoice`;
                }
                if (description.includes("elite") || description.includes("las encinas")) {
                    return `School's in session. But the real lessons are learned in the hallways. #LasEncinas #Elite #Secrets`;
                }
                if (description.includes("hogwarts") || description.includes("harry potter")) {
                    return `There's magic in the air tonight. ✨ #Hogwarts #FirstYear #WitchcraftAndWizardry`;
                }
                if (description.includes("marvel") || description.includes("superhero")) {
                    return `Just another day in the city that never sleeps. You never know who you'll see. #Marvel #NYC #NotAllHeroesWearCapes`;
                }
                if (description.includes("vampire") || description.includes("gothic")) {
                    return `The night holds its own beauty... and its own secrets. #Vampire #Gothic #Eternal`;
                }
                 if (description.includes("cyberpunk") || description.includes("neo-kyoto")) {
                    return `Neon dreams and chrome realities. Just another night in the concrete jungle. #Cyberpunk #Netrunner #HighTechLowLife`;
                }
                return `Just a glimpse into my world. What's on your mind today? #${name.replace(/\s+/g, '')}`;
            };
            
            const images = postImageSource.map(img => ({
                type: 'image' as const,
                url: typeof img === 'string' ? img : img.url,
                aspectRatio: (typeof img === 'object' && 'aspectRatio' in img) ? img.aspectRatio : 'portrait'
            }));

            if (images.length > 0) {
                newPosts.push({
                    id: `${soulForHydration.id}-post-gallery-0`,
                    media: images,
                    caption: getThematicCaption(),
                    likes: Math.floor(Math.random() * 2000) + 100,
                    comments: [],
                    timestamp: new Date(Date.now() - (index * 2 * 60 * 60 * 1000)).toISOString(),
                });
            }

            if (hasVideo) {
                newPosts.push({
                    id: `${soulForHydration.id}-post-video-0`,
                    media: [{ 
                        type: 'video', 
                        url: (soul as SoulTemplate).bgVideoUrl!, 
                        thumbnailUrl: images.length > 0 ? images[0].url : soulForHydration.avatar || '',
                        aspectRatio: 'portrait' 
                    }],
                    caption: "Some moments are best captured in motion. #video",
                    likes: Math.floor(Math.random() * 1500) + 80,
                    comments: [],
                    timestamp: new Date(Date.now() - (index * 3 * 60 * 60 * 1000)).toISOString(),
                });
            }

            soulForHydration.posts = newPosts;
        }
        
        return {
            ...soulForHydration,
            username: soulForHydration.username || soulForHydration.name.toLowerCase().replace(/\s+/g, '_'),
            bio: soulForHydration.bio || soulForHydration.description,
            followersCount: soulForHydration.followersCount || Math.floor(Math.random() * 10000),
            followingCount: soulForHydration.followingCount || Math.floor(Math.random() * 500),
            profileBannerUrl: soulForHydration.profileBannerUrl || 'https://gkryniecki.wordpress.com/wp-content/uploads/2025/07/soulboard_banner.png',
            posts: (soulForHydration.posts || []).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        };
    });
};

interface SoulBoardPageProps {
  isOpen: boolean;
  onClose: () => void;
  accountSettings: AccountSettings;
  setAccountSettings: (updater: (prev: AccountSettings) => AccountSettings) => void;
  initialState?: { view: 'feed', soulId: null } | { view: 'profile', soulId: string } | null;
  soulTemplates: SoulTemplate[];
}

const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; }> = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
        checked ? 'bg-blue-600' : 'bg-neutral-600'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
);

interface CommentAsModalProps {
    isOpen: boolean;
    onClose: () => void;
    accountSettings: AccountSettings;
    selectedId: string;
    onSelect: (id: string, name: string, avatar: string | null) => void;
}

const CommentAsModal: React.FC<CommentAsModalProps> = ({ isOpen, onClose, accountSettings, selectedId, onSelect }) => {
    
    const userProfile = {
        id: 'user_main',
        name: `${accountSettings.userName} (User)`,
        avatar: accountSettings.userAvatar
    };

    const personas = (accountSettings.personas || []).map(p => ({
        id: p.id,
        name: p.name,
        avatar: p.userAvatar
    }));

    const commenters = [userProfile, ...personas];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Comment As" maxWidth="max-w-lg">
            <div className="p-2">
                <ul className="space-y-1">
                    {commenters.map(commenter => (
                        <li key={commenter.id}>
                            <button 
                                onClick={() => {
                                    onSelect(commenter.id, commenter.name.replace(' (User)',''), commenter.avatar);
                                    onClose();
                                }} 
                                className="w-full flex items-center justify-between p-3 rounded-lg text-left hover:bg-neutral-700/60"
                            >
                                <div className="flex items-center gap-3">
                                    {commenter.avatar ? (
                                        <img src={commenter.avatar} alt={commenter.name} className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                            {commenter.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="font-semibold text-white">{commenter.name}</span>
                                </div>
                                {selectedId === commenter.id && (
                                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                        <CheckIcon className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </Modal>
    );
};


const SharePostModal: React.FC<{ post: Post | null, soul: Soul | null, isOpen: boolean, onClose: () => void }> = ({ post, soul, isOpen, onClose }) => {
    const [copied, setCopied] = useState(false);
    
    if (!isOpen || !post || !soul) return null;

    const shareLink = `https://soulverse.ai/soulboard/post/${post.id}`;

    const handleShare = async () => {
        const shareData = {
            title: `Check out this post from ${soul.name} on SoulVerse!`,
            text: post.caption,
            url: shareLink,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareLink);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (error) {
            console.error('Error sharing:', error);
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Share link" maxWidth="max-w-lg">
            <div className="p-6 space-y-4">
                 <div className="relative">
                    <input type="text" readOnly value={shareLink} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 pr-24 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    <button onClick={handleShare} className="absolute right-2 top-1/2 -translate-y-1/2 py-1.5 px-4 rounded-full text-sm font-semibold bg-neutral-700 hover:bg-neutral-600 transition-colors">
                        {copied ? 'Copied!' : 'Share'}
                    </button>
                 </div>
            </div>
        </Modal>
    );
};

interface MediaViewerModalProps {
    imageUrl: string;
    onClose: () => void;
}

const MediaViewerModal: React.FC<MediaViewerModalProps> = ({ imageUrl, onClose }) => {
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const newZoom = zoom - e.deltaY * 0.001;
        setZoom(Math.min(Math.max(1, newZoom), 5));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0 && e.button !== 1) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        (e.currentTarget as HTMLElement).classList.add('cursor-grabbing');
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        }
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (isDragging) {
            setIsDragging(false);
            (e.currentTarget as HTMLElement).classList.remove('cursor-grabbing');
        }
    };
    
    const handleSaveImage = async () => {
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const blob = await response.blob();
    
            const blobUrl = URL.createObjectURL(blob);
    
            const link = document.createElement('a');
            link.href = blobUrl;
            
            const filename = `soulverse_media_${Date.now()}.jpg`;
            link.download = filename;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
    
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Failed to download image via fetch, falling back to opening in a new tab:", error);
            window.open(imageUrl, '_blank');
        } finally {
            setIsMenuOpen(false);
        }
    }
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center backdrop-blur-sm p-4"
            onClick={onClose}
            onMouseUp={handleMouseUp}
        >
             <div
                className="relative w-full max-w-xl"
                onClick={(e) => e.stopPropagation()}
                onMouseMove={handleMouseMove}
            >
                <div 
                    className="relative w-full overflow-hidden"
                    onWheel={handleWheel}
                >
                    <img
                        ref={imageRef}
                        src={imageUrl}
                        alt="Zoomed content"
                        className="w-full h-auto object-contain transition-transform duration-100 ease-linear cursor-grab rounded-lg"
                        style={{ 
                            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                            transformOrigin: 'center center'
                        }}
                        onMouseDown={handleMouseDown}
                    />
                </div>
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                 <div className="relative">
                    <button onClick={() => setIsMenuOpen(p => !p)} className="p-2 rounded-full bg-black/50 hover:bg-black/70">
                        <EllipsisVerticalIcon className="w-6 h-6 text-white" />
                    </button>
                    {isMenuOpen && (
                         <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-md shadow-lg py-1">
                             <button onClick={handleSaveImage} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-neutral-700">
                                 <ArrowDownTrayIcon className="w-5 h-5"/>
                                 <span>Save Image</span>
                             </button>
                         </div>
                    )}
                </div>
                <button onClick={onClose} className="p-2 rounded-full bg-black/50 hover:bg-black/70">
                    <XMarkIcon className="w-6 h-6 text-white" />
                </button>
            </div>
        </div>
    );
};

interface PostMediaGridProps {
    media?: Post['media'];
    onImageClick: (url: string) => void;
}

const PostMediaGrid: React.FC<PostMediaGridProps> = ({ media, onImageClick }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    if (!media || media.length === 0) {
        return null;
    }

    const firstItem = media[0];
    const layoutType = firstItem.aspectRatio || 'portrait';
    
    if (firstItem.type === 'video') {
        const handlePlay = () => {
            if (videoRef.current) {
                videoRef.current.play();
                setIsPlaying(true);
            }
        };
        return (
             <div className="relative aspect-[2/3] bg-black w-full max-w-sm mx-auto overflow-hidden rounded-lg">
                <video ref={videoRef} src={firstItem.url} poster={firstItem.thumbnailUrl} controls={isPlaying} playsInline className="w-full h-full object-cover" onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} />
                {!isPlaying && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer" onClick={handlePlay}>
                        <PlayCircleIcon className="w-16 h-16 text-white/80 drop-shadow-lg" />
                    </div>
                )}
            </div>
        );
    }

    const images = media.filter(m => m.type === 'image');
    
    if (layoutType === 'landscape') {
        return (
            <div className="w-full rounded-lg overflow-hidden">
                <div className="relative w-full overflow-hidden cursor-pointer aspect-video bg-neutral-800" onClick={() => onImageClick(images[0].url)}>
                    <img src={images[0].url} alt="Post content" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                </div>
            </div>
        );
    }

    if (layoutType === 'square') {
        const visibleImages = images.slice(0, 4);
        return (
            <div className="grid grid-cols-2 gap-1 w-full rounded-lg overflow-hidden">
                {visibleImages.map((image, index) => (
                    <div key={index} className="relative w-full overflow-hidden cursor-pointer aspect-square bg-neutral-800" onClick={() => onImageClick(image.url)}>
                        <img src={image.url} alt={`Post content ${index + 1}`} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                    </div>
                ))}
            </div>
        );
    }

    const visibleImages = images.slice(0, 6);
    return (
        <div className="grid grid-cols-3 gap-1 w-full rounded-lg overflow-hidden">
            {visibleImages.map((image, index) => (
                <div key={index} className="relative w-full overflow-hidden cursor-pointer aspect-[2/3] bg-neutral-800" onClick={() => onImageClick(image.url)}>
                    <img src={image.url} alt={`Post content ${index + 1}`} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                </div>
            ))}
        </div>
    );
};

interface PostItemProps {
    post: Post;
    soul: Soul;
    accountSettings: AccountSettings;
    onToggleLike: (postId: string) => void;
    onAddComment: (soulId: string, postId: string, comment: Comment) => void;
    onViewProfile: (soulId: string) => void;
    onShare: (post: Post, soul: Soul) => void;
    commenter: { id: string, name: string, avatar: string | null };
    onOpenCommenterSelect: () => void;
}

const PostItem: React.FC<PostItemProps> = ({
    post,
    soul,
    accountSettings,
    onToggleLike,
    onAddComment,
    onViewProfile,
    onShare,
    commenter,
    onOpenCommenterSelect
}) => {
    const [commentText, setCommentText] = useState('');
    const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    
    const isLiked = accountSettings.likedPostIds.includes(post.id);

    const handleImageClick = (url: string) => {
        setSelectedImageUrl(url);
        setIsViewerOpen(true);
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (commentText.trim()) {
            const newComment: Comment = {
                id: `comment-${Date.now()}`,
                username: commenter.name,
                avatar: commenter.avatar,
                text: commentText.trim(),
            };
            onAddComment(soul.id, post.id, newComment);
            setCommentText('');
        }
    };
    
    const timeAgo = (timestamp: string): string => {
        const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m";
        return Math.floor(seconds) + "s";
    };

    const commentsToShow = isCommentsExpanded ? post.comments : post.comments.slice(-1);

    return (
        <>
            {isViewerOpen && selectedImageUrl && (
                <MediaViewerModal imageUrl={selectedImageUrl} onClose={() => setIsViewerOpen(false)} />
            )}
            <div className="bg-neutral-900/50 rounded-xl border border-neutral-800/80">
                <div className="flex items-center justify-between p-4">
                    <button onClick={() => onViewProfile(soul.id)} className="flex items-center gap-3 group">
                        {soul.avatar ? (
                            <img src={soul.avatar} alt={soul.name} className="w-10 h-10 rounded-full object-cover"/>
                        ) : (
                            <UserCircleIcon className="w-10 h-10 text-neutral-500" />
                        )}
                        <div>
                            <h4 className="font-bold text-white group-hover:underline">{soul.name}</h4>
                            <p className="text-xs text-neutral-400">@{soul.username} &bull; {timeAgo(post.timestamp)}</p>
                        </div>
                    </button>
                    <button className="p-2 rounded-full hover:bg-neutral-700/60 text-neutral-400">
                        <EllipsisVerticalIcon className="w-5 h-5" />
                    </button>
                </div>
                {post.caption && (
                    <div className="px-4 pb-4">
                        <p className="text-white text-sm whitespace-pre-wrap">{post.caption}</p>
                    </div>
                )}
                
                <div className="px-4">
                    <PostMediaGrid media={post.media} onImageClick={handleImageClick} />
                </div>
                
                <div className="flex justify-between items-center p-2 px-3 mt-2">
                    <div className="flex items-center gap-2">
                        <button onClick={() => onToggleLike(post.id)} className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-neutral-700/60 transition-colors">
                            <HeartIcon filled={isLiked} className={`w-6 h-6 ${isLiked ? 'text-red-500' : 'text-neutral-400'}`} />
                            <span className="text-sm text-neutral-400">{post.likes}</span>
                        </button>
                         <button onClick={() => setIsCommentsExpanded(p => !p)} className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-neutral-700/60 transition-colors">
                            <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-neutral-400" />
                            <span className="text-sm text-neutral-400">{post.comments.length}</span>
                        </button>
                    </div>
                    <button onClick={() => onShare(post, soul)} className="p-2 rounded-lg hover:bg-neutral-700/60 text-neutral-400">
                        <img src="https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Soulverse%20icon%20topbar%2Fshare.png?alt=media&token=4ff8c2ab-b6bd-460d-886c-ff47c759a464" alt="Share" className="w-6 h-6"/>
                    </button>
                </div>
                {isCommentsExpanded && (
                    <div className="p-4 pt-0 border-t border-neutral-800/80">
                        {post.comments.length > 1 && (
                            <button onClick={() => setIsCommentsExpanded(false)} className="text-sm text-neutral-400 hover:underline mb-3">
                                Hide comments
                            </button>
                        )}
                        <div className="space-y-3">
                            {commentsToShow.map(comment => (
                                <div key={comment.id} className="flex items-start gap-2 text-sm">
                                    {comment.avatar ? (
                                        <img src={comment.avatar} alt={comment.username} className="w-6 h-6 rounded-full object-cover mt-0.5" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-[10px] mt-0.5 flex-shrink-0">
                                            {comment.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-semibold text-white mr-2">{comment.username}</span>
                                        <span className="text-neutral-300">{comment.text}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                 <div className="p-4 border-t border-neutral-800/80">
                    <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
                        <button type="button" onClick={onOpenCommenterSelect} className="flex-shrink-0">
                            {commenter.avatar ? (
                                <img src={commenter.avatar} alt={commenter.name} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                    {commenter.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </button>
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder={`Comment as ${commenter.name}...`}
                            className="w-full bg-neutral-700/60 border border-neutral-700 rounded-full py-2 px-4 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm transition-colors"
                        />
                    </form>
                </div>
            </div>
        </>
    );
};

const ProfileView: React.FC<{
    soul: Soul;
    accountSettings: AccountSettings;
    onToggleFollow: (soulId: string) => void;
}> = ({ soul, accountSettings, onToggleFollow }) => {
    const isFollowing = accountSettings.followedSoulsIds.includes(soul.id);
    const [activeTab, setActiveTab] = useState('posts');
    const isOriginal = soul.templateName;

    return (
        <div className="h-full flex flex-col bg-neutral-900/50">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4 md:p-6">
                    <div className="flex flex-row items-center gap-6">
                        <div className="w-1/4 md:w-1/3 flex justify-center flex-shrink-0">
                             {soul.avatar ? (
                                <img src={soul.avatar} alt={soul.name} className="w-20 h-20 md:w-36 md:h-36 rounded-full object-cover border-2 border-neutral-700"/>
                            ) : (
                                <UserCircleIcon className="w-20 h-20 md:w-36 md:h-36 text-neutral-600" />
                            )}
                        </div>
                        <div className="w-3/4 md:w-2/3 space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                                <h2 className="text-2xl font-light text-white truncate">{soul.username}</h2>
                                <div className="flex items-center gap-4 mt-2 md:mt-0">
                                    <button onClick={() => onToggleFollow(soul.id)} className={`py-1.5 px-6 rounded-md font-semibold transition-colors text-sm ${isFollowing ? 'bg-neutral-700 text-white hover:bg-neutral-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                     <button className="p-2 rounded-md bg-neutral-700 hover:bg-neutral-600">
                                        <EllipsisVerticalIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 md:gap-8 text-sm">
                                <div><span className="font-semibold text-white">{soul.posts.length}</span> posts</div>
                                <div><span className="font-semibold text-white">{soul.followersCount.toLocaleString()}</span> followers</div>
                                <div><span className="font-semibold text-white">{soul.followingCount}</span> following</div>
                            </div>
                            
                            <div className="hidden md:block">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-white">{soul.name}</p>
                                    {isOriginal && <VerifiedIcon className="w-4 h-4 text-blue-500" />}
                                </div>
                                <p className="text-sm whitespace-pre-wrap text-neutral-300">{soul.bio}</p>
                            </div>
                        </div>
                    </div>

                    <div className="md:hidden mt-4">
                        <div className="flex items-center gap-2">
                           <p className="font-semibold text-white">{soul.name}</p>
                           {isOriginal && <VerifiedIcon className="w-4 h-4 text-blue-500" />}
                        </div>
                        <p className="text-sm whitespace-pre-wrap text-neutral-300">{soul.bio}</p>
                    </div>
                </div>

                <div className="px-4 py-2 border-y border-neutral-800/80 overflow-x-auto">
                    <div className="flex space-x-4">
                        {['Highlights', 'Moments', 'Favorites', 'Adventures', 'Gallery', 'Memories'].map(story => (
                            <div key={story} className="flex flex-col items-center flex-shrink-0 space-y-1 w-20">
                                <div className="w-16 h-16 rounded-full bg-neutral-800 border-2 border-neutral-700"></div>
                                <span className="text-xs text-neutral-300 truncate w-full text-center">{story}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="sticky top-0 bg-neutral-900/80 backdrop-blur-sm z-10">
                    <div className="flex justify-around border-b border-neutral-800/80">
                        <button onClick={() => setActiveTab('posts')} className={`flex-1 py-3 flex justify-center items-center gap-2 border-t-2 ${activeTab === 'posts' ? 'border-white text-white' : 'border-transparent text-neutral-500'}`}>
                            <GridIcon className="w-6 h-6" />
                            <span className="hidden md:inline font-semibold text-xs uppercase">Posts</span>
                        </button>
                         <button onClick={() => setActiveTab('reels')} className={`flex-1 py-3 flex justify-center items-center gap-2 border-t-2 ${activeTab === 'reels' ? 'border-white text-white' : 'border-transparent text-neutral-500'}`}>
                             <PlayCircleIcon className="w-6 h-6" />
                             <span className="hidden md:inline font-semibold text-xs uppercase">Reels</span>
                        </button>
                         <button onClick={() => setActiveTab('tagged')} className={`flex-1 py-3 flex justify-center items-center gap-2 border-t-2 ${activeTab === 'tagged' ? 'border-white text-white' : 'border-transparent text-neutral-500'}`}>
                            <BookmarkIcon className="w-6 h-6" />
                            <span className="hidden md:inline font-semibold text-xs uppercase">Tagged</span>
                        </button>
                    </div>
                </div>
                
                 <div className="grid grid-cols-3 gap-0.5">
                    {activeTab === 'posts' && soul.posts.map(post => {
                        const firstMedia = post.media?.[0];
                        if (!firstMedia) return null;
                        
                        return (
                            <div key={post.id} className="aspect-[2/3] bg-neutral-800 relative group cursor-pointer">
                                <img src={firstMedia.type === 'video' ? firstMedia.thumbnailUrl : firstMedia.url} alt="Post" className="w-full h-full object-cover" />
                                {firstMedia.type === 'video' && (
                                    <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-full pointer-events-none">
                                        <PlayCircleIcon className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold">
                                    <span className="flex items-center gap-1"><HeartIcon filled className="w-5 h-5"/> {post.likes}</span>
                                    <span className="flex items-center gap-1"><ChatBubbleBottomCenterTextIcon className="w-5 h-5"/> {post.comments.length}</span>
                                </div>
                            </div>
                        )
                    })}
                    {activeTab !== 'posts' && (
                        <div className="col-span-3 text-center py-16 text-neutral-500">This section is not yet available.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

const NotificationsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'notifications' | 'contributions'>('notifications');

    return (
        <div className="h-full flex flex-col text-neutral-300 p-4">
            <div className="flex border-b border-neutral-700 mb-4">
                <button 
                    onClick={() => setActiveTab('notifications')} 
                    className={`px-4 py-2 text-sm font-semibold ${activeTab === 'notifications' ? 'border-b-2 border-white text-white' : 'text-neutral-400'}`}
                >
                    Notifications
                </button>
                <button 
                    onClick={() => setActiveTab('contributions')} 
                    className={`px-4 py-2 text-sm font-semibold ${activeTab === 'contributions' ? 'border-b-2 border-white text-white' : 'text-neutral-400'}`}
                >
                    Review Contributions
                </button>
            </div>

            {activeTab === 'notifications' && (
                <div className="flex-1">
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 p-3 bg-neutral-800 rounded-md border border-neutral-700 text-sm">All Types</div>
                        <div className="flex-1 p-3 bg-neutral-800 rounded-md border border-neutral-700 text-sm">All My Profiles</div>
                    </div>
                    <div className="text-center text-neutral-500 py-10">
                        No notifications found matching your filters.
                    </div>
                </div>
            )}
            
            {activeTab === 'contributions' && (
                 <div className="flex-1">
                     <h3 className="font-semibold text-white mb-4">Contributions</h3>
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 p-3 bg-neutral-800 rounded-md border border-neutral-700 text-sm">All profiles created by me</div>
                        <div className="flex-1 p-3 bg-neutral-800 rounded-md border border-neutral-700 text-sm">Pending</div>
                    </div>
                    <div className="text-center text-neutral-500 py-10">
                        No contributions found.
                    </div>
                     <div className="flex justify-between items-center mt-6 text-sm text-neutral-500">
                        <span>Previous</span>
                        <span>Page 1</span>
                        <span>Next</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const UserCenterView: React.FC<{
    accountSettings: AccountSettings;
    setAccountSettings: (updater: (prev: AccountSettings) => AccountSettings) => void;
}> = ({ accountSettings }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'following' | 'blocks'>('profile');
    
    const following = [{id: '1', name: 'Bryn'}, {id: '2', name: 'NPC'}];

    return (
        <div className="h-full flex flex-col text-neutral-300 p-4">
             <h3 className="text-xl font-semibold text-white mb-6 text-center">User Center</h3>
             <div className="flex border-b border-neutral-700 mb-6">
                 <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 text-sm ${activeTab === 'profile' ? 'border-b-2 border-white text-white' : 'text-neutral-400'}`}>Profile</button>
                 <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 text-sm ${activeTab === 'settings' ? 'border-b-2 border-white text-white' : 'text-neutral-400'}`}>Settings</button>
                 <button onClick={() => setActiveTab('following')} className={`px-4 py-2 text-sm ${activeTab === 'following' ? 'border-b-2 border-white text-white' : 'text-neutral-400'}`}>Following</button>
                 <button onClick={() => setActiveTab('blocks')} className={`px-4 py-2 text-sm ${activeTab === 'blocks' ? 'border-b-2 border-white text-white' : 'text-neutral-400'}`}>Blocks</button>
             </div>

             <div className="flex-1">
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Display Name: {accountSettings.userName}</span>
                            <button className="p-1"><PencilIcon className="w-4 h-4 text-neutral-400"/></button>
                        </div>
                        <div>
                             <h4 className="font-semibold text-white mb-2">Profiles created by me</h4>
                             <p className="text-sm text-neutral-500">You haven't created any profiles yet.</p>
                        </div>
                    </div>
                )}
                 {activeTab === 'settings' && (
                    <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-white">Allow suggestive content on Feed</p>
                                <p className="text-xs text-neutral-500">Toggle whether suggestive content is displayed on Feed. Following timeline is not affected.</p>
                            </div>
                            <Toggle checked={false} onChange={() => {}} />
                        </div>
                    </div>
                )}
                 {activeTab === 'following' && (
                    <div className="space-y-2">
                        {following.map(user => (
                            <div key={user.id} className="flex justify-between items-center p-2 bg-neutral-800 rounded-md">
                                <div className="flex items-center gap-2">
                                    <UserCircleIcon className="w-8 h-8 text-neutral-500"/>
                                    <span className="text-sm">{user.name}</span>
                                </div>
                                <button className="p-1"><TrashIcon className="w-5 h-5 text-neutral-400"/></button>
                            </div>
                        ))}
                    </div>
                )}
                 {activeTab === 'blocks' && (
                    <div>
                        <p className="text-sm mb-2">Filter by blocker</p>
                        <div className="p-3 bg-neutral-800 rounded-md border border-neutral-700 mb-4 text-sm">All</div>
                        <p className="text-sm text-neutral-500">You haven't blocked anyone.</p>
                    </div>
                )}
             </div>
        </div>
    );
};

const FeedView: React.FC<{
    posts: (Post & { soul: Soul })[];
    accountSettings: AccountSettings;
    onToggleLike: (postId: string) => void;
    onAddComment: (soulId: string, postId: string, comment: Comment) => void;
    onViewProfile: (soulId: string) => void;
    onShare: (post: Post, soul: Soul) => void;
    commenter: { id: string, name: string, avatar: string | null };
    onOpenCommenterSelect: () => void;
    onSetView: (view: 'feed' | 'profile' | 'notifications' | 'user_center') => void;
    filter: 'board' | 'following';
    onSetFilter: (filter: 'board' | 'following') => void;
}> = ({ posts, onToggleLike, onAddComment, onViewProfile, onShare, commenter, onOpenCommenterSelect, onSetView, filter, onSetFilter, accountSettings }) => (
    <div className="h-full flex flex-col bg-neutral-900/50">
        <div className="flex-shrink-0 px-4 py-2 flex justify-between items-center border-b border-neutral-800/80 bg-neutral-900/30">
            <div className="flex gap-2">
                <button onClick={() => onSetFilter('board')} className={`px-4 py-1.5 text-sm font-semibold rounded-full ${filter === 'board' ? 'bg-white text-black' : 'text-neutral-300'}`}>Feed</button>
                <button onClick={() => onSetFilter('following')} className={`px-4 py-1.5 text-sm font-semibold rounded-full ${filter === 'following' ? 'bg-white text-black' : 'text-neutral-300'}`}>Following</button>
            </div>
             <div className="flex gap-2">
                <button onClick={() => onSetView('notifications')} className="p-2 text-neutral-300 hover:bg-neutral-700/60 rounded-full"><BellIcon className="w-6 h-6"/></button>
                <button onClick={() => onSetView('user_center')} className="p-2 text-neutral-300 hover:bg-neutral-700/60 rounded-full"><UserIconSolid className="w-6 h-6"/></button>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
            <div className="max-w-xl mx-auto space-y-6">
                {posts.length > 0 ? posts.map(({ soul, ...post }) => (
                    <PostItem 
                        key={post.id}
                        post={post}
                        soul={soul}
                        accountSettings={accountSettings}
                        onToggleLike={onToggleLike}
                        onAddComment={onAddComment}
                        onViewProfile={onViewProfile}
                        onShare={onShare}
                        commenter={commenter}
                        onOpenCommenterSelect={onOpenCommenterSelect}
                    />
                )) : (
                    <div className="text-center py-20 text-neutral-500">
                        <p>Nothing to see here yet.</p>
                        <p className="text-sm mt-1">
                            {filter === 'following' ? "Follow some Souls to see their posts here." : "Posts from the community will appear here."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    </div>
);

const NotFoundView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <h3 className="text-xl font-semibold text-white">Soul Not Found</h3>
        <p className="text-neutral-400 mt-2">The profile you're looking for couldn't be loaded.</p>
        <button onClick={onBack} className="mt-6 py-2 px-6 rounded-full font-semibold bg-neutral-700 hover:bg-neutral-600 transition-colors">
            Back to Feed
        </button>
    </div>
);

const SoulBoardHeader: React.FC<{
    view: 'feed' | 'profile' | 'notifications' | 'user_center';
    onBackToFeed: () => void;
    soulUsername: string | undefined;
}> = ({ view, onBackToFeed, soulUsername }) => {
    let content;

    switch (view) {
        case 'profile':
            content = (
                <>
                    <button onClick={onBackToFeed} className="p-2 rounded-full hover:bg-neutral-800">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold capitalize">
                        {soulUsername || "Profile"}
                    </h2>
                     <button className="p-2 rounded-full hover:bg-neutral-800">
                        <CogIcon className="w-6 h-6" />
                    </button>
                </>
            );
            break;
        case 'notifications':
        case 'user_center':
            content = (
                <>
                    <button onClick={onBackToFeed} className="p-2 rounded-full hover:bg-neutral-800">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold capitalize">
                       {view.replace('_', ' ')}
                    </h2>
                    <div className="w-10"></div> {/* Spacer */}
                </>
            );
            break;
        case 'feed':
        default:
            content = (
                <>
                    <div className="w-10"></div> {/* Spacer */}
                    <h1 className="text-3xl font-bold soulverse-logo-gradient">
                        SoulVerse
                    </h1>
                    <div className="w-10"></div> {/* Spacer to center the logo */}
                </>
            );
            break;
    }

    return (
        <header className="w-full flex-shrink-0 bg-slate-900/50 backdrop-blur-md z-10">
            <div className="w-full">
                <div className="flex items-center justify-between h-16 px-4">
                    {content}
                </div>
            </div>
        </header>
    );
};


export const SoulBoardPage: React.FC<SoulBoardPageProps> = ({ isOpen, onClose, accountSettings, setAccountSettings, initialState, soulTemplates }) => {
    const [view, setView] = useState<'feed' | 'profile' | 'notifications' | 'user_center'>(initialState?.view || 'feed');
    const [activeSoulId, setActiveSoulId] = useState<string | null>(initialState?.soulId || null);
    const [commenter, setCommenter] = useState({ id: 'user_main', name: accountSettings.userName, avatar: accountSettings.userAvatar });
    const [isCommenterModalOpen, setIsCommenterModalOpen] = useState(false);
    const [postToShare, setPostToShare] = useState<{ post: Post, soul: Soul } | null>(null);
    const [allSouls, setAllSouls] = useState<Soul[]>(() => 
        hydrateSoulsWithSocialData([...accountSettings.souls, ...soulTemplates])
    );
    const [feedFilter, setFeedFilter] = useState<'board' | 'following'>('board');

    


    const feedPosts = useMemo(() => {
        const allPosts = allSouls
            .flatMap(soul => (soul.posts || []).map(post => ({ ...post, soul })))
            .filter(p => p.media && p.media.length > 0)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        if (feedFilter === 'following') {
            return allPosts.filter(p => accountSettings.followedSoulsIds.includes(p.soul.id));
        }
        return allPosts;
    }, [allSouls, feedFilter, accountSettings.followedSoulsIds]);

    const activeSoulProfile = useMemo(() => {
        return allSouls.find(s => s.id === activeSoulId);
    }, [activeSoulId, allSouls]);
    
    
    
    const handleToggleLike = (postId: string) => {
        const isLiked = accountSettings.likedPostIds.includes(postId);

        setAllSouls(prevSouls => prevSouls.map(soul => ({
            ...soul,
            posts: (soul.posts || []).map(post => {
                if (post.id === postId) {
                    return { ...post, likes: isLiked ? post.likes - 1 : post.likes + 1 };
                }
                return post;
            })
        })));
        
        setAccountSettings(prev => {
            const newLikedIds = isLiked ? prev.likedPostIds.filter(id => id !== postId) : [...prev.likedPostIds, postId];
            return { ...prev, likedPostIds: newLikedIds };
        });
    };

    const handleAddComment = (soulId: string, postId: string, comment: Comment) => {
        setAllSouls(prevSouls => prevSouls.map(soul => {
            if (soul.id === soulId) {
                return {
                    ...soul,
                    posts: (soul.posts || []).map(post => {
                        if (post.id === postId) {
                            return { ...post, comments: [...(post.comments || []), comment] };
                        }
                        return post;
                    })
                };
            }
            return soul;
        }));
    };
    
    const handleToggleFollow = (soulId: string) => {
        const isFollowing = accountSettings.followedSoulsIds.includes(soulId);
        
        setAllSouls(prevSouls => prevSouls.map(soul => {
            if (soul.id === soulId) {
                return { ...soul, followersCount: isFollowing ? soul.followersCount - 1 : soul.followersCount + 1 };
            }
            return soul;
        }));

        setAccountSettings(prev => {
            const newFollowedIds = isFollowing ? prev.followedSoulsIds.filter(id => id !== soulId) : [...prev.followedSoulsIds, soulId];
            return { ...prev, followedSoulsIds: newFollowedIds };
        });
    };

    const handleViewProfile = (soulId: string) => {
        setActiveSoulId(soulId);
        setView('profile');
    };

    const handleShare = (post: Post, soul: Soul) => {
        setPostToShare({ post, soul });
    };

    const renderContent = () => {
        switch (view) {
            case 'profile':
                return activeSoulProfile ? (
                    <ProfileView
                        soul={activeSoulProfile}
                        accountSettings={accountSettings}
                        onToggleFollow={handleToggleFollow}
                    />
                ) : <NotFoundView onBack={() => setView('feed')} />;
            case 'notifications':
                return <NotificationsView />;
            case 'user_center':
                return <UserCenterView accountSettings={accountSettings} setAccountSettings={setAccountSettings}/>;
            case 'feed':
            default:
                return (
                    <FeedView
                        posts={feedPosts}
                        accountSettings={accountSettings}
                        onToggleLike={handleToggleLike}
                        onAddComment={handleAddComment}
                        onViewProfile={handleViewProfile}
                        onShare={handleShare}
                        commenter={commenter}
                        onOpenCommenterSelect={() => setIsCommenterModalOpen(true)}
                        onSetView={setView}
                        filter={feedFilter}
                        onSetFilter={setFeedFilter}
                    />
                );
        }
    };


    if (!isOpen) return null;

    return (
        <>
            <CommentAsModal
                isOpen={isCommenterModalOpen}
                onClose={() => setIsCommenterModalOpen(false)}
                accountSettings={accountSettings}
                selectedId={commenter.id}
                onSelect={(id, name, avatar) => setCommenter({ id, name, avatar })}
            />
            <SharePostModal 
                isOpen={!!postToShare}
                onClose={() => setPostToShare(null)}
                post={postToShare?.post || null}
                soul={postToShare?.soul || null}
            />
            <div className="w-full h-full flex flex-col text-white bg-transparent">
                <SoulBoardHeader
                    view={view}
                    onBackToFeed={() => setView('feed')}
                    soulUsername={activeSoulProfile?.username}
                />
                <div className="w-full flex-1 flex flex-col min-h-0">
                   {renderContent()}
                </div>
            </div>
        </>
    );
};
