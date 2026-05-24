import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly apiUrl = '/api/reviews';

  constructor(private http: HttpClient) {}

  getEventReviews(eventId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/event/${eventId}`);
  }

  createReview(eventId: number, data: { rating: number; comment: string }): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/event/${eventId}`, data);
  }

  reportReview(reviewId: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${reviewId}/report`, {});
  }
}
