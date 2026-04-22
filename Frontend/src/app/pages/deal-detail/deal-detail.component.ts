import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
    newNoteContent: string = '';
    error: string = '';
    loading: boolean = true;

    constructor(
        private route: ActivatedRoute,
        private api: ApiService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.api.getDeals().subscribe({
                next: (deals) => {
                    this.deal = deals.find((d: any) => d.id === +id);
                    if (this.deal?.contact) {
                        this.loadContact(this.deal.contact);
                    }
                    this.loadNotes(+id);
                    this.loading = false;
                },
                error: () => {
                    this.error = 'Failed to load deal';
                    this.loading = false;
                }
            });
        }
    }

    loadContact(contactId: number): void {
        this.api.getContacts().subscribe({
            next: (contacts) => {
                this.contact = contacts.find((c: any) => c.id === contactId);
            }
        });
    }

    loadNotes(dealId: number): void {
        this.api.getNotes(dealId).subscribe({
            next: (notes) => { this.notes = notes; },
            error: () => { this.notes = []; }
        });
    }

    addNote(): void {
        if (!this.newNoteContent.trim() || !this.deal) return;

        this.api.createNote({ deal: this.deal.id, text: this.newNoteContent }).subscribe({
            next: (note) => {
                this.notes.push(note);
                this.newNoteContent = '';
            },
            error: () => { this.error = 'Failed to add note'; }
        });
    }

    updateStage(newStage: string): void {
        if (!this.deal) return;

        this.api.updateDeal(this.deal.id, { stage: newStage }).subscribe({
            next: (updated) => { this.deal = updated; },
            error: () => { this.error = 'Failed to update stage'; }
        });
    }

    getStatusColor(status: string): string {
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