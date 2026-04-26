import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UserProfile {
    name: string;
    role: string;
    avatarUrl: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
    private defaultProfile: UserProfile = {
        name: localStorage.getItem('username') || 'User',
        role: localStorage.getItem('profile_role') || 'Sales Manager',
        avatarUrl: localStorage.getItem('profile_avatar') || ''
    };

    private profileSubject = new BehaviorSubject<UserProfile>(this.defaultProfile);
    profile$ = this.profileSubject.asObservable();

    updateProfile(profile: UserProfile): void {
        localStorage.setItem('username', profile.name);
        localStorage.setItem('profile_role', profile.role);
        localStorage.setItem('profile_avatar', profile.avatarUrl);
        this.profileSubject.next(profile);
    }

    getProfile(): UserProfile {
        return this.profileSubject.getValue();
    }
}