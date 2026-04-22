import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ContactService {
    constructor(private api: ApiService) { }

    getContacts(): Observable<any[]> {
        return this.api.getContacts();
    }

    createContact(data: any): Observable<any> {
        return this.api.createContact(data);
    }

    deleteContact(id: number): Observable<any> {
        return this.api.deleteContact(id);
    }
}