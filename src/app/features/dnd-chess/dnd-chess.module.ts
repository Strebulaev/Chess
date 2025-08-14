import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { 
        path: '', 
        loadComponent: () => import('./components/lobby/dnd-lobby.component')
          .then(m => m.DndLobbyComponent) 
      },
      { 
        path: 'game/:id', 
        loadComponent: () => import('./components/game/dnd-game.component')
          .then(m => m.DndGameComponent)
      }
    ])
  ]
})
export class DndChessModule { }