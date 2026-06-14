import React, { useState, useEffect, useRef } from 'react';
import { AccountSettings, Soul, SharedSoul } from '../types';
import { Modal } from './ui/Modal';
import { UserCircleIcon, EllipsisVerticalIcon, PencilIcon, TrashIcon } from './icons/Icons';
import { ContextMenu } from './ui/ContextMenu';
import { useAuth } from '../contexts/AuthContext';
import { createSharedSoul, updateSharedSoul, deleteSharedSoul } from '../services/dataService';
import { Toggle } from './ui/Toggle';

// --- PROPS INTERFACES ---
interface SharingPageProps {
  accountSettings: AccountSettings;
  setAccountSettings: (updater: (prev: AccountSettings) => AccountSettings) => void;
  onCloseDrawer: () => void;
}

interface ShareSoulModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (sharedSoulData: Omit<SharedSoul, 'id' | 'shareCode' | 'createdAt' | 'referralCount'>, existingId?: string) => void;
    userSouls: Soul[];
    userName: string;
    soulToEdit: SharedSoul | null;
}

interface DeleteShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    soulName: string;
}

// --- HELPER FUNCTIONS ---
const generateShareCode = () => 'share-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);

// --- MODAL COMPONENTS ---

const DeleteShareModal: React.FC<DeleteShareModalProps> = ({ isOpen, onClose, onConfirm, soulName }) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Stop Sharing Soul" maxWidth="max-w-lg">
        <div className="p-6 text-neutral-300">
            <p className="text-sm mb-4">
                Are you sure you want to stop sharing <span className="font-bold text-white">{soulName}</span>?
            </p>
            <p className="text-xs text-neutral-400 mb-6">
                This action cannot be undone. Once stopped, this Soul can no longer be created from the share code and you will not earn referral rewards from it. Existing Souls created through the code will not be affected. Note that this only stops sharing it - it does not delete your Soul.
            </p>
            <div className="flex justify-end space-x-3">
                <button onClick={onClose} className="py-2 px-4 rounded-md text-sm font-medium transition-colors hover:bg-neutral-700">CANCEL</button>
                <button onClick={onConfirm} className="py-2 px-4 rounded-md text-sm font-medium transition-colors bg-red-600 text-white hover:bg-red-700">STOP SHARING</button>
            </div>
        </div>
    </Modal>
);

