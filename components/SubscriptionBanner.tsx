
import React from 'react';

interface SubscriptionBannerProps {
  onUpgrade: () => void;
}

export const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ onUpgrade }) => {
  return (
    <div 
      className="relative flex items-center justify-center p-3 text-center text-sm text-white bg-gradient-cyan-purple"
    >
      <p>
        You are on the SoulVerse free plan. Upgrade to Premium for enhanced memory, voice calls, and more!{' '}
        <button onClick={onUpgrade} className="font-bold underline hover:opacity-80 transition-opacity">
          Start Subscription
        </button>
      </p>
    </div>
  );
};