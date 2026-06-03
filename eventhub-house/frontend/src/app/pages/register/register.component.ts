import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="auth-page">
      <div class="auth-frame"></div>

      <div class="auth-card card">
        <div class="corner-label">ACCOUNT</div>

        <span class="eyebrow">JOIN THE COMMUNITY / EVENTHUB</span>

        <h1>
          Crea il tuo <span class="gradient-text">account</span>
        </h1>

        <p class="subtitle">
          Crea il tuo account per prenotare eventi, ricevere biglietti e accedere alla community.
        </p>

        <button
          class="btn btn-primary submit"
          type="button"
          (click)="register()">
          Registrati
        </button>

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
      height: min(700px, calc(100% - 35px));
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

    .submit {
      width: 100%;
      margin-top: 9px;
      border-radius: 3px;
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
  constructor(private authService: AuthService) {}

  register(): void {
    this.authService.registerWithKeycloak();
  }
}
