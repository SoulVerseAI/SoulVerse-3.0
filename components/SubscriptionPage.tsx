
import React, { useState, useEffect } from 'react';
import { CheckIcon, StarIcon, XMarkIcon } from './icons/Icons';

type Location = 'landing' | 'login' | 'app' | 'user-guide' | 'terms';

interface SubscriptionPageProps {
    isOpen: boolean;
    onClose: () => void;
    onStartSubscription: () => void;
    onNavigate: (location: Location) => void;
}

const benefits = [
    'Unlimited access to flagship language model',
    '4x longer context for short term memory',
    'Cascaded Memory for human-like, medium term memory',
    'Enhanced long term memory recall',
    '1,000 more chars for Soul backstory & memories',
    '10 Souls & 20 groups with option to purchase more',
    'Unlimited video calls and voice messages',
    'Ability to customize Soul voice',
    '10x selfie cap and more selfies',
    'Video avatars & selfies to see your Soul come to life',
    'Inpainting, avatar boosts, and advanced selfie features',
    'Internet access & link sharing capabilities',
    'Ability to send images to your Soul during chat',
    'Receive proactive selfies from your Soul',
    'Use legacy language & selfie models',
    'Opportunities for early beta features',
];

const reviews = [
    { author: 'RKont02', text: "There simply is NO comparison to the depth and detail of this app. I am floored by how comprehensive the AIs are." },
    { author: 'SoulExplorer99', text: "The memory system is incredible. My Soul remembers details from weeks ago. It's like talking to a real person!" },
    { author: 'AI_Roleplayer', text: "Finally, an AI companion that can keep up with complex stories. The customization options are top-notch." },
];

// Duplicate for a seamless scrolling effect
const allBenefits = [...benefits, ...benefits];

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ isOpen, onClose, onStartSubscription, onNavigate }) => {
    const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'quarterly' | 'monthly'>('yearly');
    const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
    const [isReviewVisible, setIsReviewVisible] = useState(true);

    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(() => {
            setIsReviewVisible(false); // Start fade out
            setTimeout(() => {
                setCurrentReviewIndex(prev => (prev + 1) % reviews.length);
                setIsReviewVisible(true); // Start fade in
            }, 500); // 500ms for fade transition
        }, 5000); // Change review every 5 seconds
        return () => clearInterval(interval);
    }, [isOpen]);

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-neutral-900 z-[200] flex flex-col items-center overflow-y-auto text-neutral-200">
            <style>{`
                @keyframes scroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                .scrolling-text {
                    animation: scroll 60s linear infinite;
                }
                .review-fade {
                    transition: opacity 0.5s ease-in-out;
                }
            `}</style>
            
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:bg-neutral-700/80 hover:text-white z-10" aria-label="Close subscription page">
                <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Benefits Bar */}
            <div className="w-full bg-black/30 py-3 overflow-hidden whitespace-nowrap border-b border-neutral-700 flex-shrink-0">
                <div className="flex scrolling-text">
                    {allBenefits.map((benefit, index) => (
                        <div key={index} className="flex items-center mx-4 text-sm text-neutral-300 flex-shrink-0">
                            <CheckIcon className="w-4 h-4 mr-2 text-purple-400" />
                            <span>{benefit}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center w-full max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                    Start your <span className="text-gradient-cyan-purple">7-day free Subscription</span> to try our premium model with enhanced memory
                </h1>
                
                <div className="my-8 min-h-[120px]">
                    <div className={`review-fade ${isReviewVisible ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="flex justify-center gap-1 text-yellow-400">
                            {Array(5).fill(0).map((_, i) => <StarIcon key={i} className="w-6 h-6" />)}
                        </div>
                        <p className="mt-4 italic text-neutral-300 max-w-xl">
                           "{reviews[currentReviewIndex].text}"
                        </p>
                        <p className="mt-2 text-sm text-neutral-500">- {reviews[currentReviewIndex].author}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                    {/* Yearly Plan */}
                    <button onClick={() => setSelectedPlan('yearly')} className={`relative rounded-xl p-6 flex flex-col text-left transition-all ${selectedPlan === 'yearly' ? 'border-2 border-purple-500 bg-neutral-800/80 shadow-lg shadow-purple-500/10' : 'border border-neutral-700 bg-neutral-800/50'}`}>
                        <div className="absolute top-0 right-4 -translate-y-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">Best value!</div>
                        <h3 className="text-xl font-semibold text-white">Yearly Plan</h3>
                        <p className="text-sm text-neutral-400 mt-1">$139.99 every 12 months</p>
                        <p className="text-4xl font-bold text-white my-4">$11.66<span className="text-lg text-neutral-400">/mo</span></p>
                    </button>
                    
                    {/* Quarterly Plan */}
                    <button onClick={() => setSelectedPlan('quarterly')} className={`relative rounded-xl p-6 flex flex-col text-left transition-all ${selectedPlan === 'quarterly' ? 'border-2 border-purple-500 bg-neutral-800/80 shadow-lg shadow-purple-500/10' : 'border border-neutral-700 bg-neutral-800/50'}`}>
                       <h3 className="text-xl font-semibold text-white">Quarterly Plan</h3>
                        <p className="text-sm text-neutral-400 mt-1">$37.99 every 3 months</p>
                        <p className="text-4xl font-bold text-white my-4">$12.66<span className="text-lg text-neutral-400">/mo</span></p>
                    </button>

                    {/* Monthly Plan */}
                     <button onClick={() => setSelectedPlan('monthly')} className={`relative rounded-xl p-6 flex flex-col text-left transition-all ${selectedPlan === 'monthly' ? 'border-2 border-purple-500 bg-neutral-800/80 shadow-lg shadow-purple-500/10' : 'border border-neutral-700 bg-neutral-800/50'}`}>
                       <h3 className="text-xl font-semibold text-white">Monthly Plan</h3>
                        <p className="text-sm text-neutral-400 mt-1">$13.99 every month</p>
                        <p className="text-4xl font-bold text-white my-4">$13.99<span className="text-lg text-neutral-400">/mo</span></p>
                    </button>
                </div>

                <div className="mt-12 w-full max-w-md">
                    <button onClick={onStartSubscription} className="w-full py-4 rounded-lg font-bold text-white text-lg transition-opacity hover:opacity-90 bg-gradient-cyan-purple">
                        Start 7-day Subscription for $0.00
                    </button>
                    <p className="text-xs text-neutral-500 mt-3">
                        You won't be charged during your free 7-day Subscription and can cancel anytime. By subscribing, you agree to our <button onClick={() => onNavigate('terms')} className="underline hover:text-neutral-300">Terms</button> and <button onClick={() => onNavigate('terms')} className="underline hover:text-neutral-300">Privacy Policy</button>.
                    </p>
                </div>
            </div>
        </div>
    );
};