import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private base = 'http://127.0.0.1:8000/api';

    constructor(private http: HttpClient) { }

    private headers() {
        const token = localStorage.getItem('access_token');
        return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }

    login(username: string, password: string): Observable<any> {
        return this.http.post(`${this.base}/login/`, { username, password });
    }

    logout(refresh: string): Observable<any> {
        return this.http.post(`${this.base}/logout/`, { refresh }, { headers: this.headers() });
    }

    getDeals(): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/deals/`, { headers: this.headers() });
    }

    createDeal(data: any): Observable<any> {
        return this.http.post(`${this.base}/deals/`, data, { headers: this.headers() });
    }

    updateDeal(id: number, data: any): Observable<any> {
        return this.http.put(`${this.base}/deals/${id}/`, data, { headers: this.headers() });
    }

    deleteDeal(id: number): Observable<any> {
        return this.http.delete(`${this.base}/deals/${id}/`, { headers: this.headers() });
    }

    getContacts(): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/contacts/`, { headers: this.headers() });
    }

    createContact(data: any): Observable<any> {
        return this.http.post(`${this.base}/contacts/`, data, { headers: this.headers() });
    }

    deleteContact(id: number): Observable<any> {
        return this.http.delete(`${this.base}/contacts/${id}/`, { headers: this.headers() });
    }

    getNotes(dealId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/notes/${dealId}/`, { headers: this.headers() });
    }

    createNote(data: any): Observable<any> {
        return this.http.post(`${this.base}/notes/create/`, data, { headers: this.headers() });
    }
    getTasks(): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/tasks/`, { headers: this.headers() });
    }

    createTask(data: any): Observable<any> {
        return this.http.post(`${this.base}/tasks/`, data, { headers: this.headers() });
    }

    updateTask(id: number, data: any): Observable<any> {
        return this.http.put(`${this.base}/tasks/${id}/`, data, { headers: this.headers() });
    }

    deleteTask(id: number): Observable<any> {
        return this.http.delete(`${this.base}/tasks/${id}/`, { headers: this.headers() });
    }
}