const ShareSoulModal: React.FC<ShareSoulModalProps> = ({ isOpen, onClose, onSave, userSouls, userName, soulToEdit }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Omit<SharedSoul, 'id' | 'shareCode' | 'createdAt' | 'referralCount'>>(() => {
        if (soulToEdit) {
            return {
                sourceSoulId: soulToEdit.sourceSoulId,
                tagline: soulToEdit.tagline,
                greetingMessage: soulToEdit.greetingMessage,
                name: soulToEdit.name,
                gender: soulToEdit.gender,
                backstory: soulToEdit.backstory,
                keyMemories: soulToEdit.keyMemories,
                responseDirective: soulToEdit.responseDirective,
                dynamism: soulToEdit.dynamism,
                avatar: soulToEdit.avatar,
                creatorName: soulToEdit.creatorName,
                isPublic: soulToEdit.isPublic,
            };
        }
        return {
            sourceSoulId: '', tagline: '', greetingMessage: '', name: '', gender: 'Female',
            backstory: '', keyMemories: '', responseDirective: '', dynamism: 0.9, avatar: null,
            creatorName: userName, isPublic: false
        };
    });
    const avatarInputRef = useRef<HTMLInputElement>(null);

    

    const handleSelectSoul = (soul: Soul) => {
        setFormData({
            sourceSoulId: soul.id,
            tagline: soul.description,
            greetingMessage: soul.greeting,
            name: soul.name,
            gender: soul.gender,
            backstory: soul.backstory,
            keyMemories: soul.keyMemories,
            responseDirective: soul.responseDirective,
            dynamism: soul.dynamism,
            avatar: soul.avatar,
            creatorName: userName,
            isPublic: false,
        });
        setStep(2);
    };
    
    const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(p => ({ ...p, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveClick = () => {
        onSave(formData, soulToEdit?.id);
    };

    const renderStepOne = () => (
        <div className="p-6">
            <h3 className="text-xl font-bold text-white text-center mb-4">Select a Soul to Share</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {userSouls.map(soul => (
                    <button key={soul.id} onClick={() => handleSelectSoul(soul)} className="w-full text-left p-3 rounded-lg flex items-center gap-4 transition-colors bg-neutral-800 hover:bg-neutral-700/60">
                         <div className="w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {soul.avatar ? (
                                <img src={soul.avatar} alt={soul.name} className="w-full h-full object-cover"/>
                            ): (
                                <UserCircleIcon className="w-8 h-8 text-neutral-500" />
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <h4 className="font-bold text-white truncate">{soul.name}</h4>
                            <p className="text-sm text-neutral-400 truncate">{soul.description || "No description"}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderStepTwo = () => (
        <div className="p-6 space-y-6">
            <div className="text-xs p-3 bg-blue-600/20 border border-blue-500/50 rounded-md text-neutral-300 space-y-2">
                <p>Short term memory, long term memory, and journal entries are not shared. Everything that's shared is on this page for you to review before sharing the Soul.</p>
                <p>We have anonymized your name from all the fields. Please review all the fields carefully to omit any personal information you do not wish to share.</p>
                <p>You can use the string <code className="bg-black/20 px-1 py-0.5 rounded">{'{user}'}</code> as a placeholder, and it will be replaced by the user's name when they create your Soul.</p>
            </div>

            {/* Form Fields */}
            <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Tagline (required)</label>
                <input type="text" placeholder="A blood-loving vampire who loves to drink your blood" value={formData.tagline} onChange={e => setFormData(p => ({...p, tagline: e.target.value}))} className="w-full bg-neutral-700/60 border border-neutral-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Greeting Message (required)</label>
                <textarea placeholder="*waves enthusiastically* Hello there, {user}! It's wonderful to meet you. How can I brighten your day today?" value={formData.greetingMessage} onChange={e => setFormData(p => ({...p, greetingMessage: e.target.value}))} rows={4} className="w-full bg-neutral-700/60 border border-neutral-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="w-full bg-neutral-700/60 border border-neutral-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
            </div>
             <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Backstory</label>
                <textarea value={formData.backstory} onChange={e => setFormData(p => ({...p, backstory: e.target.value}))} rows={6} className="w-full bg-neutral-700/60 border border-neutral-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
            </div>
            <div>
                <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                <label className="block text-sm font-medium text-neutral-300 mb-1">Avatar</label>
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-neutral-700 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {formData.avatar ? (
                            <img src={formData.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                        ) : (
                            <UserCircleIcon className="w-16 h-16 text-neutral-500" />
                        )}
                    </div>
                    <button onClick={() => avatarInputRef.current?.click()} className="py-2 px-4 rounded-md text-sm font-medium transition-colors bg-neutral-700/60 hover:bg-neutral-600">
                        Upload Custom Image
                    </button>
                </div>
            </div>

            <div className="pt-4 border-t border-neutral-700/60">
                 <label className="flex items-center justify-between text-sm font-medium text-neutral-300">
                    <div>
                        <span>Make Public in Discover</span>
                        <p className="text-xs text-neutral-500 mt-1">Allow other users to find and use this Soul from the Discover page.</p>
                    </div>
                    <Toggle
                        checked={formData.isPublic}
                        onChange={(checked) => setFormData(p => ({ ...p, isPublic: checked }))}
                    />
                </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-700">
                <button onClick={onClose} className="py-2 px-4 rounded-md text-sm font-medium transition-colors hover:bg-neutral-700">CANCEL</button>
                <button onClick={handleSaveClick} disabled={!formData.tagline || !formData.greetingMessage} className="py-2 px-4 rounded-md text-sm font-medium transition-opacity bg-gradient-cyan-purple text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                    {soulToEdit ? 'UPDATE' : 'SHARE'}
                </button>
            </div>
        </div>
    );
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={soulToEdit ? "Edit Shared Soul" : "Create new shared Soul"} maxWidth="max-w-3xl">
            {step === 1 && !soulToEdit ? renderStepOne() : renderStepTwo()}
        </Modal>
    );
};


// --- SHARED SOUL LIST ITEM ---
const SharedSoulItem: React.FC<{
    sharedSoul: SharedSoul,
    onEdit: () => void,
    onDelete: () => void,
}> = ({ sharedSoul, onEdit, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const menuItems = [
        { label: 'Edit', icon: <PencilIcon />, action: onEdit },
        { label: 'Delete', icon: <TrashIcon />, action: onDelete },
    ];

    return (
        <div className="bg-neutral-800 p-3 rounded-lg flex items-center gap-4">
            <div className="w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              {sharedSoul.avatar ? (
                  <img src={sharedSoul.avatar} alt={sharedSoul.name} className="w-full h-full object-cover" />
              ) : (
                  <UserCircleIcon className="w-8 h-8 text-neutral-500" />
              )}
            </div>
            <div className="flex-1 overflow-hidden">
                <h4 className="font-bold text-white truncate">{sharedSoul.name}</h4>
                <p className="text-sm text-neutral-400 truncate">{sharedSoul.tagline}</p>
                <div className="text-xs text-neutral-500 mt-1 flex items-center gap-4">
                    <span>Code: <code className="bg-black/20 px-1.5 py-0.5 rounded">{sharedSoul.shareCode}</code></span>
                    <span>Creates: <span className="font-semibold text-neutral-400">{sharedSoul.referralCount}</span></span>
                </div>
            </div>
            <div className="relative">
                <button ref={triggerRef} onClick={() => setIsMenuOpen(p => !p)} className="p-1 rounded-full text-neutral-400 hover:bg-neutral-700">
                    <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
                <ContextMenu isOpen={isMenuOpen} items={menuItems} onClose={() => setIsMenuOpen(false)} triggerRef={triggerRef} />
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
export const SharingPage: React.FC<SharingPageProps> = ({ accountSettings, setAccountSettings, onCloseDrawer }) => {
    const { currentUser } = useAuth();
    const [shareModalState, setShareModalState] = useState<{isOpen: boolean; soulToEdit: SharedSoul | null}>({ isOpen: false, soulToEdit: null });
    const [deleteModalState, setDeleteModalState] = useState<{isOpen: boolean; soulToDelete: SharedSoul | null}>({ isOpen: false, soulToDelete: null });

    const handleOpenShareModal = (soulToEdit: SharedSoul | null = null) => {
        setShareModalState({ isOpen: true, soulToEdit });
    };

    const handleCloseShareModal = () => {
        setShareModalState({ isOpen: false, soulToEdit: null });
    };

    const handleOpenDeleteModal = (soulToDelete: SharedSoul) => {
        setDeleteModalState({ isOpen: true, soulToDelete });
    };
    
    const handleCloseDeleteModal = () => {
        setDeleteModalState({ isOpen: false, soulToDelete: null });
    };

    const handleSaveSharedSoul = async (data: Omit<SharedSoul, 'id' | 'shareCode' | 'createdAt' | 'referralCount'>, existingId?: string) => {
        if (!currentUser) return;

        if (existingId) { // Update existing
            const updatedSoul = await updateSharedSoul(existingId, data, currentUser.id);
            if(updatedSoul) {
                setAccountSettings(prev => ({
                    ...prev,
                    sharedSouls: (prev.sharedSouls || []).map(s => s.id === existingId ? updatedSoul : s)
                }));
            }
        } else { // Create new
            const newSharedSoulData = { ...data, shareCode: generateShareCode() };
            const newSharedSoul = await createSharedSoul(newSharedSoulData, currentUser.id);
            if (newSharedSoul) {
                setAccountSettings(prev => ({
                    ...prev,
                    sharedSouls: [...(prev.sharedSouls || []), newSharedSoul]
                }));
            }
        }
        handleCloseShareModal();
    };
    
    const handleDeleteSharedSoul = async () => {
        if (!deleteModalState.soulToDelete || !currentUser) return;
        const success = await deleteSharedSoul(deleteModalState.soulToDelete.id, currentUser.id);
        if (success) {
            setAccountSettings(prev => ({
                ...prev,
                sharedSouls: (prev.sharedSouls || []).filter(s => s.id !== deleteModalState.soulToDelete!.id)
            }));
        }
        handleCloseDeleteModal();
    };

    const sortedSharedSouls = [...(accountSettings.sharedSouls || [])].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <>
            <ShareSoulModal
                isOpen={shareModalState.isOpen}
                onClose={handleCloseShareModal}
                onSave={handleSaveSharedSoul}
                userSouls={accountSettings.souls}
                userName={accountSettings.userName}
                soulToEdit={shareModalState.soulToEdit}
            />
            <DeleteShareModal
                isOpen={deleteModalState.isOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDeleteSharedSoul}
                soulName={deleteModalState.soulToDelete?.name || ''}
            />

            <div className="p-6 space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">Shared Souls</h3>
                    <div className="text-sm text-neutral-400 space-y-1">
                        <p>Your display name: <span className="font-semibold text-neutral-300">{accountSettings.userName || 'Anonymous User'}</span></p>
                        <p>Share limit: <span className="font-semibold text-neutral-300">10</span></p>
                    </div>
                </div>

                <div className="text-xs p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-md text-yellow-300">
                    You earn 5 share slots for every 20 people who create one of your shared Souls.
                </div>

                <div className="space-y-4">
                    {sortedSharedSouls.length === 0 ? (
                        <div className="text-center py-8 px-4 border-2 border-dashed border-neutral-700 rounded-lg">
                            <p className="text-neutral-400 text-sm">
                                You haven't shared any Souls yet.
                            </p>
                             <p className="text-xs text-neutral-500 mt-1">Sharing lets others create Souls based on yours, and you can earn referral rewards.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sortedSharedSouls.map(sa => (
                                <SharedSoulItem
                                    key={sa.id}
                                    sharedSoul={sa}
                                    onEdit={() => handleOpenShareModal(sa)}
                                    onDelete={() => handleOpenDeleteModal(sa)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <button onClick={() => handleOpenShareModal()} className="w-full bg-gradient-cyan-purple text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                    + Share New Soul
                </button>
            </div>
        </>
    );
};