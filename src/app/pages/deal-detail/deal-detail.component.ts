import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DealService } from '../../core/services/deal.service';
import { ContactService } from '../../core/services/contact.service';
import { Deal, Contact, Note } from '../../core/models/crm.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-deal-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './deal-detail.component.html',
  styleUrl: './deal-detail.component.scss'
})
export class DealDetailComponent implements OnInit {
  deal?: Deal;
  contact?: Contact;
  newNoteContent: string = '';

  constructor(
    private route: ActivatedRoute,
    private dealService: DealService,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.deal = this.dealService.getDealById(id);

      if (this.deal && this.deal.company === 'Acme Corp') {
        this.contact = this.contactService.getContactById('1');
      }
    }
  }

  addNote(): void {
    if (this.deal && this.newNoteContent.trim()) {
      const newNote: Note = {
        id: 'n' + Date.now(),
        content: this.newNoteContent,
        author: 'John Doe',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      this.dealService.addNote(this.deal.id, newNote);
      this.newNoteContent = '';
    }
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
