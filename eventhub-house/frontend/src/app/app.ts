import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="app-main">
      <router-outlet></router-outlet>
    </main>

    <footer class="site-footer">
      <div class="container footer-content">
        <div>
          <strong>EVENTHUB HOUSE</strong>
          <p>Electronic music experiences. Milano · Roma · Torino</p>
        </div>
        <p class="copyright">© 2026 EventHub House</p>
      </div>
    </footer>
  `,
  styles: [`
    .app-main {
      min-height: calc(100vh - 160px);
    }

    .site-footer {
      border-top: 1px solid rgba(255,255,255,.08);
      padding: 28px 0;
      background: #09090d;
      color: #878796;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
    }

    .site-footer strong {
      color: #ffffff;
      letter-spacing: 2px;
    }

    .site-footer p {
      margin: 8px 0 0;
      font-size: .9rem;
    }

    @media (max-width: 650px) {
      .footer-content {
        display: block;
      }

      .copyright {
        margin-top: 22px !important;
      }
    }
  `]
})
export class App {}
