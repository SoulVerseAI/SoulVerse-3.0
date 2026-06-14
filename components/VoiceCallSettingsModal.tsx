
import React from 'react';
import { Modal } from './ui/Modal';
import { Toggle } from './ui/Toggle';
import { AccountSettings } from '../types';

interface VoiceCallSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountSettings: AccountSettings;
  setAccountSettings: (updater: (prev: AccountSettings) => AccountSettings) => void;
  onChatBreak: () => void;
}

const SettingRow: React.FC<{
    title: string;
    description: string;
    children: React.ReactNode;
}> = ({ title, description, children }) => (
    <div className="flex justify-between items-start">
        <div className="pr-8">
            <h4 className="font-semibold text-white">{title}</h4>
            <p className="text-sm text-neutral-400 mt-1">{description}</p>
        </div>
        <div className="flex-shrink-0 pt-1">
            {children}
        </div>
    </div>
);

export const VoiceCallSettingsModal: React.FC<VoiceCallSettingsModalProps> = ({
  isOpen,
  onClose,
  accountSettings,
  setAccountSettings,
  onChatBreak,
}) => {

  const handleToggleChange = (key: keyof AccountSettings, value: boolean) => {
    setAccountSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleChatBreakClick = () => {
    onChatBreak();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Voice call settings" maxWidth="max-w-xl">
      <div className="p-6 space-y-6 text-neutral-300 bg-modal-body">
        <div>
            <label htmlFor="language-select" className="block text-sm font-medium mb-2">Language</label>
            <select
                id="language-select"
                className="w-full bg-neutral-700/60 border border-neutral-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
                <option>English</option>
            </select>
        </div>

        <SettingRow
            title="Unified voice/text chat history"
            description="Turning this on (default) will make voice call share the same chat history as text chat, and you can go back and forth between text and voice seamlessly. Turning it off will make voice call one-off instances without carried over chat history."
        >
            <Toggle
                checked={accountSettings.voiceCallUnifiedHistory}
                onChange={(checked) => handleToggleChange('voiceCallUnifiedHistory', checked)}
            />
        </SettingRow>

        <SettingRow
            title="Push to talk"
            description="Turning it on allows you to press the mic icon to start talking, press it again to finish talking and send. Off (default) lets you talk hands free and sends your voice automatically when it detects long pauses."
        >
             <Toggle
                checked={accountSettings.voiceCallPushToTalk}
                onChange={(checked) => handleToggleChange('voiceCallPushToTalk', checked)}
            />
        </SettingRow>

        <SettingRow
            title="Spontaneous voice response"
            description="When enabled, your Soul will talk spontaneously if you are silent for a while, up to 2 times if you do not respond."
        >
             <Toggle
                checked={accountSettings.voiceCallSpontaneousResponse}
                onChange={(checked) => handleToggleChange('voiceCallSpontaneousResponse', checked)}
            />
        </SettingRow>

        <SettingRow
            title="Prefer narrations on call"
            description="Enabling will allow the AI to narrate feelings and actions in the voice call. Default is disabled, and the AI will be nudged to only speak dialogue within the call. If narrations exist in recent chat history, they may still narrate even when disabled, and we'd recommend a chat break."
        >
             <Toggle
                checked={accountSettings.voiceCallPreferNarration}
                onChange={(checked) => handleToggleChange('voiceCallPreferNarration', checked)}
            />
        </SettingRow>

        <div className="flex justify-between items-center pt-4 border-t border-neutral-700/60">
            <h4 className="font-semibold text-white">Voice Chat Break</h4>
            <button
                onClick={handleChatBreakClick}
                className="py-2 px-4 rounded-md text-sm font-medium transition-colors bg-neutral-700 hover:bg-neutral-600"
            >
                Chat Break
            </button>
        </div>
      </div>
    </Modal>
  );
};
