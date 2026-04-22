import { Injectable } from '@angular/core';
import { Contact } from '../models/crm.models';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private contacts: Contact[] = [
    {
      id: '1',
      name: 'Marcus Johnson',
      company: 'Acme Corp',
      phone: '(415) 555-0132',
      email: 'marcus.j@acmecorp.com',
      status: 'Active',
      lastActivity: '2 hours ago'
    },
    {
      id: '2',
      name: 'Sarah Chen',
      company: 'TechVentures Inc',
      phone: '(628) 555-0198',
      email: 's.chen@techventures.io',
      status: 'Lead',
      lastActivity: '5 hours ago'
    },
    {
      id: '3',
      name: 'David Park',
      company: 'Horizon Labs',
      phone: '(510) 555-0274',
      email: 'd.park@horizonlabs.com',
      status: 'Active',
      lastActivity: '1 day ago'
    },
    {
      id: '4',
      name: 'Emily Rodriguez',
      company: 'Stellar Design Co',
      phone: '(323) 555-0156',
      email: 'emily.r@stellardesign.co',
      status: 'Active',
      lastActivity: '3 days ago'
    },
    {
      id: '5',
      name: 'James Mitchell',
      company: 'CloudSync Solutions',
      phone: '(212) 555-0341',
      email: 'j.mitchell@cloudsync.io',
      status: 'Inactive',
      lastActivity: '2 weeks ago'
    },
    {
      id: '6',
      name: 'Maria Santos',
      company: 'NovaPay Financial',
      phone: '(305) 555-0489',
      email: 'm.santos@novapay.com',
      status: 'Lead',
      lastActivity: '6 hours ago'
    },
    {
      id: '7',
      name: 'Kevin Tanaka',
      company: 'Apex Dynamics',
      phone: '(408) 555-0712',
      email: 'k.tanaka@apexdyn.com',
      status: 'Active',
      lastActivity: '30 min ago'
    },
    {
      id: '8',
      name: 'Lisa Wang',
      company: 'Bright Pixel Media',
      phone: '(650) 555-0893',
      email: 'l.wang@brightpixel.co',
      status: 'Lead',
      lastActivity: '1 day ago'
    },
    {
      id: '9',
      name: 'Robert Blake',
      company: 'Summit Consulting',
      phone: '(773) 555-0265',
      email: 'r.blake@summitconsult.com',
      status: 'Inactive',
      lastActivity: '1 month ago'
    },
    {
      id: '10',
      name: 'Aisha Nkemelu',
      company: 'GreenLeaf Organics',
      phone: '(917) 555-0438',
      email: 'a.nkemelu@greenleaf.org',
      status: 'Active',
      lastActivity: '4 hours ago'
    }
  ];

  private contactsSubject = new BehaviorSubject<Contact[]>(this.contacts);

  getContacts(): Observable<Contact[]> {
    return this.contactsSubject.asObservable();
  }

  getContactById(id: string): Contact | undefined {
    return this.contacts.find(c => c.id === id);
  }
}
