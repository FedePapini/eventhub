import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

function matchingPasswords(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <section class="auth-page">
      <div class="auth-card card">
        <span class="eyebrow">JOIN THE COMMUNITY</span>
        <h1>Crea il tuo <span class="gradient-text">account</span></h1>
        <p class="subtitle">Registrati per prenotare i migliori eventi house.</p>

        <form [formGroup]="registerForm" (ngSubmit)="submit()">
          <div class="field">
            <label for="name">Nome completo</label>
            <input id="name" type="text" formControlName="name" placeholder="Il tuo nome">
          </div>

          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" placeholder="nome@email.com">
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" placeholder="Minimo 6 caratteri">
          </div>

          <div class="field">
            <label for="confirmPassword">Conferma password</label>
            <input id="confirmPassword" type="password" formControlName="confirmPassword" placeholder="Ripeti password">
          </div>

          <p class="error-message" *ngIf="error">{{ error }}</p>
          <p class="success-message" *ngIf="success">{{ success }}</p>

          <button class="btn btn-primary submit" type="submit" [disabled]="loading">
            {{ loading ? 'Registrazione...' : 'Registrati' }}
          </button>
        </form>

        <p class="login-link">
          Hai già un account?
          <a routerLink="/login">Accedi</a>
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
        radial-gradient(circle at 50% 20%, rgba(252,56,172,.12), transparent 35%),
        #08080c;
    }

    .auth-card {
      width: min(485px, 100%);
      padding: 42px;
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
    }

    .submit {
      width: 100%;
      border: 0;
      margin-top: 8px;
    }

    .login-link {
      margin: 27px 0 0;
      text-align: center;
      color: #9696a8;
    }

    .login-link a {
      color: #fc38ac;
      font-weight: 700;
    }
  `]
})
export class RegisterComponent {
  error = '';
  success = '';
  loading = false;

  registerForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  }, { validators: matchingPasswords });

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  submit(): void {
    if (this.registerForm.invalid) {
      this.error = this.registerForm.hasError('passwordMismatch')
        ? 'Le password non coincidono.'
        : 'Compila correttamente tutti i campi.';
      return;
    }

    this.error = '';
    this.success = '';
    this.loading = true;

    const { name, email, password } = this.registerForm.getRawValue();

    this.authService.register({ name, email, password }).subscribe({
      next: () => {
        this.success = 'Registrazione completata. Ora puoi accedere.';
        this.loading = false;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      },
      error: (error) => {
        this.error = error.error?.message || 'Registrazione non riuscita.';
        this.loading = false;
      }
    });
  }
}
