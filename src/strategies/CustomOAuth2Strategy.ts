import { Strategy as OAuth2Strategy, StrategyOptions, VerifyFunction } from 'passport-oauth2';
import { GitHubJSON } from '../models/authentication/GitHubJSON';
import { GitLabJSON } from '../models/authentication/GitLabJSON';
import { GitProviderProfile } from '../models/authentication/GitProviderProfile';

// A custom passport strategy to easily switch between github and gitlab (hosted by HAW Hamburg) as authentication provider
export abstract class CustomOAuth2Strategy extends OAuth2Strategy {

    profileUrl: string;

    constructor(options: StrategyOptions, verify: VerifyFunction, name: "github" | "gitlab" | "custom", profileUrl: string) {
        super(options, verify);
        this.name = name;
        this.profileUrl = profileUrl;
        this._oauth2.useAuthorizationHeaderforGET(true);
    }

    abstract parseProfile(json: GitLabJSON | GitHubJSON): GitProviderProfile;
    abstract userProfile(accessToken: string, done: (err?: Error | null, profile?: any) => void): void;
}