

import React, { useState, useRef, useEffect } from 'react';
import { AccountSettings } from '../types';
import { XMarkIcon, ChevronDownIcon } from './icons/Icons';

interface UserAvatarModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (avatarData: Partial<AccountSettings>) => void;
    accountSettings: AccountSettings;
}

const ConfigSection: React.FC<{title: string}> = ({title}) => (
    <button className="w-full flex justify-between items-center py-3 border-b border-neutral-700/60">
        <span className="font-semibold text-white">{title}</span>
        <ChevronDownIcon className="w-5 h-5 text-neutral-400" />
    </button>
);


export const UserAvatarModal: React.FC<UserAvatarModalProps> = ({ isOpen, onClose, onSave, accountSettings }) => {
    const [step, setStep] = useState(1);
    const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
    const [style, setStyle] = useState<'Photoreal' | 'Anime'>('Photoreal');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [prevIsOpenState, setPrevIsOpenState] = useState(isOpen);

    if (isOpen !== prevIsOpenState) {
        setPrevIsOpenState(isOpen);
        if (isOpen) {
            setImageDataUrl(accountSettings.userAvatar);
            setStyle(accountSettings.userAvatarStyle || 'Photoreal');
            setDescription(accountSettings.userAvatarDescription || '');
            setError('');
            setStep(accountSettings.userAvatar ? 2 : 1);
        }
    }

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageDataUrl(e.target?.result as string);
                setStep(2);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        setImageDataUrl(null);
        setStep(1);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
    
    const handleSave = () => {
        if (!imageDataUrl) {
            setError('! Upload a valid avatar with all required fields filled.');
            return;
        }
        if (description.trim().length === 0) {
            setError('! Upload a valid avatar with all required fields filled.');
            return;
        }
        setError('');
        onSave({
            userAvatar: imageDataUrl,
            userAvatarStyle: style,
            userAvatarDescription: description,
            userAvatarFaceDetailEnhance: accountSettings.userAvatarFaceDetailEnhance,
            userAvatarFaceDetailPrompt: accountSettings.userAvatarFaceDetailPrompt,
        });
    };
    
    // More robust backdrop click handler
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={handleBackdropClick}>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <div 
              ref={modalContentRef}
              className="bg-[#1c1c1c] rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col text-neutral-200"
            >
                <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-neutral-700/60">
                    <h2 className="text-xl font-bold">User avatar</h2>
                    <button onClick={onClose} className="p-2 -m-2 rounded-full hover:bg-neutral-700/80"><XMarkIcon className="w-6 h-6"/></button>
                </header>
                
                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 md:p-6 pb-0">
                         <p className="text-sm text-neutral-400">
                            You can use this avatar as yourself in group selfies after you set it up.
                            {imageDataUrl && step === 2 && (
                                <>
                                    {' '}
                                    <button onClick={handleRemoveAvatar} className="text-blue-400 underline hover:text-blue-300">
                                        Click to remove current set avatar.
                                    </button>
                                </>
                            )}
                        </p>
                    </div>

                    {step === 1 || !imageDataUrl ? (
                        <div className="flex flex-col items-center justify-center h-full p-4">
                            <div className="w-full max-w-sm h-72 border-2 border-dashed border-neutral-600 rounded-2xl flex items-center justify-center p-4">
                                <button onClick={() => fileInputRef.current?.click()} className="bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                                    Upload Photo
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 md:p-6 space-y-6">
                            {error && <div className="p-3 bg-red-500/20 text-red-300 rounded-lg text-sm text-center">{error}</div>}
                            
                            <div className="relative w-full aspect-square max-w-md mx-auto bg-neutral-800 rounded-xl overflow-hidden">
                                <img src={imageDataUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                                    {Array(9).fill(0).map((_, i) => <div key={i} className="border border-white/10"></div>)}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">What style is your avatar? The style should match the image style of your avatar for selfies to work properly.</label>
                                <div className="flex gap-2">
                                    <button onClick={() => setStyle('Photoreal')} className={`py-2 px-4 rounded-full text-sm font-medium transition-colors flex-1 ${style === 'Photoreal' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-neutral-700 hover:bg-neutral-600'}`}>Photoreal</button>
                                    <button onClick={() => setStyle('Anime')} className={`py-2 px-4 rounded-full text-sm font-medium transition-colors flex-1 ${style === 'Anime' ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-neutral-700 hover:bg-neutral-600'}`}>Anime</button>
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-neutral-400">Describe the physical appearance (max 800 chars). This is <span className="font-bold text-neutral-200">extremely important</span> for rendering custom avatars; see the user guide for more tips and common pitfalls.</label>
                                </div>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    maxLength={800}
                                    rows={4}
                                    placeholder="white hair, short, long hair, slight tan, -"
                                    className="w-full bg-neutral-700/60 border border-neutral-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                />
                                <p className="text-right text-xs text-neutral-500 mt-1">{description.length} / 800</p>
                            </div>
                            
                            <ConfigSection title="Face Detail" />
                            <ConfigSection title="Avatar Boost" />
                        </div>
                    )}
                </main>
    
                <footer className="flex-shrink-0 p-4 border-t border-neutral-700/60">
                    <button 
                        onClick={handleSave}
                        disabled={(step === 1 && !imageDataUrl)}
                        className="w-full py-3 rounded-full font-bold text-white text-lg transition-opacity disabled:opacity-50" 
                        style={{background: 'linear-gradient(90deg, #a855f7, #ec4899)'}}>
                        Save
                    </button>
                </footer>
            </div>
        </div>
    );
};