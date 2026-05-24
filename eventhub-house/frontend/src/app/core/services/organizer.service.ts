import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrganizerDashboardEvent {
  id: number;
  title: string;
  date: string;
  city: string;
  capacity: number;
  enrolled: number;
  available_places: number;
  estimated_revenue: number;
  average_rating: number | null;
}

export interface OrganizerDashboard {
  summary: {
    total_events: number;
    total_enrolled: number;
    total_estimated_revenue: number;
  };
  events: OrganizerDashboardEvent[];
}

export interface Attendee {
  booking_id: number;
  name: string;
  email: string;
  ticket_code: string;
  booking_date: string;
}

export interface AttendeesResponse {
  event: {
    id: number;
    title: string;
  };
  attendees: Attendee[];
}

@Injectable({
  providedIn: 'root'
})
export class OrganizerService {
  private readonly apiUrl = '/api/organizer';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<OrganizerDashboard> {
    return this.http.get<OrganizerDashboard>(`${this.apiUrl}/dashboard`);
  }

  getAttendees(eventId: number): Observable<AttendeesResponse> {
    return this.http.get<AttendeesResponse>(
      `${this.apiUrl}/events/${eventId}/attendees`
    );
  }

  exportAttendeesCsv(eventId: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/events/${eventId}/attendees/export`,
      { responseType: 'blob' }
    );
  }
}
