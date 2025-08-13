import { Bishop, ChessPiece, King, Knight, Pawn, Queen, Rook } from './chess-piece.model';
import { DndBishop, DndChessPiece, DndKing, DndKnight, DndPawn, DndQueen, DndRook } from './dnd-chess-piece.model';

export interface GameState {
    id: string;
    currentPlayer: 'white' | 'black';
    pieces: ChessPiece[];
    gameType: 'classic' | '5d' | 'dnd';
    whiteDeviceId?: string;  // ID устройства белого игрока
    blackDeviceId?: string;  // ID устройства черного игрока
    currentUserColor?: 'white' | 'black' | null;
    turnNumber: number;
    isCheck?: boolean;
    isCheckmate?: boolean;
    isStalemate?: boolean;
  }
export function createInitialGameState(gameType: 'classic' | '5d' | 'dnd' = 'classic'): GameState {
  const pieces: (ChessPiece | DndChessPiece)[] = [];

  // White pieces
  if (gameType === 'dnd') {
    pieces.push(new DndRook({ x: 0, y: 0 }, 'white'));
    pieces.push(new DndKnight({ x: 1, y: 0 }, 'white'));
    pieces.push(new DndBishop({ x: 2, y: 0 }, 'white'));
    pieces.push(new DndQueen({ x: 3, y: 0 }, 'white'));
    pieces.push(new DndKing({ x: 4, y: 0 }, 'white'));
    pieces.push(new DndBishop({ x: 5, y: 0 }, 'white'));
    pieces.push(new DndKnight({ x: 6, y: 0 }, 'white'));
    pieces.push(new DndRook({ x: 7, y: 0 }, 'white'));
    for (let i = 0; i < 8; i++) {
      pieces.push(new DndPawn({ x: i, y: 1 }, 'white'));
    }

    // Black pieces
    pieces.push(new DndRook({ x: 0, y: 7 }, 'black'));
    pieces.push(new DndKnight({ x: 1, y: 7 }, 'black'));
    pieces.push(new DndBishop({ x: 2, y: 7 }, 'black'));
    pieces.push(new DndQueen({ x: 3, y: 7 }, 'black'));
    pieces.push(new DndKing({ x: 4, y: 7 }, 'black'));
    pieces.push(new DndBishop({ x: 5, y: 7 }, 'black'));
    pieces.push(new DndKnight({ x: 6, y: 7 }, 'black'));
    pieces.push(new DndRook({ x: 7, y: 7 }, 'black'));
    for (let i = 0; i < 8; i++) {
      pieces.push(new DndPawn({ x: i, y: 6 }, 'black'));
    }
  } else {
    pieces.push(new Rook({ x: 0, y: 0 }, 'white'));
    pieces.push(new Knight({ x: 1, y: 0 }, 'white'));
    pieces.push(new Bishop({ x: 2, y: 0 }, 'white'));
    pieces.push(new Queen({ x: 3, y: 0 }, 'white'));
    pieces.push(new King({ x: 4, y: 0 }, 'white'));
    pieces.push(new Bishop({ x: 5, y: 0 }, 'white'));
    pieces.push(new Knight({ x: 6, y: 0 }, 'white'));
    pieces.push(new Rook({ x: 7, y: 0 }, 'white'));
    for (let i = 0; i < 8; i++) {
      pieces.push(new Pawn({ x: i, y: 1 }, 'white'));
    }

    // Black pieces
    pieces.push(new Rook({ x: 0, y: 7 }, 'black'));
    pieces.push(new Knight({ x: 1, y: 7 }, 'black'));
    pieces.push(new Bishop({ x: 2, y: 7 }, 'black'));
    pieces.push(new Queen({ x: 3, y: 7 }, 'black'));
    pieces.push(new King({ x: 4, y: 7 }, 'black'));
    pieces.push(new Bishop({ x: 5, y: 7 }, 'black'));
    pieces.push(new Knight({ x: 6, y: 7 }, 'black'));
    pieces.push(new Rook({ x: 7, y: 7 }, 'black'));
    for (let i = 0; i < 8; i++) {
      pieces.push(new Pawn({ x: i, y: 6 }, 'black'));
    }
  }

  return {
    id: '',
    currentPlayer: 'white',
    pieces,
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    gameType,
    turnNumber: 1
  };
}