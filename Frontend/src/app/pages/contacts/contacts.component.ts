import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
    selector: 'app-contacts',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './contacts.component.html',
    styleUrl: './contacts.component.scss'
})
export class ContactsComponent implements OnInit {
    contacts: any[] = [];
    filteredContacts: any[] = [];
    searchQuery: string = '';
    error: string = '';
    loading: boolean = true;

    showAddForm: boolean = false;
    newContact = {
        full_name: '',
        company: '',
        email: '',
        phone: '',
        status: 'Active'
    };

    constructor(private api: ApiService) { }

    ngOnInit(): void {
        this.loadContacts();
    }

    loadContacts(): void {
        this.loading = true;
        this.api.getContacts().subscribe({
            next: (contacts) => {
                this.contacts = contacts;
                this.filteredContacts = contacts;
                this.loading = false;
            },
            error: () => {
                this.error = 'Failed to load contacts';
                this.loading = false;
            }
        });
    }

    onSearch(): void {
        const query = this.searchQuery.toLowerCase().trim();
        if (!query) {
            this.filteredContacts = this.contacts;
        } else {
            this.filteredContacts = this.contacts.filter(c =>
                c.full_name?.toLowerCase().includes(query) ||
                c.company?.toLowerCase().includes(query)
            );
        }
    }

    addContact(): void {
        if (!this.newContact.full_name.trim()) return;
        this.api.createContact(this.newContact).subscribe({
            next: (contact) => {
                this.contacts.push(contact);
                this.filteredContacts = [...this.contacts];
                this.showAddForm = false;
                this.newContact = { full_name: '', company: '', email: '', phone: '', status: 'Active' };
            },
            error: () => { this.error = 'Failed to add contact'; }
        });
    }

    deleteContact(id: number): void {
        this.api.deleteContact(id).subscribe({
            next: () => {
                this.contacts = this.contacts.filter(c => c.id !== id);
                this.filteredContacts = this.filteredContacts.filter(c => c.id !== id);
            },
            error: () => { this.error = 'Failed to delete contact'; }
        });
    }

    getStatusClass(status: string): string {
        return status.toLowerCase();
    }
}