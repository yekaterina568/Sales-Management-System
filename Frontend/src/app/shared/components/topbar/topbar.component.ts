import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProfileService, UserProfile } from '../../../core/services/profile.service';
import { NotificationService, AppNotification } from '../../../core/services/notification.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './topbar.component.html',
    styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit, OnDestroy {
    profile!: UserProfile;
    notifications: AppNotification[] = [];
    showNotifications = false;
    showUserMenu = false;

    private subs = new Subscription();

    constructor(
        private profileService: ProfileService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.subs.add(
            this.profileService.profile$.subscribe(p => this.profile = p)
        );
        this.subs.add(
            this.notificationService.notifications$.subscribe(n => this.notifications = n)
        );
        this.notificationService.load();
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    getAvatarUrl(): string {
        return this.profile.avatarUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(this.profile.name)}&background=3b82f6&color=fff`;
    }

    getDayLabel(daysLeft: number): string {
        if (daysLeft < 0) return 'Просрочено';
        if (daysLeft === 0) return 'Сегодня';
        return 'Завтра';
    }

    dismiss(id: string, event: Event): void {
        event.stopPropagation();
        this.notificationService.dismiss(id);
    }

    toggleNotifications(): void {
        this.showNotifications = !this.showNotifications;
        this.showUserMenu = false;
    }

    toggleUserMenu(): void {
        this.showUserMenu = !this.showUserMenu;
        this.showNotifications = false;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(e: Event): void {
        const target = e.target as HTMLElement;
        if (!target.closest('.notifications') && !target.closest('.user-info')) {
            this.showNotifications = false;
            this.showUserMenu = false;
        }
    }
}