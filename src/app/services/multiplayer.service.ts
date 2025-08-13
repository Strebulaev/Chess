import { Injectable, OnDestroy } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { GameService } from './game.service';
import { createInitialGameState, GameState } from '../models/game-state.model';
import { Position } from '../models/chess-piece.model';
import { Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';


interface MoveOptions {
    isPassive?: boolean;
    isAbility?: boolean;
  }
  

@Injectable({ providedIn: 'root' })
export class MultiplayerService implements OnDestroy {
  private currentGameId: string | null = null;
  private gameSubscription: Subscription | null = null;
  private deviceId = uuidv4(); // Уникальный ID устройства
  private playerColor: 'white' | 'black' | null = null;

  constructor(
    private firebase: FirebaseService,
    private gameService: GameService
  ) {}

  async createGame(gameType: 'classic' | '5d' | 'dnd' = 'classic'): Promise<string> {
    const initialState = createInitialGameState(gameType);
    initialState.id = `${gameType}-${Math.random().toString(36).substr(2, 8)}`;
    initialState.whiteDeviceId = this.deviceId;
    this.playerColor = 'white';
    
    await this.firebase.createGame(initialState);
    return initialState.id;
  }

  joinGame(gameId: string): void {
    this.currentGameId = gameId;
    this.playerColor = 'black';
    
    this.gameSubscription = this.firebase.getGameState(gameId).subscribe({
      next: (state: GameState) => {
        // Если черные еще не назначены, назначаем себя
        if (!state.blackDeviceId) {
          const updatedState = {
            ...state,
            blackDeviceId: this.deviceId
          };
          this.firebase.updateGame(updatedState);
        }
        
        this.gameService.setState({
          ...state,
          currentUserColor: this.playerColor
        });
      },
      error: (err) => console.error('Game state error:', err)
    });
  }

  async makeMove(from: Position, to: Position, options: MoveOptions = {}): Promise<boolean> {
    const { isPassive = false, isAbility = false } = options;
    if (!this.currentGameId || !this.playerColor) return false;
    
    const currentState = this.gameService.getState();
    
    // Проверяем, может ли текущий игрок сделать ход
    if (this.playerColor !== currentState.currentPlayer) {
      console.log("Not your turn!");
      return false;
    }
    
    // Получаем фигуру
    const piece = currentState.pieces.find(p => 
      p.position.x === from.x && p.position.y === from.y
    );
    
    if (!piece || piece.color !== currentState.currentPlayer) {
      return false;
    }

    // Проверяем возможность хода
    if (!piece.canMove(to, currentState)) {
      return false;
    }

    // Создаем новое состояние
    const newPieces = currentState.pieces
      .filter(p => !(p.position.x === to.x && p.position.y === to.y))
      .map(p => {
        if (p.position.x === from.x && p.position.y === from.y) {
          const newPiece = this.gameService.createPieceInstance(p);
          newPiece.move(to);
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

    try {
      await this.firebase.updateGame(newState);
      return true;
    } catch (error) {
      console.error("Move failed:", error);
      return false;
    }
  }

  ngOnDestroy(): void {
    if (this.gameSubscription) {
      this.gameSubscription.unsubscribe();
    }
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

}