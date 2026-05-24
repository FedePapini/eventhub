import { Component, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArtistService } from '../../core/services/artist.service';
import { Artist } from '../../models/artist.model';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  template: `
    <section class="artist-page page">
      <div class="container">
        <a routerLink="/" class="back-link">
          ← Torna agli eventi
        </a>

        <p class="loading" *ngIf="loading()">
          Caricamento artista...
        </p>

        <p class="error-message" *ngIf="error()">
          {{ error() }}
        </p>

        <ng-container *ngIf="artist() as currentArtist">
          <header class="artist-header card">
            <div class="artist-photo">
              <img
                *ngIf="currentArtist.image_url; else fallbackPhoto"
                [src]="currentArtist.image_url"
                [alt]="'Foto di ' + currentArtist.name">

              <ng-template #fallbackPhoto>
                <div class="fallback-photo">
                  {{ initial(currentArtist.name) }}
                </div>
              </ng-template>
            </div>

            <div class="artist-copy">
              <span class="eyebrow">ARTIST</span>
              <h1>{{ currentArtist.name }}</h1>

              <p class="bio" *ngIf="currentArtist.bio">
                {{ currentArtist.bio }}
              </p>

              <p class="bio" *ngIf="!currentArtist.bio">
                Artista della scena elettronica EventHub House.
              </p>
            </div>
          </header>

          <section class="events-area">
            <span class="eyebrow">UPCOMING SHOWS</span>
            <h2>Eventi con {{ currentArtist.name }}</h2>

            <div
              class="event-grid"
              *ngIf="currentArtist.events && currentArtist.events.length > 0; else noEvents">

              <article class="event-card card" *ngFor="let event of currentArtist.events">
                <div class="event-cover">
                  <img
                    *ngIf="event.image_url; else defaultCover"
                    [src]="event.image_url"
                    [alt]="'Locandina ' + event.title">

                  <ng-template #defaultCover>
                    <div class="default-cover">♫</div>
                  </ng-template>

                  <span class="badge">{{ event.category }}</span>
                </div>

                <div class="event-body">
                  <p class="date">{{ formatDate(event.date) }}</p>
                  <h3>{{ event.title }}</h3>
                  <p class="place">{{ event.location }} · {{ event.city }}</p>

                  <div class="event-footer">
                    <strong>{{ formatPrice(event.price) }}</strong>
                    <a [routerLink]="['/eventi', event.id]">Dettagli →</a>
                  </div>
                </div>
              </article>
            </div>

            <ng-template #noEvents>
              <div class="empty-state card">
                Questo artista non è ancora presente in nessun evento.
              </div>
            </ng-template>
          </section>
        </ng-container>
      </div>
    </section>
  `,
  styles: [`
    .back-link {
      display: inline-block;
      margin-bottom: 35px;
      color: #fc38ac;
      font-weight: 600;
    }

    .loading {
      color: #a4a3b3;
    }

    .artist-header {
      display: grid;
      grid-template-columns: 280px minmax(0, 1fr);
      align-items: center;
      gap: 48px;
      padding: 42px;
      margin-bottom: 62px;
      overflow: hidden;
      background:
        radial-gradient(circle at 16% 48%, rgba(147,44,255,.18), transparent 34%),
        #111118;
    }

    .artist-photo {
      width: 280px;
      height: 280px;
      overflow: hidden;
      border-radius: 50%;
      border: 3px solid rgba(252,56,172,.36);
      box-shadow: 0 20px 55px rgba(147,44,255,.2);
    }

    .artist-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .fallback-photo {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      font-size: 6rem;
      font-weight: 700;
      background: linear-gradient(135deg, #932cff, #fc38ac);
    }

    .eyebrow {
      display: block;
      margin-bottom: 17px;
      color: #c26eff;
      font-size: .74rem;
      font-weight: 700;
      letter-spacing: 3px;
    }

    .artist-copy h1 {
      margin: 0 0 19px;
      font-size: clamp(3rem, 7vw, 4.8rem);
      line-height: 1;
    }

    .bio {
      max-width: 650px;
      margin: 0;
      color: #adacbc;
      font-size: 1.08rem;
      line-height: 1.8;
    }

    .events-area h2 {
      margin: 0 0 36px;
      font-size: clamp(2rem, 5vw, 2.7rem);
    }

    .event-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 25px;
    }

    .event-card {
      overflow: hidden;
    }

    .event-cover {
      position: relative;
      height: 220px;
      background: #141420;
    }

    .event-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .default-cover {
      height: 100%;
      display: grid;
      place-items: center;
      font-size: 4.5rem;
      color: rgba(255,255,255,.25);
      background:
        radial-gradient(circle at 70% 30%, rgba(252,56,172,.3), transparent 34%),
        #141420;
    }

    .event-cover .badge {
      position: absolute;
      left: 19px;
      top: 19px;
    }

    .event-body {
      padding: 23px;
    }

    .date {
      margin: 0 0 13px;
      color: #c26eff;
      font-size: .78rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .event-body h3 {
      margin: 0 0 10px;
      font-size: 1.3rem;
    }

    .place {
      min-height: 41px;
      margin: 0 0 19px;
      color: #9796a8;
    }

    .event-footer {
      display: flex;
      justify-content: space-between;
      padding-top: 18px;
      border-top: 1px solid rgba(255,255,255,.08);
    }

    .event-footer a {
      color: #fc38ac;
      font-weight: 700;
    }

    @media (max-width: 950px) {
      .artist-header {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .artist-photo {
        margin: 0 auto;
      }

      .event-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 620px) {
      .artist-header {
        padding: 28px;
      }

      .artist-photo {
        width: 210px;
        height: 210px;
      }

      .event-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ArtistDetailComponent implements OnInit {
  artist = signal<Artist | null>(null);
  loading = signal(true);
  error = signal('');

  constructor(
    private route: ActivatedRoute,
    private artistService: ArtistService
  ) {}

  ngOnInit(): void {
    const artistId = Number(this.route.snapshot.paramMap.get('id'));

    if (!artistId) {
      this.loading.set(false);
      this.error.set('Artista non valido.');
      return;
    }

    this.artistService.getArtist(artistId).subscribe({
      next: (artist) => {
        this.artist.set(artist);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Non è stato possibile caricare questo artista.');
      }
    });
  }

  initial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
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
