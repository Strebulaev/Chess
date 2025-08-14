import { Routes } from '@angular/router';
import { DndGameComponent } from './features/dnd-chess/components/game/dnd-game.component';
import { FiveDGameComponent } from './features/five-d-chess/components/game/five-d-game.component';
import { ClassicGameComponent } from './features/classic-chess/components/game/classic-game.component';
import { DndLobbyComponent } from './features/dnd-chess/components/lobby/dnd-lobby.component';
import { FiveDLobbyComponent } from './features/five-d-chess/components/lobby/five-d-lobby.component';
import { ClassicLobbyComponent } from './features/classic-chess/components/lobby/classic-lobby.component';

export const routes: Routes = [
  { 
    path: 'chess',
    children: [
      { 
        path: 'classic',
        children: [
          { path: '', component: ClassicLobbyComponent },
          { path: 'game/:id', component: ClassicGameComponent }
        ]
      },
      { 
        path: '5d',
        children: [
          { path: '', component: FiveDLobbyComponent },
          { path: 'game/:id', component: FiveDGameComponent }
        ]
      },
      { 
        path: 'dnd',
        children: [
          { path: '', component: DndLobbyComponent },
          { path: 'game/:id', component: DndGameComponent }
        ]
      },
      { 
        path: '',
        redirectTo: 'classic',
        pathMatch: 'full'
      }
    ]
  },
  { 
    path: '',
    redirectTo: 'chess/classic',
    pathMatch: 'full'
  }
];