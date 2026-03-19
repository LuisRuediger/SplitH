import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/groups'; // A rota do Java

  create(group: { name: string, description: string }): Observable<any> {
    return this.http.post(this.api, group);
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }
}