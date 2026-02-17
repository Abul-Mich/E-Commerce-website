import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable, tap, map, catchError, throwError } from 'rxjs';
import { IUser } from '../models/user.model';
import { ILoginResponse, ILoginRequest } from './models/Login.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly cookieService = inject(CookieService);

  private readonly API_BASE = 'http://192.168.7.156:5005/api';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly COOKIE_OPTIONS = { expires: 7, sameSite: 'Strict' as const, secure: true };

  // ---------------------------------------------------------------------------
  // Reactive State (Signals)
  // ---------------------------------------------------------------------------

  private readonly _token = signal<string | null>(null);
  private readonly _currentUser = signal<IUser | null>(null);

  readonly token = this._token.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => {
    const token = this._token();
    if (!token) return false;
    return !this.isTokenExpired(token);
  });

  constructor() {
    // Hydrate signals from persisted storage on service instantiation
    const storedToken = this.cookieService.get(this.TOKEN_KEY) || null;
    this._token.set(storedToken);
    this._currentUser.set(this.loadUser());
  }

  // ---------------------------------------------------------------------------
  // Authentication
  // ---------------------------------------------------------------------------

  login(credentials: ILoginRequest): Observable<string> {
    return this.http
      .post<ILoginResponse>(`${this.API_BASE}/User/Login`, credentials)
      .pipe(
        tap((res) => {
          const token = res?.Login?.AccessToken;
          if (!token) return;
          this.persistToken(token);
          const decoded = this.decodeToken(token);
          if (decoded) {
            const user: IUser = {
              id: (decoded['sub'] ?? decoded['nameid'] ?? '') as string,
              username: (decoded['unique_name'] ?? decoded['name'] ?? '') as string,
              email: (decoded['email'] ?? '') as string,
              roles: this.parseRoles(decoded['role']),
            };
            this.persistUser(user);
          }
        }),
        map((res) => res.Login.AccessToken),
        catchError((err) => {
          this.clearSession();
          return throwError(() => err);
        })
      );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/']);
  }

  // ---------------------------------------------------------------------------
  // Token Management (Cookie-backed)
  // ---------------------------------------------------------------------------

  getToken(): string | null {
    return this._token();
  }

  private persistToken(token: string): void {
    this.cookieService.set(this.TOKEN_KEY, token, this.COOKIE_OPTIONS);
    this._token.set(token);
  }

  private removeToken(): void {
    this.cookieService.delete(this.TOKEN_KEY);
    this._token.set(null);
  }

  // ---------------------------------------------------------------------------
  // User Management (localStorage-backed)
  // ---------------------------------------------------------------------------

  private persistUser(user: IUser): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._currentUser.set(user);
  }

  private removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
  }

  private loadUser(): IUser | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as IUser;
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Session Reset
  // ---------------------------------------------------------------------------

  private clearSession(): void {
    this.removeToken();
    this.removeUser();
  }

  // ---------------------------------------------------------------------------
  // JWT Utilities
  // ---------------------------------------------------------------------------

  decodeToken(token: string): Record<string, unknown> | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  isTokenExpired(token: string = this._token() ?? ''): boolean {
    if (!token) return true;
    const decoded = this.decodeToken(token);
    if (!decoded || typeof decoded['exp'] !== 'number') return true;
    return Date.now() >= decoded['exp'] * 1000;
  }

  getTokenExpiry(): Date | null {
    const token = this._token();
    if (!token) return null;
    const decoded = this.decodeToken(token);
    if (!decoded || typeof decoded['exp'] !== 'number') return null;
    return new Date(decoded['exp'] * 1000);
  }

  hasRole(role: string): boolean {
    return this._currentUser()?.roles?.includes(role) ?? false;
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private parseRoles(raw: unknown): string[] {
    if (Array.isArray(raw)) return raw as string[];
    if (typeof raw === 'string') return [raw];
    return [];
  }
}