import React, { useState } from 'react';
import { Modal } from './ui/Modal';

interface PhoneVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({ isOpen, onClose }) => {
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleSendCode = () => {
        // Placeholder for future logic
        alert(`Verification code sent to ${phoneNumber}`);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Verify Phone Number" maxWidth="max-w-lg">
            <div className="p-6 text-neutral-300 space-y-4">
                <p className="text-sm text-neutral-400">
                    To prevent abuse, please verify your phone number to start the free Subscription. We only use your phone number for verification and abuse prevention purposes. If you'd like to proceed without a phone number, you may <button onClick={() => alert('Subscription without trial not implemented')} className="text-blue-400 underline">subscribe without a trial</button>.
                </p>
                <div>
                    <label htmlFor="phone-number" className="block text-sm font-semibold mb-2 text-white">Please enter your phone number</label>
                    <div className="flex items-center bg-neutral-900 border border-neutral-700 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                        <input
                            id="phone-number"
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full bg-transparent p-3 focus:outline-none text-white"
                            placeholder="e.g., +1 201 555 0123"
                        />
                    </div>
                </div>
                 <button onClick={handleSendCode} className="w-full mt-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700">
                    Send code
                </button>
            </div>
        </Modal>
    );
};