import { ActivatedRoute, Router } from '@angular/router';
import { MultiplayerService } from '../../../../shared/chess-core/services/multiplayer.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-classic-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './classic-lobby.component.html',
  styleUrls: ['./classic-lobby.component.scss']
})
export class ClassicLobbyComponent {
  gameId: string = '';
  isLoading = false;
  errorMessage: string | null = null;
  currentMode = {
    path: 'classic',
    title: 'Classic Chess',
    icon: '♔',
    description: 'Traditional 8x8 chess with standard rules'
  };

  constructor(
    private router: Router,
    private multiplayer: MultiplayerService
  ) {}

  createGame() {
    this.isLoading = true;
    this.multiplayer.createGame('classic') // для classic-lobby
      .then(id => {
        // Переход на соответствующий компонент игры
        this.router.navigate(['/chess/classic/game', id]);
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
    
    this.router.navigate(['/chess/classic/game', this.gameId]);
  }
}