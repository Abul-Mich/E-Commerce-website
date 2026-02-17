import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {CookieService} from 'ngx-cookie-service'
import { IUser } from '../models/user.model';
import { tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IloginResponse } from './models/Login.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private router: Router, 
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  tokenKey = 'token';
  user : IUser | undefined;

  getToken(): string {
    return this.cookieService.get('token');
  }

  setToken(token: string): void {
    this.cookieService.set(this.tokenKey, token, {expires: 7, sameSite: 'Strict'});
  }

  authentication(username: string, password: string): Observable<string | undefined> {
      return this.http.post<IloginResponse>('http://192.168.7.156:5005/api/User/Login', {
        "username": username,
        "password": password
    }).pipe(
      tap((res) => {
      if (!res.Login.AccessToken) return;
      this.setToken(res.Login.AccessToken);
      }),
      map((res) => res.Login.AccessToken)
    )
  }
  
  logout() {
    this.cookieService.delete(this.tokenKey);
    this.router.navigate(['/']);
    
  }
}
