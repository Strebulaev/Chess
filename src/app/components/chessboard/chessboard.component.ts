import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import type { GameState } from '../../models/game-state.model';
import { Position } from '../../models/chess-piece.model';
import { MultiplayerService } from '../../services/multiplayer.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chessboard',
  templateUrl: './chessboard.component.html',
  styleUrls: ['./chessboard.component.scss'],
  imports: [CommonModule]
})
export class ChessboardComponent implements OnChanges {
  @Input() state!: GameState;
  selectedPiece: Position | null = null;
  selectedPieceInfo: any = null;
  selectedMoveType: 'normal' | 'ability' | 'passive' = 'normal';
  possibleMoves: Position[] = [];
  gameType: 'classic' | '5d' | 'dnd' = 'classic';

  constructor(private multiplayer: MultiplayerService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['state']) {
      this.gameType = this.state?.gameType || 'classic';
      this.clearSelection();
    }
  }

  getPieceAt(position: Position): any {
    return this.state.pieces.find(p => 
      p.position.x === position.x && p.position.y === position.y
    );
  }

  getGameTypeDisplayName(): string {
    switch(this.gameType) {
      case '5d': return '5D Chess';
      case 'dnd': return 'D&D Chess';
      default: return 'Classic Chess';
    }
  }

  getGameTypeName(type: string): string {
    const names: Record<string, string> = {
      'classic': 'Classic Chess',
      '5d': '5D Chess',
      'dnd': 'D&D Chess'
    };
    return names[type] || 'Chess';
  }

  getPieceSymbol(type: string): string {
    const symbols: Record<string, string> = {
      pawn: '♟', rook: '♜', knight: '♞',
      bishop: '♝', queen: '♛', king: '♚'
    };
    return symbols[type] || '';
  }

  isPossibleMove(position: Position): boolean {
    return this.possibleMoves.some(move => 
      move.x === position.x && move.y === position.y
    );
  }

  handleCellClick(position: Position): void {
    const piece = this.getPieceAt(position);
    
    if (piece && piece.color === this.state.currentPlayer) {
      this.selectPiece(position);
      return;
    }

    if (this.selectedPiece) {
      this.makeMove(position);
    }
  }

  selectPiece(position: Position): void {
    const piece = this.getPieceAt(position);
    if (!piece || piece.color !== this.state.currentPlayer) return;

    this.selectedPiece = position;
    this.calculatePossibleMoves(position);
    
    this.selectedPieceInfo = {
      type: piece.type,
      color: piece.color,
      ...(this.gameType === 'dnd' && {
        health: piece.health,
        maxHealth: piece.maxHealth,
        abilityDamage: piece['abilityDamage'] || 20,
        abilityCharges: piece.abilityCharges,
        passiveCooldown: piece.passiveCooldown
      })
    };
    this.selectedMoveType = 'normal';
  }

  calculatePossibleMoves(position: Position): void {
    this.possibleMoves = [];
    const piece = this.getPieceAt(position);
    if (!piece) return;

    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const targetPos = {x, y};
        if (this.gameType === 'dnd' && this.selectedMoveType === 'passive') {
          this.possibleMoves.push(targetPos);
        } else if (piece.canMove(targetPos, this.state)) {
          this.possibleMoves.push(targetPos);
        }
      }
    }
  }

  selectMoveType(type: 'normal' | 'ability' | 'passive'): void {
    if (this.gameType !== 'dnd') return;
    if (type === 'ability' && this.selectedPieceInfo?.abilityCharges <= 0) return;
    if (type === 'passive' && this.selectedPieceInfo?.passiveCooldown > 0) return;
    
    this.selectedMoveType = type;
    this.calculatePossibleMoves(this.selectedPiece!);
  }

  async makeMove(targetPosition: Position): Promise<void> {
    if (!this.selectedPiece) return;

    let success: boolean;
    
    if (this.gameType === 'dnd') {
      switch (this.selectedMoveType) {
        case 'ability':
          success = await this.multiplayer.useAbility(this.selectedPiece, targetPosition);
          break;
        case 'passive':
          success = await this.multiplayer.makeMove(this.selectedPiece, targetPosition, true);
          break;
        default:
          success = await this.multiplayer.makeMove(this.selectedPiece, targetPosition);
      }
    } else {
      success = await this.multiplayer.makeMove(this.selectedPiece, targetPosition);
    }

    if (success) {
      this.clearSelection();
    }
  }

  clearSelection(): void {
    this.selectedPiece = null;
    this.selectedPieceInfo = null;
    this.possibleMoves = [];
    this.selectedMoveType = 'normal';
  }
}
.chessboard {
  margin: 0 auto; /* Центрирование доски */
  
  /* Уменьшенные размеры для мобильных */
  @media (max-width: 768px) {
    .cell {
      width: 40px;
      height: 40px;
      
      span {
        font-size: 30px;
      }
    }
  }

  @media (max-width: 480px) {
    .cell {
      width: 30px;
      height: 30px;
      
      span {
        font-size: 22px;
      }
    }
  }
}