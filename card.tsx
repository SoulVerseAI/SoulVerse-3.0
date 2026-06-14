import React, { useState, useEffect, useRef } from 'react';
import type { Card as CardType } from '../types';

interface CardProps {
  card: CardType;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrag?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  isDraggable?: boolean;
  size?: 'full' | 'hand' | 'board';
  canBePlayed?: boolean;
  isAttacking?: boolean;
  isBeingDragged?: boolean;
}

const Card: React.FC<CardProps> = ({ card, onDragStart, onDrag, onDragEnd, isDraggable, size = 'full', canBePlayed = false, isAttacking, isBeingDragged }) => {
  const [prevHealth, setPrevHealth] = useState(card.health);
  const [damaged, setDamaged] = useState(false);

  if (card.health < prevHealth) {
    setPrevHealth(card.health);
    setDamaged(true);
  }

  useEffect(() => {
    if (damaged) {
      const timer = setTimeout(() => setDamaged(false), 300);
      return () => clearTimeout(timer);
    }
  }, [damaged]);
  
  const factionStyles = {
    Solari: {
      border: 'border-amber-400',
      gradient: 'from-yellow-900/50 to-amber-950/80',
      header: 'bg-amber-800',
      type: 'text-amber-200',
    },
    Shadow: {
      border: 'border-purple-500',
      gradient: 'from-purple-900/50 to-indigo-950/80',
      header: 'bg-purple-800',
      type: 'text-purple-300',
    },
  };

  const styles = factionStyles[card.faction];

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (isDraggable && onDragStart) {
      onDragStart(e);
    }
  };
  
  const cardId = card.instanceId || card.id;

  const getCardSizeClasses = () => {
    switch(size){
        case 'hand': return 'w-40 h-56';
        case 'board': return 'w-32 h-44';
        default: return 'w-48 h-64';
    }
  }

  return (
    <div
      id={cardId}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      className={`relative ${getCardSizeClasses()} ${styles.gradient} rounded-lg shadow-lg shadow-black/40 border-2 ${styles.border} overflow-hidden flex flex-col justify-between transition-all duration-200 
      ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} 
      ${size === 'hand' && isDraggable ? 'hover:scale-105 hover:-translate-y-4' : ''}
      ${canBePlayed ? `can-play-glow ${styles.border}` : ''}
      ${damaged ? 'is-damaged' : ''}
      ${isAttacking ? 'is-attacking' : ''}
      ${isBeingDragged ? 'opacity-0' : ''}
      `}
    >
      {/* Header */}
      <div className={`flex justify-between items-center px-2 py-1 ${styles.header}`}>
        <span className="text-white font-bold text-sm truncate">{card.name}</span>
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-white font-bold border-2 border-sky-300 text-sm">
          {card.cost}
        </span>
      </div>

      {/* Image */}
      <div className="h-1/2 bg-cover bg-center mx-2 border-2 border-black/50 rounded-md" style={{ backgroundImage: `url(${card.imageUrl})` }}></div>
      
      {/* Type */}
      <div className="px-2 text-center">
         <p className={`${styles.type} text-xs font-semibold`}>{card.cardType}</p>
      </div>
      
      {/* Footer Stats */}
      <div className="flex justify-between items-center px-3 py-1 bg-black/50 text-white font-bold">
        <span className="flex items-center justify-center text-lg w-8 h-8 rounded-full bg-red-700 border-2 border-red-400">{card.power}</span>
        <span className="flex items-center justify-center text-lg w-8 h-8 rounded-full bg-green-700 border-2 border-green-400">{card.health}</span>
      </div>
    </div>
  );
};

export default Card;
