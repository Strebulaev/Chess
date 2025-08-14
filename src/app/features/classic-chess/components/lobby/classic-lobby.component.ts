import { ActivatedRoute, Route, Router } from '@angular/router';
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
  currentMode = {
    path: 'classic',
    title: 'Classic Chess',
    icon: '♔',
    description: 'Traditional 8x8 chess with standard rules'
  };
  showShareModal = false;
  gameLink = '';
  linkCopied = false;
  isLoading = false;
  errorMessage = '';
  gameId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private multiplayer: MultiplayerService
  ) {}

  createGame() {
    this.isLoading = true;
    this.multiplayer.createGame('classic').then(id => {
      this.gameLink = `${window.location.origin}/chess/classic/game/${id}`;
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
    this.router.navigate(['/chess/classic/game', this.gameId]);
  }

  joinGame() {
    if (!this.gameId) {
      this.errorMessage = 'Введите ID игры';
      return;
    }
    this.router.navigate(['/chess/classic/game', this.gameId]);
  }
}