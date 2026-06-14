import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { EnvelopeIcon, ArrowLeftIcon } from './icons/Icons';

declare global {
    interface Window {
        google: any;
    }
}

type Location = 'landing' | 'login' | 'app' | 'user-guide' | 'terms';


interface LoginOptionsProps {
  onNavigate: (location: Location) => void;
}

const CLIENT_ID = '257071725330-264utoh0qg6mg5c15fb4n88c29vlk5kl.apps.googleusercontent.com';

export const LoginOptions: React.FC<LoginOptionsProps> = ({ onNavigate }) => {
    const { signInWithGoogle } = useAuth();

    useEffect(() => {
        if (typeof window.google !== 'undefined' && window.google.accounts) {
            window.google.accounts.id.initialize({
                client_id: CLIENT_ID,
                callback: signInWithGoogle,
            });
            window.google.accounts.id.renderButton(
                document.getElementById('googleSignInButtonContainer'),
                { theme: 'filled_black', size: 'small', type: 'standard', text: 'continue_with', shape: 'pill' } // Changed size to small for better mobile fit
            );
        }
    }, [signInWithGoogle]);

    return (
        <div className="relative flex items-center justify-center min-h-screen text-neutral-200 p-4 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center" style={{backgroundImage: "url('https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0176412501.firebasestorage.app/o/bg.png?alt=media&token=c1112b32-3b2d-4561-9c16-b84295e86d06')"}}></div>
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-cyan-500/30 rounded-full blur-3xl animate-pulse animation-delay-400"></div>
            </div>
            <button onClick={() => onNavigate('landing')} className="absolute top-4 left-4 p-2 rounded-full text-neutral-400 hover:bg-neutral-700/80 hover:text-white z-10" aria-label="Back to Landing">
                <ArrowLeftIcon />
            </button>
            <div className="relative z-10 w-full max-w-md bg-transparent card-dark-glass rounded-2xl shadow-2xl p-8 text-center">
                <h2 className="text-2xl font-bold text-white">Join SoulVerse</h2>
                <p className="mt-2 text-sm text-neutral-400 max-w-xs mx-auto">
                    Choose your preferred method to sign in and start your journey.
                </p>

                <div className="mt-8 space-y-4 flex flex-col items-center">
                    <div id="googleSignInButtonContainer" className="w-full max-w-[350px]"></div>
                    
                    <button
                        onClick={() => onNavigate('login')}
                        className="w-full max-w-[350px] flex justify-center items-center gap-3 py-3 px-4 border border-neutral-600 rounded-full shadow-sm text-sm font-medium text-white bg-neutral-800/60 hover:bg-neutral-700/80 transition-colors"
                    >
                        <EnvelopeIcon className="w-5 h-5" />
                        Continue with Email
                    </button>
                </div>
            </div>
        </div>
    );
};
