import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private http = inject(HttpClient);
  
  // Usamos apenas UMA variável com a URL correta, sem o /api
  private apiUrl = 'http://localhost:8080/transactions'; 

  create(transaction: any): Observable<any> {
    return this.http.post(this.apiUrl, transaction);
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  update(id: number, transaction: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, transaction);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getByGroup(groupName: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/group/${groupName}`);
  }

  uploadStatement(groupId: number, file: File, bankFormat: string): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('bank', bankFormat);

    // Aponta para a URL correta do back-end (confirme se o endpoint de import começa com /transactions/import/...)
    return this.http.post(`${this.apiUrl}/import/group/${groupId}`, formData);
  }
}