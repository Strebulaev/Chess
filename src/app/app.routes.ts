import { Routes } from '@angular/router';
import { LobbyComponent } from './components/lobby/lobby.component';
import { GameComponent } from './components/game/game.component';

export const routes: Routes = [
  { 
    path: 'chess', 
    children: [
      { 
        path: 'classic', 
        component: LobbyComponent, 
        data: { gameType: 'classic' } 
      },
      { 
        path: '5d', 
        component: LobbyComponent, 
        data: { gameType: '5d' } 
      },
      { 
        path: 'dnd', 
        component: LobbyComponent, 
        data: { gameType: 'dnd' } 
      },
      { 
        path: 'game/:id', 
        component: GameComponent 
      }
    ]
  },
  { path: '', redirectTo: 'chess/classic', pathMatch: 'full' }
];