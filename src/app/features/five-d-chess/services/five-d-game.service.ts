import { Injectable } from '@angular/core';
import { BaseGameService } from '../../../shared/chess-core/services/base-game.service';
import { GameState } from '../../../shared/chess-core/models/game-state.model';
import { ChessPiece, Pawn, Rook, Knight, Bishop, Queen, King } from '../../../shared/chess-core/models/chess-piece.model';

@Injectable({
  providedIn: 'root'
})
export class ClassicGameService extends BaseGameService {
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
    const color = pieceData.color;
    const hasMoved = pieceData.hasMoved || false;

    switch (pieceData.type) {
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