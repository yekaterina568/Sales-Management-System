import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DealService } from '../../core/services/deal.service';
import { Deal } from '../../core/models/crm.models';
import { 
  CdkDragDrop, 
  moveItemInArray, 
  transferArrayItem, 
  CdkDrag, 
  CdkDropList, 
  CdkDropListGroup 
} from '@angular/cdk/drag-drop';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CdkDropListGroup, CdkDropList, CdkDrag, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  deals: Deal[] = [];
  
  columns: { name: string, status: Deal['status'], deals: Deal[] }[] = [
    { name: 'New', status: 'New', deals: [] },
    { name: 'In Progress', status: 'In Progress', deals: [] },
    { name: 'Negotiation', status: 'Negotiation', deals: [] },
    { name: 'Won / Lost', status: 'Won', deals: [] }
  ];

  stats = [
    { title: 'TOTAL DEALS', value: '47', trend: '+12% this month', icon: 'trending-up' },
    { title: 'REVENUE', value: '$124,500', trend: '+8.2% this month', icon: 'dollar-sign' },
    { title: 'ACTIVE CONTACTS', value: '183', trend: '+5 new this week', icon: 'users' }
  ];

  constructor(private dealService: DealService) {}

  ngOnInit(): void {
    this.dealService.getDeals().subscribe(deals => {
      this.deals = deals;
      this.organizeDeals();
    });
  }

  organizeDeals(): void {
    this.columns.forEach(col => col.deals = []);
    this.deals.forEach(deal => {
      const col = this.columns.find(c => {
        if (c.name === 'Won / Lost') {
          return deal.status === 'Won' || deal.status === 'Lost';
        }
        return c.status === deal.status;
      });
      if (col) {
        col.deals.push(deal);
      }
    });
  }

  drop(event: CdkDragDrop<Deal[]>): void {
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
        this.dealService.updateDealStatus(deal.id, targetColumn.status);
      }
    }
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
