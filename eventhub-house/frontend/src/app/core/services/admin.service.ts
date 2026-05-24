import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserRole } from '../../models/user.model';

export interface AdminReview {
  id: number;
  rating: number;
  comment: string;
  is_reported: boolean;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  event: {
    id: number;
    title: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly apiUrl = '/api/admin';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  toggleBan(userId: number): Observable<{ message: string; user: User }> {
    return this.http.patch<{ message: string; user: User }>(
      `${this.apiUrl}/users/${userId}/ban`,
      {}
    );
  }

  updateRole(
    userId: number,
    role: UserRole
  ): Observable<{ message: string; user: User }> {
    return this.http.patch<{ message: string; user: User }>(
      `${this.apiUrl}/users/${userId}/role`,
      { role }
    );
  }

  getReportedReviews(): Observable<AdminReview[]> {
    return this.http.get<AdminReview[]>(`${this.apiUrl}/reviews/reported`);
  }

  approveReview(reviewId: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.apiUrl}/reviews/${reviewId}/approve`,
      {}
    );
  }

  deleteReview(reviewId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/reviews/${reviewId}`
    );
  }
}
