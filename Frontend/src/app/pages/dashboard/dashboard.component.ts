import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import {
    CdkDragDrop,
    moveItemInArray,
    transferArrayItem,
    CdkDrag,
    CdkDropList,
    CdkDropListGroup
} from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, CdkDropListGroup, CdkDropList, CdkDrag],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
    deals: any[] = [];
    error: string = '';
    loading: boolean = true;

    showAddForm: boolean = false;
    newDeal = {
        title: '',
        value: 0,
        stage: 'New',
        expected_close: '',
        contact: null
    };

    columns: { name: string; status: string; deals: any[] }[] = [
        { name: 'New', status: 'New', deals: [] },
        { name: 'In Progress', status: 'In Progress', deals: [] },
        { name: 'Negotiation', status: 'Negotiation', deals: [] },
        { name: 'Won / Lost', status: 'Won', deals: [] }
    ];

    stats = [
        { title: 'TOTAL DEALS', value: '0', trend: '', icon: 'trending-up' },
        { title: 'REVENUE', value: '$0', trend: '', icon: 'dollar-sign' },
        { title: 'ACTIVE CONTACTS', value: '0', trend: '', icon: 'users' }
    ];

    constructor(private api: ApiService) { }

    ngOnInit(): void {
        this.loadDeals();
        this.loadStats();
    }

    loadDeals(): void {
        this.loading = true;
        this.api.getDeals().subscribe({
            next: (deals) => {
                this.deals = deals;
                this.organizeDeals();
                this.loading = false;
            },
            error: () => {
                this.error = 'Failed to load deals';
                this.loading = false;
            }
        });
    }

    loadStats(): void {
        this.api.getDeals().subscribe({
            next: (deals) => {
                const total = deals.length;
                const revenue = deals
                    .filter(d => d.stage === 'Won')
                    .reduce((sum: number, d: any) => sum + parseFloat(d.value || 0), 0);
                this.stats[0].value = String(total);
                this.stats[0].trend = `${total} deals total`;
                this.stats[1].value = '$' + revenue.toLocaleString();
                this.stats[1].trend = 'Won deals revenue';
            }
        });

        this.api.getContacts().subscribe({
            next: (contacts) => {
                const active = contacts.filter((c: any) => c.status === 'Active').length;
                this.stats[2].value = String(active);
                this.stats[2].trend = `${active} active contacts`;
            }
        });
    }

    organizeDeals(): void {
        this.columns.forEach(col => col.deals = []);
        this.deals.forEach(deal => {
            const col = this.columns.find(c => {
                if (c.name === 'Won / Lost') {
                    return deal.stage === 'Won' || deal.stage === 'Lost';
                }
                return c.status === deal.stage;
            });
            if (col) col.deals.push(deal);
        });
    }

    drop(event: CdkDragDrop<any[]>): void {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
            const deal = event.container.data[event.currentIndex];
            const targetColumn = this.columns.find(c => c.deals === event.container.data);
            if (targetColumn) {
                const newStage = targetColumn.status;
                this.api.updateDeal(deal.id, { stage: newStage }).subscribe({
                    next: (updated) => { deal.stage = updated.stage; },
                    error: () => { this.error = 'Failed to update deal stage'; }
                });
            }
        }
    }

    addDeal(): void {
        if (!this.newDeal.title.trim() || !this.newDeal.expected_close) return;
        this.api.createDeal(this.newDeal).subscribe({
            next: (deal) => {
                this.deals.push(deal);
                this.organizeDeals();
                this.showAddForm = false;
                this.newDeal = { title: '', value: 0, stage: 'New', expected_close: '', contact: null };
            },
            error: () => { this.error = 'Failed to create deal'; }
        });
    }

    getBorderColor(status: string): string {
        switch (status) {
            case 'New': return '#3b82f6';
            case 'In Progress': return '#6366f1';
            case 'Negotiation': return '#f59e0b';
            case 'Won': return '#10b981';
            case 'Lost': return '#ef4444';
            default: return '#e2e8f0';
        }
    }
}