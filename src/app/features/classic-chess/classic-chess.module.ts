import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { 
        path: '', 
        loadComponent: () => import('./components/lobby/classic-lobby.component')
          .then(m => m.ClassicLobbyComponent) 
      },
      { 
        path: 'game/:id', 
        loadComponent: () => import('./components/game/classic-game.component')
          .then(m => m.ClassicGameComponent)
      }
    ])
  ]
})
export class ClassicChessModule { }