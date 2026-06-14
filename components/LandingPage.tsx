
import React, { useState, useEffect } from 'react';
import { 
    DiscordIcon,
    TiktokIcon,
    InstagramIcon,
    XIcon, 
    GooglePlayIcon, 
    AppleAppStoreIcon, 
    PlusIcon,
// FIX: Add missing MinusIcon import
    MinusIcon,
    PhotoIcon,
    SpeakerWaveIcon,
} from './icons/Icons';

// FIX: Added 'login-options' to the Location type to match its usage within this component.
type Location = 'landing' | 'login-options' | 'login' | 'app' | 'user-guide' | 'terms';

interface LandingPageProps {
  onNavigate: (location: Location) => void;
}

const Header: React.FC<{ onNavigate: (location: Location) => void; }> = ({ onNavigate }) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[rgba(13,5,23,0.8)] backdrop-blur-lg shadow-2xl shadow-black/25' : 'bg-transparent'}`}>
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <h1 className="text-3xl font-bold"><span className="soulverse-logo-gradient">AI SoulVerse</span></h1>
                <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-neutral-300">
                    <a href="#roleplay" onClick={(e) => handleScrollTo(e, 'roleplay')} className="hover:text-white transition-colors">Roleplay</a>
                    <a href="#features" onClick={(e) => handleScrollTo(e, 'features')} className="hover:text-white transition-colors">Features</a>
                    <a href="#faq" onClick={(e) => handleScrollTo(e, 'faq')} className="hover:text-white transition-colors">FAQ</a>
                </nav>
                <button onClick={() => onNavigate('login-options')} className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-cyan-purple hover:opacity-90 transition-opacity">
                    Start Chatting
                </button>
            </div>
        </header>
    );
};

