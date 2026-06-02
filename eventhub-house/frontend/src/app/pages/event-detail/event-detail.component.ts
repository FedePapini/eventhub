import { Component, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { BookingService } from '../../core/services/booking.service';
import { ReviewService } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';
import { EventItem, Review } from '../../models/event.model';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, ReactiveFormsModule],
  template: `
    <section class="detail-page">
      <div *ngIf="loading()" class="container page">
        <p>Caricamento evento...</p>
      </div>

      <div *ngIf="error()" class="container page">
        <p class="error-message">{{ error() }}</p>
      </div>

      <ng-container *ngIf="event() as currentEvent">
        <div class="event-cover">
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
          <main>
            <section class="card event-info">
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

              <section
                class="lineup-section"
                *ngIf="currentEvent.artists && currentEvent.artists.length > 0">

                <div class="lineup-heading">
                  <span>LINEUP</span>
                  <h2>Artisti</h2>
                </div>

                <div class="lineup-grid">
                  <a
                    class="lineup-artist"
                    *ngFor="let artist of currentEvent.artists"
                    [routerLink]="['/artisti', artist.id]">

                    <div class="artist-circle">
                      <img
                        *ngIf="artist.image_url; else artistFallback"
                        [src]="artist.image_url"
                        [alt]="'Foto di ' + artist.name">

                      <ng-template #artistFallback>
                        <div class="artist-fallback">
                          {{ artist.name.charAt(0).toUpperCase() }}
                        </div>
                      </ng-template>
                    </div>

                    <strong>{{ artist.name }}</strong>
                    <small>Vedi artista →</small>
                  </a>
                </div>
              </section>

              <h2 class="description-title">Descrizione</h2>
              <p class="description">
                {{ currentEvent.description }}
              </p>
            </section>

            <section class="reviews-section">
              <div class="reviews-heading">
                <div>
                  <span class="eyebrow">COMMUNITY REVIEWS</span>
                  <h2>Recensioni</h2>
                </div>

                <div
                  class="average-rating"
                  *ngIf="currentEvent.average_rating !== null">
                  ★ {{ currentEvent.average_rating }} / 5
                </div>
              </div>

              <section class="card review-form-card" *ngIf="authService.isLoggedIn()">
                <h3>Lascia una recensione</h3>

                <p class="review-note">
                  Puoi recensire solo eventi già svolti a cui eri iscritto.
                </p>

                <form [formGroup]="reviewForm" (ngSubmit)="publishReview()">
                  <div class="field">
                    <label for="rating">Valutazione</label>
                    <select id="rating" formControlName="rating">
                      <option [ngValue]="5">★★★★★ — Eccezionale</option>
                      <option [ngValue]="4">★★★★☆ — Molto bello</option>
                      <option [ngValue]="3">★★★☆☆ — Buono</option>
                      <option [ngValue]="2">★★☆☆☆ — Migliorabile</option>
                      <option [ngValue]="1">★☆☆☆☆ — Deludente</option>
                    </select>
                  </div>

                  <div class="field">
                    <label for="comment">Commento</label>
                    <textarea
                      id="comment"
                      formControlName="comment"
                      placeholder="Racconta la tua esperienza durante l'evento..."></textarea>
                  </div>

                  <p *ngIf="reviewError()" class="error-message">
                    {{ reviewError() }}
                  </p>

                  <p *ngIf="reviewSuccess()" class="success-message">
                    {{ reviewSuccess() }}
                  </p>

                  <button
                    type="submit"
                    class="btn btn-primary publish-button"
                    [disabled]="reviewSaving()">
                    {{ reviewSaving() ? 'Pubblicazione...' : 'Pubblica recensione' }}
                  </button>
                </form>
              </section>

              <section class="card login-review" *ngIf="!authService.isLoggedIn()">
                <p>
                  <a routerLink="/login">Accedi</a>
                  per pubblicare una recensione.
                </p>
              </section>

              <p *ngIf="reviewsLoading()" class="reviews-loading">
                Caricamento recensioni...
              </p>

              <div
                class="reviews-list"
                *ngIf="!reviewsLoading() && reviews().length > 0">

                <article class="card review-card" *ngFor="let review of reviews()">
                  <div class="review-top">
                    <div class="author">
                      <div class="avatar">
                        {{ review.user.name.charAt(0).toUpperCase() }}
                      </div>

                      <div>
                        <strong>{{ review.user.name }}</strong>
                        <p class="stars">{{ stars(review.rating) }}</p>
                      </div>
                    </div>

                    <button
                      *ngIf="authService.isLoggedIn()"
                      type="button"
                      class="report-button"
                      (click)="reportReview(review)">
                      Segnala
                    </button>
                  </div>

                  <p class="review-comment">
                    {{ review.comment }}
                  </p>

                  <small>
                    {{ formatReviewDate(review.created_at) }}
                  </small>
                </article>
              </div>

              <div
                class="card empty-reviews"
                *ngIf="!reviewsLoading() && reviews().length === 0">
                Non ci sono ancora recensioni per questo evento.
              </div>
            </section>
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

            <p class="past-booking-note" *ngIf="isPastEvent(currentEvent.date)">
              Evento concluso. Puoi visualizzare i dettagli, la lineup e le recensioni,
              ma le iscrizioni sono chiuse.
            </p>

            <ng-container *ngIf="authService.isLoggedIn(); else loginRequired">
              <button
                type="button"
                class="btn btn-primary booking-button"
                [disabled]="bookingLoading() || currentEvent.available_places === 0 || isPastEvent(currentEvent.date)"
                (click)="bookEvent()">
                {{
                  isPastEvent(currentEvent.date)
                    ? 'Evento concluso'
                    : currentEvent.available_places === 0
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
      padding-bottom: 90px;
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
    }

    .cover-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, #08080c 0%, rgba(8,8,12,.6) 43%, rgba(8,8,12,.28) 100%);
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

    .lineup-section {
      margin-top: 34px;
      padding-bottom: 33px;
      border-bottom: 1px solid rgba(255,255,255,.08);
    }

    .lineup-heading span {
      display: block;
      margin-bottom: 12px;
      color: #c26eff;
      font-size: .7rem;
      font-weight: 700;
      letter-spacing: 3px;
    }

    .lineup-heading h2 {
      margin-bottom: 24px;
    }

    .lineup-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 22px;
    }

    .lineup-artist {
      width: 112px;
      display: grid;
      justify-items: center;
      gap: 10px;
      text-align: center;
    }

    .artist-circle {
      width: 88px;
      height: 88px;
      overflow: hidden;
      border-radius: 50%;
      border: 2px solid rgba(252,56,172,.38);
      transition: transform .2s, border-color .2s;
    }

    .lineup-artist:hover .artist-circle {
      transform: scale(1.06);
      border-color: #fc38ac;
    }

    .artist-circle img {
      position: static;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .artist-fallback {
      height: 100%;
      display: grid;
      place-items: center;
      font-size: 1.8rem;
      font-weight: 700;
      background: linear-gradient(135deg, #932cff, #fc38ac);
    }

    .lineup-artist strong {
      font-size: .92rem;
    }

    .lineup-artist small {
      color: #fc38ac;
      font-size: .76rem;
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

    .past-booking-note {
      margin: 0 0 20px;
      padding: 14px 15px;
      border: 1px solid rgba(112, 136, 157, .38);
      border-radius: 4px;
      color: #a8bdcf;
      background: rgba(91, 112, 131, .1);
      font-size: .91rem;
      line-height: 1.55;
    }

    .booking-button {
      width: 100%;
      margin-bottom: 12px;
      border: 0;
    }

    .booking-button:disabled,
    .publish-button:disabled {
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

    .reviews-section {
      margin-top: 42px;
    }

    .reviews-heading {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 18px;
      margin-bottom: 25px;
    }

    .eyebrow {
      display: block;
      margin-bottom: 12px;
      color: #c26eff;
      font-size: .71rem;
      font-weight: 700;
      letter-spacing: 3px;
    }

    .reviews-heading h2 {
      margin: 0;
      font-size: 2rem;
    }

    .average-rating {
      padding: 11px 16px;
      border-radius: 999px;
      color: #ffd45a;
      background: rgba(255,212,90,.1);
      font-weight: 700;
    }

    .review-form-card {
      padding: 29px;
      margin-bottom: 20px;
    }

    .review-form-card h3 {
      margin: 0 0 11px;
      font-size: 1.4rem;
    }

    .review-note {
      margin: 0 0 27px;
      color: #9796a7;
      line-height: 1.6;
    }

    .publish-button {
      border: 0;
    }

    .login-review {
      padding: 24px;
      margin-bottom: 20px;
      color: #a3a2b2;
    }

    .login-review p {
      margin: 0;
    }

    .login-review a {
      color: #fc38ac;
      font-weight: 700;
    }

    .reviews-loading {
      color: #a3a2b2;
    }

    .reviews-list {
      display: grid;
      gap: 16px;
    }

    .review-card {
      padding: 24px;
    }

    .review-top {
      display: flex;
      justify-content: space-between;
      gap: 18px;
      margin-bottom: 19px;
    }

    .author {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .avatar {
      width: 45px;
      height: 45px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: white;
      font-weight: 700;
      background: linear-gradient(125deg, #932cff, #fc38ac);
    }

    .stars {
      margin: 7px 0 0;
      color: #ffd45a;
      letter-spacing: 2px;
    }

    .report-button {
      align-self: start;
      border: 0;
      color: #a3a2b2;
      background: transparent;
      font-size: .86rem;
    }

    .report-button:hover {
      color: #fc78a8;
    }

    .review-comment {
      margin: 0 0 15px;
      color: #dddce6;
      line-height: 1.7;
    }

    .review-card small {
      color: #898899;
    }

    .empty-reviews {
      padding: 38px 22px;
      color: #9c9bab;
      text-align: center;
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
      .ticket-card,
      .review-form-card {
        padding: 24px;
      }

      .facts {
        grid-template-columns: 1fr;
      }

      .reviews-heading {
        display: block;
      }

      .average-rating {
        display: inline-flex;
        margin-top: 18px;
      }
    }
  `]
})
export class EventDetailComponent implements OnInit {
  event = signal<EventItem | null>(null);
  reviews = signal<Review[]>([]);
  loading = signal(true);
  reviewsLoading = signal(true);
  error = signal('');
  bookingLoading = signal(false);
  bookingError = signal('');
  bookingSuccess = signal('');
  reviewSaving = signal(false);
  reviewError = signal('');
  reviewSuccess = signal('');

