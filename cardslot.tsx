
import React from 'react';
import type { Card as CardType } from '../types';
import Card from './Card';
import { useCardSlot } from '../slots';

interface CardSlotProps {
  slotIndex: number;
  card: CardType | null;
  onDrop: (e: React.DragEvent<HTMLDivElement>, slotIndex: number) => void;
  isPlayerSlot?: boolean;
}

const CardSlot: React.FC<CardSlotProps> = ({ slotIndex, card, onDrop, isPlayerSlot = false }) => {
  const { isOver, dragHandlers } = useCardSlot({ slotIndex, onDrop });

  return (
    <div
      {...dragHandlers}
      className={`w-36 h-48 rounded-md border-2 border-dashed flex items-center justify-center transition-all duration-200 relative
      ${isOver && isPlayerSlot ? 'border-cyan-400 bg-cyan-400/20 scale-105' : 'border-stone-600 bg-black/30'}
      `}
    >
      {card ? (
        <Card card={card} isDraggable={false} size="board" />
      ) : (
        <div className="w-full h-full bg-stone-900/50"></div>
      )}
    </div>
  );
};

export default CardSlot;
