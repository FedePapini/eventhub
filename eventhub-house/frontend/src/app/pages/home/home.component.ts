import { Component, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { EventItem } from '../../models/event.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, RouterLink],
  template: `
    <section class="hero">
      <div class="blue-haze"></div>
      <div class="poster-frame"></div>

      <div class="spark spark-left">✦</div>
      <div class="spark spark-right">✦</div>

      <div class="hero-top-label hero-label-left">
        <span class="tiny-star">✦</span>
        ELECTRONIC HOUSE
      </div>

      <div class="hero-top-label hero-label-right">
        EUROPEAN NIGHTS
      </div>

      <div class="orbit orbit-one"></div>
      <div class="orbit orbit-two"></div>

      <div class="wire-globe" aria-hidden="true">
        <span class="globe-line line-a"></span>
        <span class="globe-line line-b"></span>
        <span class="globe-line line-c"></span>
        <span class="globe-line line-d"></span>
      </div>

      <div class="container hero-grid">
        <div class="hero-copy">
          <span class="eyebrow">REFLECTION / HOUSE CULTURE / 2026</span>

          <h1 class="chrome-title">
            <span class="chrome-word">Find your</span>
            <span class="chrome-word">next beat.</span>
          </h1>

          <p>
            Vivi le migliori notti house, deep house e tech house
            nelle location più esclusive d'Europa.
          </p>

          <div class="hero-buttons">
            <a href="#events" class="btn btn-primary">
              <span>Scopri gli eventi</span>
              <span class="button-arrow">→</span>
            </a>

            <a routerLink="/register" class="btn btn-outline">
              Crea account
            </a>
          </div>
        </div>

        <aside class="tech-panel">
          <div class="panel-caption">NEXT DROP</div>

          <div class="equalizer">
            <span *ngFor="let bar of bars" [style.height.px]="bar"></span>
          </div>

          <strong class="chrome-mini">HOUSE</strong>
          <small>Music · Lights · Community</small>

          <div class="panel-code">
            <span>LIVE</span>
            <span>EU / 026</span>
          </div>
        </aside>
      </div>

      <div class="hero-footer-strip">
        <span>90'S SUPERGRAPHICS</span>
        <span class="dots">············</span>
        <span>WELCOME TO EVENTHUB</span>
      </div>
    </section>

    <section class="events-section" id="events">
      <div class="container">
        <header class="section-heading">
          <div>
            <span class="eyebrow">UPCOMING NIGHTS / SELECT YOUR FREQUENCY</span>
            <h2>
              Prossimi <span class="chrome-section">eventi</span>
            </h2>
          </div>

          <span class="section-index">01 / EVENTS</span>
        </header>

        <form
          class="filters card"
          [formGroup]="filtersForm"
          (ngSubmit)="searchEvents()">

          <input
            type="text"
            formControlName="search"
            placeholder="CERCA EVENTO">

          <select formControlName="category">
            <option value="">TUTTI I GENERI</option>
            <option value="House">HOUSE</option>
            <option value="Deep House">DEEP HOUSE</option>
            <option value="Tech House">TECH HOUSE</option>
            <option value="Classic House">CLASSIC HOUSE</option>
            <option value="Progressive House">PROGRESSIVE HOUSE</option>
          </select>

          <input
            type="text"
            formControlName="city"
            placeholder="CITTÀ">

          <button type="submit" class="btn btn-primary">
            Cerca
          </button>
        </form>

        <p class="loading" *ngIf="loading()">
          Caricamento eventi...
        </p>

        <p class="error-message" *ngIf="error()">
          {{ error() }}
        </p>

        <div
          class="event-grid"
          *ngIf="!loading() && events().length > 0">

          <article class="event-card card" *ngFor="let event of events(); let index = index">
            <div class="card-index">
              {{ formatIndex(index + 1) }}
            </div>

            <div class="event-cover">
              <img
                *ngIf="event.image_url; else defaultCover"
                [src]="event.image_url"
                [alt]="'Locandina ' + event.title">

              <ng-template #defaultCover>
                <div class="default-cover">
                  <div class="cover-orbit"></div>
                  <div class="cover-star">✦</div>
                  <div class="cover-title">HOUSE</div>
                </div>
              </ng-template>

              <div class="image-overlay"></div>

              <span class="badge category-badge">
                {{ event.category }}
              </span>
            </div>

            <div class="event-body">
              <p class="event-date">
                {{ formatDate(event.date) }}
              </p>

              <h3>{{ event.title }}</h3>

              <p class="place">
                {{ event.location }} · {{ event.city }}
              </p>

              <div class="event-footer">
                <strong>{{ formatPrice(event.price) }}</strong>

                <a
                  class="details"
                  [routerLink]="['/eventi', event.id]">
                  Dettagli <span>→</span>
                </a>
              </div>
            </div>
          </article>
        </div>

        <div
          class="empty-state card"
          *ngIf="!loading() && events().length === 0 && !error()">
          Nessun evento trovato con questi filtri.
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      position: relative;
      min-height: min(820px, calc(100vh - 76px));
      overflow: hidden;
      display: grid;
      align-items: center;
      background: #020305;
      border-bottom: 1px solid rgba(92, 110, 128, .22);
    }

    .blue-haze {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        radial-gradient(circle at 71% 23%, rgba(92, 116, 140, .07), transparent 20%),
        radial-gradient(circle at 28% 70%, rgba(39, 60, 79, .07), transparent 26%);
    }

    .poster-frame {
      position: absolute;
      inset: 28px;
      border-left: 1px solid rgba(90, 119, 143, .38);
      border-right: 1px solid rgba(90, 119, 143, .38);
      pointer-events: none;
    }

    .poster-frame::before,
    .poster-frame::after {
      content: '';
      position: absolute;
      top: 0;
      width: 175px;
      border-top: 1px solid rgba(90, 119, 143, .38);
    }

    .poster-frame::before {
      left: 0;
    }

    .poster-frame::after {
      right: 0;
    }

    .spark {
      position: absolute;
      z-index: 2;
      color: #88a9c4;
      font-size: 2rem;
      filter: drop-shadow(0 0 7px rgba(75, 98, 118, .3));
      animation: star-pulse 3.2s ease-in-out infinite;
    }

    .spark-left {
      top: 34px;
      left: 20px;
    }

    .spark-right {
      top: 34px;
      right: 20px;
      animation-delay: 1.1s;
    }

    @keyframes star-pulse {
      0%, 100% {
        opacity: .62;
        transform: scale(.92);
      }

      50% {
        opacity: 1;
        transform: scale(1.12);
      }
    }

    .hero-top-label {
      position: absolute;
      top: 44px;
      z-index: 2;
      font-family: 'Orbitron', Arial, sans-serif;
      color: #7597b1;
      font-size: clamp(.7rem, 1.3vw, .94rem);
      font-weight: 700;
      letter-spacing: 4px;
    }

    .hero-label-left {
      left: 77px;
    }

    .hero-label-right {
      right: 74px;
      padding: 12px 28px;
      border-radius: 999px;
      border: 1px solid rgba(98, 126, 148, .44);
      background: rgba(20, 26, 32, .2);
    }

    .tiny-star {
      margin-right: 12px;
    }

    .orbit {
      position: absolute;
      pointer-events: none;
      border: 1px solid rgba(93, 120, 143, .38);
      border-radius: 50%;
    }

    .orbit-one {
      width: 920px;
      height: 290px;
      right: 96px;
      bottom: 128px;
      transform: rotate(-18deg);
    }

    .orbit-two {
      width: 690px;
      height: 230px;
      right: 218px;
      bottom: 208px;
      transform: rotate(-18deg);
      border-color: rgba(93, 120, 143, .18);
    }

    .wire-globe {
      position: absolute;
      right: 20%;
      top: 128px;
      width: 150px;
      height: 150px;
      border: 1px solid rgba(107, 136, 159, .42);
      border-radius: 50%;
      overflow: hidden;
      transform: rotate(-10deg);
      box-shadow: none;
    }

    .wire-globe::before,
    .wire-globe::after {
      content: '';
      position: absolute;
      inset: 22px 0;
      border-top: 1px solid rgba(107, 136, 159, .38);
      border-bottom: 1px solid rgba(107, 136, 159, .38);
      border-radius: 50%;
    }

    .wire-globe::after {
      inset: 49px 0;
    }

    .globe-line {
      position: absolute;
      inset: 0;
      border-left: 1px solid rgba(107, 136, 159, .38);
      border-right: 1px solid rgba(107, 136, 159, .38);
      border-radius: 50%;
    }

    .line-a {
      inset: 0 35px;
    }

    .line-b {
      inset: 0 53px;
    }

    .line-c {
      inset: 15px 0;
    }

    .line-d {
      inset: 33px 0;
    }

    .hero-grid {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: minmax(550px, 1fr) 300px;
      gap: 58px;
      align-items: end;
      padding-top: 124px;
      padding-bottom: 108px;
    }

    .eyebrow {
      display: block;
      margin-bottom: 21px;
      font-family: 'Orbitron', Arial, sans-serif;
      font-size: .64rem;
      font-weight: 700;
      letter-spacing: 3.5px;
      color: #7899b1;
    }

    .chrome-title {
      max-width: 790px;
      margin: 0 0 29px;
      font-size: clamp(4.6rem, 8.8vw, 7.7rem);
      line-height: .84;
      letter-spacing: -6px;
    }

    .chrome-word {
      display: block;
      color: transparent;
      background:
        linear-gradient(
          112deg,
          #425261 0%,
          #f7fdff 10%,
          #677a8b 21%,
          #fff 32%,
          #738799 39%,
          #f5fcff 49%,
          #49677d 61%,
          #edfaff 73%,
          #078bff 86%,
          #eaffff 100%
        );
      background-size: 280% 100%;
      background-clip: text;
      -webkit-background-clip: text;
      filter: drop-shadow(0 0 10px rgba(55,181,255,.12));
      animation: liquid-metal 5.7s linear infinite;
    }

    .chrome-word:last-child {
      animation-delay: -.8s;
    }

    @keyframes liquid-metal {
      from {
        background-position: 260% center;
      }

      to {
        background-position: -20% center;
      }
    }

    .hero-copy p {
      max-width: 600px;
      margin: 0 0 39px;
      color: #94b0c7;
      font-size: 1.08rem;
      line-height: 1.75;
    }

    .hero-buttons {
      display: flex;
      gap: 15px;
    }

    .button-arrow {
      font-size: 1.15rem;
    }

    .tech-panel {
      position: relative;
      min-height: 335px;
      padding: 28px 25px;
      display: flex;
      flex-direction: column;
      justify-content: end;
      border: 1px solid rgba(96, 124, 146, .34);
      border-radius: 3px 28px 3px 3px;
      background:
        linear-gradient(155deg, rgba(17, 23, 30, .52), rgba(2,3,5,.82));
      box-shadow: none;
    }

    .tech-panel::before {
      content: '';
      position: absolute;
      top: 58px;
      right: -1px;
      width: 1px;
      height: 98px;
      background: #718fa8;
      box-shadow: none;
    }

    .panel-caption {
      position: absolute;
      top: 25px;
      font-family: 'Orbitron', Arial, sans-serif;
      color: #7899b1;
      font-size: .61rem;
      font-weight: 700;
      letter-spacing: 3px;
    }

    .equalizer {
      display: flex;
      height: 92px;
      gap: 6px;
      align-items: end;
      margin-bottom: 27px;
    }

    .equalizer span {
      display: block;
      width: 7px;
      border-radius: 1px;
      background: linear-gradient(to top, #355068, #a5bfce);
      box-shadow: none;
      animation: equalizer-shimmer 2.6s ease-in-out infinite alternate;
    }

    .equalizer span:nth-child(odd) {
      animation-delay: -.8s;
    }

    @keyframes equalizer-shimmer {
      to {
        opacity: .45;
        filter: brightness(.8);
      }
    }

    .chrome-mini {
      font-family: 'Orbitron', Arial, sans-serif;
      font-size: 1.6rem;
      color: transparent;
      background: linear-gradient(100deg, #7d91a5, white, #1e9eff, white);
      background-size: 220%;
      background-clip: text;
      animation: liquid-metal 5s linear infinite;
    }

    .tech-panel small {
      margin-top: 10px;
      color: #7e9bb4;
    }

    .panel-code {
      position: absolute;
      right: 13px;
      top: 25px;
      display: grid;
      gap: 5px;
      writing-mode: vertical-rl;
      color: #718fa8;
      font-family: 'Orbitron', Arial, sans-serif;
      font-size: .52rem;
      letter-spacing: 2px;
    }

    .hero-footer-strip {
      position: absolute;
      bottom: 37px;
      left: 70px;
      right: 70px;
      z-index: 2;
      display: flex;
      justify-content: space-between;
      color: #7899b1;
      font-family: 'Orbitron', Arial, sans-serif;
      font-size: .68rem;
      font-weight: 700;
      letter-spacing: 3px;
    }

    .dots {
      letter-spacing: 6px;
    }

    .events-section {
      padding: 78px 0 92px;
      background:
        linear-gradient(180deg, rgba(59, 77, 94, .06), transparent 120px),
        var(--background);
    }

    .section-heading {
      display: flex;
      justify-content: space-between;
      align-items: end;
      gap: 25px;
      margin-bottom: 40px;
    }

    .section-heading h2 {
      margin: 0;
      font-size: clamp(2.6rem, 5vw, 3.7rem);
      letter-spacing: -2px;
    }

    .chrome-section {
      color: transparent;
      background:
        linear-gradient(110deg, #61788b, #fff, #1e9eff, #e9faff);
      background-size: 220%;
      background-clip: text;
      animation: liquid-metal 5.5s linear infinite;
    }

    .section-index {
      padding: 11px 16px;
      color: #7899b1;
      border: 1px solid rgba(94, 119, 140, .42);
      font-family: 'Orbitron', Arial, sans-serif;
      font-size: .6rem;
      letter-spacing: 2px;
    }

    .filters {
      position: relative;
      display: grid;
      grid-template-columns: 2fr 1.2fr 1.2fr auto;
      gap: 12px;
      padding: 17px;
      margin-bottom: 47px;
      border-radius: 4px;
    }

    .filters::before {
      content: 'FILTER / SEARCH';
      position: absolute;
      top: -22px;
      right: 0;
      color: rgba(55,181,255,.72);
      font-family: 'Orbitron', Arial, sans-serif;
      font-size: .52rem;
      letter-spacing: 2px;
    }

    .filters input,
    .filters select {
      min-height: 59px;
      padding: 0 21px;
      color: white;
      border: 1px solid rgba(27,142,255,.23);
      border-radius: 3px;
      outline: none;
      background: #070d14;
      font-size: .88rem;
    }

    .filters input::placeholder {
      color: #6f8ba4;
    }

    .filters input:focus,
    .filters select:focus {
      border-color: #8aa4b9;
      box-shadow: inset 0 0 0 1px rgba(130, 154, 174, .14);
    }

    .filters .btn {
      min-height: 59px;
      border-radius: 3px;
      padding: 0 32px;
    }

    .loading {
      margin: 35px 0;
      color: var(--muted);
      font-size: 1.05rem;
    }

    .event-grid {
      display: grid;
      gap: 25px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .event-card {
      position: relative;
      overflow: hidden;
      border-radius: 3px 26px 3px 3px;
      transition: transform .22s, border-color .22s, box-shadow .22s;
    }

    .event-card:hover {
      transform: translateY(-5px);
      border-color: rgba(121, 148, 169, .6);
      box-shadow: 0 22px 54px rgba(0, 0, 0, .28);
    }

    .card-index {
      position: absolute;
      z-index: 3;
      top: 18px;
      right: 18px;
      color: #7899b1;
      font-family: 'Orbitron', Arial, sans-serif;
      font-size: .6rem;
      letter-spacing: 2px;
    }

    .event-cover {
      position: relative;
      height: 252px;
      overflow: hidden;
      background: #04070d;
      border-bottom: 1px solid rgba(91, 112, 131, .3);
    }

    .event-cover img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
      object-position: center;
      filter: saturate(.85) contrast(1.06);
    }

    .default-cover {
      position: absolute;
      inset: 0;
      overflow: hidden;
      background:
        linear-gradient(135deg, rgba(83, 106, 126, .1), transparent 55%),
        #04070d;
    }

    .cover-orbit {
      position: absolute;
      width: 300px;
      height: 105px;
      top: 72px;
      left: 28px;
      transform: rotate(-18deg);
      border: 1px solid rgba(102, 129, 151, .42);
      border-radius: 50%;
    }

    .cover-star {
      position: absolute;
      top: 34px;
      right: 45px;
      color: #7899b1;
      font-size: 2rem;
      text-shadow: 0 0 15px rgba(0,132,255,.72);
    }

    .cover-title {
      position: absolute;
      bottom: 26px;
      left: 25px;
      color: transparent;
      background: linear-gradient(100deg, #648097, white, #168eff, #fff);
      background-clip: text;
      font-family: 'Orbitron', Arial, sans-serif;
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: 4px;
    }

    .image-overlay {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(to top, rgba(2,3,5,.7), transparent 54%),
        linear-gradient(to right, rgba(0,80,150,.11), transparent);
    }

    .category-badge {
      position: absolute;
      z-index: 2;
      top: 18px;
      left: 18px;
    }

    .event-body {
      padding: 25px 25px 23px;
    }

    .event-date {
      color: #7899b1;
      margin: 0 0 15px;
      font-family: 'Orbitron', Arial, sans-serif;
      font-size: .62rem;
      font-weight: 700;
      letter-spacing: 1.3px;
      text-transform: uppercase;
    }

    .event-body h3 {
      margin: 0 0 11px;
      font-size: 1.44rem;
      color: #ecf5ff;
    }

    .place {
      color: #829eb8;
      min-height: 42px;
      margin: 0 0 20px;
      font-size: .98rem;
    }

    .event-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 20px;
      border-top: 1px solid rgba(91, 112, 131, .28);
    }

    .event-footer strong {
      font-size: 1.32rem;
      color: #eaf6ff;
    }

    .details {
      color: #7899b1;
      font-weight: 700;
      font-size: .92rem;
    }

    .details span {
      margin-left: 5px;
    }

    .empty-state {
      padding: 62px 20px;
      border-radius: 4px;
      text-align: center;
      color: var(--muted);
      font-size: 1.05rem;
    }

    @media (max-width: 1100px) {
      .wire-globe,
      .orbit-one,
      .orbit-two {
        opacity: .42;
      }

      .hero-grid {
        grid-template-columns: 1fr;
      }

      .tech-panel {
        display: none;
      }
    }

    @media (max-width: 1000px) {
      .event-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .filters {
        grid-template-columns: repeat(2, 1fr);
      }

      .hero-footer-strip {
        display: none;
      }
    }

    @media (max-width: 680px) {
      .poster-frame,
      .wire-globe,
      .hero-label-right,
      .orbit {
        display: none;
      }

      .hero {
        min-height: auto;
      }

      .hero-grid {
        padding-top: 104px;
        padding-bottom: 72px;
      }

      .hero-label-left {
        left: 28px;
      }

      .chrome-title {
        font-size: clamp(3.3rem, 18vw, 4.5rem);
        letter-spacing: -3px;
      }

      .hero-buttons,
      .filters {
        display: grid;
        grid-template-columns: 1fr;
      }

      .section-heading {
        display: block;
      }

      .section-index {
        display: inline-flex;
        margin-top: 24px;
      }

      .event-grid {
        grid-template-columns: 1fr;
      }

      .event-cover {
        height: 245px;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  events = signal<EventItem[]>([]);
  loading = signal(true);
  error = signal('');

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
    this.loading.set(true);
    this.error.set('');

    this.eventService.getEvents(this.filtersForm.getRawValue()).subscribe({
      next: (events) => {
        this.events.set(events);
        this.loading.set(false);
      },
      error: () => {
        this.events.set([]);
        this.loading.set(false);
        this.error.set(
          'Non è stato possibile caricare gli eventi. Controlla che il backend sia acceso.'
        );
      }
    });
  }

  formatIndex(index: number): string {
    return index.toString().padStart(2, '0');
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2
    }).format(price);
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }
}