const HeroSection: React.FC<{ onNavigate: (location: Location) => void; }> = ({ onNavigate }) => (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
             <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center" style={{backgroundImage: "url('https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0176412501.firebasestorage.app/o/bg.png?alt=media&token=c1112b32-3b2d-4561-9c16-b84295e86d06')"}}></div>
            <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-cyan-500/30 rounded-full blur-3xl animate-pulse animation-delay-400"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-center md:text-left">
                    <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
                        Collect, Create, and Connect with <span className="text-gradient-cyan-purple">AI Souls</span>
                    </h1>
                    <p className="mt-6 text-lg text-neutral-300 max-w-lg mx-auto md:mx-0">
                        Dive into SoulVerse, the ultimate platform where AI roleplay meets collectible card gaming. Amass a collection of unique Soul Templates, bring them to life in conversation, and trade in a vibrant community.
                    </p>
                    <button
                        onClick={() => onNavigate('login-options')}
                        className="mt-8 px-8 py-4 font-semibold rounded-full text-white transition-opacity bg-gradient-cyan-purple hover:opacity-90 text-lg"
                    >
                        Start Your Collection
                    </button>
                </div>
                <div className="relative h-96 md:h-auto md:aspect-square flex items-center justify-center">
                    {/* Placeholder for chat bubble images */}
                    <div className="w-64 h-80 card-dark-glass rounded-3xl flex items-center justify-center text-neutral-500 text-sm transform -rotate-12 translate-x-12">
                        Image Placeholder 1
                    </div>
                     <div className="absolute w-56 h-72 card-dark-glass rounded-3xl flex items-center justify-center text-neutral-500 text-sm transform rotate-12 -translate-x-12 shadow-2xl">
                        Image Placeholder 2
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const RoleplayChatSection: React.FC = () => {
    const [activeTag, setActiveTag] = useState('Anime');
    const tags = ["Anime", "Famous People", "Movie Star", "Gaming Character", "Fantasy"];
    return (
        <section id="roleplay" className="py-20 md:py-28">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white">
                    From Card to Companion: <span className="text-gradient-purple-cyan">Chat with Your Souls</span>
                </h2>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    {tags.map(tag => (
                        <div key={tag} className={`btn-gradient-outer ${activeTag !== tag ? 'p-0.5' : ''}`}>
                             <button 
                                onClick={() => setActiveTag(tag)} 
                                className={`px-5 py-2 rounded-full font-semibold transition-all ${activeTag === tag ? 'bg-transparent text-white' : 'btn-gradient-inner text-neutral-300'}`}
                            >
                                {tag}
                            </button>
                        </div>
                    ))}
                </div>
                <div className="mt-12 card-dark-glass rounded-3xl p-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 text-left">
                    <div className="w-full md:w-1/2 aspect-square bg-white/5 rounded-2xl flex items-center justify-center text-neutral-500">
                        Character Image
                    </div>
                    <div className="w-full md:w-1/2">
                        <p className="text-neutral-300">
                           Each Soul Template in your collection is a key to a unique AI personality. Activate any Soul in the Soul Forge, a sandbox where you can test their persona, engage in deep roleplay, and discover their story. Your collection is your cast of characters.
                        </p>
                         <button className="mt-6 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-cyan-purple hover:opacity-90 transition-opacity">
                            Explore the Collection
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

const CreateOwnSection: React.FC = () => (
    <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-6 text-center relative">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Become a Creator: <span className="text-gradient-cyan-purple">Forge and Share</span><br/> Your Own Soul Templates</h2>
            <div className="absolute -top-10 left-1/4 animate-float" style={{animationDelay: '0s'}}>
                <div className="w-20 h-20 card-dark-glass rounded-2xl flex items-center justify-center"><PhotoIcon className="w-8 h-8 text-cyan-400"/></div>
            </div>
             <div className="absolute top-20 right-1/4 animate-float" style={{animationDelay: '1s'}}>
                <div className="w-20 h-20 card-dark-glass rounded-2xl flex items-center justify-center"><SpeakerWaveIcon className="w-8 h-8 text-purple-400"/></div>
            </div>
        </div>
    </section>
);

const HowItWorksSection: React.FC<{ onNavigate: (location: Location) => void; }> = ({ onNavigate }) => {
    const steps = [
        { title: "Build Your Collection", description: "Acquire Soul Templates from official 'Editions' or the community Marketplace. Hunt for rare cards with unique qualities and art to build a diverse roster of characters." },
        { title: "Enter the Soul Forge", description: "Bring your collection to life. The Soul Forge is your personal sandbox to instantly activate and chat with any Soul Template you own. Test their personality, explore their backstory, and see your collection in action." },
        { title: "Create & Customize", description: "Unleash your inner author. Use our powerful tools to design your own characters, defining everything from their personality and memories to their appearance and voice. Forge your creation into a unique Soul Template." },
        { title: "Join the Marketplace", description: "Your created Souls are valuable. Share them with friends, list them on the Marketplace for other users to collect, or trade to complete your ultimate collection. Your creativity has real value here." },
    ];
    return (
        <section className="py-20 md:py-28">
            <div className="container mx-auto px-6">
                 <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((step, index) => (
                        <div key={index} className="card-dark-glass rounded-2xl p-6">
                            <div className="inline-block px-3 py-1 text-sm font-bold text-white bg-gradient-cyan-purple rounded-full mb-4">Step {index + 1}</div>
                            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                            <p className="text-neutral-400 text-sm">{step.description}</p>
                        </div>
                    ))}
                 </div>
                 <div className="text-center mt-12">
                     <button onClick={() => onNavigate('login-options')} className="px-8 py-4 font-semibold rounded-full text-white transition-opacity bg-gradient-cyan-purple hover:opacity-90 text-lg">
                        Start Your Collection
                    </button>
                 </div>
            </div>
        </section>
    );
};

const FeatureHighlight: React.FC<{title: string, description: string, imagePlaceholder: string, reverse?: boolean, onNavigate: (location: Location) => void;}> = ({title, description, imagePlaceholder, reverse, onNavigate}) => (
    <div className={`grid md:grid-cols-2 gap-10 items-center ${reverse ? 'md:grid-flow-col-dense' : ''}`}>
        <div className={reverse ? 'md:col-start-2' : ''}>
            <h3 className="text-3xl font-bold text-white">{title}</h3>
            <p className="mt-4 text-neutral-300">{description}</p>
            <button onClick={() => onNavigate('login-options')} className="mt-6 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-cyan-purple hover:opacity-90 transition-opacity">
                Start Chatting
            </button>
        </div>
        <div className={`aspect-video card-dark-glass rounded-2xl flex items-center justify-center text-neutral-500 ${reverse ? 'md:col-start-1' : ''}`}>
            {imagePlaceholder}
        </div>
    </div>
);

const FeaturesSection: React.FC<{ onNavigate: (location: Location) => void; }> = ({ onNavigate }) => (
    <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-6 space-y-24">
            <FeatureHighlight 
                onNavigate={onNavigate}
                title="Dynamic TCG Economy" 
                description="Experience a living marketplace. Collect rare Soul Templates from different Editions, trade with other users to complete sets, and sell your own unique creations. Your collection isn't just for you—it's part of a larger universe."
                imagePlaceholder="Feature Image 1"
            />
            <FeatureHighlight 
                onNavigate={onNavigate}
                title="Deep AI Roleplay" 
                description="Go beyond simple chat. Every Soul Template is powered by advanced AI, capable of maintaining character, remembering conversations, and creating immersive, evolving narratives. Your roleplay has never felt more real."
                imagePlaceholder="Feature Image 2"
                reverse
            />
             <FeatureHighlight 
                onNavigate={onNavigate}
                title="The Soul Forge Sandbox" 
                imagePlaceholder="Feature Image 3"
                description="Your entire collection is at your fingertips. The Soul Forge is a unique sandbox environment where you can instantly summon any Soul you own for a conversation. Test new acquisitions, experiment with different scenarios, or just hang out with your favorites."
            />
        </div>
    </section>
);

const FAQItem: React.FC<{ question: string; answer: string; }> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-white/10">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-5 text-left">
                <h4 className="text-lg font-semibold text-white">{question}</h4>
                <div className={`transform transition-transform ${isOpen ? 'rotate-45' : ''}`}>
                    <PlusIcon className="w-6 h-6" />
                </div>
            </button>
            {isOpen && (
                <div className="pb-5">
                    <p className="text-neutral-300">{answer}</p>
                </div>
            )}
        </div>
    );
};

