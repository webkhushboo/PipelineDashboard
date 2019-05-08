import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';

// Dashboard hub model and services
import { ProjectModel } from '../../models/index.model';
import { ProjectService } from '../../../core/services/project.service';
import { Router } from '@angular/router';
import { SpinnerService } from '../../../core/services/spinner.service';

@Component({
    selector: 'dashboard-projects-public',
    templateUrl: './public.component.html',
})
export class PublicProjectsComponent implements OnInit {

    private projectSubscription: Subscription;
    public projects: ProjectModel[] = [];
    @Input() title: string = 'My Projects';

    constructor(
        private projectService: ProjectService,
        private router: Router,
        private spinnerService: SpinnerService
    ) {
    }

    ngOnInit(): void {
        this.spinnerService.setProgressBar(true);
        if (this.router.url === '/') {
            this.projectSubscription = this.projectService
                .findPublicProjects()
                .subscribe((projects: ProjectModel[]) => {
                    this.projects = projects;
                    this.spinnerService.setProgressBar(false);
                });
        } else {
            this.projectSubscription = this.projectService
                .findMyProjects()
                .subscribe((projects: ProjectModel[]) => {
                    this.projects = projects;
                    this.spinnerService.setProgressBar(false);
                });
        }
    }

    ngDestroy(): void {
        this.projectSubscription
            .unsubscribe();
    }
}
