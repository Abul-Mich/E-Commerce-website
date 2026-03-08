import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable, tap, map, catchError, throwError } from 'rxjs';
import { IUser } from '../../models/user';
import { ILoginResponse, ILoginRequest } from '../models/Login';
import { IUserRequest, IUserResponse } from '../models/User';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly cookieService = inject(CookieService);

  private readonly API_BASE = 'https://melaine-palaeobiologic-savourily.ngrok-free.dev/api';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly COOKIE_OPTIONS = { expires: 7, sameSite: 'Strict' as const, secure: true };

  // ---------------------------------------------------------------------------
  // Reactive State (Signals)
  // ---------------------------------------------------------------------------

  private _token = signal<string | null>(null);
  private _currentUser = signal<IUser | null>(null);

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

  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.role === 'admin';
  }

  // ---------------------------------------------------------------------------
  // Authentication
  // ---------------------------------------------------------------------------
  register(userData: IUserRequest): Observable<IUserResponse> {
    return this.http.post<IUserResponse>(`${this.API_BASE}/auth/register`, userData).pipe(
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }

  login(credentials: ILoginRequest): Observable<string> {
    return this.http.post<ILoginResponse>(`${this.API_BASE}/auth/login`, credentials).pipe(
      tap((res) => {
        const token = res?.token;
        if (!token) return;
        this.persistToken(token);
        if (res.user) {
          const user: IUser = {
            username: res.user.username,
            email: res.user.email,
            firstName: res.user.firstName,
            lastName: res.user.lastName,
            role: res.user.role,
            dateOfBirth: res.user?.dateOfBirth,
            imageUrl: res.user?.imageUrl,
          };
          this.persistUser(user);
        }
      }),
      map((res) => res.token),
      catchError((err) => {
        this.clearSession();
        return throwError(() => err);
      }),
    );
  }

  logout(): void {
    this.clearSession();
    localStorage.removeItem('payment_cards');
    localStorage.removeItem('default_payment_id');
    localStorage.removeItem('cart');
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

  updateUser(user: IUser): void {
    this.persistUser(user);
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
      return jwtDecode<Record<string, unknown>>(token);
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

  // hasRole(role: string): boolean {
  //   return this._currentUser()?.roles?.includes(role) ?? false;
  // }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private parseRoles(raw: unknown): string[] {
    if (Array.isArray(raw)) return raw as string[];
    if (typeof raw === 'string') return [raw];
    return [];
  }
}