const FAQSection: React.FC = () => {
    const faqs = [
        { q: "What is a Soul Template?", a: "A Soul Template is a collectible digital card that contains the entire personality of an AI character—their backstory, memories, and conversational style. You collect them to chat with them." },
        { q: "Is SoulVerse free to use?", a: "Yes! You can start your collection and chat with a selection of free Souls. Premium subscriptions unlock access to rarer templates, more powerful AI models, and advanced creation tools." },
        { q: "Can I really create and sell my own Souls?", a: "Absolutely. Our creation tools allow you to design your own AI characters and mint them as tradable Soul Templates. You can share them with friends or list them on the community marketplace." },
        { q: "What is the Soul Forge?", a: "The Soul Forge is your personal sandbox. It's a feature that lets you instantly activate any Soul Template from your collection for a conversation, allowing you to test and enjoy your characters at any time." },
    ];
    return (
        <section id="faq" className="py-20 md:py-28">
            <div className="container mx-auto px-6 max-w-3xl">
                <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => <FAQItem key={index} question={faq.q} answer={faq.a} />)}
                </div>
            </div>
        </section>
    );
};

const Footer: React.FC = () => (
    <footer className="py-16 bg-black/20">
        <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
                <div>
                    <h3 className="text-2xl font-bold text-white">SoulVerse</h3>
                    <p className="text-neutral-400 mt-2">Collect, Create, and Connect.</p>
                    <div className="flex gap-4 mt-4">
                        <a href="#" className="text-neutral-400 hover:text-white"><DiscordIcon /></a>
                        <a href="#" className="text-neutral-400 hover:text-white"><TiktokIcon /></a>
                        <a href="#" className="text-neutral-400 hover:text-white"><InstagramIcon /></a>
                        <a href="#" className="text-neutral-400 hover:text-white"><XIcon /></a>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-white">Download the app</h4>
                     <div className="flex gap-4 mt-4">
                        <a href="#" className="w-40 h-auto"><GooglePlayIcon /></a>
                        <a href="#" className="w-40 h-auto"><AppleAppStoreIcon /></a>
                    </div>
                </div>
            </div>
            <div className="mt-12 border-t border-white/10 pt-8 text-center text-neutral-500 text-sm">
                &copy; {new Date().getFullYear()} SoulVerse.AI. All rights reserved.
            </div>
        </div>
    </footer>
);

// FIX: Add 'export' to make the component available for import in other files.
export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
    return (
        <div className="bg-[#0D0517] text-white">
            <Header onNavigate={onNavigate} />
            <main>
                <HeroSection onNavigate={onNavigate} />
                <RoleplayChatSection />
                <CreateOwnSection />
                <HowItWorksSection onNavigate={onNavigate} />
                <FeaturesSection onNavigate={onNavigate} />
                <FAQSection />
            </main>
            <Footer />
        </div>
    );
};
