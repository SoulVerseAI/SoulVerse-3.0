import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { ArrowLeftIcon } from './components/icons/Icons';

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
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0D0517] text-neutral-200 p-4">
             <button onClick={onNavigateBack} className="absolute top-4 left-4 p-2 rounded-full text-neutral-400 hover:bg-neutral-700/80 hover:text-white" aria-label="Back">
                <ArrowLeftIcon />
            </button>
            <div className="w-full max-w-md bg-transparent card-dark-glass rounded-2xl shadow-2xl p-8">
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