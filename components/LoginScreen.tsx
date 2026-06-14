import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeftIcon } from './icons/Icons';

interface LoginScreenProps {
  onEmailSubmit: (email: string) => void;
  onNavigateBack: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onEmailSubmit, onNavigateBack }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !email.includes('@')) {
            setError('Please enter a valid email address.');
            return;
        }

        setIsLoading(true);
        setError('');
        
        const lowercasedEmail = email.toLowerCase();
        
        await login(lowercasedEmail);
        onEmailSubmit(lowercasedEmail);
        
        // No need for isLoading false, navigation will occur
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen text-neutral-200 p-4 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center" style={{backgroundImage: "url('https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0176412501.firebasestorage.app/o/bg.png?alt=media&token=c1112b32-3b2d-4561-9c16-b84295e86d06')"}}></div>
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-cyan-500/30 rounded-full blur-3xl animate-pulse animation-delay-400"></div>
            </div>
             <button onClick={onNavigateBack} className="absolute top-4 left-4 p-2 rounded-full text-neutral-400 hover:bg-neutral-700/80 hover:text-white z-10" aria-label="Back to options">
                <ArrowLeftIcon />
            </button>
            <div className="relative z-10 w-full max-w-md bg-transparent card-dark-glass rounded-2xl shadow-2xl p-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">Continue with Email</h2>
                    <p className="mt-2 text-sm text-neutral-400 max-w-xs mx-auto">
                       Create a local profile to save your Souls and conversations directly in your browser.
                    </p>
                </div>

                <form onSubmit={handleEmailSubmit} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="email" className="sr-only">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-neutral-700/60 border border-neutral-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder="Enter your email"
                        />
                         {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-cyan-purple hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Loading...' : 'Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
};