  reviewForm = new FormGroup({
    rating: new FormControl(5, { nonNullable: true }),
    comment: new FormControl('', { nonNullable: true })
  });

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private bookingService: BookingService,
    private reviewService: ReviewService,
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
    this.loadReviews(eventId);
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

  loadReviews(eventId: number): void {
    this.reviewsLoading.set(true);

    this.reviewService.getEventReviews(eventId).subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.reviewsLoading.set(false);
      },
      error: () => {
        this.reviews.set([]);
        this.reviewsLoading.set(false);
      }
    });
  }

  isPastEvent(date: string): boolean {
    return new Date(date).getTime() < Date.now();
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

  publishReview(): void {
    const currentEvent = this.event();
    const values = this.reviewForm.getRawValue();
    const comment = values.comment.trim();

    if (!currentEvent) {
      return;
    }

    this.reviewError.set('');
    this.reviewSuccess.set('');

    if (!comment || comment.length < 3) {
      this.reviewError.set('Scrivi un commento di almeno 3 caratteri.');
      return;
    }

    this.reviewSaving.set(true);

    this.reviewService.createReview(currentEvent.id, {
      rating: values.rating,
      comment
    }).subscribe({
      next: () => {
        this.reviewSaving.set(false);
        this.reviewSuccess.set('Recensione pubblicata correttamente.');
        this.reviewForm.patchValue({
          rating: 5,
          comment: ''
        });
        this.loadReviews(currentEvent.id);
        this.loadEvent(currentEvent.id);
      },
      error: (response) => {
        this.reviewSaving.set(false);
        this.reviewError.set(
          response.error?.message || 'Non è stato possibile pubblicare la recensione.'
        );
      }
    });
  }

  reportReview(review: Review): void {
    if (!window.confirm('Vuoi segnalare questa recensione all amministratore?')) {
      return;
    }

    this.reviewError.set('');
    this.reviewSuccess.set('');

    this.reviewService.reportReview(review.id).subscribe({
      next: () => {
        this.reviewSuccess.set('Recensione segnalata all amministratore.');

        const currentEvent = this.event();

        if (currentEvent) {
          this.loadReviews(currentEvent.id);
          this.loadEvent(currentEvent.id);
        }
      },
      error: (response) => {
        this.reviewError.set(
          response.error?.message || 'Non è stato possibile segnalare la recensione.'
        );
      }
    });
  }

  stars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
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

  formatReviewDate(date: string): string {
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  }
}
