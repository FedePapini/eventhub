import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { EventItem } from '../../models/event.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, CurrencyPipe, ReactiveFormsModule, RouterLink],
  template: `
    <section class="hero">
      <div class="hero-light hero-light-one"></div>
      <div class="hero-light hero-light-two"></div>

      <div class="container hero-grid">
        <div class="hero-copy">
          <span class="eyebrow">ELECTRONIC HOUSE EVENTS</span>
          <h1>
            Find your next
            <span class="gradient-text">beat.</span>
          </h1>
          <p>
            Vivi le migliori notti house, deep house e tech house
            nelle location più esclusive d'Italia.
          </p>

          <div class="hero-buttons">
            <a href="#events" class="btn btn-primary">Scopri gli eventi</a>
            <a routerLink="/register" class="btn btn-outline">Crea account</a>
          </div>
        </div>

        <div class="pulse-card">
          <div class="pulse-title">NEXT DROP</div>
          <div class="wave">
            <span *ngFor="let bar of bars" [style.height.px]="bar"></span>
          </div>
          <strong>House experience</strong>
          <small>Music · Lights · Community</small>
        </div>
      </div>
    </section>

    <section class="events-section" id="events">
      <div class="container">
        <div class="section-heading">
          <div>
            <span class="eyebrow">UPCOMING NIGHTS</span>
            <h2>Prossimi eventi</h2>
          </div>
        </div>

        <form class="filters card" [formGroup]="filtersForm" (ngSubmit)="searchEvents()">
          <input type="text" formControlName="search" placeholder="Cerca evento...">
          <select formControlName="category">
            <option value="">Tutti i generi</option>
            <option value="House">House</option>
            <option value="Deep House">Deep House</option>
            <option value="Tech House">Tech House</option>
            <option value="Classic House">Classic House</option>
          </select>
          <input type="text" formControlName="city" placeholder="Città">
          <button type="submit" class="btn btn-primary">Cerca</button>
        </form>

        <p class="error-message" *ngIf="error">{{ error }}</p>

        <div class="event-grid" *ngIf="events.length; else noEvents">
          <article class="event-card card" *ngFor="let event of events">
            <div class="event-cover">
              <div class="cover-gradient"></div>
              <span class="badge">{{ event.category }}</span>
              <div class="music-icon">♫</div>
            </div>

            <div class="event-body">
              <p class="event-date">{{ event.date | date:'EEEE d MMMM · HH:mm':'':'it-IT' }}</p>
              <h3>{{ event.title }}</h3>
              <p class="place">{{ event.location }} · {{ event.city }}</p>

              <div class="event-footer">
                <strong>{{ event.price | currency:'EUR':'symbol':'1.0-2':'it-IT' }}</strong>
                <a class="details" [routerLink]="['/eventi', event.id]">
                  Dettagli →
                </a>
              </div>
            </div>
          </article>
        </div>

        <ng-template #noEvents>
          <div class="empty-state card">
            Nessun evento trovato con questi filtri.
          </div>
        </ng-template>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      position: relative;
      overflow: hidden;
      min-height: 600px;
      display: grid;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,.06);
    }

    .hero-light {
      position: absolute;
      filter: blur(90px);
      border-radius: 50%;
      pointer-events: none;
    }

    .hero-light-one {
      width: 400px;
      height: 400px;
      right: 12%;
      top: 30px;
      background: rgba(147, 44, 255, .28);
    }

    .hero-light-two {
      width: 340px;
      height: 340px;
      right: 2%;
      bottom: 30px;
      background: rgba(252, 56, 172, .16);
    }

    .hero-grid {
      position: relative;
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 72px;
      align-items: center;
      padding-top: 55px;
      padding-bottom: 55px;
    }

    .eyebrow {
      display: block;
      margin-bottom: 20px;
      font-size: .76rem;
      font-weight: 700;
      letter-spacing: 3px;
      color: #c26eff;
    }

    h1 {
      max-width: 650px;
      margin: 0 0 23px;
      font-size: clamp(4.2rem, 8vw, 6.6rem);
      line-height: .92;
      letter-spacing: -5px;
    }

    .hero-copy p {
      max-width: 540px;
      margin: 0 0 36px;
      color: #a2a1b2;
      font-size: 1.1rem;
      line-height: 1.7;
    }

    .hero-buttons {
      display: flex;
      gap: 14px;
    }

    .pulse-card {
      position: relative;
      padding: 38px 34px;
      min-height: 320px;
      border-radius: 34px;
      background: rgba(255,255,255,.045);
      border: 1px solid rgba(255,255,255,.1);
      box-shadow: 0 24px 90px rgba(147,44,255,.2);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .pulse-title {
      position: absolute;
      top: 28px;
      font-size: .72rem;
      letter-spacing: 3px;
      color: #8c8b9d;
    }

    .wave {
      display: flex;
      height: 115px;
      gap: 7px;
      align-items: center;
      margin-bottom: 30px;
    }

    .wave span {
      display: block;
      width: 9px;
      border-radius: 20px;
      background: linear-gradient(#932cff, #fc38ac);
    }

    .pulse-card strong {
      font-size: 1.45rem;
    }

    .pulse-card small {
      margin-top: 9px;
      color: #9090a2;
    }

    .events-section {
      padding: 70px 0 85px;
    }

    .section-heading h2 {
      margin: 0 0 34px;
      font-size: clamp(2rem, 4vw, 2.7rem);
    }

    .filters {
      display: grid;
      grid-template-columns: 2fr 1.2fr 1.2fr auto;
      gap: 12px;
      padding: 15px;
      margin-bottom: 37px;
    }

    .filters input,
    .filters select {
      min-height: 49px;
      padding: 0 17px;
      color: white;
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 999px;
      outline: none;
      background: #181822;
    }

    .event-grid {
      display: grid;
      gap: 23px;
      grid-template-columns: repeat(3, 1fr);
    }

    .event-card {
      overflow: hidden;
      transition: transform .2s, border-color .2s;
    }

    .event-card:hover {
      transform: translateY(-5px);
      border-color: rgba(147,44,255,.45);
    }

    .event-cover {
      position: relative;
      height: 208px;
      padding: 18px;
      overflow: hidden;
      background:
        radial-gradient(circle at 70% 30%, rgba(252,56,172,.35), transparent 33%),
        radial-gradient(circle at 30% 60%, rgba(39,226,233,.18), transparent 25%),
        #10101c;
    }

    .cover-gradient {
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        90deg,
        transparent 0 18px,
        rgba(147,44,255,.07) 18px 20px
      );
    }

    .music-icon {
      position: absolute;
      right: 26px;
      bottom: 18px;
      font-size: 4rem;
      color: rgba(255,255,255,.16);
    }

    .event-body {
      padding: 22px;
    }

    .event-date {
      color: #c26eff;
      margin: 0 0 12px;
      font-size: .8rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    h3 {
      margin: 0 0 9px;
      font-size: 1.3rem;
    }

    .place {
      color: #9595a7;
      min-height: 42px;
      margin: 0 0 18px;
    }

    .event-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 18px;
      border-top: 1px solid rgba(255,255,255,.08);
    }

    .event-footer strong {
      font-size: 1.25rem;
    }

    .details {
      color: #fc38ac;
      font-weight: 700;
    }

    @media (max-width: 950px) {
      .hero-grid {
        grid-template-columns: 1fr;
      }

      .pulse-card {
        display: none;
      }

      .event-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .filters {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 620px) {
      .hero {
        min-height: auto;
      }

      .hero-grid {
        padding-top: 70px;
        padding-bottom: 70px;
      }

      h1 {
        letter-spacing: -3px;
      }

      .hero-buttons,
      .filters {
        display: grid;
        grid-template-columns: 1fr;
      }

      .event-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  events: EventItem[] = [];
  error = '';
  bars = [24, 48, 84, 57, 102, 44, 71, 96, 38, 63, 89, 43, 28];

  filtersForm = new FormGroup({
    search: new FormControl('', { nonNullable: true }),
    category: new FormControl('', { nonNullable: true }),
    city: new FormControl('', { nonNullable: true })
  });

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.searchEvents();
  }

  searchEvents(): void {
    this.error = '';

    this.eventService.getEvents(this.filtersForm.getRawValue()).subscribe({
      next: (events) => {
        this.events = events;
      },
      error: () => {
        this.error = 'Non è stato possibile caricare gli eventi. Controlla che il backend sia acceso.';
      }
    });
  }
}
