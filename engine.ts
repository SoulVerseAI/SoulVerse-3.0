// FIX: Import React to provide the React namespace for types like React.DragEvent.
import React, { useState, useCallback } from 'react';
import type { Card, GameState } from './types';
import { BOARD_SLOTS_COUNT, MAX_MANA, SHADOW_DECK, STARTING_HAND_SIZE, STARTING_HP, STARTING_MANA } from './constants';

const shuffleDeck = (deck: Card[]): Card[] => {
  return [...deck].sort(() => Math.random() - 0.5);
};

const createInitialState = (playerDeck: Card[]): GameState => ({
  phase: 'DECK_BUILDING',
  player: {
    hp: STARTING_HP,
    mana: STARTING_MANA,
    maxMana: STARTING_MANA,
    deck: playerDeck,
    hand: [],
    board: Array(BOARD_SLOTS_COUNT).fill(null),
  },
  ai: {
    hp: STARTING_HP,
    mana: STARTING_MANA,
    maxMana: STARTING_MANA,
    deck: shuffleDeck(SHADOW_DECK),
    hand: [],
    board: Array(BOARD_SLOTS_COUNT).fill(null),
  },
  turn: 'PLAYER',
  winner: null,
});

export const useBattleForgeGame = (initialPlayerDeck: Card[]) => {
    const [gameState, setGameState] = useState<GameState>(createInitialState(initialPlayerDeck));
    const [deckSlots, setDeckSlots] = useState<(Card | null)[]>(Array(12).fill(null));
    const [draggedCard, setDraggedCard] = useState<Card | null>(null);
    const [draggedCardPosition, setDraggedCardPosition] = useState<{ x: number, y: number } | null>(null);

    const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        if (e.clientX === 0 && e.clientY === 0) return; // Ignore final drag event in some browsers
        setDraggedCardPosition({ x: e.clientX, y: e.clientY });
    }, []);

    const handleDragEnd = useCallback(() => {
        setDraggedCard(null);
        setDraggedCardPosition(null);
    }, []);

    const handleCollectionDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, cardId: string) => {
        e.dataTransfer.setData('cardId', cardId);
        const card = initialPlayerDeck.find(c => c.id === cardId);
        if (card) {
            setDraggedCard(card);
            setDraggedCardPosition({ x: e.clientX, y: e.clientY });
        }
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);
    }, [initialPlayerDeck]);
    
    const handleHandDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, card: Card) => {
        e.dataTransfer.setData('cardId', card.id);
        setDraggedCard(card);
        setDraggedCardPosition({ x: e.clientX, y: e.clientY });
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);
    }, []);


    const handleDropInDeck = useCallback((e: React.DragEvent<HTMLDivElement>, slotIndex: number) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData('cardId');
        if (!cardId || deckSlots[slotIndex]) return;
        
        const cardToAdd = initialPlayerDeck.find((c) => c.id === cardId);
        if (cardToAdd) {
            setDeckSlots((prev) => {
                const newDeck = [...prev];
                newDeck[slotIndex] = cardToAdd;
                return newDeck;
            });
        }
    }, [deckSlots, initialPlayerDeck]);

    const handleResetDeck = useCallback(() => {
        setDeckSlots(Array(12).fill(null));
    }, []);

    const startGame = useCallback(() => {
        const finalPlayerDeck = deckSlots.filter(c => c !== null) as Card[];
        if (finalPlayerDeck.length < 1) return;

        setGameState(prevState => {
            const shuffledPlayerDeck = shuffleDeck(finalPlayerDeck);
            const shuffledAiDeck = shuffleDeck(SHADOW_DECK);

            const playerHand = shuffledPlayerDeck.slice(0, STARTING_HAND_SIZE);
            const aiHand = shuffledAiDeck.slice(0, STARTING_HAND_SIZE);

            return {
                ...createInitialState(finalPlayerDeck),
                phase: 'IN_GAME',
                player: {
                    ...prevState.player,
                    deck: shuffledPlayerDeck.slice(STARTING_HAND_SIZE),
                    hand: playerHand,
                },
                ai: {
                    ...prevState.ai,
                    deck: shuffledAiDeck.slice(STARTING_HAND_SIZE),
                    hand: aiHand,
                }
            };
        });
    }, [deckSlots]);
    
    const playCard = useCallback((cardId: string, slotIndex: number) => {
        if (gameState.turn !== 'PLAYER') return;

        setGameState(prevState => {
            const card = prevState.player.hand.find(c => c.id === cardId);
            if (!card || card.cost > prevState.player.mana || prevState.player.board[slotIndex]) {
                return prevState;
            }

            const newHand = prevState.player.hand.filter(c => c.id !== cardId);
            const newBoard = [...prevState.player.board];
            newBoard[slotIndex] = { ...card, instanceId: `${card.id}-${Date.now()}` };

            return {
                ...prevState,
                player: {
                    ...prevState.player,
                    hand: newHand,
                    board: newBoard,
                    mana: prevState.player.mana - card.cost,
                },
            };
        });
    }, [gameState.turn]);

    const endTurn = useCallback(() => {
        if (gameState.turn !== 'PLAYER' || gameState.phase !== 'IN_GAME') return;

        // Player combat phase
        setGameState(prevState => {
            let newAiState = { ...prevState.ai };
            const playerBoard = [...prevState.player.board];

            playerBoard.forEach((card, index) => {
                if (!card) return;
                const opposingCard = newAiState.board[index];
                if (opposingCard) {
                    opposingCard.health -= card.power;
                } else {
                    newAiState.hp -= card.power;
                }
            });
            
            newAiState.board = newAiState.board.map(c => c && c.health > 0 ? c : null);

            if (newAiState.hp <= 0) {
                return { ...prevState, phase: 'GAME_OVER', winner: 'PLAYER' };
            }

            return { ...prevState, ai: newAiState, turn: 'AI' };
        });

        // AI Turn
        setTimeout(() => {
            setGameState(prevState => {
                if (prevState.phase !== 'IN_GAME') return prevState;

                // AI starts turn: increase mana, draw card
                const newMaxMana = Math.min(prevState.ai.maxMana + 1, MAX_MANA);
                const newDeck = [...prevState.ai.deck];
                const cardDrawn = newDeck.length > 0 ? newDeck.shift() : null;
                let newHand = cardDrawn ? [...prevState.ai.hand, cardDrawn] : [...prevState.ai.hand];

                let aiState = { ...prevState.ai, maxMana: newMaxMana, mana: newMaxMana, deck: newDeck, hand: newHand };

                // AI plays cards
                const playableCards = aiState.hand.filter(c => c.cost <= aiState.mana);
                const emptySlots = aiState.board.map((slot, i) => slot === null ? i : -1).filter(i => i !== -1);
                
                if(playableCards.length > 0 && emptySlots.length > 0) {
                    const cardToPlay = playableCards.sort((a,b) => b.cost - a.cost)[0];
                    const slotToPlay = emptySlots[Math.floor(Math.random() * emptySlots.length)];

                    aiState.hand = aiState.hand.filter(c => c.id !== cardToPlay.id);
                    aiState.board[slotToPlay] = { ...cardToPlay, instanceId: `${cardToPlay.id}-${Date.now()}` };
                    aiState.mana -= cardToPlay.cost;
                }
                
                // AI combat phase
                let newPlayerState = { ...prevState.player };
                 aiState.board.forEach((card, index) => {
                    if (!card) return;
                    const opposingCard = newPlayerState.board[index];
                    if (opposingCard) {
                        opposingCard.health -= card.power;
                    } else {
                        newPlayerState.hp -= card.power;
                    }
                });
                newPlayerState.board = newPlayerState.board.map(c => c && c.health > 0 ? c : null);

                if (newPlayerState.hp <= 0) {
                    return { ...prevState, phase: 'GAME_OVER', winner: 'AI' };
                }
                
                // Player starts turn: increase mana, draw card
                const playerNewMaxMana = Math.min(newPlayerState.maxMana + 1, MAX_MANA);
                const playerNewDeck = [...newPlayerState.deck];
                const playerCardDrawn = playerNewDeck.length > 0 ? playerNewDeck.shift() : null;
                newPlayerState.hand = playerCardDrawn ? [...newPlayerState.hand, playerCardDrawn] : newPlayerState.hand;
                newPlayerState.maxMana = playerNewMaxMana;
                newPlayerState.mana = playerNewMaxMana;

                return { ...prevState, player: newPlayerState, ai: aiState, turn: 'PLAYER' };
            });
        }, 1500); // AI "thinking" time

    }, [gameState.turn, gameState.phase]);
    
    const playAgain = useCallback(() => {
        const finalPlayerDeck = deckSlots.filter(c => c !== null) as Card[];
        setDeckSlots(Array(12).fill(null));
        setGameState(createInitialState(finalPlayerDeck));
    }, [deckSlots]);

    return {
        gameState,
        draggedCard,
        draggedCardPosition,
        deckBuilder: {
            deckSlots,
            collectionCards: initialPlayerDeck,
            handleDragStart: handleCollectionDragStart,
            handleDropInDeck,
            handleResetDeck,
            startGame,
            handleDrag,
            handleDragEnd,
        },
        game: {
            playCard,
            endTurn,
            playAgain,
            handleDragStart: handleHandDragStart,
            handleDrag,
            handleDragEnd,
        }
    };
};