import { Injectable } from '@angular/core';
import { GameState, createInitialGameState } from '../models/game-state.model';
import { ChessPiece } from '../models/chess-piece.model';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseGameService {
  protected state: GameState = createInitialGameState('classic');

  abstract getState(): GameState;
  abstract setState(state: GameState): void;
  abstract createPieceInstance(pieceData: any): ChessPiece;
}