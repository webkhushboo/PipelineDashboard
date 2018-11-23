import { Injectable, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

@Injectable()
export class ErrorHttpInterceptor implements HttpInterceptor {

    constructor(
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(tap(undefined, (error: HttpErrorResponse) => {
            if (error instanceof HttpErrorResponse) {
                let message: string = '';
                switch (error.status) {
                    case 401:
                    case 403:
                        message = 'Permission denied. Please try again.';
                        break;
                    case 404:
                        message = 'Not found. Please try again.';
                        break;
                    default:
                        this.snackBar.open(error.message, undefined, { duration: 5000 });
                        break;
                }

                this.router.navigate(['/'])
                    .then(() => this.snackBar.open(message, undefined, { duration: 5000 }));
            }
        }));
    }
}

@NgModule({
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorHttpInterceptor,
            multi: true
        }
    ]
})
export class ErrorHttpInterceptorModule {
}