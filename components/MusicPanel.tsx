import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Soul, AccountSettings } from '../types';
import { Slider } from './ui/Slider';
import { PlayCircleIcon, PauseIcon, SparklesIcon, PreviousTrackIcon, NextTrackIcon } from './icons/Icons';

interface MusicPanelProps {
    isOpen: boolean;
    onClose: () => void;
    activeSoul: Soul | null;
    accountSettings: AccountSettings;
}

type Status = 'idle' | 'generating' | 'playing' | 'paused';

export const MusicPanel: React.FC<MusicPanelProps> = ({ isOpen, onClose, activeSoul, accountSettings }) => {
    const [prompt, setPrompt] = useState('');
    const [status, setStatus] = useState<Status>('idle');
    const [volume, setVolume] = useState(0.75);
    const [nowPlaying, setNowPlaying] = useState('');

    const handleSearch = () => {
        if (!prompt) {
            alert("Please enter a description or link for the music.");
            return;
        }
        setStatus('generating');
        // Simulate API call and finding a song
        setTimeout(() => {
            setNowPlaying(prompt);
            setStatus('playing');
        }, 1500);
    };

    const handlePlayPause = () => {
        if (status === 'playing') {
            setStatus('paused');
        } else if (status === 'paused') {
            setStatus('playing');
        } else if (status === 'idle' && nowPlaying) {
            setStatus('playing');
        } else if (status === 'idle' && prompt) {
            handleSearch();
        }
    };
    
    const handleSkip = (direction: 'next' | 'previous') => {
        if (!nowPlaying) return;
        setStatus('generating');
        setTimeout(() => {
            setNowPlaying(`Simulating ${direction} track...`);
            setStatus('playing');
        }, 800);
    }

    const getStatusText = () => {
        switch (status) {
            case 'generating': return `Searching for music...`;
            case 'playing':
                return `Now playing: ${nowPlaying.substring(0, 40)}${nowPlaying.length > 40 ? '...' : ''}`;
            case 'paused':
                return "Music is paused.";
            case 'idle':
            default:
                 return "Music is stopped.";
        }
    };
    
    // FIX: Changed comparison from 'Wisp' to 'Free' to match SubscriptionTier type.
    const isSubscriber = accountSettings.subscriptionTier !== 'Free';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="SoulVerse Music" maxWidth="max-w-md">
            <div className="p-6 space-y-6 bg-[#1c1c1c] text-neutral-300">
                <div className="space-y-2">
                    <input
                        id="music-prompt"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        className="w-full bg-neutral-700/60 border border-neutral-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                        placeholder="Search for a song or paste a link..."
                    />
                    <button onClick={handleSearch} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 transition-opacity">
                        <SparklesIcon className="w-5 h-5" /> Search & Play
                    </button>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-neutral-700/60">
                    <div className="text-center h-10 flex flex-col justify-center">
                        <p className="text-sm font-medium">{getStatusText()}</p>
                        {isSubscriber && status === 'playing' && (
                            <p className="text-xs text-purple-400">✨ Ad-free listening</p>
                        )}
                    </div>

                    <div className="flex items-center justify-center gap-6">
                         <button onClick={() => handleSkip('previous')} className="text-neutral-400 hover:text-white transition-colors p-1 rounded-full hover:bg-neutral-700/60 disabled:opacity-50" aria-label="Previous Track" disabled={!nowPlaying}>
                            <PreviousTrackIcon className="w-7 h-7" />
                        </button>
                        <button onClick={handlePlayPause} className="text-neutral-400 hover:text-white transition-colors p-1 rounded-full hover:bg-neutral-700/60" aria-label={status === 'playing' ? 'Pause' : 'Play'}>
                            {status === 'playing' ? <PauseIcon className="w-10 h-10"/> : <PlayCircleIcon className="w-12 h-12" />}
                        </button>
                         <button onClick={() => handleSkip('next')} className="text-neutral-400 hover:text-white transition-colors p-1 rounded-full hover:bg-neutral-700/60 disabled:opacity-50" aria-label="Next Track" disabled={!nowPlaying}>
                            <NextTrackIcon className="w-7 h-7" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <Slider
                            min={0}
                            max={1}
                            step={0.01}
                            value={volume}
                            onChange={setVolume}
                        />
                         <span className="text-xs w-8 text-right">{Math.round(volume * 100)}%</span>
                    </div>
                </div>
            </div>
        </Modal>
    );
};