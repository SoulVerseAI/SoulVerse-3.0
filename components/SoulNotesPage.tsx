

import React, { useState, useMemo } from 'react';
import { updates as allPosts } from './AnnouncementsModal';
import { ArrowLeftIcon, Bars3Icon } from './icons/Icons';

type MainCategory = 'News' | 'Rewards';
type NewsSubCategory = 'Updates' | 'Tutorials';
type RewardsSubCategory = 'Tutorial Missions' | 'Quests' | 'Daily Rewards' | 'Achievements';

const TopTabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-8 py-2 text-lg font-semibold transition-colors relative ${
            isActive ? 'text-cyan-300' : 'text-neutral-500 hover:text-neutral-300'
        }`}
    >
        {label}
        {isActive && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_theme(colors.cyan.400)]"></div>}
    </button>
);

const LeftSectionButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
            isActive
                ? 'bg-neutral-700/80 text-white shadow-inner'
                : 'bg-transparent text-neutral-400 hover:bg-neutral-800/50'
        }`}
    >
        {label}
    </button>
);

const PostItem: React.FC<{ post: any; onClick: () => void }> = ({ post, onClick }) => (
    <button onClick={onClick} className="w-full text-left p-4 md:p-6 border-b border-neutral-800/80 group cursor-pointer hover:bg-black/20 transition-colors flex items-start gap-4 md:gap-6">
      <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 flex items-center justify-center">
        {post.imageUrl && <img src={post.imageUrl} alt="" className="w-16 h-16 md:w-20 md:h-20 object-contain" />}
      </div>
      <div className="flex-1 pt-1">
        <h3 className="text-lg md:text-xl font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors">{post.title}</h3>
        <p className="text-xs md:text-sm text-neutral-500 mt-1 mb-3">{post.date}</p>
        <p className="text-sm md:text-base text-neutral-300">{post.summary}</p>
      </div>
    </button>
);

