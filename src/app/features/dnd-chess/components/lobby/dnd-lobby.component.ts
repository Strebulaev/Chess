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
  currentMode = {
    path: 'dnd',
    title: 'D&D Chess',
    icon: '⚔️',
    description: 'Fantasy RPG chess with special abilities'
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
    this.multiplayer.createGame('dnd').then(id => {
      this.gameLink = `${window.location.origin}/chess/dnd/game/${id}`;
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
    this.router.navigate(['/chess/dnd/game', this.gameId]);
  }

  joinGame() {
    if (!this.gameId) {
      this.errorMessage = 'Введите ID игры';
      return;
    }
    this.router.navigate(['/chess/dnd/game', this.gameId]);
  }
}