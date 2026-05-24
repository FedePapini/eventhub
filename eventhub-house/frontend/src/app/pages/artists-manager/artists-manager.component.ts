import { Component, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ArtistService } from '../../core/services/artist.service';
import { Artist } from '../../models/artist.model';

@Component({
  selector: 'app-artists-manager',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, RouterLink],
  template: `
    <section class="manager-page page">
      <div class="container">
        <a routerLink="/organizer" class="back-link">
          ← Torna alla dashboard
        </a>

        <header class="page-heading">
          <span class="eyebrow">LINEUP MANAGEMENT</span>
          <h1>Gestione <span class="gradient-text">artisti</span></h1>
          <p>Crea artisti con foto e biografia da utilizzare nelle lineup degli eventi.</p>
        </header>

        <div class="layout">
          <form class="artist-form card" [formGroup]="artistForm" (ngSubmit)="saveArtist()">
            <h2>{{ editingArtist() ? 'Modifica artista' : 'Nuovo artista' }}</h2>

            <div class="field">
              <label for="artistName">Nome artista *</label>
              <input
                id="artistName"
                type="text"
                formControlName="name"
                placeholder="Esempio: Luna D">
            </div>

            <div class="field">
              <label for="bio">Biografia</label>
              <textarea
                id="bio"
                formControlName="bio"
                placeholder="Descrivi genere, stile e percorso dell'artista..."></textarea>
            </div>

            <label class="photo-upload" for="artistImage">
              <input
                id="artistImage"
                type="file"
                accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                (change)="onFileSelected($event)">

              <img
                *ngIf="imagePreview(); else uploadPlaceholder"
                [src]="imagePreview()"
                alt="Anteprima artista">

              <ng-template #uploadPlaceholder>
                <div class="upload-placeholder">
                  <strong>Carica foto artista</strong>
                  <span>PNG, JPG o WEBP</span>
                </div>
              </ng-template>
            </label>

            <p class="error-message" *ngIf="formError()">
              {{ formError() }}
            </p>

            <div class="form-actions">
              <button
                *ngIf="editingArtist()"
                class="btn btn-outline"
                type="button"
                (click)="resetForm()">
                Annulla
              </button>

              <button
                class="btn btn-primary"
                type="submit"
                [disabled]="saving()">
                {{
                  saving()
                    ? 'Salvataggio...'
                    : editingArtist()
                      ? 'Salva modifiche'
                      : 'Crea artista'
                }}
              </button>
            </div>
          </form>

          <section class="artists-area">
            <p class="success-message" *ngIf="success()">
              {{ success() }}
            </p>

            <p class="error-message" *ngIf="pageError()">
              {{ pageError() }}
            </p>

            <p *ngIf="loading()" class="loading">
              Caricamento artisti...
            </p>

            <div class="artists-grid" *ngIf="!loading() && artists().length > 0">
              <article class="artist-card card" *ngFor="let artist of artists()">
                <a [routerLink]="['/artisti', artist.id]" class="artist-public-link">
                  <div class="artist-avatar">
                    <img
                      *ngIf="artist.image_url; else fallback"
                      [src]="artist.image_url"
                      [alt]="'Foto di ' + artist.name">

                    <ng-template #fallback>
                      <div class="fallback-avatar">
                        {{ artist.name.charAt(0).toUpperCase() }}
                      </div>
                    </ng-template>
                  </div>

                  <h3>{{ artist.name }}</h3>
                </a>

                <p>{{ artist.bio || 'Nessuna biografia inserita.' }}</p>

                <div class="artist-actions">
                  <button type="button" (click)="editArtist(artist)">
                    Modifica
                  </button>

                  <button type="button" class="delete" (click)="deleteArtist(artist)">
                    Elimina
                  </button>
                </div>
              </article>
            </div>

            <div class="empty-state card" *ngIf="!loading() && artists().length === 0">
              Non hai ancora creato artisti.
            </div>
          </section>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .back-link {
      display: inline-block;
      margin-bottom: 34px;
      color: #fc38ac;
      font-weight: 600;
    }

    .page-heading {
      margin-bottom: 42px;
    }

    .eyebrow {
      display: block;
      margin-bottom: 16px;
      color: #c26eff;
      font-size: .74rem;
      font-weight: 700;
      letter-spacing: 3px;
    }

    .page-heading h1 {
      margin: 0 0 13px;
      font-size: clamp(2.8rem, 6vw, 4rem);
    }

    .page-heading p {
      margin: 0;
      color: #a3a2b2;
    }

    .layout {
      display: grid;
      grid-template-columns: 380px minmax(0, 1fr);
      gap: 26px;
      align-items: start;
    }

    .artist-form {
      position: sticky;
      top: 96px;
      padding: 29px;
    }

    .artist-form h2 {
      margin: 0 0 27px;
      font-size: 1.55rem;
    }

    .photo-upload {
      height: 230px;
      margin-top: 8px;
      display: grid;
      place-items: center;
      overflow: hidden;
      border-radius: 18px;
      cursor: pointer;
      border: 2px dashed rgba(147,44,255,.42);
      background: rgba(147,44,255,.05);
    }

    .photo-upload input {
      display: none;
    }

    .photo-upload img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .upload-placeholder {
      display: grid;
      gap: 10px;
      text-align: center;
      color: #9291a3;
    }

    .upload-placeholder strong {
      color: white;
    }

    .form-actions {
      display: flex;
      gap: 11px;
      margin-top: 25px;
    }

    .form-actions .btn {
      flex: 1;
      border: 0;
    }

    .artists-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
    }

    .artist-card {
      padding: 25px;
      text-align: center;
    }

    .artist-public-link {
      display: block;
    }

    .artist-avatar {
      width: 118px;
      height: 118px;
      margin: 0 auto 18px;
      overflow: hidden;
      border-radius: 50%;
      border: 2px solid rgba(252,56,172,.32);
    }

    .artist-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .fallback-avatar {
      height: 100%;
      display: grid;
      place-items: center;
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #932cff, #fc38ac);
    }

    .artist-card h3 {
      margin: 0 0 13px;
      font-size: 1.28rem;
    }

    .artist-card p {
      min-height: 47px;
      margin: 0 0 21px;
      color: #9998a9;
      line-height: 1.55;
      font-size: .91rem;
    }

    .artist-actions {
      display: flex;
      justify-content: center;
      gap: 11px;
    }

    .artist-actions button {
      padding: 8px 15px;
      border-radius: 999px;
      color: #d8a5ff;
      border: 1px solid rgba(147,44,255,.38);
      background: rgba(147,44,255,.12);
    }

    .artist-actions .delete {
      color: #ff91b0;
      border-color: rgba(211,41,94,.38);
      background: rgba(211,41,94,.12);
    }

    .loading {
      color: #a3a2b2;
    }

    @media (max-width: 950px) {
      .layout {
        grid-template-columns: 1fr;
      }

      .artist-form {
        position: static;
      }
    }

    @media (max-width: 600px) {
      .artists-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ArtistsManagerComponent implements OnInit {
  artists = signal<Artist[]>([]);
  editingArtist = signal<Artist | null>(null);
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  loading = signal(true);
  saving = signal(false);
  pageError = signal('');
  formError = signal('');
  success = signal('');

  artistForm = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    bio: new FormControl('', { nonNullable: true })
  });

  constructor(private artistService: ArtistService) {}

  ngOnInit(): void {
    this.loadArtists();
  }

  loadArtists(): void {
    this.loading.set(true);

    this.artistService.getArtists().subscribe({
      next: (artists) => {
        this.artists.set(artists);
        this.loading.set(false);
      },
      error: () => {
        this.pageError.set('Non è stato possibile caricare gli artisti.');
        this.loading.set(false);
      }
    });
  }

  onFileSelected(event: globalThis.Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.formError.set('');
    this.selectedFile.set(file);

    if (!file) {
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      this.formError.set('Formato immagine non valido. Usa PNG, JPG o WEBP.');
      this.selectedFile.set(null);
      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview.set(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  saveArtist(): void {
    const values = this.artistForm.getRawValue();
    const name = values.name.trim();

    this.formError.set('');
    this.success.set('');

    if (!name) {
      this.formError.set('Inserisci il nome dell artista.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('bio', values.bio.trim());

    const image = this.selectedFile();

    if (image) {
      formData.append('image', image, image.name);
    }

    this.saving.set(true);

    const artist = this.editingArtist();

    const request = artist
      ? this.artistService.updateArtist(artist.id, formData)
      : this.artistService.createArtist(formData);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set(
          artist ? 'Artista modificato correttamente.' : 'Artista creato correttamente.'
        );
        this.resetForm();
        this.loadArtists();
      },
      error: (response) => {
        this.saving.set(false);
        this.formError.set(
          response.error?.message || 'Non è stato possibile salvare l artista.'
        );
      }
    });
  }

  editArtist(artist: Artist): void {
    this.editingArtist.set(artist);
    this.artistForm.patchValue({
      name: artist.name,
      bio: artist.bio
    });
    this.imagePreview.set(artist.image_url);
    this.selectedFile.set(null);
    this.formError.set('');
    this.success.set('');
  }

  resetForm(): void {
    this.editingArtist.set(null);
    this.selectedFile.set(null);
    this.imagePreview.set(null);
    this.artistForm.reset({
      name: '',
      bio: ''
    });
  }

  deleteArtist(artist: Artist): void {
    if (!window.confirm(`Vuoi eliminare l artista "${artist.name}"?`)) {
      return;
    }

    this.pageError.set('');
    this.success.set('');

    this.artistService.deleteArtist(artist.id).subscribe({
      next: () => {
        this.success.set('Artista eliminato correttamente.');
        this.loadArtists();
      },
      error: (response) => {
        this.pageError.set(
          response.error?.message || 'Non è stato possibile eliminare l artista.'
        );
      }
    });
  }
}
