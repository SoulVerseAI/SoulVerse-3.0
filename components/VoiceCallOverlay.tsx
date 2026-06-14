

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Soul, AccountSettings } from '../types';
import { MicrophoneIcon, UserCircleIcon, ExclamationTriangleIcon } from './icons/Icons';
import { EssenceIcon } from './Collection/IconsCollection';

interface VoiceCallOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenSettings: () => void;
    onSendMessage: (text: string, isFromVoice: boolean) => void;
    activeSoul: Soul | null;
    accountSettings: AccountSettings;
    isLoading: boolean;
    isSpeaking: boolean;
    setAccountSettings: (updater: (prev: AccountSettings) => AccountSettings) => void;
    setToast: (toast: { title: string; message: React.ReactNode } | null) => void;
}

const SpeakingVisualizer: React.FC = () => {
    const [heights] = useState<number[]>(() => 
        Array.from({ length: 32 }).map(() => Math.random() * 70 + 15)
    );
    
    return (
        <div className="flex items-center justify-center h-full w-full bg-transparent rounded-lg overflow-hidden">
            <div className="flex items-center justify-center space-x-1.5 h-full w-full">
                {heights.length > 0 ? heights.map((h, i) => (
                    <div
                        key={i}
                        className="w-1.5 bg-green-400 transition-all duration-300 rounded-full"
                        style={{
                            height: `${h}%`,
                            animation: `waveform 1.2s ease-in-out infinite alternate`,
                            animationDelay: `${i * 0.04}s`,
                        }}
                    ></div>
                )) : Array.from({ length: 32 }).map((_, i) => (
                    <div
                        key={i}
                        className="w-1.5 bg-green-400/30 rounded-full"
                        style={{ height: '15%' }}
                    ></div>
                ))}
            </div>
             <style>{`
                @keyframes waveform {
                    from { transform: scaleY(0.1); opacity: 0.5; }
                    to { transform: scaleY(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

// Mock function to simulate server-side transcription
const sendAudioForTranscription = async (audioBlob: Blob): Promise<string> => {
    console.log("Simulating sending audio blob to backend:", audioBlob);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    // Return a mock transcript
    const mockTranscript = "This is a transcribed message from the recorded audio.";
    console.log("Received mock transcript:", mockTranscript);
    return mockTranscript;
};


export const VoiceCallOverlay: React.FC<VoiceCallOverlayProps> = ({
    isOpen,
    onClose,
    onOpenSettings,
    onSendMessage,
    activeSoul,
    accountSettings,
    isLoading,
    isSpeaking,
    setAccountSettings,
    setToast,
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [micError, setMicError] = useState('');
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    
    const stopVisualizerAnimation = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (canvasRef.current) {
            const canvasCtx = canvasRef.current.getContext('2d');
            if (canvasCtx) {
                canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
    }, []);

    const drawVisualizerAnimation = useCallback(() => {
        if (!analyserRef.current || !canvasRef.current || animationFrameRef.current) return;

        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            if (!analyserRef.current || !canvasRef.current) return;

            analyserRef.current.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = '#171717'; // bg-neutral-900
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = '#6366f1'; // indigo-500

            canvasCtx.beginPath();

            const sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;

                if (i === 0) canvasCtx.moveTo(x, y);
                else canvasCtx.lineTo(x, y);
                
                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
        };

        draw();
    }, []);

    useEffect(() => {
        const initMic = async () => {
            if (isOpen) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    streamRef.current = stream;
                    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                    audioContextRef.current = audioContext;
                    analyserRef.current = audioContext.createAnalyser();
                    sourceRef.current = audioContext.createMediaStreamSource(stream);
                    sourceRef.current.connect(analyserRef.current);
                    analyserRef.current.fftSize = 2048;
                    setMicError('');
                } catch (err) {
                    console.error("Error accessing microphone:", err);
                    setMicError("Microphone access is required. Please grant permission and refresh.");
                }
            }
        };

        initMic();

        return () => {
            stopVisualizerAnimation();
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            if (sourceRef.current) {
                sourceRef.current.disconnect();
                sourceRef.current = null;
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(e => console.error("Error closing AudioContext:", e));
                audioContextRef.current = null;
            }
            mediaRecorderRef.current = null;
        };
    }, [isOpen, stopVisualizerAnimation]);

    const handleStartRecording = useCallback(() => {
        if (isSpeaking) window.speechSynthesis.cancel();
        if (!streamRef.current || isRecording) {
            if (!streamRef.current) setMicError("Microphone not ready. Please grant permission.");
            return;
        }

        audioChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            setIsRecording(false);
            stopVisualizerAnimation();

            if (audioChunksRef.current.length === 0) return;

            setIsTranscribing(true);
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            audioChunksRef.current = [];

            try {
                const transcript = await sendAudioForTranscription(audioBlob);
                if (transcript) onSendMessage(transcript, true);
            } catch (error) {
                console.error("Transcription failed:", error);
                setMicError("Could not transcribe audio. Please try again.");
            } finally {
                setIsTranscribing(false);
            }
        };
        
        mediaRecorder.start();
        setIsRecording(true);
        drawVisualizerAnimation();
    }, [isRecording, onSendMessage, drawVisualizerAnimation, stopVisualizerAnimation, isSpeaking]);

    const handleStopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    }, []);

    const handleMicToggle = () => {
        if (isRecording) {
            handleStopRecording();
        } else {
            handleStartRecording();
        }
    };
    
    useEffect(() => {
        let timerId: number | undefined;
        if (isOpen && accountSettings.voiceCallSpontaneousResponse && !isRecording && !isSpeaking && !isLoading && !isTranscribing) {
            timerId = window.setTimeout(() => {
                onSendMessage("(The user has been silent for a while. Say something engaging to continue the conversation or ask a question to break the silence.)", true);
            }, 15000); // 15 seconds of silence
        }
        return () => {
            if (timerId) {
                clearTimeout(timerId);
            }
        };
    }, [isOpen, accountSettings.voiceCallSpontaneousResponse, isRecording, isSpeaking, isLoading, isTranscribing, onSendMessage]);
    
    useEffect(() => {
        if (!isOpen || !isRecording) {
            return;
        }
    
        if ((accountSettings.referralEssence || 0) <= 0) {
            setToast({ title: "Out of Essence", message: "Your voice call has ended." });
            onClose();
            return;
        }
    
        const intervalId = setInterval(() => {
            setAccountSettings(prev => ({
                ...prev,
                referralEssence: (prev.referralEssence || 0) - 1
            }));
        }, 1000);
    
        return () => {
            clearInterval(intervalId);
        };
    }, [isOpen, isRecording, accountSettings.referralEssence, setAccountSettings, onClose, setToast]);

    if (!activeSoul) return null;

    if (micError) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-white text-center bg-transparent">
                <ExclamationTriangleIcon className="w-16 h-16 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Microphone Error</h2>
                <p className="max-w-md text-neutral-400">{micError}</p>
                <button onClick={onClose} className="mt-8 py-2 px-6 rounded-full font-semibold bg-neutral-700 hover:bg-neutral-600 transition-colors">
                    Close
                </button>
            </div>
        );
    }
    
    const getStatusText = () => {
        if (isTranscribing) return 'Transcribing...';
        if (isRecording) return 'Recording...';
        if (isLoading) return `${activeSoul.name} is thinking...`;
        if (isSpeaking) return `${activeSoul.name} is speaking...`;
        return accountSettings.voiceCallPushToTalk ? 'Hold to talk' : 'Tap to talk';
    };
    
    const getRingClassName = () => {
        if (isTranscribing || isLoading) return 'border-purple-500/80 animate-spin';
        if (isRecording) return 'border-red-500/80 animate-pulse';
        if (isSpeaking) return 'border-green-500/80 animate-pulse';
        return 'border-transparent';
    };
    
    return (
        <div className="w-full h-full bg-transparent flex flex-col items-center justify-between p-4 text-white">
             <div className="w-full max-w-4xl flex justify-between items-center z-20">
                <div className="flex items-center gap-2 bg-black/30 p-2 px-3 rounded-full border border-neutral-700">
                    <EssenceIcon className="w-6 h-6" />
                    <span className="font-bold text-lg text-white tabular-nums">
                        {accountSettings.referralEssence.toLocaleString()}
                    </span>
                </div>
                <button onClick={onOpenSettings} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <img src="https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Soulverse%20icon%20topbar%2Fsettings.png?alt=media&token=e3bd0463-a321-4fbf-89a4-5d6d03e36668" alt="Settings" className="w-6 h-6" />
                </button>
            </div>

            <main className="flex flex-col items-center justify-center text-center flex-1">
                 <div className="relative w-48 h-48 md:w-64 md:h-64 mb-4">
                    <div className={`absolute -inset-2 rounded-full border-4 transition-all duration-500 ${getRingClassName()}`} style={{ animationDuration: '2s' }}></div>
                     {activeSoul.avatar ? (
                        <img src={activeSoul.avatar} alt={activeSoul.name} className="w-full h-full rounded-full object-cover relative z-10 shadow-2xl" />
                    ) : (
                        <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center relative z-10 shadow-2xl">
                            <UserCircleIcon className="w-4/5 h-4/5 text-neutral-600" />
                        </div>
                    )}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">{activeSoul.name}</h2>
                <p className="text-neutral-400 mt-2 h-6">{getStatusText()}</p>
                
                <div className="w-full max-w-sm h-24 mt-4">
                    {isRecording && <canvas ref={canvasRef} width="400" height="100" className="w-full h-full"></canvas>}
                    {isSpeaking && <SpeakingVisualizer />}
                </div>
            </main>

            <footer className="w-full max-w-sm flex justify-center items-center pb-4 z-20">
                <button
                    onMouseDown={accountSettings.voiceCallPushToTalk ? handleStartRecording : undefined}
                    onMouseUp={accountSettings.voiceCallPushToTalk ? handleStopRecording : undefined}
                    onTouchStart={accountSettings.voiceCallPushToTalk ? handleStartRecording : undefined}
                    onTouchEnd={accountSettings.voiceCallPushToTalk ? handleStopRecording : undefined}
                    onClick={!accountSettings.voiceCallPushToTalk ? handleMicToggle : undefined}
                    disabled={isTranscribing || isLoading || isSpeaking}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-200 active:scale-110 disabled:opacity-50 disabled:cursor-not-allowed
                        ${isRecording && !accountSettings.voiceCallPushToTalk ? 'bg-red-600' : 'bg-gradient-cyan-purple'}
                    `}
                >
                    <MicrophoneIcon className="w-10 h-10"/>
                </button>
            </footer>
        </div>
    );
};