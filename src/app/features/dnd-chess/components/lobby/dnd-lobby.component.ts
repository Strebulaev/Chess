import { ActivatedRoute, Router } from '@angular/router';
import { MultiplayerService } from '../../../../shared/chess-core/services/multiplayer.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-classic-lobby',
  templateUrl: './dnd-lobby.component.html',
  styleUrls: ['./dnd-lobby.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class DndLobbyComponent {
  gameId: string = '';
  isLoading = false;
  errorMessage: string | null = null;
  currentMode = {
    path: 'dnd',
    title: 'D&D Chess',
    icon: '⚔️',
    description: 'Fantasy RPG chess with special abilities'
  };

  constructor(
    private router: Router,
    private multiplayer: MultiplayerService
  ) {}

  createGame() {
    this.isLoading = true;
    this.multiplayer.createGame('dnd') // для classic-lobby
      .then(id => {
        // Переход на соответствующий компонент игры
        this.router.navigate(['/chess/dnd/game', id]);
      })
      .catch(error => {
        this.errorMessage = error.message;
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
  
  joinGame() {
    if (!this.gameId) {
      this.errorMessage = 'Please enter a game ID';
      return;
    }
    
    this.isLoading = true;
    const parts = this.gameId.split('-');
    
    if (parts.length < 2 || !['classic', '5d', 'dnd'].includes(parts[0])) {
      this.errorMessage = 'Invalid game ID format';
      this.isLoading = false;
      return;
    }
    
    this.router.navigate(['/chess/dnd/game', this.gameId]);
  }
}