import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/transactions'; // A rota no Java

  create(transaction: any): Observable<any> {
    return this.http.post(this.api, transaction);
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  update(id: number, transaction: any): Observable<any> {
    return this.http.put(`${this.api}/${id}`, transaction);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }
}