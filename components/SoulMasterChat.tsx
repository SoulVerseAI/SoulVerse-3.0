import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, SparklesIcon, LoadingSpinner } from './icons/Icons';
import { generateSoulMasterResponse } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    role: 'user' | 'model';
    text: string;
}

export const SoulMasterChat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: "Hello! I am the Soul Master, your expert assistant for crafting compelling AI characters. How can I help you develop your Soul today? You can ask me to write a backstory, suggest a personality, or brainstorm ideas." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatContainerRef.current?.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', text: input.trim() };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const history = newMessages.map(m => ({ role: m.role, text: m.text }));
            const response = await generateSoulMasterResponse(history);
            const modelMessage: Message = { role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: Message = { role: 'model', text: "Sorry, I encountered an error. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-neutral-900/50">
            <div className="p-4 border-b border-neutral-800 text-center">
                <h3 className="font-bold text-white text-lg flex items-center justify-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-purple-400" />
                    Soul Master Assistant
                </h3>
                <p className="text-xs text-neutral-500">Your creative partner for building Souls</p>
            </div>

            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xl p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600/30 text-white' : 'bg-neutral-800 text-neutral-200'}`}>
                            <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 text-white">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-xl p-3 rounded-lg bg-neutral-800 flex items-center">
                           <LoadingSpinner className="w-5 h-5" />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-neutral-800">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask for a backstory, personality traits, etc..."
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg py-2 px-4 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="p-2 rounded-full bg-blue-600 text-white disabled:bg-neutral-700">
                        <SendIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};
