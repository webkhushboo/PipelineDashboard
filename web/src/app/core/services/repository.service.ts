import { Injectable } from '@angular/core';

// Firestore modules
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';

// Rxjs operators
import { from, Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

// Dashboard hub model and services
import { AuthenticationService } from './authentication.service';
import { RepositoriesModel } from '../../shared/models/index.model';
import { RepositoryModel, ProfileModel } from '../../shared/models/index.model';

@Injectable({
    providedIn: 'root'
})
export class RepositoryService {

    private profile: ProfileModel;

    constructor(
        private afs: AngularFirestore,
        private fns: AngularFireFunctions,
        private authService: AuthenticationService,
    ) {
        this.authService.checkAuth().subscribe((profile: ProfileModel) => this.profile = profile);
    }

    // This function returns all the repository list for user
    public findAll(force: boolean = false): Observable<RepositoriesModel> {
        if (force) {
            const callable: any = this.fns.httpsCallable('findAllUserRepositories');
            callable({ token: this.authService.profile.oauth.githubToken });
        }

        return this.authService
                .getProfile(this.authService.profile.uid)
                .pipe(
                    pluck('repositories')
                );
    }

    // This function returns the repository via uid
    public findOneById(uid: string): Observable<RepositoryModel> {
        return from(this.afs.collection<RepositoryModel>('repositories').doc<RepositoryModel>(uid).valueChanges());
    }

    // This function loads all the available repositories
    public loadRepository(fullName: string): void {
        const callable: any = this.fns.httpsCallable('getRepositoryInfo');
        callable({ fullName, token: this.authService.profile.oauth.githubToken });
    }
}