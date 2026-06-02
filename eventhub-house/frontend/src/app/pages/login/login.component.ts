import { Component, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <section class="auth-page">
      <div class="auth-frame"></div>

      <div class="auth-card card">
        <div class="corner-label">ACCESS / 01</div>

        <span class="eyebrow">WELCOME BACK / EVENTHUB</span>

        <h1>
          Accedi a <span class="gradient-text">EventHub</span>
        </h1>

        <p class="subtitle">
          Entra nel tuo account per gestire eventi, biglietti e recensioni.
        </p>

        <form [formGroup]="loginForm" (ngSubmit)="submit()">
          <div class="field">
            <label for="email">EMAIL</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="nome@email.com">
          </div>

          <div class="field">
            <label for="password">PASSWORD</label>

            <div class="password-field">
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                placeholder="Inserisci la password">

              <button
                class="password-toggle"
                type="button"
                (click)="togglePassword()"
                [attr.aria-label]="showPassword() ? 'Nascondi password' : 'Mostra password'">

                <svg *ngIf="!showPassword()" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"></path>
                  <circle cx="12" cy="12" r="3.2"></circle>
                </svg>

                <svg *ngIf="showPassword()" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 3l18 18"></path>
                  <path d="M10.4 6.1A10.6 10.6 0 0 1 12 6c6.1 0 9.5 6 9.5 6a17.1 17.1 0 0 1-3.7 4"></path>
                  <path d="M6.1 7.7A16.6 16.6 0 0 0 2.5 12s3.4 6 9.5 6c1 0 1.9-.2 2.8-.5"></path>
                  <path d="M10 10a3.2 3.2 0 0 0 4 4"></path>
                </svg>
              </button>
            </div>
          </div>

          <p class="error-message" *ngIf="error()">
            {{ error() }}
          </p>

          <button
            class="btn btn-primary submit-button"
            type="submit"
            [disabled]="loading()">
            {{ loading() ? 'Accesso in corso...' : 'Accedi' }}
          </button>
        </form>

        <div class="separator">
          <span>NON HAI ANCORA UN ACCOUNT?</span>
        </div>

        <a routerLink="/register" class="btn btn-outline register-button">
          Crea un account
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

    .field label {
      color: #7790a5;
      font-family: 'Orbitron', Arial, sans-serif;
      font-size: .56rem;
      letter-spacing: 2px;
    }

    .password-field {
      position: relative;
    }

    .password-field input {
      padding-right: 54px;
    }

    .password-toggle {
      position: absolute;
      top: 50%;
      right: 14px;
      width: 30px;
      height: 30px;
      display: grid;
      place-items: center;
      transform: translateY(-50%);
      border: 0;
      color: #7e9bae;
      background: transparent;
      transition: color .2s;
    }

    .password-toggle:hover {
      color: #dce9f3;
    }

    .password-toggle svg {
      width: 21px;
      height: 21px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.7;
      stroke-linecap: round;
      stroke-linejoin: round;
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
export class LoginComponent {
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);

  loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  submit(): void {
    this.error.set('');

    if (this.loginForm.invalid) {
      this.error.set('Inserisci email e password valide.');
      return;
    }

    this.loading.set(true);

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: (response) => {
        this.loading.set(false);

        if (response.user.role === 'admin') {
          this.router.navigate(['/admin']);
          return;
        }

        if (response.user.role === 'organizer') {
          this.router.navigate(['/organizer']);
          return;
        }

        this.router.navigate(['/']);
      },
      error: (response) => {
        this.loading.set(false);
        this.error.set(
          response.error?.message || 'Accesso non riuscito.'
        );
      }
    });
  }
}
