import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ProfileService } from '../../core/services/profile.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
    profile = {
        first_name: '', last_name: '', email: '',
        role: '', avatar_url: '', bio: '', phone: '', company: ''
    };
    username = '';
    saved = false;
    loading = true;
    error = '';

    users: any[] = [];
    incomingRequests: any[] = [];
    outgoingRequests: any[] = [];
    sendingTo: number | null = null;
    collabMessage = '';
    activeTab: 'profile' | 'users' | 'requests' = 'profile';

    constructor(private api: ApiService, private profileService: ProfileService) {}

    ngOnInit(): void {
        this.loadProfile();
        this.loadUsers();
        this.loadRequests();
    }

    loadProfile(): void {
        this.api.getMyProfile().subscribe({
            next: (data) => {
                this.username = data.username;
                this.profile.first_name = data.first_name || '';
                this.profile.last_name = data.last_name || '';
                this.profile.email = data.email || '';
                this.profile.role = data.profile?.role || '';
                this.profile.avatar_url = data.profile?.avatar_url || '';
                this.profile.bio = data.profile?.bio || '';
                this.profile.phone = data.profile?.phone || '';
                this.profile.company = data.profile?.company || '';
                this.loading = false;
            },
            error: () => { this.error = 'Failed to load profile'; this.loading = false; }
        });
    }

    loadUsers(): void {
        this.api.getUsers().subscribe({ next: (u) => this.users = u });
    }

    loadRequests(): void {
        this.api.getIncomingRequests().subscribe({ next: (r) => this.incomingRequests = r });
        this.api.getOutgoingRequests().subscribe({ next: (r) => this.outgoingRequests = r });
    }

    save(): void {
        this.api.updateMyProfile(this.profile).subscribe({
            next: (data) => {
                this.saved = true;
                setTimeout(() => this.saved = false, 2500);
                this.profileService.updateProfile({
                    name: data.first_name
                        ? `${data.first_name} ${data.last_name}`.trim()
                        : data.username,
                    role: data.profile?.role || '',
                    avatarUrl: data.profile?.avatar_url || ''
                });
            },
            error: () => { this.error = 'Failed to save'; }
        });
    }

    sendRequest(userId: number): void {
        this.api.sendCollabRequest(userId, this.collabMessage).subscribe({
            next: () => {
                this.loadRequests();
                this.sendingTo = null;
                this.collabMessage = '';
            },
            error: (e) => { this.error = e.error?.error || 'Failed to send request'; }
        });
    }

    respond(id: number, action: 'accept' | 'decline'): void {
        this.api.respondToRequest(id, action).subscribe({
            next: () => this.loadRequests()
        });
    }

    getAvatarUrl(avatarUrl?: string, name?: string): string {
        return avatarUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=3b82f6&color=fff`;
    }

    getRequestStatus(userId: number): string {
        const r = this.outgoingRequests.find(r => r.to_user?.id === userId);
        return r ? r.status : '';
    }
}