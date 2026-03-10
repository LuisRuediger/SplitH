import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = 'http://localhost:8080/auth';

  constructor(private http: HttpClient, private router: Router) {};

  login(email: string, password: string) {
    return this.http.post<{ token: string }>(`${this.api}/login`, { email, password }).pipe(tap(res => localStorage.setItem('token', res.token)))
  }

  register(payload: RegisterPayload) {
    return this.http.post(`${this.api}/register`, payload);
  }

  get token () { return localStorage.getItem('token'); }
  get isLoggedIn() { return !!this.token; }
}
