import { Component, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
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
      <div class="auth-frame"></div>

      <div class="auth-card card">
        <div class="corner-label">NEW MEMBER / 02</div>

        <span class="eyebrow">JOIN THE COMMUNITY / EVENTHUB</span>

        <h1>
          Crea il tuo <span class="gradient-text">account</span>
        </h1>

        <p class="subtitle">
          Registrati per prenotare i migliori eventi house.
        </p>

        <form [formGroup]="registerForm" (ngSubmit)="submit()">
          <div class="field">
            <label for="name">NOME COMPLETO</label>
            <input
              id="name"
              type="text"
              formControlName="name"
              placeholder="Il tuo nome">
          </div>

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
                placeholder="Minimo 6 caratteri">

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

          <div class="field">
            <label for="confirmPassword">CONFERMA PASSWORD</label>

            <div class="password-field">
              <input
                id="confirmPassword"
                [type]="showConfirmPassword() ? 'text' : 'password'"
                formControlName="confirmPassword"
                placeholder="Ripeti password">

              <button
                class="password-toggle"
                type="button"
                (click)="toggleConfirmPassword()"
                [attr.aria-label]="showConfirmPassword() ? 'Nascondi password' : 'Mostra password'">

                <svg *ngIf="!showConfirmPassword()" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"></path>
                  <circle cx="12" cy="12" r="3.2"></circle>
                </svg>

                <svg *ngIf="showConfirmPassword()" viewBox="0 0 24 24" aria-hidden="true">
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

          <p class="success-message" *ngIf="success()">
            {{ success() }}
          </p>

          <button
            class="btn btn-primary submit"
            type="submit"
            [disabled]="loading()">
            {{ loading() ? 'Registrazione...' : 'Registrati' }}
          </button>
        </form>

        <div class="separator">
          <span>HAI GIÀ UN ACCOUNT?</span>
        </div>

        <a routerLink="/login" class="btn btn-outline login-button">
          Accedi
        </a>
      </div>
    </section>
  `,
  styles: [`
    .auth-page {
      position: relative;
      min-height: calc(100vh - 82px);
      padding: 52px 18px;
      display: grid;
      place-items: center;
      overflow: hidden;
      background:
        radial-gradient(circle at 50% 18%, rgba(80, 104, 126, .08), transparent 34%),
        #020305;
    }

    .auth-frame {
      position: absolute;
      width: min(620px, calc(100% - 32px));
      height: min(800px, calc(100% - 35px));
      border-left: 1px solid rgba(91, 112, 131, .24);
      border-right: 1px solid rgba(91, 112, 131, .24);
      pointer-events: none;
    }

    .auth-card {
      position: relative;
      width: min(500px, 100%);
      padding: 43px;
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
      margin-bottom: 17px;
      color: #7899b1;
      font-family: 'Orbitron', Arial, sans-serif;
      font-size: .56rem;
      font-weight: 700;
      letter-spacing: 2.7px;
    }

    h1 {
      margin: 0 0 13px;
      font-size: clamp(2rem, 6vw, 2.38rem);
    }

    .subtitle {
      margin: 0 0 31px;
      color: #879eaf;
      line-height: 1.65;
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

    .submit {
      width: 100%;
      margin-top: 9px;
      border-radius: 3px;
    }

    .submit:disabled {
      opacity: .62;
      cursor: not-allowed;
      transform: none;
    }

    .separator {
      position: relative;
      margin: 34px 0 25px;
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

    .login-button {
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
export class RegisterComponent {
  error = signal('');
  success = signal('');
  loading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

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

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  submit(): void {
    this.error.set('');
    this.success.set('');

    if (this.registerForm.invalid) {
      this.error.set(
        this.registerForm.hasError('passwordMismatch')
          ? 'Le password non coincidono.'
          : 'Compila correttamente tutti i campi.'
      );
      return;
    }

    this.loading.set(true);

    const { name, email, password } = this.registerForm.getRawValue();

    this.authService.register({
      name: name.trim(),
      email: email.trim(),
      password
    }).subscribe({
      next: () => {
        this.success.set('Registrazione completata. Ora puoi accedere.');
        this.loading.set(false);

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      },
      error: (error) => {
        this.error.set(
          error.error?.message || 'Registrazione non riuscita.'
        );
        this.loading.set(false);
      }
    });
  }
}
