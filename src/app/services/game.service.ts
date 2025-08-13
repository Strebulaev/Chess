import { Injectable } from '@angular/core';
import { GameState, createInitialGameState } from '../models/game-state.model';
import { ChessPiece, PieceType, PieceColor } from '../models/chess-piece.model';
import { Position } from '../models/position.model';
import { Pawn, Rook, Knight, Bishop, Queen, King } from '../models/chess-piece.model';
import { DndBishop, DndKing, DndKnight, DndPawn, DndQueen, DndRook } from '../models/dnd-chess-piece.model';

@Injectable({ providedIn: 'root' })
export class GameService {
  private state: GameState = createInitialGameState();

  getState(): GameState {
    return this.state;
  }

  setState(state: GameState): void {
    if (state.pieces) {
      state.pieces = state.pieces.map(piece => this.createPieceInstance(piece));
    }
    this.state = state;
  }

  createPieceInstance(pieceData: any): ChessPiece {
    const position = { x: pieceData.position.x, y: pieceData.position.y };
    const color = pieceData.color as PieceColor;
    const hasMoved = pieceData.hasMoved || false;
    const gameType = pieceData.gameType || 'classic';

    if (gameType === 'dnd') {
        switch (pieceData.type as PieceType) {
            case 'pawn': return new DndPawn(position, color, hasMoved);
            case 'rook': return new DndRook(position, color, hasMoved);
            case 'knight': return new DndKnight(position, color, hasMoved);
            case 'bishop': return new DndBishop(position, color, hasMoved);
            case 'queen': return new DndQueen(position, color, hasMoved);
            case 'king': return new DndKing(position, color, hasMoved);
            default: throw new Error(`Unknown piece type: ${pieceData.type}`);
        }
    } else {
        switch (pieceData.type as PieceType) {
            case 'pawn': return new Pawn(position, color, hasMoved);
            case 'rook': return new Rook(position, color, hasMoved);
            case 'knight': return new Knight(position, color, hasMoved);
            case 'bishop': return new Bishop(position, color, hasMoved);
            case 'queen': return new Queen(position, color, hasMoved);
            case 'king': return new King(position, color, hasMoved);
            default: throw new Error(`Unknown piece type: ${pieceData.type}`);
        }
    }
  }
  getPiece(position: Position): ChessPiece | null {
    return this.state.pieces.find(
      p => p.position.x === position.x && p.position.y === position.y
    ) || null;
  }
}