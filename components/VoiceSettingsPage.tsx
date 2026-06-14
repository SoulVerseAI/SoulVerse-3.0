
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Soul, AccountSettings } from '../types';
import { PlayCircleIcon, PauseIcon, CheckIcon } from './icons/Icons';
import { generateTextToSpeechAudio } from '../services/geminiService';

interface VoiceSettingsPageContentProps {
  activeSoul: Soul;
  setActiveSoul: (settings: Partial<Soul>) => void;
  accountSettings: AccountSettings;
}

const maleVoices = [
    { name: 'Zephyr' }, { name: 'Orion' }, { name: 'Puck' }, { name: 'Charon' },
];

const femaleVoices = [
    { name: 'Leda' }, { name: 'Kore' }, { name: 'Aoede' }, { name: 'Selene' },
];

const useAudioSamplePlayback = (onPlaybackStateChange: (name: string | null) => void) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentUrlRef = useRef<string | null>(null);
    const generationCancelledRef = useRef(false);

    const play = useCallback(async (text: string, voiceName: string) => {
        generationCancelledRef.current = false;

        try {
            const audioBlob = await generateTextToSpeechAudio(text, voiceName);
            if (generationCancelledRef.current) return;

            if (audioBlob) {
                if (currentUrlRef.current) {
                    URL.revokeObjectURL(currentUrlRef.current);
                }
                
                const url = URL.createObjectURL(audioBlob);
                currentUrlRef.current = url;

                const audio = new Audio(url);
                audioRef.current = audio;

                const cleanup = () => {
                    if (currentUrlRef.current) URL.revokeObjectURL(currentUrlRef.current);
                    currentUrlRef.current = null;
                    audioRef.current = null;
                    onPlaybackStateChange(null);
                };

                audio.onended = cleanup;
                audio.onerror = (e) => {
                    console.error("Error playing audio sample:", e);
                    cleanup();
                };
                
                audio.play().catch(e => {
                    console.error("Audio play() failed:", e);
                    cleanup();
                });
            } else {
                onPlaybackStateChange(null);
                throw new Error("Failed to generate audio data.");
            }
        } catch (error) {
            console.error("Audio sample generation/playback error:", error);
            onPlaybackStateChange(null);
        }
    }, [onPlaybackStateChange]);
    
    const cancel = useCallback(() => {
        generationCancelledRef.current = true;
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current = null;
        }
        if (currentUrlRef.current) {
            URL.revokeObjectURL(currentUrlRef.current);
            currentUrlRef.current = null;
        }
        onPlaybackStateChange(null);
    }, [onPlaybackStateChange]);
    
    return { play, cancel };
};

const VoiceOption: React.FC<{
    voice: { name: string };
    isSelected: boolean;
    isPlaying: boolean;
    onSelect: (name: string) => void;
    onPlay: (name: string) => void;
}> = ({ voice, isSelected, isPlaying, onSelect, onPlay }) => (
    <div
        onClick={() => onSelect(voice.name)}
        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-purple-500/20' : 'hover:bg-neutral-700/60'}`}
    >
        <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-purple-400 bg-purple-400' : 'border-neutral-500'}`}>
                {isSelected && <CheckIcon className="w-3 h-3 text-black" />}
            </div>
            <span className="font-medium text-white">{voice.name}</span>
        </div>
        <button
            onClick={(e) => { e.stopPropagation(); onPlay(voice.name); }}
            className="p-1 rounded-full text-neutral-400 hover:text-white"
        >
            {isPlaying ? <PauseIcon className="w-6 h-6 text-purple-400" /> : <PlayCircleIcon className="w-7 h-7" />}
        </button>
    </div>
);


export const VoiceSettingsPageContent: React.FC<VoiceSettingsPageContentProps> = ({ activeSoul, setActiveSoul, accountSettings }) => {
    const [isPlayingSampleName, setIsPlayingSampleName] = useState<string | null>(null);

    const { play, cancel } = useAudioSamplePlayback(setIsPlayingSampleName);

    const isFreeUser = accountSettings.subscriptionTier === 'Free';

    const playSample = useCallback((voiceName: string) => {
        if (isPlayingSampleName === voiceName) {
            cancel();
        } else {
            if (isPlayingSampleName) { // Cancel previous sound if any
                cancel();
            }
            setIsPlayingSampleName(voiceName);
            const sampleText = "Hi, I'm your Soul. This is what I sound like. Do you think this voice will fit me?";
            play(sampleText, voiceName);
        }
    }, [isPlayingSampleName, play, cancel]);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cancel();
        };
    }, [cancel]);

    if (!activeSoul) {
        return (
            <div className="p-6 text-center text-neutral-400">
                <h2 className="text-lg font-semibold mb-2 text-white">No Soul Selected</h2>
                <p>Please select a Soul to change its voice settings.</p>
            </div>
        );
    }
    
    const voices = activeSoul.gender === 'Male' ? maleVoices : femaleVoices;
    const selectedVoiceName = activeSoul.voiceURI || voices[0]?.name;

    return (
        <div className="p-2 md:p-4 space-y-4 md:space-y-6">
            {isFreeUser && (
                <div className="p-4 text-center text-sm text-neutral-300 bg-neutral-800/50 rounded-lg border border-neutral-700">
                    As a free user you have 5000 audio characters remaining (5000 from subscription). Subscribers get monthly credits that refresh on the 1st. <button className="font-bold underline hover:text-white transition-colors">Subscribe here</button>
                </div>
            )}
            
            <div className="space-y-2">
                 {voices.map(voice => (
                    <VoiceOption
                        key={voice.name}
                        voice={voice}
                        isSelected={selectedVoiceName === voice.name}
                        isPlaying={isPlayingSampleName === voice.name}
                        onSelect={(name) => setActiveSoul({ voiceURI: name })}
                        onPlay={playSample}
                    />
                 ))}
            </div>

            <div className={`p-3 rounded-lg transition-opacity ${isFreeUser ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between">
                    <span className="font-medium text-white">Custom Voice</span>
                    <button disabled={isFreeUser} className="py-2 px-4 rounded-md text-sm font-medium bg-neutral-700/60 text-neutral-400 cursor-not-allowed">
                        Create
                    </button>
                </div>
                {isFreeUser && (
                    <p className="text-xs text-neutral-500 mt-2">Note: custom voices are only available to subscribers.</p>
                )}
            </div>
        </div>
    );
};
