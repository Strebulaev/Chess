import { Injectable } from '@angular/core';
import { BaseGameService } from '../../../shared/chess-core/services/base-game.service';
import { GameState } from '../../../shared/chess-core/models/game-state.model';
import { ChessPiece, Position, PieceColor } from '../../../shared/chess-core/models/chess-piece.model';
import { Pawn, Rook, Knight, Bishop, Queen, King } from '../../../shared/chess-core/models/chess-piece.model';

@Injectable({
  providedIn: 'root'
})
export class ClassicGameService extends BaseGameService {
  private enPassantTarget: Position | null = null;
  private castlingRights = {
    white: { kingSide: true, queenSide: true },
    black: { kingSide: true, queenSide: true }
  };

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

  getPieceAt(position: Position): ChessPiece | null {
    return this.state.pieces.find(p => 
      p.position.x === position.x && p.position.y === position.y
    ) || null;
  }

  movePiece(from: Position, to: Position): boolean {
    const piece = this.getPieceAt(from);
    if (!piece || piece.color !== this.state.currentPlayer) {
        return false;
    }

    // Проверка допустимости хода для данной фигуры
    if (!this.isValidMove(piece, from, to)) {
        return false;
    }

    // Создаём временное состояние для проверки
    const tempState = this.createTempState(from, to);
    
    // Проверяем, не остаётся ли король под шахом
    if (this.isKingInCheck(this.state.currentPlayer, tempState)) {
        return false;
    }

    // Если всё в порядке, выполняем ход
    this.executeMove(from, to);
    this.updateGameStatus();
    this.switchPlayer();
    return true;
    }

    private executeMove(from: Position, to: Position): void {
        const piece = this.getPieceAt(from);
        if (!piece) return;

        // Обработка взятия на проходе
        if (piece instanceof Pawn && this.enPassantTarget && 
            to.x === this.enPassantTarget.x && to.y === this.enPassantTarget.y) {
            const capturedPawnPos = { x: to.x, y: from.y };
            this.state.pieces = this.state.pieces.filter(p => 
                !(p.position.x === capturedPawnPos.x && p.position.y === capturedPawnPos.y)
            );
        }

        // Обработка рокировки
        if (piece instanceof King && Math.abs(to.x - from.x) === 2) {
            this.executeCastle(from, to);
            return;
        }

        // Обновляем позицию фигуры
        piece.position = to;
        piece.hasMoved = true;

        // Устанавливаем цель для взятия на проходе
        this.enPassantTarget = null;
        if (piece instanceof Pawn && Math.abs(to.y - from.y) === 2) {
            this.enPassantTarget = { x: from.x, y: from.y + (to.y - from.y) / 2 };
        }

        // Превращение пешки
        if (piece instanceof Pawn && (to.y === 0 || to.y === 7)) {
            this.promotePawn(to, 'queen'); // В реальной игре нужно дать выбор фигуры
        }

        // Удаляем съеденную фигуру
        this.state.pieces = this.state.pieces.filter(p => 
            !(p.position.x === to.x && p.position.y === to.y && p !== piece)
        );

        this.state.turnNumber++;
    }

    private executeCastle(from: Position, to: Position): void {
        const king = this.getPieceAt(from) as King;
        king.position = to;
        king.hasMoved = true;

        const rookX = to.x > from.x ? 7 : 0;
        const newRookX = to.x > from.x ? 5 : 3;
        const rook = this.getPieceAt({ x: rookX, y: from.y }) as Rook;

        rook.position = { x: newRookX, y: from.y };
        rook.hasMoved = true;
    }

  public isValidMove(piece: ChessPiece, from: Position, to: Position): boolean {
    if (!piece.canMove(to, this.state)) {
      return false;
    }

    const targetPiece = this.getPieceAt(to);
    if (targetPiece && targetPiece.color === piece.color) {
      return false;
    }

    if (piece instanceof Pawn) {
      return this.isValidPawnMove(piece as Pawn, from, to);
    }
    if (piece instanceof King) {
      return this.isValidKingMove(piece as King, from, to);
    }

    if (piece instanceof Rook || piece instanceof Bishop || piece instanceof Queen) {
      return this.isPathClear(from, to);
    }

    return true;
  }

  private isValidPawnMove(pawn: Pawn, from: Position, to: Position): boolean {
    const direction = pawn.color === 'white' ? 1 : -1;
    const startRow = pawn.color === 'white' ? 1 : 6;

    if (to.x === from.x && to.y === from.y + direction) {
      return !this.getPieceAt(to);
    }

    if (Math.abs(to.x - from.x) === 1 && to.y === from.y + direction) {
      const targetPiece = this.getPieceAt(to);
      if (targetPiece && targetPiece.color !== pawn.color) {
        return true;
      }
      if (this.enPassantTarget && 
          to.x === this.enPassantTarget.x && 
          to.y === this.enPassantTarget.y) {
        return true;
      }
    }

    if (!pawn.hasMoved && to.x === from.x && to.y === from.y + 2 * direction) {
      const intermediatePos = { x: from.x, y: from.y + direction };
      return !this.getPieceAt(to) && !this.getPieceAt(intermediatePos);
    }

    return false;
  }

