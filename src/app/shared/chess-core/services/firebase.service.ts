import { Injectable, inject, NgZone } from '@angular/core';
import { GameState } from '../models/game-state.model';
import { Database, ref, set, push, onValue, update, off } from '@angular/fire/database';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private db = inject(Database);
  private zone = inject(NgZone);
  private activeListeners: {[gameId: string]: () => void} = {};

  async createGame(state: GameState): Promise<void> {
    if (!state.id) {
        throw new Error('Game state must have an ID');
    }
    
    const gameRef = ref(this.db, `games/${state.id}`);
    await set(gameRef, state);
  }

  getGameState(gameId: string): Observable<GameState> {
    return new Observable(subscriber => {
      this.zone.runOutsideAngular(() => {
        const gameRef = ref(this.db, `games/${gameId}`);
        
        if (this.activeListeners[gameId]) {
          this.activeListeners[gameId]();
        }

        const unsubscribe = onValue(gameRef, (snapshot) => {
          this.zone.run(() => {
            const data = snapshot.val();
            if (data) {
              subscriber.next(data);
            }
          });
        });

        this.activeListeners[gameId] = unsubscribe;

        return () => {
          this.zone.run(() => {
            if (this.activeListeners[gameId]) {
              this.activeListeners[gameId]();
              delete this.activeListeners[gameId];
            }
          });
        };
      });
    });
  }

  async updateGame(state: GameState): Promise<void> {
    return this.zone.runOutsideAngular(async () => {
      const gameRef = ref(this.db, `games/${state.id}`);
      await update(gameRef, state);
    });
  }

  cleanup(gameId: string): void {
    this.zone.run(() => {
      if (this.activeListeners[gameId]) {
        this.activeListeners[gameId]();
        delete this.activeListeners[gameId];
      }
    });
  }
}