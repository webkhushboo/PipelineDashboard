import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtModule } from '@auth0/angular-jwt';

import { environment } from '../environments/environment';

import { LoginDirective } from './directives/login.directive';
import { MarkdownDirective } from './directives/markdown.directive';

import { AppComponent } from './app.component';
import { MainComponent } from './main.component';
import { CallbackComponent } from './auth/callback/callback.component';
import { EnvironmentsAddComponent } from './environments/add/environments-add.component';
import { EnvironmentsEditComponent } from './environments/edit/environments-edit.component';
import { EnvironmentsListComponent } from './environments/list/environments-list.component';
import { EnvironmentsListPublicComponent } from './environments/list/public/environments-list-public.component';
import { EnvironmentsListPrivateComponent } from './environments/list/private/environments-list-private.component';
import { EnvironmentsReleasesComponent } from './environments/releases/environments-releases.component';
import { EnvironmentsTokensComponent } from './environments/tokens/environments-tokens.component';
import { EnvironmentsViewComponent } from './environments/view/environments-view.component';
import { EnvironmentsViewPublicComponent } from './environments/view/public/environments-view-public.component';
import { EnvironmentsViewPrivateComponent } from './environments/view/private/environments-view-private.component';
import { FeaturesComponent } from './features/features.component';
import { HelpComponent } from './help/help.component';
import { TermsConditionsComponent } from './legal/terms-conditions/terms-conditions.component';
import { PrivacyComponent } from './legal/privacy/privacy.component';

import { DialogConfirmationComponent } from './dialog/confirmation/dialog-confirmation.component';
import { DialogMarkdownComponent } from './dialog/markdown/dialog-markdown.component';

import { ApiHttpInterceptorModule } from '../interceptors/api.http.interceptor';
import { ErrorHttpInterceptorModule } from '../interceptors/error.http.interceptor';

import { PipesModule } from '../pipes/pipes.module';
import { ChartsModule } from './charts.module';
import { MaterialModule } from './material.module';
import { AppRoutesModule } from './routes.module';

export function tokenGetter(): string | null {
    return localStorage.getItem('access_token');
}

@NgModule({
    declarations: [
        AppComponent,
        MainComponent,
        CallbackComponent,
        LoginDirective,
        MarkdownDirective,
        EnvironmentsAddComponent,
        EnvironmentsEditComponent,
        EnvironmentsListComponent,
        EnvironmentsListPublicComponent,
        EnvironmentsListPrivateComponent,
        EnvironmentsReleasesComponent,
        EnvironmentsTokensComponent,
        EnvironmentsViewComponent,
        EnvironmentsViewPublicComponent,
        EnvironmentsViewPrivateComponent,
        FeaturesComponent,
        HelpComponent,
        TermsConditionsComponent,
        PrivacyComponent,
        DialogConfirmationComponent,
        DialogMarkdownComponent
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        RouterModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        ChartsModule,
        MaterialModule,
        PipesModule,
        AppRoutesModule,
        ApiHttpInterceptorModule,
        ErrorHttpInterceptorModule,
        JwtModule.forRoot({
            config: {
                tokenGetter: tokenGetter,
                whitelistedDomains: environment.whitelist,
            },
        })
    ],
    providers: [],
    entryComponents: [
        DialogConfirmationComponent,
        DialogMarkdownComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
