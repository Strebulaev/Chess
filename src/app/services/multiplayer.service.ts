import { Injectable, OnDestroy } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { GameService } from './game.service';
import { createInitialGameState, GameState } from '../models/game-state.model';
import { Position } from '../models/chess-piece.model';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MultiplayerService implements OnDestroy {
  private currentGameId: string | null = null;
  private gameSubscription: Subscription | null = null;

  constructor(
    private firebase: FirebaseService,
    private gameService: GameService
  ) {}

  async createGame(gameType: 'classic' | '5d' | 'dnd' = 'classic'): Promise<string> {
    const initialState = createInitialGameState(gameType);
    initialState.id = `${gameType}-${Math.random().toString(36).substr(2, 8)}`; // Генерируем ID с префиксом типа
    
    try {
        await this.firebase.createGame(initialState);
        return initialState.id;
    } catch (error) {
        console.error('Error creating game:', error);
        throw error;
    }
  }
  
  joinGame(gameId: string): void {
    if (this.currentGameId) {
      this.firebase.cleanup(this.currentGameId);
    }
    
    this.currentGameId = gameId;
    this.gameSubscription = this.firebase.getGameState(gameId).subscribe({
      next: (state: GameState) => {
        this.gameService.setState(state);
      },
      error: (err) => {
        console.error('Game state error:', err);
      }
    });
  }

  async makeMove(from: Position, to: Position, isPassive: boolean = false): Promise<boolean> {
    if (!this.currentGameId) return false;
    
    const currentState = this.gameService.getState();
    const piece = currentState.pieces.find(p => 
      p.position.x === from.x && p.position.y === from.y
    );
    
    if (!piece || piece.color !== currentState.currentPlayer) {
      return false;
    }

    // Validate move
    if (!isPassive && !piece.canMove(to, currentState)) {
      return false;
    }

    // Check for capture
    const targetPiece = currentState.pieces.find(p => 
      p.position.x === to.x && p.position.y === to.y && 
      (p.position.x !== from.x || p.position.y !== from.y)
    );

    // Create new state
    const newPieces = currentState.pieces
      .filter(p => !targetPiece || p !== targetPiece)
      .map(p => {
        if (p.position.x === from.x && p.position.y === from.y) {
          const newPiece = this.gameService.createPieceInstance(p);
          newPiece.move(to);
          if (isPassive) {
            newPiece.usePassive();
          }
          return newPiece;
        }
        return p;
      });

    const newState: GameState = {
      ...currentState,
      pieces: newPieces,
      currentPlayer: currentState.currentPlayer === 'white' ? 'black' : 'white',
      turnNumber: currentState.turnNumber + (currentState.currentPlayer === 'black' ? 1 : 0)
    };

    // Reset ability charges for new turn
    if (newState.currentPlayer === 'white') {
      newState.pieces.forEach(p => {
        if (p.color === 'white') {
          p.abilityCharges = 3;
        }
      });
    }

    await this.firebase.updateGame(newState);
    return true;
  }

  async useAbility(from: Position, target: Position): Promise<boolean> {
    if (!this.currentGameId) return false;
    
    const currentState = this.gameService.getState();
    const piece = currentState.pieces.find(p => 
      p.position.x === from.x && p.position.y === from.y
    );
    
    if (!piece || piece.color !== currentState.currentPlayer || piece.abilityCharges <= 0) {
      return false;
    }

    const targetPiece = currentState.pieces.find(p => 
      p.position.x === target.x && p.position.y === target.y
    );

    if (!targetPiece) return false;

    // Create new state with damage applied
    const newPieces = currentState.pieces.map(p => {
      const newPiece = this.gameService.createPieceInstance(p);
      
      if (p === piece) {
        newPiece.useAbility();
      }
      
      if (p === targetPiece) {
        newPiece.takeDamage((piece as any).abilityDamage || 20);
      }
      
      return newPiece;
    }).filter(p => p.health > 0);

    const newState: GameState = {
      ...currentState,
      pieces: newPieces
    };

    await this.firebase.updateGame(newState);
    return true;
  }

  ngOnDestroy(): void {
    if (this.currentGameId) {
      this.firebase.cleanup(this.currentGameId);
    }
    if (this.gameSubscription) {
      this.gameSubscription.unsubscribe();
    }
  }
}