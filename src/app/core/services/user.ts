import { inject, Injectable, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { IUser } from '../../shared/models/user';
import { IUserResponse, IUpdateUserPayload } from '../models/User';
import { AuthService } from './auth-service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly BASE_URL = 'https://melaine-palaeobiologic-savourily.ngrok-free.dev/api/';

  readonly currentUser = this.authService.currentUser;
  readonly isLoggedIn = computed(() => !!this.authService.currentUser());
  readonly username = computed(() => this.authService.currentUser()?.username ?? '');
  readonly role = computed(() => this.authService.currentUser()?.role ?? '');
  readonly avatar = computed(() => this.authService.currentUser()?.imageUrl ?? '');

  private get authHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
  }

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
    this.authService.logout();
  }

  getProfile(): Observable<IUserResponse> {
    return this.http
      .get<IUserResponse>(`${this.BASE_URL}/user/`, { headers: this.authHeaders })
      .pipe(tap((response) => this.persistUser(response)));
  }

  updateProfile(payload: IUpdateUserPayload): Observable<IUserResponse> {
    return this.http
      .patch<IUserResponse>(`${this.BASE_URL}/user`, payload, { headers: this.authHeaders })
      .pipe(tap((response) => this.persistUser(response)));
  }

  deleteUser(): Observable<void> {
    return this.http
      .delete<void>(`${this.BASE_URL}/user`, { headers: this.authHeaders })
      .pipe(tap(() => this.clearUser()));
  }
}
