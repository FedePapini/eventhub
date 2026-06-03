import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, Observable, tap } from 'rxjs';
import Keycloak from 'keycloak-js';
import { LoginResponse, User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = '/api/auth';
  private readonly userKey = 'eventhub_user';
  private readonly tokenKey = 'eventhub_access_token';
  private readonly refreshKey = 'eventhub_refresh_token';

  private keycloak?: Keycloak;
  private userSubject = new BehaviorSubject<User | null>(this.getStoredUser());

  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(data: { name: string; email: string; password: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/register`, data);
  }

  login(data: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((response) => this.storeSession(response))
    );
  }

  async loginWithKeycloak(): Promise<void> {
    const keycloak = this.getKeycloak();

    const authenticated = await keycloak.init({
      onLoad: 'login-required',
      redirectUri: `${window.location.origin}/login`,
      checkLoginIframe: false,
      pkceMethod: 'S256'
    });

    if (!authenticated || !keycloak.token) {
      throw new Error('Login Keycloak non completato.');
    }

    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${this.apiUrl}/keycloak-login`, {
        token: keycloak.token
      })
    );

    this.storeSession(response);
  }

  registerWithKeycloak(): void {
    const keycloak = this.getKeycloak();

    keycloak.register({
      redirectUri: `${window.location.origin}/login`
    });
  }

  updateProfile(data: { name: string; password?: string }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/profile`, data);
  }

  loadProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        localStorage.setItem(this.userKey, JSON.stringify(user));
        this.userSubject.next(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem(this.userKey);
    this.userSubject.next(null);

    if (this.keycloak?.authenticated) {
      this.keycloak.logout({
        redirectUri: window.location.origin
      });
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(...roles: string[]): boolean {
    return !!this.currentUser && roles.includes(this.currentUser.role);
  }

  private storeSession(response: LoginResponse): void {
    localStorage.setItem(this.tokenKey, response.access_token);
    localStorage.setItem(this.refreshKey, response.refresh_token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.userSubject.next(response.user);
  }

  private getStoredUser(): User | null {
    const storedUser = localStorage.getItem(this.userKey);
    return storedUser ? JSON.parse(storedUser) as User : null;
  }

  private getKeycloak(): Keycloak {
    if (!this.keycloak) {
      this.keycloak = new Keycloak({
        url: this.getKeycloakUrl(),
        realm: 'eventhub',
        clientId: 'eventhub-frontend'
      });
    }

    return this.keycloak;
  }

  private getKeycloakUrl(): string {
    const savedUrl = localStorage.getItem('eventhub_keycloak_url');

    if (savedUrl) {
      return savedUrl;
    }

    const origin = window.location.origin;

    if (origin.includes('-4200.')) {
      return origin.replace('-4200.', '-8080.');
    }

    return 'http://localhost:8080';
  }
}
