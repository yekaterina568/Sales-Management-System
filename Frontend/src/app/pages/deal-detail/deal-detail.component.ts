import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
    selector: 'app-deal-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './deal-detail.component.html',
    styleUrl: './deal-detail.component.scss'
})
export class DealDetailComponent implements OnInit {
    deal: any = null;
    contact: any = null;
    notes: any[] = [];
    activities: any[] = [];
    newNoteContent = '';
    error = '';
    loading = true;
    showStageMenu = false;
    showEditModal = false;
    editForm: any = {};
    saving = false;
    contacts: any[] = [];

    stages = ['New', 'In Progress', 'Negotiation', 'Won', 'Lost'];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private api: ApiService
    ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) this.loadDeal(+id);
        this.api.getContacts().subscribe({ next: (c) => this.contacts = c });
    }

    loadDeal(id: number): void {
        this.loading = true;
        this.api.getDeals().subscribe({
            next: (deals) => {
                this.deal = deals.find((d: any) => d.id === id);
                if (this.deal) {
                    this.notes = this.deal.notes || [];
                    this.activities = this.deal.activities || [];
                    if (this.deal.contact) {
                        this.contact = this.contacts.find((c: any) => c.id === this.deal.contact)
                            || null;
                        if (!this.contact) {
                            this.api.getContacts().subscribe({
                                next: (cs) => {
                                    this.contacts = cs;
                                    this.contact = cs.find((c: any) => c.id === this.deal.contact) || null;
                                }
                            });
                        }
                    }
                }
                this.loading = false;
            },
            error: () => { this.error = 'Failed to load deal'; this.loading = false; }
        });
    }

    openEdit(): void {
        this.editForm = { ...this.deal };
        this.showEditModal = true;
    }

    saveEdit(): void {
        if (!this.editForm.title?.trim() || !this.editForm.expected_close) return;
        this.saving = true;
        this.api.updateDeal(this.deal.id, {
            title: this.editForm.title,
            value: this.editForm.value,
            stage: this.editForm.stage,
            contact: this.editForm.contact,
            expected_close: this.editForm.expected_close
        }).subscribe({
            next: (updated) => {
                this.deal = { ...updated, notes: this.notes, activities: this.activities };
                this.showEditModal = false;
                this.saving = false;
                this.loadDeal(this.deal.id);
            },
            error: () => { this.saving = false; }
        });
    }

    deleteDeal(): void {
        if (!confirm(`Delete "${this.deal.title}"?`)) return;
        this.api.deleteDeal(this.deal.id).subscribe({
            next: () => this.router.navigate(['/dashboard']),
            error: () => { this.error = 'Failed to delete deal'; }
        });
    }

    changeStage(stage: string): void {
        this.showStageMenu = false;
        if (stage === this.deal.stage) return;
        this.api.updateDeal(this.deal.id, { stage }).subscribe({
            next: (updated) => {
                const prevActivities = this.activities;
                const prevNotes = this.notes;
                this.deal = { ...updated, notes: prevNotes, activities: prevActivities };
                this.loadDeal(this.deal.id);
            },
            error: () => { this.error = 'Failed to update stage'; }
        });
    }

    addNote(): void {
        if (!this.newNoteContent.trim()) return;
        this.api.createNote({ deal: this.deal.id, text: this.newNoteContent }).subscribe({
            next: (note) => { this.notes.push(note); this.newNoteContent = ''; },
            error: () => { this.error = 'Failed to add note'; }
        });
    }

    getStageColor(stage: string): string {
        const map: any = {
            'New': '#3b82f6', 'In Progress': '#6366f1',
            'Negotiation': '#f59e0b', 'Won': '#10b981', 'Lost': '#ef4444'
        };
        return map[stage] || '#94a3b8';
    }

    getStageProgress(stage: string): number {
        const map: any = { 'New': 20, 'In Progress': 45, 'Negotiation': 70, 'Won': 100, 'Lost': 100 };
        return map[stage] || 0;
    }

    daysInPipeline(): number {
        if (!this.deal?.created_at) return 0;
        const created = new Date(this.deal.created_at);
        const now = new Date();
        return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    }
}
