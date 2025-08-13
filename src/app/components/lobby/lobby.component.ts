import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MultiplayerService } from '../../services/multiplayer.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent {
  gameId: string = '';
  isLoading = false;
  errorMessage: string | null = null;
  currentMode: any;

  chessModes = [
    {
      path: 'classic',
      title: 'Classic Chess',
      icon: '♔',
      description: 'Traditional 8x8 chess'
    },
    {
      path: '5d',
      title: '5D Chess',
      icon: '🌀',
      description: 'Multidimensional chess'
    },
    {
      path: 'dnd',
      title: 'D&D Chess',
      icon: '⚔️',
      description: 'Fantasy RPG chess'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private multiplayer: MultiplayerService
  ) {}

  ngOnInit(): void {
    // Получаем тип игры из параметров маршрута
    const gameType = this.route.snapshot.data['gameType'] || 'classic';
    this.currentMode = this.chessModes.find(m => m.path === gameType) || this.chessModes[0];
  }

  createGame() {
    this.isLoading = true;
    // Получаем тип игры из данных маршрута
    const gameType = this.route.snapshot.data['gameType'] || 'classic';
    
    this.multiplayer.createGame(gameType).then(id => {
        // Перенаправляем на страницу игры с правильным ID
        this.router.navigate(['/chess/game', id]);
    }).catch(error => {
        this.errorMessage = 'Failed to create game: ' + error.message;
        console.error('Create game error:', error);
    }).finally(() => {
        this.isLoading = false;
    });
  }

  joinGame() {
    if (!this.gameId) {
        this.errorMessage = 'Please enter a game ID';
        return;
    }
    
    this.isLoading = true;
    
    // Проверяем формат ID (type-randomchars)
    const parts = this.gameId.split('-');
    if (parts.length < 2 || !['classic', '5d', 'dnd'].includes(parts[0])) {
        this.errorMessage = 'Invalid game ID format';
        this.isLoading = false;
        return;
    }
    
    this.router.navigate(['/chess/game', this.gameId]);
  }
}