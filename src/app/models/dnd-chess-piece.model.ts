import { ChessPiece, PieceType, PieceColor, Position } from './chess-piece.model';
import { GameState } from './game-state.model';

export abstract class DndChessPiece extends ChessPiece {
  abilityDamage: number = 20;
  passiveCooldownDuration: number = 3;

  constructor(
    type: PieceType,
    position: Position,
    color: PieceColor,
    hasMoved: boolean = false
  ) {
    super(type, position, color, hasMoved);
  }

  canMove(to: Position, gameState: GameState): boolean {
    if (this.canUsePassive()) {
      return true; // Can move through pieces when passive is available
    }
    return super.isPathClear(to, gameState);
  }

  override getAbilityDescription(): string {
    return `${this.type} Attack: Deal ${this.abilityDamage} damage to target (${this.abilityCharges}/3 charges)`;
  }

  override getPassiveDescription(): string {
    return `Phase Walk: Move through pieces (ready in ${this.passiveCooldown} turns)`;
  }
}

export class DndPawn extends DndChessPiece {
  constructor(position: Position, color: PieceColor, hasMoved: boolean = false) {
    super('pawn', position, color, hasMoved);
    this.maxHealth = 100;
    this.abilityDamage = 15;
  }

  override canMove(to: Position, gameState: GameState): boolean {
    if (this.canUsePassive()) return true;

    const direction = this.color === 'white' ? 1 : -1;
    const startRow = this.color === 'white' ? 1 : 6;

    // Standard move
    if (to.x === this.position.x && to.y === this.position.y + direction) {
      return !gameState.pieces.some(p => p.position.x === to.x && p.position.y === to.y);
    }

    // Initial double move
    if (!this.hasMoved && to.x === this.position.x && to.y === this.position.y + 2 * direction && this.position.y === startRow) {
      const intermediatePos = { x: to.x, y: this.position.y + direction };
      return !gameState.pieces.some(p => 
        (p.position.x === to.x && p.position.y === to.y) ||
        (p.position.x === intermediatePos.x && p.position.y === intermediatePos.y)
      );
    }

    // Capture
    if (Math.abs(to.x - this.position.x) === 1 && to.y === this.position.y + direction) {
      const targetPiece = gameState.pieces.find(p => 
        p.position.x === to.x && p.position.y === to.y
      );
      return targetPiece ? targetPiece.color !== this.color : false;
    }

    return false;
  }
}

export class DndRook extends DndChessPiece {
  constructor(position: Position, color: PieceColor, hasMoved: boolean = false) {
    super('rook', position, color, hasMoved);
    this.maxHealth = 150;
    this.abilityDamage = 25;
  }

  override canMove(to: Position, gameState: GameState): boolean {
    if (this.canUsePassive()) return true;
    if (to.x !== this.position.x && to.y !== this.position.y) return false;
    if (!this.isPathClear(to, gameState)) return false;

    const targetPiece = gameState.pieces.find(p => 
      p.position.x === to.x && p.position.y === to.y
    );
    
    return !targetPiece || targetPiece.color !== this.color;
  }
}

export class DndKnight extends DndChessPiece {
  constructor(position: Position, color: PieceColor, hasMoved: boolean = false) {
    super('knight', position, color, hasMoved);
    this.maxHealth = 120;
    this.abilityDamage = 30;
  }

  override canMove(to: Position, gameState: GameState): boolean {
    if (this.canUsePassive()) return true;
    
    const dx = Math.abs(to.x - this.position.x);
    const dy = Math.abs(to.y - this.position.y);
    
    if (!((dx === 1 && dy === 2) || (dx === 2 && dy === 1))) return false;
    
    const targetPiece = gameState.pieces.find(p => 
      p.position.x === to.x && p.position.y === to.y
    );
    
    return !targetPiece || targetPiece.color !== this.color;
  }
}

export class DndBishop extends DndChessPiece {
  constructor(position: Position, color: PieceColor, hasMoved: boolean = false) {
    super('bishop', position, color, hasMoved);
    this.maxHealth = 130;
    this.abilityDamage = 20;
  }

  override canMove(to: Position, gameState: GameState): boolean {
    if (this.canUsePassive()) return true;
    if (Math.abs(to.x - this.position.x) !== Math.abs(to.y - this.position.y)) {
      return false;
    }

    if (!this.isPathClear(to, gameState)) return false;

    const targetPiece = gameState.pieces.find(p => 
      p.position.x === to.x && p.position.y === to.y
    );
    
    return !targetPiece || targetPiece.color !== this.color;
  }
}

export class DndQueen extends DndChessPiece {
  constructor(position: Position, color: PieceColor, hasMoved: boolean = false) {
    super('queen', position, color, hasMoved);
    this.maxHealth = 140;
    this.abilityDamage = 35;
  }

  override canMove(to: Position, gameState: GameState): boolean {
    if (this.canUsePassive()) return true;
    
    const isRookMove = (to.x === this.position.x || to.y === this.position.y);
    const isBishopMove = (Math.abs(to.x - this.position.x) === Math.abs(to.y - this.position.y));
    
    if (!isRookMove && !isBishopMove) return false;

    if (!this.isPathClear(to, gameState)) return false;

    const targetPiece = gameState.pieces.find(p => 
      p.position.x === to.x && p.position.y === to.y
    );
    
    return !targetPiece || targetPiece.color !== this.color;
  }
}

export class DndKing extends DndChessPiece {
  constructor(position: Position, color: PieceColor, hasMoved: boolean = false) {
    super('king', position, color, hasMoved);
    this.maxHealth = 200;
    this.abilityDamage = 15;
  }

  override canMove(to: Position, gameState: GameState): boolean {
    if (this.canUsePassive()) return true;
    
    const dx = Math.abs(to.x - this.position.x);
    const dy = Math.abs(to.y - this.position.y);
    
    if (dx > 1 || dy > 1) return false;
    
    const targetPiece = gameState.pieces.find(p => 
      p.position.x === to.x && p.position.y === to.y
    );
    
    return !targetPiece || targetPiece.color !== this.color;
  }
}