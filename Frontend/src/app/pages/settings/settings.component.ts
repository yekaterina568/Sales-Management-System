import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService, UserProfile } from '../../core/services/profile.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
    profile: UserProfile = { name: '', role: '', avatarUrl: '' };
    saved = false;

    constructor(private profileService: ProfileService) { }

    ngOnInit(): void {
        this.profile = { ...this.profileService.getProfile() };
    }

    save(): void {
        this.profileService.updateProfile({ ...this.profile });
        this.saved = true;
        setTimeout(() => this.saved = false, 2500);
    }

    getAvatarUrl(): string {
        return this.profile.avatarUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(this.profile.name)}&background=3b82f6&color=fff`;
    }
}