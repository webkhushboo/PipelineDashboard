import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { forkJoin, Observable } from 'rxjs';
import { filter, map, mergeMap, switchMap, take, tap } from 'rxjs/operators';

import { MatDialog, MatDialogConfig } from '@angular/material';
import { v4 as uuid } from 'uuid';

// Dashboard model and services
import { DialogConfirmationComponent } from '@shared/dialog/confirmation/dialog-confirmation.component';
import { IProject, ProjectModel, RepositoryModel } from '@shared/models/index.model';
import { ActivityService } from './activity.service';
import { AuthenticationService } from './authentication.service';
import { RepositoryService } from './repository.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {

  constructor(
    private afs: AngularFirestore,
    private authService: AuthenticationService,
    private activityService: ActivityService,
    private dialog: MatDialog,
    private repositoryService: RepositoryService
  ) {
  }

  // This function is for creating the project for logged in user
  public create(data: IProject): Observable<ProjectModel> {
    const project: ProjectModel = new ProjectModel(
      {
        uid: uuid(),
        ...data,
        access: { admin: [this.authService.profile.uid] },
        createdOn: firebase.firestore.Timestamp.fromDate(new Date()),
        updatedOn: firebase.firestore.Timestamp.fromDate(new Date()),
      }
    );

    return this.activityService
      .start()
      .pipe(
        tap(() => this.repositoryService.refresh()),
        switchMap(() => this.afs.collection<IProject>('projects').doc(project.uid).set(project.toData())),
        map(() => project),
        take(1)
      );
  }

  // This function delete the project
  public showDeleteDialog(projectUid: string): Observable<void> {
    let dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig = {
      width: '500px',
      data: {
        title: 'Delete Project',
        content: 'Are you sure you want to delete?',
      },
    };

    return this.dialog
      .open(DialogConfirmationComponent, dialogConfig)
      .afterClosed()
      .pipe(
        filter((result: boolean) => !!result),
        switchMap(() => this.delete(projectUid))
      );
  }

  // This function delete the project via uid
  public delete(uid: string): Observable<void> {
    return this.activityService
      .start()
      .pipe(
        switchMap(() => this.afs.collection<IProject>('projects').doc<IProject>(uid).delete()),
        take(1)
      );
  }

  // This function returns the public projects list
  public findPublicProjects(): Observable<ProjectModel[]> {
    return this.activityService
      .start()
      .pipe(
        switchMap(() => this.afs
          .collection<IProject>(
            'projects',
            (ref: firebase.firestore.Query) => ref.where('type', '==', 'public')
              .orderBy('updatedOn', 'desc').limit(10)
          )
          .valueChanges()),
        map((projects: IProject[]) => projects.map((project: IProject) => new ProjectModel(project)))
      );
  }

  // This function returns the private projects list
  public findMyProjects(): Observable<ProjectModel[]> {
    return this.activityService
      .start()
      .pipe(
        switchMap(() => this.afs
          .collection<IProject>(
            'projects',
            (ref: firebase.firestore.Query) => ref.where('access.admin', 'array-contains', this.authService.profile.uid)
              .orderBy('updatedOn', 'desc')
          )
          .valueChanges()),
        map((projects: IProject[]) => projects.map((project: IProject) => new ProjectModel(project)))
      );
  }

  // This function returns the project details via id
  public findOneById(uid: string): Observable<ProjectModel> {
    return this.activityService
      .start()
      .pipe(
        switchMap(() => this.afs.collection<IProject>('projects').doc<IProject>(uid).valueChanges()),
        map((project: IProject) => new ProjectModel(project))
      );
  }

  // This function update the project details
  public save(data: IProject): Observable<void> {
    return this.findOneById(data.uid)
      .pipe(
        take(1),
        map((project: ProjectModel) => ({
          ...project.toData(),
          ...data,
          updatedOn: firebase.firestore.Timestamp.fromDate(new Date()),
        })),
        switchMap((project: IProject) => this.afs
          .collection<IProject>('projects')
          .doc<IProject>(project.uid)
          .set(project, { merge: true }))
      );
  }

  // This function add the repository in any project
  // @TODO: move to repository service
  public saveRepositories(project: ProjectModel, repositories: RepositoryModel[]): Observable<void> {
    // remove webhook from unselected repo
    if (project.repositories && project.repositories.length > 0) {
      const remove: string[] = project.repositories
        .filter((uid: string) => repositories.findIndex((repo: RepositoryModel) => uid === repo.uid) === -1);
      const removeWebhooks: Observable<RepositoryModel>[] = [];
      remove.forEach((uid: string) => {
        const tmp: Observable<RepositoryModel> = this.repositoryService.deleteGitWebhook({ uid }).pipe(take(1));
        removeWebhooks.push(tmp);
      });
      forkJoin(removeWebhooks).subscribe();
    }

    if (!repositories.length) {
      return this.activityService
        .start()
        .pipe(
          switchMap(() => this.afs
            .collection<IProject>('projects')
            .doc<IProject>(project.uid)
            .set(
              {
                repositories: [],
                updatedOn: firebase.firestore.Timestamp.fromDate(new Date()),
              },
              { merge: true })),
          take(1)
        );
    }

    return this.activityService
      .start()
      .pipe(
        mergeMap(() => forkJoin(
          ...repositories.map((repository: RepositoryModel) => this.repositoryService.loadRepository(repository))
        )),
        switchMap(() => this.afs
          .collection<IProject>('projects')
          .doc<IProject>(project.uid)
          .set(
            {
              repositories: repositories.map((repo: RepositoryModel) => repo.uid),
              updatedOn: firebase.firestore.Timestamp.fromDate(new Date()),
            },
            { merge: true }
          )
        ),
        take(1)
      );
  }

  public getPopularProjects(): Observable<ProjectModel[]> {
    return this.activityService
      .start()
      .pipe(
        switchMap(() => this.afs
          .collection<IProject>(
            'projects',
            (ref: firebase.firestore.Query) => ref
              .where('type', '==', 'public')
              .orderBy('views', 'desc')
              .limit(4)
          )
          .valueChanges()),
        map((projects: IProject[]) => projects.map((project: IProject) => new ProjectModel(project)))
      );
  }
}
