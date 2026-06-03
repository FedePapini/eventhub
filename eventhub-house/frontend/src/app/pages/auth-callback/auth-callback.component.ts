import { Component, OnInit, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [NgIf],
  template: `
    <section class="callback-page">
      <div class="callback-card card">
        <span class="eyebrow">ACCESSO EVENTHUB</span>
        <h1>Accesso in corso...</h1>
        <p>Stiamo completando il login e caricando il tuo profilo.</p>

        <p class="error-message" *ngIf="error()">
          {{ error() }}
        </p>
      </div>
    </section>
  `,
  styles: [`
    .callback-page {
      min-height: calc(100vh - 82px);
      padding: 58px 18px;
      display: grid;
      place-items: center;
      background:
        radial-gradient(circle at 50% 18%, rgba(80, 104, 126, .08), transparent 34%),
        #020305;
    }

    .callback-card {
      width: min(480px, 100%);
      padding: 43px;
      border-radius: 3px 27px 3px 3px;
      border-color: rgba(91, 112, 131, .38);
      text-align: center;
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
      font-size: clamp(2rem, 6vw, 2.45rem);
    }

    p {
      margin: 0;
      color: #879eaf;
      line-height: 1.7;
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  error = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.authService.completeKeycloakCallback();
      this.redirectLoggedUser();
    } catch (error) {
      console.error(error);
      this.error.set('Accesso non riuscito.');
    }
  }

  private redirectLoggedUser(): void {
    const user = this.authService.currentUser;

    if (user?.role === 'admin') {
      this.router.navigate(['/admin']);
      return;
    }

    if (user?.role === 'organizer') {
      this.router.navigate(['/organizer']);
      return;
    }

    this.router.navigate(['/']);
  }
}
