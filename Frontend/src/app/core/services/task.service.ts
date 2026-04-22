import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
    constructor(private api: ApiService) { }

    getTasks(): Observable<any[]> {
        return this.api.getTasks();
    }

    createTask(data: any): Observable<any> {
        return this.api.createTask(data);
    }

    updateTask(id: number, data: any): Observable<any> {
        return this.api.updateTask(id, data);
    }

    deleteTask(id: number): Observable<any> {
        return this.api.deleteTask(id);
    }
}