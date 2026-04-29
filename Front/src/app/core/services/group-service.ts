import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type GroupRole = 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface GroupMemberDTO {
  id: number;
  name: string;
  email: string;
  role: GroupRole;
}

export interface GroupDTO {
  id: number;
  name: string;
  description: string;
  members: GroupMemberDTO[];
}

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/groups';

  create(group: { name: string, description: string }): Observable<GroupDTO> {
    return this.http.post<GroupDTO>(this.api, group);
  }

  getAll(): Observable<GroupDTO[]> {
    return this.http.get<GroupDTO[]>(this.api);
  }

  getById(id: number): Observable<GroupDTO> {
    return this.http.get<GroupDTO>(`${this.api}/${id}`);
  }

  addMember(groupId: number, email: string): Observable<void> {
    return this.http.post<void>(`${this.api}/${groupId}/members`, { email });
  }

  changeMemberRole(groupId: number, userId: number, role: GroupRole): Observable<void> {
    return this.http.put<void>(`${this.api}/${groupId}/members/${userId}/role`, { role });
  }

  removeMember(groupId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${groupId}/members/${userId}`);
  }
}