  private isValidKingMove(king: King, from: Position, to: Position): boolean {
    // Обычный ход короля
    if (Math.abs(to.x - from.x) <= 1 && Math.abs(to.y - from.y) <= 1) {
        return true;
    }

    // Рокировка
    if (!king.hasMoved && Math.abs(to.x - from.x) === 2 && to.y === from.y) {
        return this.canCastle(king, from, to);
    }

    return false;
  }


  private canCastle(king: King, from: Position, to: Position): boolean {
    if (this.isKingInCheck(king.color)) {
        return false;
    }

    const rookX = to.x > from.x ? 7 : 0;
    const rook = this.getPieceAt({ x: rookX, y: from.y });
    if (!(rook instanceof Rook) || rook.hasMoved) {
        return false;
    }

    const direction = to.x > from.x ? 1 : -1;
    for (let x = from.x + direction; x !== rookX; x += direction) {
        if (this.getPieceAt({ x, y: from.y })) {
            return false;
        }
    }

    // Проверяем, не проходит ли король через атакованные клетки
    for (let x = from.x; x !== to.x + direction; x += direction) {
        const tempPos = { x, y: from.y };
        const tempState = this.createTempState(from, tempPos);
        if (this.isKingInCheck(king.color, tempState)) {
            return false;
        }
    }

    return true;
  }
  public promotePawn(position: Position, pieceType: 'queen' | 'rook' | 'bishop' | 'knight'): void {
    const pawn = this.getPieceAt(position);
    if (!(pawn instanceof Pawn)) return;

    const color = pawn.color;
    this.state.pieces = this.state.pieces.filter(p => p !== pawn);

    switch (pieceType) {
      case 'queen':
        this.state.pieces.push(new Queen(position, color));
        break;
      case 'rook':
        this.state.pieces.push(new Rook(position, color));
        break;
      case 'bishop':
        this.state.pieces.push(new Bishop(position, color));
        break;
      case 'knight':
        this.state.pieces.push(new Knight(position, color));
        break;
    }
  }
  private isPathClear(from: Position, to: Position): boolean {
    const dx = Math.sign(to.x - from.x);
    const dy = Math.sign(to.y - from.y);
    let x = from.x + dx;
    let y = from.y + dy;

    while (x !== to.x || y !== to.y) {
      if (this.getPieceAt({ x, y })) {
        return false;
      }
      x += dx;
      y += dy;
    }

    return true;
  }

  public isKingInCheck(color: PieceColor, state: GameState = this.state): boolean {
    const kingPos = this.findKingPosition(state, color);
    if (!kingPos) return false;

    return state.pieces.some(piece => 
        piece.color !== color && 
        piece.canMove(kingPos, state)
    );
}

  private findKingPosition(state: GameState, color: PieceColor): Position | null {
    const king = state.pieces.find(p => 
      p instanceof King && p.color === color
    );
    return king ? king.position : null;
  }

  public updateGameStatus(): void {
    const currentColor = this.state.currentPlayer;
    const opponentColor = currentColor === 'white' ? 'black' : 'white';

    // Проверяем, находится ли оппонент под шахом
    this.state.isCheck = this.isKingInCheck(opponentColor);

    // Проверяем, есть ли у оппонента допустимые ходы
    const hasLegalMoves = this.hasAnyLegalMoves(opponentColor);
    
    if (this.state.isCheck && !hasLegalMoves) {
        this.state.isCheckmate = true;
    } else if (!hasLegalMoves) {
        this.state.isStalemate = true;
    }
  }


  private hasAnyLegalMoves(color: PieceColor): boolean {
    for (const piece of this.state.pieces) {
        if (piece.color !== color) continue;

        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const to = { x, y };
                if (this.isValidMove(piece, piece.position, to)) {
                    const tempState = this.createTempState(piece.position, to);
                    if (!this.isKingInCheck(color, tempState)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
  }

  public createTempState(from: Position, to: Position): GameState {
    const piece = this.getPieceAt(from);
    if (!piece) return JSON.parse(JSON.stringify(this.state));

    const tempState = JSON.parse(JSON.stringify(this.state));
    const tempPiece = tempState.pieces.find((p: any) => 
      p.position.x === from.x && p.position.y === from.y
    );

    tempPiece.position = { ...to };
    tempState.pieces = tempState.pieces.filter((p: any) => 
      !(p.position.x === to.x && p.position.y === to.y && p !== tempPiece)
    );

    return tempState;
  }

  public switchPlayer(): void {
    this.state.currentPlayer = this.state.currentPlayer === 'white' ? 'black' : 'white';
  }
}