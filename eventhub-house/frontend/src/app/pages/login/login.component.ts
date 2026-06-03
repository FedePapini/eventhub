import { Component, OnInit, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, NgIf],
  template: `
    <section class="auth-page">
      <div class="auth-frame"></div>

      <div class="auth-card card">
        <div class="corner-label">SECURE LOGIN</div>

        <span class="eyebrow">ACCESSO EVENTHUB</span>

        <h1>
          Accedi a <span class="gradient-text">EventHub</span>
        </h1>

        <p class="subtitle">
          Accedi al tuo account per gestire eventi, biglietti e permessi.
        </p>

        <p class="error-message" *ngIf="error()">
          {{ error() }}
        </p>

        <button
          class="btn btn-primary submit-button"
          type="button"
          [disabled]="loading()"
          (click)="login()">
          {{ loading() ? 'Accesso in corso...' : 'Accedi' }}
        </button>

        <div class="separator">
          <span>NUOVO ACCOUNT?</span>
        </div>

        <a routerLink="/register" class="btn btn-outline register-button">
          Registrati
        </a>
      </div>
    </section>
  `,
  styles: [`
    .auth-page {
      position: relative;
      min-height: calc(100vh - 82px);
      padding: 58px 18px;
      display: grid;
      place-items: center;
      overflow: hidden;
      background:
        radial-gradient(circle at 50% 18%, rgba(80, 104, 126, .08), transparent 34%),
        #020305;
    }

    .auth-frame {
      position: absolute;
      width: min(600px, calc(100% - 32px));
      height: min(680px, calc(100% - 42px));
      border-left: 1px solid rgba(91, 112, 131, .24);
      border-right: 1px solid rgba(91, 112, 131, .24);
      pointer-events: none;
    }

    .auth-card {
      position: relative;
      width: min(475px, 100%);
      padding: 45px 43px;
      border-radius: 3px 27px 3px 3px;
      border-color: rgba(91, 112, 131, .38);
      box-shadow: none;
    }

    .corner-label {
      position: absolute;
      right: 24px;
      top: 20px;
      color: #718fa8;
      font-family: 'Orbitron', Arial, sans-serif;
      font-size: .48rem;
      font-weight: 700;
      letter-spacing: 2px;
    }

    .eyebrow {
      display: block;
      margin-bottom: 18px;
      color: #7899b1;
      font-family: 'Orbitron', Arial, sans-serif;
      font-size: .59rem;
      font-weight: 700;
      letter-spacing: 3px;
    }

    h1 {
      margin: 0 0 13px;
      font-size: clamp(2.1rem, 6vw, 2.45rem);
    }

    .subtitle {
      margin: 0 0 34px;
      color: #879eaf;
      line-height: 1.7;
    }

    .submit-button {
      width: 100%;
      margin-top: 12px;
      border-radius: 3px;
    }

    .submit-button:disabled {
      opacity: .62;
      cursor: not-allowed;
      transform: none;
    }

    .separator {
      position: relative;
      margin: 35px 0 25px;
      text-align: center;
      border-top: 1px solid rgba(91, 112, 131, .29);
    }

    .separator span {
      position: relative;
      top: -9px;
      padding: 0 14px;
      color: #728a9d;
      background: #070b11;
      font-family: 'Orbitron', Arial, sans-serif;
      font-size: .48rem;
      font-weight: 700;
      letter-spacing: 2px;
    }

    .register-button {
      width: 100%;
      border-radius: 3px;
    }

    @media (max-width: 520px) {
      .auth-card {
        padding: 40px 23px 28px;
      }

      .auth-frame {
        display: none;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loading = signal(false);
  error = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  async login(): Promise<void> {
    this.error.set('');
    this.loading.set(true);

    try {
      await this.authService.loginWithKeycloak();
    } catch (error) {
      console.error(error);
      this.error.set('Accesso non riuscito.');
    } finally {
      this.loading.set(false);
    }
  }
}
