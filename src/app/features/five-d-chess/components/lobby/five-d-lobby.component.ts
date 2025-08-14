import { ActivatedRoute, Router } from '@angular/router';
import { MultiplayerService } from '../../../../shared/chess-core/services/multiplayer.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-classic-lobby',
  templateUrl: './five-d-lobby.component.html',
  styleUrls: ['./five-d-lobby.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class FiveDLobbyComponent {
  currentMode = {
    path: '5d',
    title: '5D Chess',
    icon: '🌀',
    description: 'Multidimensional time-travel chess'
  };
  showShareModal = false;
  gameLink = '';
  linkCopied = false;
  isLoading = false;
  errorMessage = '';
  gameId = '';
  isUnderMaintenance = true;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private multiplayer: MultiplayerService
  ) {}
  goToClassic() {
    this.router.navigate(['/chess/classic']);
  }
  createGame() {
    this.isLoading = true;
    this.multiplayer.createGame('5d').then(id => {
      this.gameLink = `${window.location.origin}/chess/5d/game/${id}`;
      this.showShareModal = true;
      this.linkCopied = false;
      this.gameId = id;
    }).catch(error => {
      this.errorMessage = 'Ошибка при создании игры: ' + error.message;
    }).finally(() => {
      this.isLoading = false;
    });
  }

  copyGameLink() {
    navigator.clipboard.writeText(this.gameLink).then(() => {
      this.linkCopied = true;
      setTimeout(() => this.linkCopied = false, 2000);
    });
  }

  closeModal() {
    this.showShareModal = false;
    this.router.navigate(['/chess/5d/game', this.gameId]);
  }

  joinGame() {
    if (!this.gameId) {
      this.errorMessage = 'Введите ID игры';
      return;
    }
    this.router.navigate(['/chess/5d/game', this.gameId]);
  }
}