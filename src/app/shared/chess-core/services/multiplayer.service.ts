import { Injectable, OnDestroy } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { GameService } from './game.service';
import { createInitialGameState, GameState } from '../models/game-state.model';
import { King, Position } from '../models/chess-piece.model';
import { Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Route, Router } from '@angular/router';


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
    private gameService: GameService,
    private router: Router
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
    
    this.gameSubscription = this.firebase.getGameState(gameId).subscribe({
      next: (state: GameState) => {
        // Определяем цвет игрока
        if (state.whiteDeviceId === this.deviceId) {
          this.playerColor = 'white';
        } else if (!state.blackDeviceId) {
          this.playerColor = 'black';
          const updatedState = {
            ...state,
            blackDeviceId: this.deviceId
          };
          this.firebase.updateGame(updatedState);
        } else if (state.blackDeviceId === this.deviceId) {
          this.playerColor = 'black';
        } else {
          // Игра уже занята двумя игроками
          this.router.navigate(['/chess', gameId.split('-')[0]]);
          return;
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
    
    // Проверяем, что это ход текущего игрока
    if (this.playerColor !== currentState.currentPlayer) {
        return false;
    }
    
    const piece = currentState.pieces.find(p => 
        p.position.x === from.x && p.position.y === from.y
    );
    
    if (!piece || piece.color !== currentState.currentPlayer) {
        return false;
    }

    // Для D&D режима - проверка способностей
    if (currentState.gameType === 'dnd') {
        if (isAbility && piece.abilityCharges <= 0) return false;
        if (isPassive && !piece.canUsePassive()) return false;
    }

    // Создаем временное состояние для проверки
    const newPieces = currentState.pieces
        .filter(p => !(p.position.x === to.x && p.position.y === to.y && p.color !== piece.color))
        .map(p => {
            if (p.position.x === from.x && p.position.y === from.y) {
                const newPiece = this.gameService.createPieceInstance(p);
                newPiece.move(to);
                
                // Применяем эффекты способностей для D&D
                if (currentState.gameType === 'dnd') {
                    if (isAbility) {
                        newPiece.useAbility();
                    }
                    if (isPassive) {
                        newPiece.usePassive();
                    }
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

    // Проверяем, не оставляет ли ход короля под шахом
    if (currentState.gameType === 'classic' || currentState.gameType === '5d') {
        const tempKingPos = newPieces.find(p => 
            p instanceof King && p.color === currentState.currentPlayer
        )?.position;
        
        if (tempKingPos && this.isSquareUnderAttack(tempKingPos, newState, currentState.currentPlayer === 'white' ? 'black' : 'white')) {
            return false;
        }
    }

    try {
        await this.firebase.updateGame(newState);
        return true;
    } catch (error) {
        console.error("Move failed:", error);
        return false;
    }
  }

  private isSquareUnderAttack(pos: Position, state: GameState, byColor: 'white' | 'black'): boolean {
    return state.pieces.some(p => 
        p.color === byColor && 
        p.canMove(pos, state)
    );
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