import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private base = 'http://127.0.0.1:8000/api';

    constructor(private http: HttpClient) {}

    private headers() {
        const token = localStorage.getItem('access_token');
        return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }

    login(username: string, password: string): Observable<any> {
        return this.http.post(`${this.base}/login/`, { username, password });
    }
    signup(data: { username: string; password: string; email: string; first_name: string; last_name: string; }) {
        return this.http.post<any>(`${this.base}/register/`, data);
    }

    changePassword(old_password: string, new_password: string) {
        return this.http.post<any>(`${this.base}/change-password/`, { old_password, new_password }, { headers: this.headers() });
    }
    logout(refresh: string): Observable<any> {
        return this.http.post(`${this.base}/logout/`, { refresh }, { headers: this.headers() });
    }
    getMyProfile(): Observable<any> {
        return this.http.get(`${this.base}/profile/me/`, { headers: this.headers() });
    }
    updateMyProfile(data: any): Observable<any> {
        return this.http.put(`${this.base}/profile/me/`, data, { headers: this.headers() });
    }
    getUserProfile(id: number): Observable<any> {
        return this.http.get(`${this.base}/profile/${id}/`, { headers: this.headers() });
    }
    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/users/`, { headers: this.headers() });
    }

    sendCollabRequest(toUserId: number, message: string): Observable<any> {
        return this.http.post(`${this.base}/collaboration/request/`,
            { to_user_id: toUserId, message }, { headers: this.headers() });
    }
    getIncomingRequests(): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/collaboration/incoming/`, { headers: this.headers() });
    }
    getOutgoingRequests(): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/collaboration/outgoing/`, { headers: this.headers() });
    }
    respondToRequest(id: number, action: 'accept' | 'decline'): Observable<any> {
        return this.http.put(`${this.base}/collaboration/${id}/respond/`,
            { action }, { headers: this.headers() });
    }

    search(q: string): Observable<any> {
        return this.http.get(`${this.base}/search/?q=${encodeURIComponent(q)}`,
            { headers: this.headers() });
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