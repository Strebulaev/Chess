import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { 
        path: '', 
        loadComponent: () => import('./components/lobby/five-d-lobby.component')
          .then(m => m.FiveDLobbyComponent) 
      },
      { 
        path: 'game/:id', 
        loadComponent: () => import('./components/game/five-d-game.component')
          .then(m => m.FiveDGameComponent)
      }
    ])
  ]
})
export class FiveDChessModule { }