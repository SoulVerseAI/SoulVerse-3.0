import React, { useState, useMemo } from 'react';
import { AccountSettings, ChatMessage, LongTermMemory, Soul } from '../types';
import { getSubscriptionBenefits } from '../services/subscriptionService';

interface DebugStatsProps {
    messages: ChatMessage[];
    consolidatedMemories: LongTermMemory[];
    accountSettings: AccountSettings;
    activeSoul: Soul;
}

export const DebugStats: React.FC<DebugStatsProps> = ({ messages, consolidatedMemories, accountSettings, activeSoul }) => {
    const [isOpen, setIsOpen] = useState(false);

    const stats = useMemo(() => {
        const userMessages = messages.filter(m => m.sender === 'user').length;
        const soulMessages = messages.filter(m => m.sender === 'ai' && m.text !== '--- Chat Break ---' && m.timestamp !== '0').length;
        const totalChars = messages.reduce((acc, msg) => acc + msg.text.length, 0);
        
        const benefits = getSubscriptionBenefits(accountSettings);
        const maxChars = benefits.conversationContextChars;
        const contextUsage = Math.min(100, (totalChars / maxChars) * 100);

        return {
            userMessages,
            soulMessages,
            totalChars,
            contextUsage,
            longTermMemories: consolidatedMemories.length,
        };
    }, [messages, consolidatedMemories, accountSettings]);

    const handleSaveAsPdf = () => {
        const soulName = activeSoul.name;
        const userName = accountSettings.userName;

        let printableContent = `
            <html>
            <head>
                <title>Chat with ${soulName}</title>
                <style>
                    body { font-family: sans-serif; line-height: 1.5; color: #333; }
                    .message { margin-bottom: 1em; padding: 0.8em; border-radius: 8px; max-width: 80%; }
                    .user { background-color: #e0f0ff; align-self: flex-end; }
                    .ai { background-color: #f0f0f0; align-self: flex-start; }
                    .sender { font-weight: bold; margin-bottom: 0.3em; }
                    .container { display: flex; flex-direction: column; max-width: 800px; margin: auto; padding: 20px; }
                    pre { white-space: pre-wrap; word-wrap: break-word; font-family: inherit; margin: 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Conversation with ${soulName}</h1>
        `;

        messages.forEach(msg => {
            if (msg.text === '--- Chat Break ---' || msg.timestamp === '0') return;
            const senderName = msg.sender === 'user' ? userName : soulName;
            const className = msg.sender === 'user' ? 'user' : 'ai';
            printableContent += `
                <div class="message ${className}">
                    <div class="sender">${senderName}</div>
                    <pre>${msg.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
                </div>
            `;
        });

        printableContent += `</div></body></html>`;

        const win = window.open('', '', 'height=800,width=800');
        if (win) {
            win.document.write(printableContent);
            win.document.close();
            win.print();
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 font-mono text-xs">
            {isOpen ? (
                <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-700 text-white rounded-lg p-3 shadow-2xl w-72">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold">Debug Stats</h4>
                        <button onClick={() => setIsOpen(false)} className="font-bold hover:text-neutral-400">X</button>
                    </div>
                    <ul className="space-y-1">
                        <li>User Msgs: <span className="font-bold float-right">{stats.userMessages}</span></li>
                        <li>Soul Msgs: <span className="font-bold float-right">{stats.soulMessages}</span></li>
                        <li>Total Chars: <span className="font-bold float-right">{stats.totalChars.toLocaleString()}</span></li>
                        <li>Context Use: <span className="font-bold float-right">{stats.contextUsage.toFixed(1)}%</span></li>
                        <li>LTM Count: <span className="font-bold float-right">{stats.longTermMemories}</span></li>
                    </ul>
                    <div className="mt-2 pt-2 border-t border-neutral-700">
                        <h5 className="font-bold mb-1">Stored Messages ({messages.length})</h5>
                        <div className="max-h-40 overflow-y-auto text-xs space-y-1 custom-scrollbar">
                            {messages.map(msg => (
                                <div key={msg.id} className="flex justify-between items-center group pr-1">
                                    <p className="truncate flex-1">
                                        <span className="font-bold">{msg.sender === 'user' ? 'U' : 'A'}:</span> {msg.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button 
                        onClick={handleSaveAsPdf}
                        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-md text-center text-xs"
                    >
                        Save as PDF
                    </button>
                </div>
            ) : (
                <button onClick={() => setIsOpen(true)} className="w-10 h-10 bg-neutral-900/80 backdrop-blur-sm border border-neutral-700 text-white rounded-full flex items-center justify-center shadow-2xl">
                    📊
                </button>
            )}
        </div>
    );
};
