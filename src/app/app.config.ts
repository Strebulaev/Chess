import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideZoneChangeDetection } from '@angular/core';

const firebaseConfig = {
  apiKey: "AIzaSyBj1T7DGrGLTfapIWb2wXKdPC9FbbOeluo",
  authDomain: "dndchess-dbcbe.firebaseapp.com",
  databaseURL: "https://dndchess-dbcbe-default-rtdb.firebaseio.com",
  projectId: "dndchess-dbcbe",
  storageBucket: "dndchess-dbcbe.appspot.com",
  messagingSenderId: "455536765703",
  appId: "1:455536765703:web:2b2e60048e6abeffdd33a2",
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideDatabase(() => getDatabase()),
  ],
};