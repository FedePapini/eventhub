import { Component, OnInit, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  template: `
    <section class="profile-page page">
      <div class="container">
        <header class="page-heading">
          <span class="eyebrow">MY ACCOUNT</span>
          <h1>Il mio <span class="gradient-text">profilo</span></h1>
          <p>Gestisci le tue informazioni personali e la password.</p>
        </header>

        <p *ngIf="loading()" class="loading">
          Caricamento profilo...
        </p>

        <p *ngIf="pageError()" class="error-message">
          {{ pageError() }}
        </p>

        <div class="profile-grid" *ngIf="user() as currentUser">
          <aside class="identity-card card">
            <div class="avatar">
              {{ currentUser.name.charAt(0).toUpperCase() }}
            </div>

            <h2>{{ currentUser.name }}</h2>
            <p class="email">{{ currentUser.email }}</p>

            <span class="role">
              {{ roleLabel(currentUser.role) }}
            </span>

            <div class="profile-info">
              <div>
                <span>EMAIL</span>
                <strong>{{ currentUser.email }}</strong>
              </div>

              <div>
                <span>RUOLO</span>
                <strong>{{ roleLabel(currentUser.role) }}</strong>
              </div>
            </div>
          </aside>

          <main class="settings-card card">
            <h2>Modifica profilo</h2>
            <p class="subtitle">
              Aggiorna il tuo nome oppure imposta una nuova password.
            </p>

            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
              <div class="field">
                <label for="name">Nome visualizzato</label>
                <input
                  id="name"
                  type="text"
                  formControlName="name"
                  placeholder="Il tuo nome">
              </div>

              <div class="separator">
                <span>CAMBIO PASSWORD</span>
              </div>

              <div class="field">
                <label for="password">Nuova password</label>
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  placeholder="Lascia vuoto per non modificarla">
              </div>

              <div class="field">
                <label for="confirmPassword">Conferma nuova password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  formControlName="confirmPassword"
                  placeholder="Ripeti la nuova password">
              </div>

              <p *ngIf="formError()" class="error-message">
                {{ formError() }}
              </p>

              <p *ngIf="success()" class="success-message">
                {{ success() }}
              </p>

              <button
                class="btn btn-primary save-button"
                type="submit"
                [disabled]="saving()">
                {{ saving() ? 'Salvataggio...' : 'Salva modifiche' }}
              </button>
            </form>
          </main>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .page-heading {
      margin-bottom: 42px;
    }

    .eyebrow {
      display: block;
      margin-bottom: 16px;
      color: #c26eff;
      font-size: .75rem;
      font-weight: 700;
      letter-spacing: 3px;
    }

    .page-heading h1 {
      margin: 0 0 12px;
      font-size: clamp(2.8rem, 6vw, 4rem);
    }

    .page-heading p {
      margin: 0;
      color: #a4a3b3;
      font-size: 1.05rem;
    }

    .loading {
      color: #a4a3b3;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 345px minmax(0, 610px);
      justify-content: center;
      gap: 25px;
      align-items: start;
    }

    .identity-card {
      padding: 34px 28px;
      text-align: center;
    }

    .avatar {
      width: 92px;
      height: 92px;
      margin: 0 auto 23px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      font-size: 2.2rem;
      font-weight: 700;
      background: linear-gradient(125deg, #932cff, #fc38ac);
      box-shadow: 0 16px 38px rgba(252,56,172,.2);
    }

    .identity-card h2 {
      margin: 0 0 10px;
      font-size: 1.65rem;
    }

    .email {
      margin: 0 0 22px;
      color: #9d9cac;
      overflow-wrap: anywhere;
    }

    .role {
      display: inline-flex;
      padding: 8px 16px;
      margin-bottom: 31px;
      border-radius: 999px;
      color: #e1b7ff;
      background: rgba(147,44,255,.17);
      border: 1px solid rgba(147,44,255,.38);
      font-size: .76rem;
      font-weight: 700;
      letter-spacing: 1.5px;
    }

    .profile-info {
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,.08);
      display: grid;
      gap: 20px;
      text-align: left;
    }

    .profile-info div {
      display: grid;
      gap: 7px;
    }

    .profile-info span,
    .separator span {
      color: #8f8e9e;
      font-size: .69rem;
      font-weight: 700;
      letter-spacing: 2px;
    }

    .profile-info strong {
      overflow-wrap: anywhere;
    }

    .settings-card {
      padding: 38px;
    }

    .settings-card h2 {
      margin: 0 0 12px;
      font-size: 2rem;
    }

    .subtitle {
      margin: 0 0 31px;
      color: #a4a3b3;
      line-height: 1.65;
    }

    .separator {
      margin: 31px 0 23px;
      padding-top: 28px;
      border-top: 1px solid rgba(255,255,255,.08);
    }

    .save-button {
      border: 0;
      margin-top: 12px;
    }

    .save-button:disabled {
      opacity: .6;
      cursor: not-allowed;
      transform: none;
    }

    @media (max-width: 820px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }

      .identity-card {
        max-width: 420px;
        width: 100%;
        margin: 0 auto;
      }
    }

    @media (max-width: 560px) {
      .settings-card {
        padding: 25px;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  user = signal<User | null>(null);
  loading = signal(true);
  saving = signal(false);
  pageError = signal('');
  formError = signal('');
  success = signal('');

  profileForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    }),
    password: new FormControl('', {
      nonNullable: true
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true
    })
  });

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.loadProfile().subscribe({
      next: (user) => {
        this.user.set(user);
        this.profileForm.patchValue({
          name: user.name
        });
        this.loading.set(false);
      },
      error: () => {
        this.pageError.set('Non è stato possibile caricare il profilo.');
        this.loading.set(false);
      }
    });
  }

  saveProfile(): void {
    const values = this.profileForm.getRawValue();

    this.formError.set('');
    this.success.set('');

    if (this.profileForm.invalid) {
      this.formError.set('Inserisci un nome valido.');
      return;
    }

    if (values.password && values.password.length < 6) {
      this.formError.set('La password deve avere almeno 6 caratteri.');
      return;
    }

    if (values.password !== values.confirmPassword) {
      this.formError.set('Le password non coincidono.');
      return;
    }

    const payload: { name: string; password?: string } = {
      name: values.name.trim()
    };

    if (values.password) {
      payload.password = values.password;
    }

    this.saving.set(true);

    this.authService.updateProfile(payload).subscribe({
      next: () => {
        this.authService.loadProfile().subscribe({
          next: (updatedUser) => {
            this.user.set(updatedUser);
            this.profileForm.patchValue({
              name: updatedUser.name,
              password: '',
              confirmPassword: ''
            });
            this.success.set('Profilo aggiornato correttamente.');
            this.saving.set(false);
          },
          error: () => {
            this.formError.set('Profilo salvato, ma non aggiornato nella schermata.');
            this.saving.set(false);
          }
        });
      },
      error: (error) => {
        this.formError.set(
          error.error?.message || 'Non è stato possibile aggiornare il profilo.'
        );
        this.saving.set(false);
      }
    });
  }

  roleLabel(role: string): string {
    const labels: Record<string, string> = {
      user: 'UTENTE',
      organizer: 'ORGANIZER',
      admin: 'ADMIN'
    };

    return labels[role] || role.toUpperCase();
  }
}
