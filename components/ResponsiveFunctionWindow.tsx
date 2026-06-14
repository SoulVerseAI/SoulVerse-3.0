import React from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { useIsTablet } from '../hooks/useIsTablet';
import { FunctionWindow } from './ui/FunctionWindow';
import { MobileFunctionWindow } from './ui/MobileFunctionWindow';
import { TabletFunctionWindow } from './ui/TabletFunctionWindow';

interface ResponsiveFunctionWindowProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  headerClassName?: string;
  transparentBg?: boolean;
  functionName: string; // To identify which function's modal it is
}

export const ResponsiveFunctionWindow: React.FC<ResponsiveFunctionWindowProps> = (props) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  if (isMobile) {
    return <MobileFunctionWindow {...props} />;
  }

  if (isTablet) {
    return <TabletFunctionWindow {...props} />;
  }

  // Desktop default
  return <FunctionWindow {...props} />;
};
