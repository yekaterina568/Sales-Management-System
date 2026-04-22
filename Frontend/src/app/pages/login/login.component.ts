import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, CommonModule],
    template: `
    <div class="login-container">
        <div class="login-box">
        <h1>LiteCRM</h1>
        <h2>Sign In</h2>
        <div class="form-group">
            <label>Username</label>
            <input [(ngModel)]="username" type="text" placeholder="Enter username" />
        </div>
        <div class="form-group">
            <label>Password</label>
            <input [(ngModel)]="password" type="password" placeholder="Enter password" />
        </div>
        <div class="error" *ngIf="error">{{ error }}</div>
        <button (click)="login()">Sign In</button>
        </div>
    </div>
`,
    styles: [`
    .login-container { display:flex; justify-content:center; align-items:center; height:100vh; background:#0f172a; }
    .login-box { background:#1e293b; padding:40px; border-radius:12px; width:360px; color:white; }
    h1 { color:#3b82f6; margin-bottom:8px; }
    h2 { margin-bottom:24px; font-weight:400; }
    .form-group { margin-bottom:16px; }
    label { display:block; margin-bottom:6px; color:#94a3b8; font-size:14px; }
    input { width:100%; padding:10px; border-radius:8px; border:1px solid #334155; background:#0f172a; color:white; box-sizing:border-box; }
    button { width:100%; padding:12px; background:#3b82f6; color:white; border:none; border-radius:8px; cursor:pointer; font-size:16px; margin-top:8px; }
    button:hover { background:#2563eb; }
    .error { color:#ef4444; margin-bottom:12px; font-size:14px; }
`]
})
export class LoginComponent {
    username = '';
    password = '';
    error = '';

    constructor(private api: ApiService, private router: Router) { }

    login() {
        this.error = '';
        this.api.login(this.username, this.password).subscribe({
            next: (res) => {
                localStorage.setItem('access_token', res.access);
                localStorage.setItem('refresh_token', res.refresh);
                this.router.navigate(['/dashboard']);
            },
            error: () => { this.error = 'Invalid username or password'; }
        });
    }
}