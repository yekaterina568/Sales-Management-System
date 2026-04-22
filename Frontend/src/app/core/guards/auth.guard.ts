import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
    const token = localStorage.getItem('access_token');
    if (token) return true;
    inject(Router).navigate(['/login']);
    return false;
};