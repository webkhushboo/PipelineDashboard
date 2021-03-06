// Third party modules
import { firestore } from 'firebase-admin';

// DashboardHub imports
import { GitHubEventModel } from './event.mapper';
import { GitHubContributorModel } from './index.mapper';
import { GitHubIssueModel } from './issue.mapper';
import { GitHubMilestoneModel } from './milestone.mapper';
import { GitHubPullRequestModel } from './pullRequest.mapper';
import { GitHubReleaseModel } from './release.mapper';
import { GitHubRepositoryWebhookModel } from './webhook.mapper';

export interface GitHubRepositoryInput {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  url: string;
  private: boolean;
  fork: boolean;
  forks_count: number;
  stargazers_count: number;
  watchers_count: number;
}

export interface GitHubRepositoryModel {
  id: number;
  uid?: string;
  fullName: string;
  description?: string;
  url: string;
  private: boolean;
  fork: boolean;
  pullRequests?: GitHubPullRequestModel[];
  events?: GitHubEventModel[];
  releases?: GitHubReleaseModel[];
  issues?: GitHubIssueModel[];
  contributors?: GitHubContributorModel[];
  milestones?: GitHubMilestoneModel[];
  updatedAt: firestore.Timestamp;
  webhook?: GitHubRepositoryWebhookModel;
  forksCount: number;
  stargazersCount: number;
  watchersCount: number;
}

export class GitHubRepositoryMapper {
  static import(input: GitHubRepositoryInput, type: 'minimum' | 'all' | 'event' = 'minimum'): GitHubRepositoryModel {
    const output: any = {};
    if (type === 'all') {
      output.fork = input.fork;
      output.forksCount = input.forks_count;
      output.stargazersCount = input.stargazers_count;
      output.watchersCount = input.watchers_count;
    }

    if (type === 'event' || type === 'all') {
      output.id = input.id;
      output.fullName = input.name;
      output.url = input.url;
    }

    if (type === 'minimum' || type === 'all') {
      output.id = input.id;
      output.fullName = input.full_name;
      output.description = input.description;
      output.private = input.private;
    }

    return output;
  }
}
