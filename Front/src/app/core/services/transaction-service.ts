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
uploadStatement(groupName: string, file: File, bankFormat: string): Observable<any> {
    const formData: FormData = new FormData();
    // Os nomes aqui ('file', 'bankCode', 'groupName') precisam ser EXATAMENTE
    // iguais aos que estão no @RequestParam do seu Controller no Java.
    formData.append('file', file);
    formData.append('bankCode', bankFormat);
    formData.append('groupName', groupName);

    // Aponta para a URL correta e aguarda um texto de resposta
    return this.http.post('http://localhost:8080/api/statement/import', formData, {
      responseType: 'text'
    });
  }
}