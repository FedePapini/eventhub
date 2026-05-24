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
    <div class="container page">
      <a routerLink="/" class="back-link">← Torna agli eventi</a>

      <p *ngIf="loading()">Caricamento evento...</p>

      <p *ngIf="error()" class="error-message">
        {{ error() }}
      </p>

      <section *ngIf="event() as currentEvent" class="event-layout">
        <main class="card event-info">
          <span class="badge">{{ currentEvent.category }}</span>

          <h1>{{ currentEvent.title }}</h1>

          <p class="location">
            {{ currentEvent.location }} · {{ currentEvent.city }}
          </p>

          <div class="facts">
            <div class="fact">
              <span>DATA</span>
              <strong>{{ formatDate(currentEvent.date) }}</strong>
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

          <h2>Descrizione</h2>
          <p class="description">{{ currentEvent.description }}</p>
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
      </section>
    </div>
  `,
  styles: [`
    .back-link {
      display: inline-block;
      margin-bottom: 34px;
      color: #fc38ac;
      font-weight: 600;
    }

    .event-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 340px;
      gap: 25px;
      align-items: start;
    }

    .event-info {
      padding: 38px;
    }

    h1 {
      margin: 20px 0 10px;
      font-size: clamp(2.8rem, 6vw, 4rem);
      line-height: 1;
    }

    .location {
      margin: 0 0 34px;
      color: #a3a2b2;
      font-size: 1.1rem;
    }

    .facts {
      display: grid;
      gap: 22px;
      grid-template-columns: repeat(3, 1fr);
      padding: 28px 0;
      margin-bottom: 30px;
      border-top: 1px solid rgba(255,255,255,.08);
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
      overflow-wrap: anywhere;
    }

    h2 {
      margin: 0 0 15px;
    }

    .description {
      margin: 0;
      color: #b0afbd;
      line-height: 1.75;
    }

    .ticket-card {
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
      .event-layout {
        grid-template-columns: 1fr;
      }

      .ticket-card {
        order: -1;
      }
    }

    @media (max-width: 600px) {
      .event-info {
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
      error: (error) => {
        this.bookingError.set(
          error.error?.message || 'Non è stato possibile completare la prenotazione.'
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
