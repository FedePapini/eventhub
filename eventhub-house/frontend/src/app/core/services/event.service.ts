import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventItem } from '../../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly apiUrl = '/api/events';

  constructor(private http: HttpClient) {}

  getEvents(filters?: {
    search?: string;
    category?: string;
    city?: string;
  }): Observable<EventItem[]> {
    let params = new HttpParams();

    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    if (filters?.category) {
      params = params.set('category', filters.category);
    }

    if (filters?.city) {
      params = params.set('city', filters.city);
    }

    return this.http.get<EventItem[]>(this.apiUrl, { params });
  }

  getFeaturedEvents(): Observable<EventItem[]> {
    return this.http.get<EventItem[]>(`${this.apiUrl}/featured`);
  }

  getEvent(id: number): Observable<EventItem> {
    return this.http.get<EventItem>(`${this.apiUrl}/${id}`);
  }

  createEvent(formData: FormData): Observable<EventItem> {
    return this.http.post<EventItem>(this.apiUrl, formData);
  }

  updateEvent(id: number, formData: FormData): Observable<EventItem> {
    return this.http.put<EventItem>(`${this.apiUrl}/${id}`, formData);
  }

  deleteEvent(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
