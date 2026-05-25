import { Component, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as QRCode from 'qrcode';
import { BookingService } from '../../core/services/booking.service';
import { Ticket } from '../../models/event.model';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  template: `
    <section class="tickets-page page">
      <div class="container">
        <header class="page-heading">
          <span class="eyebrow">YOUR PASSES / ACCESS CONTROL</span>
          <h1>I miei <span class="gradient-text">biglietti</span></h1>
          <p>Mostra il QR code all'ingresso dell'evento.</p>
        </header>

        <p *ngIf="loading()" class="loading">
          Caricamento biglietti...
        </p>

        <p *ngIf="error()" class="error-message">
          {{ error() }}
        </p>

        <p *ngIf="success()" class="success-message">
          {{ success() }}
        </p>

        <div class="tickets-grid" *ngIf="!loading() && tickets().length > 0">
          <article class="ticket card" *ngFor="let ticket of tickets(); let index = index">
            <div class="ticket-cover">
              <img
                *ngIf="ticket.event.image_url; else fallbackCover"
                [src]="ticket.event.image_url"
                [alt]="'Locandina ' + ticket.event.title">

              <ng-template #fallbackCover>
                <div class="fallback-cover">
                  <div class="fallback-orbit"></div>
                  <span class="fallback-star">✦</span>
                  <strong>HOUSE</strong>
                </div>
              </ng-template>

              <div class="cover-overlay"></div>

              <div class="ticket-cover-top">
                <span class="badge">DIGITAL TICKET</span>
                <span class="ticket-number">
                  {{ formatIndex(index + 1) }} / PASS
                </span>
              </div>

              <div class="ticket-title">
                <h2>{{ ticket.event.title }}</h2>
                <p>{{ ticket.event.location }} · {{ ticket.event.city }}</p>
              </div>
            </div>

            <div class="perforation">
              <span></span>
            </div>

            <div class="ticket-body">
              <div class="qr-box">
                <img
                  *ngIf="qrImages()[ticket.id]"
                  [src]="qrImages()[ticket.id]"
                  [alt]="'QR code ' + ticket.event.title">
              </div>

              <div class="ticket-info">
                <span>DATA EVENTO</span>
                <strong>{{ formatDate(ticket.event.date) }}</strong>

                <span>PREZZO</span>
                <strong>{{ formatPrice(ticket.event.price) }}</strong>

                <span>CODICE BIGLIETTO</span>
                <code>{{ ticket.qr_code }}</code>
              </div>
            </div>

            <div class="ticket-actions">
              <a
                class="btn btn-outline"
                [routerLink]="['/eventi', ticket.event.id]">
                Dettaglio evento
              </a>

              <button
                type="button"
                class="cancel-button"
                (click)="cancelBooking(ticket.event.id)">
                Annulla iscrizione
              </button>
            </div>
          </article>
        </div>

        <div
          class="empty-state card"
          *ngIf="!loading() && tickets().length === 0 && !error()">
          <h2>Nessun biglietto</h2>
          <p>Non sei ancora iscritto a nessun evento.</p>
          <a routerLink="/" class="btn btn-primary">
            Scopri gli eventi
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .tickets-page {
      min-height: calc(100vh - 82px);
      background:
        linear-gradient(180deg, rgba(10, 30, 50, .16), transparent 220px),
        var(--background);
    }

    .page-heading {
      margin-bottom: 43px;
    }

    .eyebrow {
      display: block;
      margin-bottom: 16px;
      color: #298edc;
      font-family: 'Orbitron', Arial, sans-serif;
      font-size: .62rem;
      font-weight: 700;
      letter-spacing: 3px;
    }

    h1 {
      margin: 0 0 12px;
      font-size: clamp(2.8rem, 6vw, 4rem);
    }

    .page-heading p {
      margin: 0;
      color: #839bb0;
      font-size: 1.05rem;
    }

    .loading {
      color: #839bb0;
      font-size: 1.05rem;
    }

    .tickets-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 26px;
    }

    .ticket {
      position: relative;
      overflow: hidden;
      border-radius: 3px 28px 3px 3px;
      border-color: rgba(25, 111, 184, .42);
      background: #04070b;
      transition: border-color .2s, transform .2s;
    }

    .ticket:hover {
      transform: translateY(-3px);
      border-color: rgba(36, 134, 214, .68);
    }

    .ticket-cover {
      position: relative;
      height: 270px;
      overflow: hidden;
      background: #05080d;
    }

    .ticket-cover > img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
      object-position: center;
      filter: saturate(.88) contrast(1.06);
    }

    .fallback-cover {
      position: absolute;
      inset: 0;
      overflow: hidden;
      background:
        radial-gradient(circle at 80% 20%, rgba(16, 100, 178, .18), transparent 34%),
        #04070c;
    }

    .fallback-orbit {
      position: absolute;
      width: 430px;
      height: 125px;
      left: 44px;
      top: 86px;
      transform: rotate(-18deg);
      border: 1px solid rgba(30, 126, 205, .5);
      border-radius: 50%;
    }

    .fallback-star {
      position: absolute;
      right: 42px;
      top: 51px;
      color: #2184d6;
      font-size: 1.8rem;
    }

    .fallback-cover strong {
      position: absolute;
      left: 30px;
      bottom: 27px;
      font-family: 'Orbitron', Arial, sans-serif;
      font-size: 2rem;
      letter-spacing: 4px;
      color: #dbe7f2;
    }

    .cover-overlay {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(to top, rgba(2,3,5,.9) 0%, rgba(2,3,5,.4) 43%, rgba(2,3,5,.3)),
        linear-gradient(to right, rgba(2,3,5,.48), transparent 60%);
    }

    .ticket-cover-top {
      position: absolute;
      z-index: 2;
      top: 25px;
      left: 27px;
      right: 25px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 17px;
    }

    .ticket-number {
      color: #4398dc;
      font-family: 'Orbitron', Arial, sans-serif;
      font-size: .57rem;
      font-weight: 700;
      letter-spacing: 2px;
    }

    .ticket-title {
      position: absolute;
      z-index: 2;
      left: 28px;
      right: 28px;
      bottom: 29px;
    }

    .ticket-title h2 {
      margin: 0 0 9px;
      font-size: clamp(1.4rem, 3vw, 1.75rem);
      color: #f2f7fd;
      text-shadow: 0 2px 11px rgba(0,0,0,.55);
    }

    .ticket-title p {
      margin: 0;
      color: #b0c2d2;
    }

    .perforation {
      position: relative;
      height: 1px;
      border-top: 1px dashed rgba(34, 119, 191, .42);
    }

    .perforation::before,
    .perforation::after {
      content: '';
      position: absolute;
      top: -10px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--background);
      border: 1px solid rgba(25, 111, 184, .42);
    }

    .perforation::before {
      left: -10px;
    }

    .perforation::after {
      right: -10px;
    }

    .ticket-body {
      display: grid;
      grid-template-columns: 170px minmax(0, 1fr);
      gap: 24px;
      align-items: center;
      padding: 30px 28px 27px;
    }

    .qr-box {
      min-height: 170px;
      padding: 10px;
      display: grid;
      place-items: center;
      border-radius: 6px;
      background: white;
    }

    .qr-box img {
      width: 100%;
      display: block;
    }

    .ticket-info {
      min-width: 0;
      display: grid;
      gap: 8px;
    }

    .ticket-info span {
      margin-top: 11px;
      color: #6685a0;
      font-family: 'Orbitron', Arial, sans-serif;
      font-size: .56rem;
      font-weight: 700;
      letter-spacing: 2px;
    }

    .ticket-info strong {
      color: #edf4fb;
      line-height: 1.4;
    }

    code {
      color: #4aa4e8;
      overflow-wrap: anywhere;
      font-size: .85rem;
    }

    .ticket-actions {
      display: flex;
      gap: 16px;
      align-items: center;
      padding: 0 28px 29px;
    }

    .ticket-actions .btn {
      min-height: 44px;
      padding: 0 19px;
      font-size: .9rem;
    }

    .cancel-button {
      border: 0;
      color: #7896af;
      background: transparent;
      font-weight: 600;
      transition: color .2s;
    }

    .cancel-button:hover {
      color: #dcecff;
    }

    .empty-state {
      padding: 75px 20px;
      border-radius: 3px;
    }

    .empty-state h2 {
      margin: 0 0 16px;
      color: white;
    }

    .empty-state p {
      margin: 0 0 30px;
    }

    @media (max-width: 950px) {
      .tickets-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 560px) {
      .ticket-cover {
        height: 245px;
      }

      .ticket-body {
        grid-template-columns: 1fr;
      }

      .qr-box {
        width: 175px;
        margin: 0 auto;
      }

      .ticket-actions {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
      }
    }
  `]
})
export class TicketsComponent implements OnInit {
  tickets = signal<Ticket[]>([]);
  qrImages = signal<Record<number, string>>({});
  loading = signal(true);
  error = signal('');
  success = signal('');

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading.set(true);
    this.error.set('');

    this.bookingService.getMyTickets().subscribe({
      next: async (tickets) => {
        this.tickets.set(tickets);
        await this.generateQrCodes(tickets);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.error.set(
          error.error?.message || 'Non è stato possibile caricare i tuoi biglietti.'
        );
      }
    });
  }

  async generateQrCodes(tickets: Ticket[]): Promise<void> {
    const generatedImages: Record<number, string> = {};

    for (const ticket of tickets) {
      generatedImages[ticket.id] = await QRCode.toDataURL(ticket.qr_code, {
        width: 180,
        margin: 1
      });
    }

    this.qrImages.set(generatedImages);
  }

  cancelBooking(eventId: number): void {
    const confirmed = window.confirm(
      'Vuoi davvero annullare l iscrizione a questo evento?'
    );

    if (!confirmed) {
      return;
    }

    this.error.set('');
    this.success.set('');

    this.bookingService.cancelBooking(eventId).subscribe({
      next: () => {
        this.success.set('Iscrizione annullata correttamente.');
        this.loadTickets();
      },
      error: (error) => {
        this.error.set(
          error.error?.message || 'Non è stato possibile annullare l iscrizione.'
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
