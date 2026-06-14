

import React from 'react';
import { FunctionWindow } from './ui/FunctionWindow';
import { GeneralSettingsPageContent } from './GeneralSettingsPage';
import { AccountSettings } from '../types';
import { User } from '../contexts/AuthContext';

interface GeneralSettingsWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  accountSettings: AccountSettings;
  setAccountSettings: (updater: (prev: AccountSettings) => AccountSettings) => void;
  setPreviewTheme: (theme: string | null) => void;
  currentUser: User | null;
  onOpenJournalModal: () => void;
}

export const GeneralSettingsWrapper: React.FC<GeneralSettingsWrapperProps> = ({
  isOpen,
  onClose,
  accountSettings,
  setAccountSettings,
  setPreviewTheme,
  currentUser,
  onOpenJournalModal,
}) => {
  const handleCloseWrapper = () => {
    setPreviewTheme(null); // Reset theme preview when closing
    onClose();
  };

  return (
    <FunctionWindow isOpen={isOpen} onClose={handleCloseWrapper} title="Options">
        <GeneralSettingsPageContent
            accountSettings={accountSettings}
            setAccountSettings={setAccountSettings}
            onCloseDrawer={handleCloseWrapper}
            setPreviewTheme={setPreviewTheme}
            currentUser={currentUser}
            onOpenJournalModal={onOpenJournalModal}
        />
    </FunctionWindow>
  );
};
