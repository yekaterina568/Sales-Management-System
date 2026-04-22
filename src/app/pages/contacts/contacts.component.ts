import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../core/services/contact.service';
import { Contact } from '../../core/models/crm.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent implements OnInit {
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  searchQuery: string = '';

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.contactService.getContacts().subscribe(contacts => {
      this.contacts = contacts;
      this.filteredContacts = contacts;
    });
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredContacts = this.contacts;
    } else {
      this.filteredContacts = this.contacts.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.company.toLowerCase().includes(query)
      );
    }
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }
}
