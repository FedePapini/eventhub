import { Component, OnInit, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { EventItem } from '../../models/event.model';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [NgIf, RouterLink],
  template: `
    <section class="detail-page">
      <div *ngIf="loading()" class="container page">
        <p>Caricamento evento...</p>
      </div>

      <div *ngIf="error()" class="container page">
        <p class="error-message">{{ error() }}</p>
      </div>

      <ng-container *ngIf="event() as currentEvent">
        <div
          class="event-cover"
          [class.with-image]="currentEvent.image_url">

          <img
            *ngIf="currentEvent.image_url"
            [src]="currentEvent.image_url"
            [alt]="'Locandina evento ' + currentEvent.title">

          <div class="cover-overlay"></div>

          <div class="container cover-content">
            <a routerLink="/" class="back-link">
              ← Torna agli eventi
            </a>

            <div class="title-area">
              <span class="badge">{{ currentEvent.category }}</span>

              <h1>{{ currentEvent.title }}</h1>

              <p>
                {{ currentEvent.location }} · {{ currentEvent.city }}
              </p>
            </div>
          </div>
        </div>

        <div class="container event-layout">
          <main class="card event-info">
            <h2>Informazioni evento</h2>

            <div class="facts">
              <div class="fact">
                <span>DATA E ORA</span>
                <strong>{{ formatDate(currentEvent.date) }}</strong>
              </div>

              <div class="fact">
                <span>LOCATION</span>
                <strong>{{ currentEvent.location }}, {{ currentEvent.city }}</strong>
              </div>

              <div class="fact">
                <span>PREZZO</span>
                <strong>{{ formatPrice(currentEvent.price) }}</strong>
              </div>

              <div class="fact">
                <span>POSTI DISPONIBILI</span>
                <strong>
                  {{ currentEvent.available_places }} / {{ currentEvent.capacity }}
                </strong>
              </div>
            </div>

            <h2 class="description-title">Descrizione</h2>
            <p class="description">
              {{ currentEvent.description }}
            </p>
          </main>

          <aside class="card ticket-card">
            <span class="small-label">BIGLIETTO</span>

            <strong class="price">
              {{ formatPrice(currentEvent.price) }}
            </strong>

            <p class="availability">
              Ancora
              <strong>{{ currentEvent.available_places }}</strong>
              posti disponibili.
            </p>

            <p *ngIf="bookingError()" class="error-message">
              {{ bookingError() }}
            </p>

            <p *ngIf="bookingSuccess()" class="success-message">
              {{ bookingSuccess() }}
            </p>

            <ng-container *ngIf="authService.isLoggedIn(); else loginRequired">
              <button
                type="button"
                class="btn btn-primary booking-button"
                [disabled]="bookingLoading() || currentEvent.available_places === 0"
                (click)="bookEvent()">
                {{
                  currentEvent.available_places === 0
                    ? 'Posti esauriti'
                    : bookingLoading()
                      ? 'Prenotazione...'
                      : 'Prenota ora'
                }}
              </button>

              <a routerLink="/biglietti" class="btn btn-outline booking-button">
                I miei biglietti
              </a>
            </ng-container>

            <ng-template #loginRequired>
              <a routerLink="/login" class="btn btn-primary booking-button">
                Accedi per prenotare
              </a>
            </ng-template>

            <div class="ticket-info">
              <p>✓ Conferma immediata</p>
              <p>✓ Biglietto digitale</p>
              <p>✓ QR code personale</p>
            </div>
          </aside>
        </div>
      </ng-container>
    </section>
  `,
  styles: [`
    .detail-page {
      padding-bottom: 85px;
    }

    .event-cover {
      position: relative;
      height: 490px;
      overflow: hidden;
      display: flex;
      align-items: end;
      background:
        radial-gradient(circle at 74% 24%, rgba(252, 56, 172, .34), transparent 27%),
        radial-gradient(circle at 24% 38%, rgba(147, 44, 255, .42), transparent 34%),
        linear-gradient(130deg, #090910, #181024);
    }

    .event-cover img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }

    .cover-overlay {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(to top, #08080c 0%, rgba(8, 8, 12, .58) 43%, rgba(8, 8, 12, .28) 100%);
    }

    .cover-content {
      position: relative;
      z-index: 1;
      padding-bottom: 54px;
    }

    .back-link {
      display: inline-block;
      margin-bottom: 72px;
      color: #f0eff8;
      font-weight: 600;
      text-shadow: 0 1px 8px rgba(0,0,0,.45);
    }

    .back-link:hover {
      color: #fc38ac;
    }

    .title-area h1 {
      margin: 19px 0 12px;
      max-width: 850px;
      font-size: clamp(3rem, 7vw, 5rem);
      line-height: .98;
      text-shadow: 0 3px 18px rgba(0,0,0,.36);
    }

    .title-area p {
      margin: 0;
      color: #e0dfeb;
      font-size: 1.15rem;
      text-shadow: 0 2px 12px rgba(0,0,0,.42);
    }

    .event-layout {
      position: relative;
      z-index: 2;
      margin-top: -20px;
      display: grid;
      grid-template-columns: minmax(0, 1fr) 340px;
      gap: 25px;
      align-items: start;
    }

    .event-info {
      padding: 38px;
    }

    .event-info h2 {
      margin: 0 0 27px;
      font-size: 1.65rem;
    }

    .facts {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 29px;
      padding-bottom: 32px;
      border-bottom: 1px solid rgba(255,255,255,.08);
    }

    .fact {
      display: grid;
      gap: 10px;
    }

    .fact span,
    .small-label {
      color: #9291a3;
      font-size: .7rem;
      font-weight: 700;
      letter-spacing: 2px;
    }

    .fact strong {
      line-height: 1.5;
    }

    .description-title {
      margin-top: 33px !important;
      margin-bottom: 16px !important;
    }

    .description {
      margin: 0;
      color: #b0afbd;
      line-height: 1.8;
      font-size: 1.02rem;
    }

    .ticket-card {
      position: sticky;
      top: 96px;
      padding: 30px;
    }

    .price {
      display: block;
      margin: 17px 0 14px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 2.5rem;
    }

    .availability {
      margin: 0 0 26px;
      color: #a3a2b2;
      line-height: 1.5;
    }

    .availability strong {
      color: #27e2e9;
    }

    .booking-button {
      width: 100%;
      margin-bottom: 12px;
      border: 0;
    }

    .booking-button:disabled {
      opacity: .55;
      cursor: not-allowed;
      transform: none;
    }

    .ticket-info {
      margin-top: 24px;
      padding-top: 18px;
      border-top: 1px solid rgba(255,255,255,.08);
      color: #a3a2b2;
      font-size: .92rem;
    }

    .ticket-info p {
      margin: 12px 0;
    }

    @media (max-width: 850px) {
      .event-cover {
        height: 420px;
      }

      .back-link {
        margin-bottom: 55px;
      }

      .event-layout {
        grid-template-columns: 1fr;
      }

      .ticket-card {
        position: static;
        order: -1;
      }
    }

    @media (max-width: 600px) {
      .event-cover {
        height: 390px;
      }

      .cover-content {
        padding-bottom: 38px;
      }

      .back-link {
        margin-bottom: 42px;
      }

      .event-info,
      .ticket-card {
        padding: 24px;
      }

      .facts {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EventDetailComponent implements OnInit {
  event = signal<EventItem | null>(null);
  loading = signal(true);
  error = signal('');
  bookingLoading = signal(false);
  bookingError = signal('');
  bookingSuccess = signal('');

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private bookingService: BookingService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const eventId = Number(this.route.snapshot.paramMap.get('id'));

    if (!eventId) {
      this.loading.set(false);
      this.error.set('Evento non valido.');
      return;
    }

    this.loadEvent(eventId);
  }

  loadEvent(eventId: number): void {
    this.eventService.getEvent(eventId).subscribe({
      next: (event) => {
        this.event.set(event);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Non è stato possibile caricare questo evento.');
      }
    });
  }

  bookEvent(): void {
    const currentEvent = this.event();

    if (!currentEvent) {
      return;
    }

    this.bookingLoading.set(true);
    this.bookingError.set('');
    this.bookingSuccess.set('');

    this.bookingService.bookEvent(currentEvent.id).subscribe({
      next: () => {
        this.bookingSuccess.set(
          'Prenotazione completata! Trovi il tuo biglietto nella pagina Biglietti.'
        );
        this.bookingLoading.set(false);
        this.loadEvent(currentEvent.id);
      },
      error: (response) => {
        this.bookingError.set(
          response.error?.message || 'Non è stato possibile completare la prenotazione.'
        );
        this.bookingLoading.set(false);
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'long',
      timeStyle: 'short'
    }).format(new Date(date));
  }
}
