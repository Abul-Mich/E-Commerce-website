// core/services/user.service.ts

import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { IUser } from '../../models/user';
import { IUserResponse } from '../models/User';
import { AuthService } from './auth-service';

export interface UpdateUserPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  password?: string;
  dateOfBirth?: string;
  imageUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  // ── Change this to your real API base URL ────────────────────────────────
  private readonly BASE_URL = 'https://melaine-palaeobiologic-savourily.ngrok-free.dev/api/';
  // ─────────────────────────────────────────────────────────────────────────

  // ── State ─────────────────────────────────────────────────────────────────
  //   private readonly _currentUser = signal<IUser | null>(this.getUserFromStorage());

  /** Read-only public signal — use this in templates and other services */
  readonly currentUser = this.authService.currentUser;

  /** Convenience computed signals */
  readonly isLoggedIn = computed(() => !!this.authService.currentUser());
  readonly username = computed(() => this.authService.currentUser()?.username ?? '');
  readonly role = computed(() => this.authService.currentUser()?.role ?? '');
  readonly avatar = computed(() => this.authService.currentUser()?.imageUrl ?? '');

  // ── Private helpers ───────────────────────────────────────────────────────

  private get authHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
  }

  private getUserFromStorage(): IUser | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? (JSON.parse(raw) as IUser) : null;
    } catch {
      return null;
    }
  }

  /** Maps the full API response to the slim IUser stored in localStorage */
  private mapToStoredUser(response: IUserResponse): IUser {
    return {
      username: response.username,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      role: response.role,
      imageUrl: response.imageUrl,
    };
  }

  private persistUser(response: IUserResponse): void {
    const slim = this.mapToStoredUser(response);
    this.authService.updateUser(slim);
  }

  private clearUser(): void {
    this.authService.logout;
  }

  // ── GET /users/:id ────────────────────────────────────────────────────────
  getProfile(): Observable<IUserResponse> {
    return this.http
      .get<IUserResponse>(`${this.BASE_URL}/user/`, {
        headers: this.authHeaders,
      })
      .pipe(tap((response) => this.persistUser(response)));
  }

  // ── PATCH /users/:id ──────────────────────────────────────────────────────
  updateProfile(payload: UpdateUserPayload): Observable<IUserResponse> {
    return this.http
      .patch<IUserResponse>(`${this.BASE_URL}/user`, payload, {
        headers: this.authHeaders,
      })
      .pipe(tap((response) => this.persistUser(response)));
  }

  // ── DELETE /users/:id ─────────────────────────────────────────────────────
  deleteUser(): Observable<void> {
    return this.http
      .delete<void>(`${this.BASE_URL}/user`, {
        headers: this.authHeaders,
      })
      .pipe(tap(() => this.clearUser()));
  }
}
