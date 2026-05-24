import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from '../../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly apiUrl = '/api/bookings';

  constructor(private http: HttpClient) {}

  getMyTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/my-tickets`);
  }

  bookEvent(eventId: number): Observable<{ message: string; ticket: Ticket }> {
    return this.http.post<{ message: string; ticket: Ticket }>(
      `${this.apiUrl}/event/${eventId}`,
      {}
    );
  }

  cancelBooking(eventId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/event/${eventId}`);
  }
}
