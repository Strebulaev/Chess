import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { MultiplayerService } from '../../services/multiplayer.service';
import { ChessboardComponent } from '../chessboard/chessboard.component';
import { CommonModule } from '@angular/common';
import { createInitialGameState } from '../../models/game-state.model';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [ChessboardComponent, CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  gameId: string = '';
  chessType: string = 'classic';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public gameService: GameService,
    private multiplayer: MultiplayerService
  ) {}

  ngOnInit(): void {
    this.gameId = this.route.snapshot.params['id'];
    
    // Извлекаем тип игры из ID (первые символы до дефиса)
    const gameType = this.gameId.split('-')[0] as 'classic' | '5d' | 'dnd';
    
    if (!['classic', '5d', 'dnd'].includes(gameType)) {
        this.router.navigate(['/chess/classic']);
        return;
    }
    
    this.chessType = gameType;
    
    // Инициализируем состояние игры с правильным типом
    this.gameService.setState(createInitialGameState(gameType));
    
    if (this.gameId) {
        this.multiplayer.joinGame(this.gameId);
    }
  }
  
  ngOnDestroy(): void {
    this.multiplayer.ngOnDestroy();
  }

  onLeaveGame(): void {
    this.router.navigate(['/chess', this.chessType]);
  }
}