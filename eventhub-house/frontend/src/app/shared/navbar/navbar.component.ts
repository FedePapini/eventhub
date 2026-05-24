import { Component } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf, AsyncPipe],
  template: `
    <header class="navbar">
      <div class="container nav-content">
        <a routerLink="/" class="logo">
          <span class="logo-square"></span>
          EVENT<span>HUB</span>
        </a>

        <button class="menu-button" type="button" (click)="menuOpen = !menuOpen">
          ☰
        </button>

        <nav class="links" [class.open]="menuOpen">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            Eventi
          </a>

          <ng-container *ngIf="authService.user$ | async as user; else guestLinks">
            <a routerLink="/biglietti" routerLinkActive="active">Biglietti</a>
            <a routerLink="/profilo" routerLinkActive="active">Profilo</a>
            <a *ngIf="user.role === 'organizer' || user.role === 'admin'"
               routerLink="/organizer"
               routerLinkActive="active">
              Organizer
            </a>
            <a *ngIf="user.role === 'admin'"
               routerLink="/admin"
               routerLinkActive="active">
              Admin
            </a>

            <div class="user-chip">{{ user.name }}</div>
            <button type="button" class="logout" (click)="logout()">Esci</button>
          </ng-container>

          <ng-template #guestLinks>
            <a routerLink="/login" routerLinkActive="active">Login</a>
            <a routerLink="/register" class="signup">Registrati</a>
          </ng-template>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 20;
      height: 76px;
      border-bottom: 1px solid rgba(255,255,255,.08);
      background: rgba(8,8,12,.86);
      backdrop-filter: blur(18px);
    }

    .nav-content {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .logo span:not(.logo-square) {
      color: #fc38ac;
    }

    .logo-square {
      width: 18px;
      height: 18px;
      border-radius: 5px;
      display: inline-block;
      background: linear-gradient(135deg, #932cff, #fc38ac);
      transform: rotate(45deg);
    }

    .links {
      display: flex;
      align-items: center;
      gap: 25px;
      color: #a7a6b6;
      font-weight: 500;
    }

    .links a:hover,
    .links a.active {
      color: white;
    }

    .signup {
      padding: 11px 20px;
      border-radius: 999px;
      color: white !important;
      background: linear-gradient(110deg, #932cff, #fc38ac);
    }

    .user-chip {
      padding: 9px 14px;
      border-radius: 999px;
      color: white;
      font-size: .86rem;
      background: rgba(255,255,255,.07);
    }

    .logout {
      border: 0;
      color: #a7a6b6;
      background: transparent;
    }

    .logout:hover {
      color: white;
    }

    .menu-button {
      display: none;
      color: white;
      font-size: 1.3rem;
      border: 0;
      background: transparent;
    }

    @media (max-width: 820px) {
      .menu-button {
        display: block;
      }

      .links {
        position: absolute;
        top: 76px;
        left: 0;
        right: 0;
        display: none;
        padding: 22px;
        flex-direction: column;
        align-items: stretch;
        background: #111118;
        border-bottom: 1px solid rgba(255,255,255,.08);
      }

      .links.open {
        display: flex;
      }
    }
  `]
})
export class NavbarComponent {
  menuOpen = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.menuOpen = false;
    this.router.navigate(['/']);
  }
}
