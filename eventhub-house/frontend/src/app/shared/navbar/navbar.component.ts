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
        <a routerLink="/" class="logo" aria-label="EventHub Home">
          <span class="logo-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48">
              <path class="mark-frame" d="M24 3.5 44.5 24 24 44.5 3.5 24 24 3.5Z"></path>
              <path class="mark-star" d="M24 8.5c.9 8.9 3.1 13.8 15.5 15.5C27.1 25.7 24.9 30.6 24 39.5 23.1 30.6 20.9 25.7 8.5 24 20.9 22.3 23.1 17.4 24 8.5Z"></path>
              <path class="mark-line" d="M24 4.5v8M24 35.5v8M4.5 24h8M35.5 24h8"></path>
            </svg>
          </span>

          <span class="logo-copy">
            <span class="logo-name">EVENTHUB</span>
            <span class="logo-sub">ELECTRONIC NIGHTS</span>
          </span>
        </a>

        <button
          class="menu-button"
          type="button"
          aria-label="Apri menu"
          (click)="menuOpen = !menuOpen">
          <span></span>
          <span></span>
        </button>

        <nav class="links" [class.open]="menuOpen">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            Eventi
          </a>

          <ng-container *ngIf="authService.user$ | async as user; else guestLinks">
            <a routerLink="/biglietti" routerLinkActive="active">Biglietti</a>
            <a routerLink="/profilo" routerLinkActive="active">Profilo</a>

            <a
              *ngIf="user.role === 'organizer' || user.role === 'admin'"
              routerLink="/organizer"
              routerLinkActive="active">
              Organizer
            </a>

            <a
              *ngIf="user.role === 'admin'"
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
      height: 82px;
      border-bottom: 1px solid rgba(28, 116, 194, .3);
      background: rgba(2, 3, 5, .91);
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
      gap: 13px;
    }

    .logo-mark {
      width: 42px;
      height: 42px;
      display: inline-flex;
      filter: drop-shadow(0 0 7px rgba(19, 126, 225, .24));
    }

    .logo-mark svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .mark-frame {
      fill: rgba(1, 10, 18, .72);
      stroke: rgba(40, 143, 229, .8);
      stroke-width: 1.2;
    }

    .mark-star {
      fill: url(#unused);
      fill: #1689e8;
      stroke: #62c2ff;
      stroke-width: .7;
    }

    .mark-line {
      fill: none;
      stroke: #1591ed;
      stroke-width: 1.2;
      stroke-linecap: round;
    }

    .logo-copy {
      display: grid;
      gap: 3px;
    }

    .logo-name {
      font-family: 'Orbitron', Arial, sans-serif;
      font-size: 1.03rem;
      font-weight: 700;
      letter-spacing: 3px;
      color: transparent;
      background:
        linear-gradient(
          105deg,
          #667d91 0%,
          #f5fdff 22%,
          #7991a5 38%,
          #ffffff 51%,
          #258ee7 72%,
          #e5f7ff 100%
        );
      background-size: 230% 100%;
      background-clip: text;
      -webkit-background-clip: text;
      animation: logo-chrome 5s linear infinite;
    }

    .logo-sub {
      color: #328cd7;
      font-family: 'Orbitron', Arial, sans-serif;
      font-size: .43rem;
      font-weight: 700;
      letter-spacing: 2.5px;
    }

    @keyframes logo-chrome {
      from {
        background-position: 220% center;
      }

      to {
        background-position: -20% center;
      }
    }

    .links {
      display: flex;
      align-items: center;
      gap: 27px;
      color: #86a1b8;
      font-weight: 500;
    }

    .links a {
      position: relative;
      transition: color .2s;
    }

    .links a:not(.signup)::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: -13px;
      height: 1px;
      transform: scaleX(0);
      transform-origin: left;
      background: #1a8ce8;
      transition: transform .2s;
    }

    .links a:hover,
    .links a.active {
      color: #edf6ff;
    }

    .links a.active:not(.signup)::after {
      transform: scaleX(1);
    }

    .signup {
      padding: 11px 21px;
      border: 1px solid rgba(30, 139, 231, .62);
      border-radius: 999px;
      color: #eaf6ff !important;
      background: rgba(8, 48, 83, .18);
    }

    .signup:hover {
      background: rgba(14, 74, 124, .24);
    }

    .user-chip {
      padding: 10px 15px;
      border: 1px solid rgba(27, 118, 196, .35);
      border-radius: 999px;
      color: #dcefff;
      font-size: .86rem;
      background: rgba(7, 23, 37, .58);
    }

    .logout {
      border: 0;
      color: #86a1b8;
      background: transparent;
    }

    .logout:hover {
      color: #edf6ff;
    }

    .menu-button {
      display: none;
      width: 39px;
      height: 39px;
      place-content: center;
      gap: 7px;
      border: 1px solid rgba(30, 139, 231, .42);
      border-radius: 50%;
      background: transparent;
    }

    .menu-button span {
      width: 17px;
      height: 1px;
      display: block;
      background: #4eaef4;
    }

    @media (prefers-reduced-motion: reduce) {
      .logo-name {
        animation: none;
      }
    }

    @media (max-width: 820px) {
      .navbar {
        height: 76px;
      }

      .logo-mark {
        width: 37px;
        height: 37px;
      }

      .logo-name {
        font-size: .9rem;
        letter-spacing: 2px;
      }

      .menu-button {
        display: grid;
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
        background: #05080d;
        border-bottom: 1px solid rgba(28, 116, 194, .3);
      }

      .links.open {
        display: flex;
      }

      .links a:not(.signup)::after {
        display: none;
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
