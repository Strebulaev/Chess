import { GameState } from './game-state.model';

export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';

export interface Position {
  x: number;
  y: number;
}

export abstract class ChessPiece {
  health: number = 100;
  abilityCharges: number = 3;
  passiveCooldown: number = 0;
  maxHealth: number = 100;
  
  constructor(
    public type: PieceType,
    public position: Position,
    public color: PieceColor,
    public hasMoved: boolean = false
  ) {}

  abstract canMove(to: Position, gameState: GameState): boolean;

  move(to: Position): void {
    this.position = to;
    this.hasMoved = true;
    this.passiveCooldown = Math.max(0, this.passiveCooldown - 1);
  }

  useAbility(): void {
    if (this.abilityCharges > 0) {
      this.abilityCharges--;
    }
  }

  canUsePassive(): boolean {
    return this.passiveCooldown === 0;
  }

  usePassive(): void {
    this.passiveCooldown = 3;
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  getAbilityDescription(): string {
    return 'Basic Attack: Deal 20 damage to target piece (3 charges per round)';
  }

  getPassiveDescription(): string {
    return 'Phase Walk: Move through any piece (once every 3 turns)';
  }

  protected isPathClear(to: Position, gameState: GameState): boolean {
    const dx = Math.sign(to.x - this.position.x);
    const dy = Math.sign(to.y - this.position.y);

    let x = this.position.x + dx;
    let y = this.position.y + dy;

    while (x !== to.x || y !== to.y) {
      if (gameState.pieces.some(p => p.position.x === x && p.position.y === y)) {
        return false;
      }
      x += dx;
      y += dy;
    }

    return true;
  }

  toJSON() {
    return {
      type: this.type,
      position: this.position,
      color: this.color,
      hasMoved: this.hasMoved,
      health: this.health,
      abilityCharges: this.abilityCharges,
      passiveCooldown: this.passiveCooldown,
      maxHealth: this.maxHealth
    };
  }
}

export class Pawn extends ChessPiece {
  constructor(position: Position, color: PieceColor, hasMoved: boolean = false) {
    super('pawn', position, color, hasMoved);
    this.maxHealth = 80;
  }

  canMove(to: Position, gameState: GameState): boolean {
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

export class Rook extends ChessPiece {
  constructor(position: Position, color: PieceColor, hasMoved: boolean = false) {
    super('rook', position, color, hasMoved);
    this.maxHealth = 120;
  }

  canMove(to: Position, gameState: GameState): boolean {
    if (to.x !== this.position.x && to.y !== this.position.y) return false;
    if (!this.isPathClear(to, gameState)) return false;

    const targetPiece = gameState.pieces.find(p => 
      p.position.x === to.x && p.position.y === to.y
    );
    
    return !targetPiece || targetPiece.color !== this.color;
  }
}

export class Knight extends ChessPiece {
  constructor(position: Position, color: PieceColor, hasMoved: boolean = false) {
    super('knight', position, color, hasMoved);
    this.maxHealth = 90;
  }

  canMove(to: Position, gameState: GameState): boolean {
    const dx = Math.abs(to.x - this.position.x);
    const dy = Math.abs(to.y - this.position.y);
    
    if (!((dx === 1 && dy === 2) || (dx === 2 && dy === 1))) return false;
    
    const targetPiece = gameState.pieces.find(p => 
      p.position.x === to.x && p.position.y === to.y
    );
    
    return !targetPiece || targetPiece.color !== this.color;
  }
}

export class Bishop extends ChessPiece {
  constructor(position: Position, color: PieceColor, hasMoved: boolean = false) {
    super('bishop', position, color, hasMoved);
    this.maxHealth = 95;
  }

  canMove(to: Position, gameState: GameState): boolean {
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

export class Queen extends ChessPiece {
  constructor(position: Position, color: PieceColor, hasMoved: boolean = false) {
    super('queen', position, color, hasMoved);
    this.maxHealth = 110;
  }

  canMove(to: Position, gameState: GameState): boolean {
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

export class King extends ChessPiece {
  constructor(position: Position, color: PieceColor, hasMoved: boolean = false) {
    super('king', position, color, hasMoved);
    this.maxHealth = 150;
  }

  canMove(to: Position, gameState: GameState): boolean {
    const dx = Math.abs(to.x - this.position.x);
    const dy = Math.abs(to.y - this.position.y);
    
    // Обычный ход короля
    if (dx <= 1 && dy <= 1) {
      const targetPiece = gameState.pieces.find(p => 
        p.position.x === to.x && p.position.y === to.y
      );
      return !targetPiece || targetPiece.color !== this.color;
    }
    
    return false;
  }
}