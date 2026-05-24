import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Artist } from '../../models/artist.model';

@Injectable({
  providedIn: 'root'
})
export class ArtistService {
  private readonly apiUrl = '/api/artists';

  constructor(private http: HttpClient) {}

  getArtists(): Observable<Artist[]> {
    return this.http.get<Artist[]>(this.apiUrl);
  }

  getArtist(id: number): Observable<Artist> {
    return this.http.get<Artist>(`${this.apiUrl}/${id}`);
  }

  createArtist(formData: FormData): Observable<Artist> {
    return this.http.post<Artist>(this.apiUrl, formData);
  }

  updateArtist(id: number, formData: FormData): Observable<Artist> {
    return this.http.put<Artist>(`${this.apiUrl}/${id}`, formData);
  }

  deleteArtist(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
