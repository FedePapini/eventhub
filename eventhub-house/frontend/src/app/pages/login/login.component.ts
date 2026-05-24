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
      <div class="auth-card card">
        <span class="eyebrow">WELCOME BACK</span>

        <h1>
          Accedi a <span class="gradient-text">EventHub</span>
        </h1>

        <p class="subtitle">
          Entra nel tuo account per gestire eventi, biglietti e recensioni.
        </p>

        <form [formGroup]="loginForm" (ngSubmit)="submit()">
          <div class="field">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="nome@email.com">
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Inserisci la password">
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
      min-height: calc(100vh - 150px);
      padding: 58px 18px;
      display: grid;
      place-items: center;
      background:
        radial-gradient(circle at 50% 16%, rgba(147,44,255,.19), transparent 36%),
        radial-gradient(circle at 75% 72%, rgba(252,56,172,.1), transparent 28%),
        #08080c;
    }

    .auth-card {
      width: min(475px, 100%);
      padding: 43px;
      box-shadow: 0 22px 85px rgba(147,44,255,.13);
    }

    .eyebrow {
      display: block;
      margin-bottom: 17px;
      color: #c26eff;
      font-size: .73rem;
      font-weight: 700;
      letter-spacing: 3px;
    }

    h1 {
      margin: 0 0 13px;
      font-size: clamp(2.1rem, 6vw, 2.45rem);
    }

    .subtitle {
      margin: 0 0 34px;
      color: #9998aa;
      line-height: 1.7;
    }

    .submit-button {
      width: 100%;
      margin-top: 10px;
      border: 0;
    }

    .submit-button:disabled {
      opacity: .62;
      cursor: not-allowed;
      transform: none;
    }

    .separator {
      position: relative;
      margin: 34px 0 25px;
      text-align: center;
      border-top: 1px solid rgba(255,255,255,.09);
    }

    .separator span {
      position: relative;
      top: -9px;
      padding: 0 14px;
      color: #898899;
      background: #111118;
      font-size: .67rem;
      font-weight: 700;
      letter-spacing: 1.7px;
    }

    .register-button {
      width: 100%;
    }

    @media (max-width: 520px) {
      .auth-card {
        padding: 28px 23px;
      }
    }
  `]
})
export class LoginComponent {
  loading = signal(false);
  error = signal('');

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
