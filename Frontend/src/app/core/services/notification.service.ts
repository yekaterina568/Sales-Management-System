import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

export interface AppNotification {
    id: string;
    type: 'task' | 'deal';
    title: string;
    deadline: string;
    daysLeft: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
    private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
    notifications$ = this.notificationsSubject.asObservable();

    constructor(private api: ApiService) { }

    load(): void {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const notifications: AppNotification[] = [];

        this.api.getTasks().subscribe({
            next: (tasks) => {
                tasks.forEach((task: any) => {
                    if (task.completed) return;
                    const deadline = new Date(task.deadline);
                    deadline.setHours(0, 0, 0, 0);
                    const daysLeft = Math.round((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysLeft <= 1) {
                        notifications.push({
                            id: 'task-' + task.id,
                            type: 'task',
                            title: task.title,
                            deadline: task.deadline,
                            daysLeft
                        });
                    }
                });
                this.notificationsSubject.next([...notifications]);
            },
            error: () => { } 
        });

        this.api.getDeals().subscribe({
            next: (deals) => {
                const current = this.notificationsSubject.getValue();
                deals.forEach((deal: any) => {
                    if (deal.stage === 'Won' || deal.stage === 'Lost') return;
                    const deadline = new Date(deal.expected_close);
                    deadline.setHours(0, 0, 0, 0);
                    const daysLeft = Math.round((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysLeft <= 1) {
                        current.push({
                            id: 'deal-' + deal.id,
                            type: 'deal',
                            title: deal.title,
                            deadline: deal.expected_close,
                            daysLeft
                        });
                    }
                });
                this.notificationsSubject.next([...current]);
            },
            error: () => { }
        });
    }

    dismiss(id: string): void {
        const updated = this.notificationsSubject.getValue().filter(n => n.id !== id);
        this.notificationsSubject.next(updated);
    }
}