const PostDetailView: React.FC<{ post: any; onBack: () => void }> = ({ post, onBack }) => (
    <div className="h-full flex flex-col">
        <header className="flex-shrink-0 p-4 flex items-center gap-4 bg-black/20 border-b border-neutral-800/80">
            <button onClick={onBack} className="p-2 -m-2 rounded-full hover:bg-white/10">
                <ArrowLeftIcon />
            </button>
            <h3 className="text-lg md:text-xl font-bold text-white truncate">{post.title}</h3>
        </header>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="w-full h-48 md:h-64 object-cover" />}
            <div className="p-4 md:p-6 prose-custom">
                {post.content ? (
                    typeof post.content === 'function' ? post.content({}) : post.content
                ) : (
                    <ul className="list-disc list-inside space-y-1.5 text-sm text-neutral-300 pl-2">
                        {(post.changes || []).map((change: string, index: number) => (
                            <li key={index} dangerouslySetInnerHTML={{ __html: change.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>') }}></li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    </div>
);

const PlaceholderContent: React.FC<{ title: string }> = ({ title }) => (
    <div className="h-full flex items-center justify-center text-neutral-500 p-8">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-400">{title}</h2>
            <p className="mt-2">This section is coming soon!</p>
        </div>
    </div>
);

export const SoulNotesPage: React.FC<{ isOpen: boolean; onClose: () => void; onNavigate: (loc: any) => void; }> = ({ isOpen, onClose }) => {
    const [activeMainTab, setActiveMainTab] = useState<MainCategory>('News');
    const [activeSubTab, setActiveSubTab] = useState<string>('Updates');
    const [selectedPost, setSelectedPost] = useState<any | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const newsSections: NewsSubCategory[] = ['Updates', 'Tutorials'];
    const rewardsSections: RewardsSubCategory[] = ['Tutorial Missions', 'Quests', 'Daily Rewards', 'Achievements'];

    const newsPosts = useMemo(() => allPosts.filter(p => p.category === 'Updates' || !p.category), []);
    const tutorialPosts = useMemo(() => allPosts.filter(p => p.category === 'Tutorials'), []);

    const handleMainTabClick = (tab: MainCategory) => {
        setActiveMainTab(tab);
        setSelectedPost(null);
        if (tab === 'News') {
            setActiveSubTab('Updates');
        } else if (tab === 'Rewards') {
            setActiveSubTab('Tutorial Missions');
        }
    };

    const handleSubTabClick = (tab: string) => {
        setActiveSubTab(tab);
        setSelectedPost(null);
        setIsMenuOpen(false); // Close menu on selection
    };

    const renderContent = () => {
        if (selectedPost) {
            return <PostDetailView post={selectedPost} onBack={() => setSelectedPost(null)} />;
        }

        if (activeMainTab === 'News') {
            switch (activeSubTab) {
                case 'Updates':
                    return <div className="divide-y divide-neutral-800/80">{newsPosts.map(post => <PostItem key={post.id || post.version} post={post} onClick={() => setSelectedPost(post)} />)}</div>;
                case 'Tutorials':
                    return <div className="divide-y divide-neutral-800/80">{tutorialPosts.map(post => <PostItem key={post.id || post.version} post={post} onClick={() => setSelectedPost(post)} />)}</div>;
                default:
                    return null;
            }
        }

        if (activeMainTab === 'Rewards') {
            return <PlaceholderContent title={activeSubTab} />;
        }
        return null;
    };

    const currentSubTabs = activeMainTab === 'News' ? newsSections : rewardsSections;

    return (
        <div className="relative h-full w-full bg-transparent flex">
            <style>{`
                .prose-custom h3 { font-size: 1.25rem; line-height: 1.75rem; font-weight: 700; color: white; margin-top: 1.5rem; margin-bottom: 1rem; }
                .prose-custom p, .prose-custom ul { color: #d4d4d8; line-height: 1.75; margin-top: 1em; margin-bottom: 1em; font-size: 0.875rem; }
                .prose-custom ul { list-style-position: inside; }
                 @media (min-width: 768px) {
                    .prose-custom h3 { font-size: 1.5rem; line-height: 2rem; }
                    .prose-custom p, .prose-custom ul { font-size: 1rem; }
                }
            `}</style>
            
            {/* Backdrop for mobile menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}></div>
            )}

            <aside className={`fixed md:relative top-0 left-0 bottom-0 w-64 md:w-56 flex-shrink-0 bg-neutral-900 md:bg-black/20 p-4 flex flex-col border-r border-white/10 z-50 md:z-auto transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <img 
                    src="https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/obraz_2025-09-24_000523451.png?alt=media&token=010fc2f0-91c4-4999-bbba-2553dbc9e0f6" 
                    alt="SoulVerse Logo" 
                    className="absolute top-2 left-1/2 -translate-x-1/2 w-48 h-auto pointer-events-none z-10"
                />
                
                <div className="flex-grow flex flex-col pt-[138px] overflow-y-auto custom-scrollbar">
                    <nav className="flex flex-col space-y-2">
                        {currentSubTabs.map(tab => (
                            <LeftSectionButton
                                key={tab}
                                label={tab}
                                isActive={activeSubTab === tab}
                                onClick={() => handleSubTabClick(tab)}
                            />
                        ))}
                    </nav>
                    
                    <div className="flex-grow"></div> 
                    
                    {activeMainTab === 'News' && (
                        <a href="https://discord.gg/rbuWm6DX7a" target="_blank" rel="noopener noreferrer" className="block my-4 transition-transform duration-150 ease-out hover:scale-105 active:scale-100">
                            <img src="https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/join-us-on-discord_1.webp?alt=media&token=e86cbc57-b755-4c56-8409-0707db5486cf" alt="Join Discord" className="w-full h-auto rounded-md" />
                        </a>
                    )}
                    
                    <img src="https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/DiscoverPagePhotos%2Fsoul_persona.png?alt=media&token=f063b4b6-321c-40d7-8061-23c0ca30338f" alt="Soul Persona" className="w-full h-auto" />
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="relative flex-shrink-0 px-4 md:px-8 pt-4 pb-0 bg-black/20 border-b-2 border-neutral-800 flex items-end">
                     <button className="md:hidden p-2 text-neutral-300" onClick={() => setIsMenuOpen(true)}>
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <nav className="flex items-center mx-auto md:mx-0">
                        <TopTabButton label="News" isActive={activeMainTab === 'News'} onClick={() => handleMainTabClick('News')} />
                        <TopTabButton label="Rewards" isActive={activeMainTab === 'Rewards'} onClick={() => handleMainTabClick('Rewards')} />
                    </nav>
                </header>

                <main className="flex-1 flex flex-col overflow-hidden bg-black/10">
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};