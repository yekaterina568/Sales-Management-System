import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ApiService } from '../../core/services/api.service';

interface Deal {
    id: number;
    title: string;
    value: number;
    stage: string;
    contact: number | null;
    contact_name?: string;
    expected_close: string;
}

@Component({
    selector: 'app-kanban',
    standalone: true,
    imports: [CommonModule, FormsModule, DragDropModule],
    templateUrl: './kanban.component.html',
    styleUrl: './kanban.component.scss'
})
export class KanbanComponent implements OnInit {
    stages = ['New', 'In Progress', 'Negotiation', 'Won', 'Lost'];
    columns: { [key: string]: Deal[] } = {
        'New': [],
        'In Progress': [],
        'Negotiation': [],
        'Won': [],
        'Lost': []
    };
    contacts: any[] = [];
    loading = true;
    showModal = false;
    saving = false;

    newDeal = {
        title: '',
        value: null as number | null,
        stage: 'New',
        contact: null as number | null,
        expected_close: ''
    };

    constructor(private api: ApiService, private router: Router) {}

    ngOnInit(): void {
        this.api.getDeals().subscribe({
            next: (deals) => {
                this.stages.forEach(s => this.columns[s] = []);
                deals.forEach(d => {
                    if (this.columns[d.stage]) this.columns[d.stage].push(d);
                    else this.columns['New'].push(d);
                });
                this.loading = false;
            },
            error: () => { this.loading = false; }
        });
        this.api.getContacts().subscribe({
            next: (c) => this.contacts = c
        });
    }

    getConnectedLists(): string[] {
        return this.stages;
    }

    onDrop(event: CdkDragDrop<Deal[]>, targetStage: string): void {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            const deal = event.previousContainer.data[event.previousIndex];
            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
            this.api.updateDeal(deal.id, { stage: targetStage }).subscribe();
            deal.stage = targetStage;
        }
    }

    openModal(stage = 'New'): void {
        this.newDeal = { title: '', value: null, stage, contact: null, expected_close: '' };
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
    }

    saveDeal(): void {
        if (!this.newDeal.title.trim() || !this.newDeal.value || !this.newDeal.expected_close) return;
        this.saving = true;
        this.api.createDeal(this.newDeal).subscribe({
            next: (deal) => {
                this.columns[deal.stage].push(deal);
                this.showModal = false;
                this.saving = false;
            },
            error: () => { this.saving = false; }
        });
    }

    openDeal(id: number): void {
        this.router.navigate(['/deals', id]);
    }

    getContactName(contactId: number | null): string {
        if (!contactId) return '';
        const c = this.contacts.find(x => x.id === contactId);
        return c ? c.full_name : '';
    }

    getColumnTotal(stage: string): number {
        return this.columns[stage].reduce((sum, d) => sum + Number(d.value), 0);
    }

    formatValue(v: number): string {
        if (v >= 1000000) return '$' + (v / 1000000).toFixed(1) + 'M';
        if (v >= 1000) return '$' + (v / 1000).toFixed(1) + 'K';
        return '$' + v;
    }

    stageColor(stage: string): string {
        const map: { [k: string]: string } = {
            'New': '#6366f1',
            'In Progress': '#f59e0b',
            'Negotiation': '#3b82f6',
            'Won': '#22c55e',
            'Lost': '#ef4444'
        };
        return map[stage] || '#94a3b8';
    }
}
