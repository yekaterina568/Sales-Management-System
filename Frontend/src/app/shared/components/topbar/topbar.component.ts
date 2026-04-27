import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProfileService, UserProfile } from '../../../core/services/profile.service';
import { NotificationService, AppNotification } from '../../../core/services/notification.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './topbar.component.html',
    styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit, OnDestroy {
    profile!: UserProfile;
    notifications: AppNotification[] = [];
    showNotifications = false;
    showUserMenu = false;

    searchQuery = '';
    searchResults: any = null;
    showSearch = false;
    private searchSubject = new Subject<string>();

    private subs = new Subscription();

    constructor(
        private profileService: ProfileService,
        private notificationService: NotificationService,
        private api: ApiService
    ) {}

    ngOnInit(): void {
        this.subs.add(this.profileService.profile$.subscribe(p => this.profile = p));
        this.subs.add(this.notificationService.notifications$.subscribe(n => this.notifications = n));
        this.notificationService.load();

        this.subs.add(
            this.searchSubject.pipe(
                debounceTime(300),
                distinctUntilChanged()
            ).subscribe(q => {
                if (q.length < 2) { this.searchResults = null; return; }
                this.api.search(q).subscribe({
                    next: (res) => { this.searchResults = res; this.showSearch = true; },
                    error: () => {}
                });
            })
        );
    }

    ngOnDestroy(): void { this.subs.unsubscribe(); }

    onSearchInput(): void {
        this.searchSubject.next(this.searchQuery);
        if (!this.searchQuery) { this.searchResults = null; this.showSearch = false; }
    }

    clearSearch(): void {
        this.searchQuery = '';
        this.searchResults = null;
        this.showSearch = false;
    }

    hasResults(): boolean {
        if (!this.searchResults) return false;
        return (
            this.searchResults.deals?.length > 0 ||
            this.searchResults.contacts?.length > 0 ||
            this.searchResults.tasks?.length > 0 ||
            this.searchResults.users?.length > 0
        );
    }

    getAvatarUrl(): string {
        return this.profile.avatarUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(this.profile.name)}&background=3b82f6&color=fff`;
    }

    getDayLabel(daysLeft: number): string {
        if (daysLeft < 0) return 'Overdue';
        if (daysLeft === 0) return 'Today';
        return 'Tomorrow';
    }

    dismiss(id: string, event: Event): void {
        event.stopPropagation();
        this.notificationService.dismiss(id);
    }

    toggleNotifications(): void { this.showNotifications = !this.showNotifications; this.showUserMenu = false; }
    toggleUserMenu(): void { this.showUserMenu = !this.showUserMenu; this.showNotifications = false; }

    @HostListener('document:click', ['$event'])
    onDocumentClick(e: Event): void {
        const t = e.target as HTMLElement;
        if (!t.closest('.notifications') && !t.closest('.user-info')) {
            this.showNotifications = false;
            this.showUserMenu = false;
        }
        if (!t.closest('.search-container')) {
            this.showSearch = false;
        }
    }
}