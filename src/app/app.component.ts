import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, CommonModule, RouterLink]
})
export class AppComponent {
  constructor(private router: Router) {}
  chessModes = [
    {
      path: 'classic',
      title: 'Classic Chess',
      description: 'Traditional 8x8 chess with standard rules',
      icon: '♔'
    },
    {
      path: '5d',
      title: '5D Chess',
      description: 'Multidimensional time-travel chess',
      icon: '🌀'
    },
    {
      path: 'dnd',
      title: 'D&D Chess',
      description: 'Fantasy RPG chess with special abilities',
      icon: '⚔️'
    }
  ];
  getCurrentModeTitle(): string {
    const url = this.router.url;
    if (url.includes('/chess/classic')) return 'Classic Chess';
    if (url.includes('/chess/5d')) return '5D Chess';
    if (url.includes('/chess/dnd')) return 'D&D Chess';
    return 'Chess';
}
}