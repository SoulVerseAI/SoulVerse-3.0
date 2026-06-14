// FIX: Import React to provide the React namespace for types like React.DragEvent.
import React, { useState, useCallback } from 'react';

interface UseCardSlotProps {
  slotIndex: number;
  onDrop: (e: React.DragEvent<HTMLDivElement>, slotIndex: number) => void;
}

export const useCardSlot = ({ slotIndex, onDrop }: UseCardSlotProps) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    onDrop(e, slotIndex);
    setIsOver(false);
  }, [onDrop, slotIndex]);

  return {
    isOver,
    dragHandlers: {
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
};