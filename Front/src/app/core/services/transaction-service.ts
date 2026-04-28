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

// Front/src/app/core/services/transaction-service.ts

uploadStatement(groupName: string, file: File, bank: string): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bank', bank);
  
  // Confirme se o seu TransactionController.java espera o parâmetro como 'groupName' ou 'groupId'
  formData.append('groupName', groupName); 

  return this.http.post(`${this.apiUrl}/import`, formData);
}

}