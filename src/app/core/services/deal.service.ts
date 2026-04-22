import { Injectable } from '@angular/core';
import { Deal, Note, Activity } from '../models/crm.models';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DealService {
  private deals: Deal[] = [
    {
      id: '1',
      title: 'Website Redesign',
      company: 'Acme Corp',
      amount: 12000,
      status: 'New',
      owner: 'John Doe',
      expectedCloseDate: 'Feb 28, 2025',
      probability: 75,
      source: 'Referral',
      notes: [
        {
          id: 'n1',
          content: 'Initial meeting went well. Sarah is interested in a full website redesign including new branding elements. Budget approved by their team lead. Need to follow up on the timeline for Q1 delivery.',
          author: 'John Doe',
          date: 'Jan 20, 2025'
        }
      ],
      activities: [
        { id: 'a1', type: 'meeting', description: 'Meeting scheduled with Sarah for next Tuesday', date: 'Jan 25, 2025 - 2 hours ago' },
        { id: 'a2', type: 'note', description: 'Note added from the initial meeting discussion', date: 'Jan 22, 2025 - 3 days ago' },
        { id: 'a3', type: 'stage', description: 'Moved to Negotiation from In Progress', date: 'Jan 20, 2025 - 5 days ago' },
        { id: 'a4', type: 'stage', description: 'Moved to In Progress from New', date: 'Jan 17, 2025 - 8 days ago' },
        { id: 'a5', type: 'created', description: 'Deal created by John Doe', date: 'Jan 15, 2025 - 10 days ago' }
      ]
    },
    {
      id: '2',
      title: 'SEO Audit',
      company: 'TechStart Inc',
      amount: 3500,
      status: 'New',
      owner: 'John Doe',
      expectedCloseDate: 'Mar 15, 2025'
    },
    {
      id: '3',
      title: 'Brand Identity',
      company: 'Nova Labs',
      amount: 8200,
      status: 'New',
      owner: 'John Doe',
      expectedCloseDate: 'Mar 10, 2025'
    },
    {
      id: '4',
      title: 'App Prototype',
      company: 'Zenith Co',
      amount: 5000,
      status: 'New',
      owner: 'John Doe',
      expectedCloseDate: 'Feb 15, 2025'
    },
    {
      id: '5',
      title: 'CRM Integration',
      company: 'DataFlow Systems',
      amount: 24000,
      status: 'In Progress',
      owner: 'Jane Smith',
      expectedCloseDate: 'Apr 01, 2025'
    },
    {
      id: '6',
      title: 'E-commerce Store',
      company: 'RetailMax',
      amount: 18500,
      status: 'In Progress',
      owner: 'Jane Smith',
      expectedCloseDate: 'Apr 10, 2025'
    },
    {
      id: '7',
      title: 'Cloud Migration',
      company: 'Pinnacle Group',
      amount: 32000,
      status: 'In Progress',
      owner: 'John Doe',
      expectedCloseDate: 'May 20, 2025'
    },
    {
      id: '8',
      title: 'Enterprise Suite',
      company: 'GlobalTech Inc',
      amount: 45000,
      status: 'Negotiation',
      owner: 'John Doe',
      expectedCloseDate: 'Jun 30, 2025'
    },
    {
      id: '9',
      title: 'API Platform',
      company: 'DevHub Solutions',
      amount: 15800,
      status: 'Negotiation',
      owner: 'Alex Morgan',
      expectedCloseDate: 'May 15, 2025'
    },
    {
      id: '10',
      title: 'Mobile App',
      company: 'Spark Digital',
      amount: 28000,
      status: 'Won',
      owner: 'John Doe',
      expectedCloseDate: 'Jan 10, 2025'
    },
    {
      id: '11',
      title: 'Dashboard UI',
      company: 'Orbit Media',
      amount: 9200,
      status: 'Won',
      owner: 'John Doe',
      expectedCloseDate: 'Jan 05, 2025'
    },
    {
      id: '12',
      title: 'Data Analytics',
      company: 'Vertex Corp',
      amount: 6400,
      status: 'Lost',
      owner: 'John Doe',
      expectedCloseDate: 'Dec 20, 2024'
    }
  ];

  private dealsSubject = new BehaviorSubject<Deal[]>(this.deals);

  getDeals(): Observable<Deal[]> {
    return this.dealsSubject.asObservable();
  }

  getDealById(id: string): Deal | undefined {
    return this.deals.find(d => d.id === id);
  }

  updateDealStatus(dealId: string, newStatus: Deal['status']): void {
    const deal = this.deals.find(d => d.id === dealId);
    if (deal) {
      deal.status = newStatus;
      this.dealsSubject.next([...this.deals]);
    }
  }

  addNote(dealId: string, note: Note): void {
    const deal = this.deals.find(d => d.id === dealId);
    if (deal) {
      if (!deal.notes) deal.notes = [];
      deal.notes.push(note);
      this.dealsSubject.next([...this.deals]);
    }
  }
}
