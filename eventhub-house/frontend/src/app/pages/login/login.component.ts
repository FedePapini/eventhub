import { Component } from '@angular/core';
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
        <h1>Accedi a <span class="gradient-text">EventHub</span></h1>
        <p class="subtitle">Entra e gestisci eventi, biglietti e recensioni.</p>

        <form [formGroup]="loginForm" (ngSubmit)="submit()">
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" placeholder="nome@email.com">
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" placeholder="Inserisci password">
          </div>

          <p class="error-message" *ngIf="error">{{ error }}</p>

          <button class="btn btn-primary submit" type="submit" [disabled]="loading">
            {{ loading ? 'Accesso...' : 'Accedi' }}
          </button>
        </form>

        <div class="demo-box">
          <strong>Account demo</strong>
          <p>User: user&#64;eventhub.local / password</p>
          <p>Organizer: organizer&#64;eventhub.local / password</p>
          <p>Admin: admin&#64;eventhub.local / password</p>
        </div>

        <p class="register-link">
          Non hai un account?
          <a routerLink="/register">Registrati</a>
        </p>
      </div>
    </section>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 150px);
      padding: 55px 18px;
      display: grid;
      place-items: center;
      background:
        radial-gradient(circle at 50% 20%, rgba(147,44,255,.16), transparent 35%),
        #08080c;
    }

    .auth-card {
      width: min(475px, 100%);
      padding: 42px;
      box-shadow: 0 22px 80px rgba(147,44,255,.12);
    }

    .eyebrow {
      display: block;
      color: #c26eff;
      letter-spacing: 3px;
      font-size: .73rem;
      font-weight: 700;
      margin-bottom: 17px;
    }

    h1 {
      margin: 0 0 12px;
      font-size: 2.35rem;
    }

    .subtitle {
      margin: 0 0 32px;
      color: #9696a8;
      line-height: 1.6;
    }

    .submit {
      width: 100%;
      margin-top: 8px;
      border: 0;
    }

    .submit:disabled {
      opacity: .65;
    }

    .demo-box {
      margin-top: 28px;
      padding: 17px;
      border-radius: 14px;
      color: #b2b2c0;
      font-size: .88rem;
      background: rgba(255,255,255,.04);
    }

    .demo-box p {
      margin: 9px 0 0;
    }

    .register-link {
      margin: 27px 0 0;
      text-align: center;
      color: #9696a8;
    }

    .register-link a {
      color: #fc38ac;
      font-weight: 700;
    }
  `]
})
export class LoginComponent {
  error = '';
  loading = false;

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
    if (this.loginForm.invalid) {
      this.error = 'Inserisci email e password valide.';
      return;
    }

    this.error = '';
    this.loading = true;

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: (response) => {
        if (response.user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (response.user.role === 'organizer') {
          this.router.navigate(['/organizer']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        this.error = error.error?.message || 'Accesso non riuscito.';
        this.loading = false;
      }
    });
  }
}
