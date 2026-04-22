import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const http = inject(HttpClient);

    const token = localStorage.getItem('access_token');
    if (token) {
        req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
    }

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                const refresh = localStorage.getItem('refresh_token');
                if (refresh) {
                    return http.post('http://127.0.0.1:8000/api/token/refresh/', { refresh }).pipe(
                        switchMap((res: any) => {
                            localStorage.setItem('access_token', res.access);
                            const retryReq = req.clone({
                                setHeaders: { Authorization: `Bearer ${res.access}` }
                            });
                            return next(retryReq);
                        }),
                        catchError(() => {
                            localStorage.clear();
                            router.navigate(['/login']);
                            return throwError(() => error);
                        })
                    );
                } else {
                    localStorage.clear();
                    router.navigate(['/login']);
                }
            }
            return throwError(() => error);
        })
    );
};