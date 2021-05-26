import { InternalOAuthError, StrategyOptions, VerifyFunction } from 'passport-oauth2';
import { isGitLabJSON } from '../predicates/authentication/isGitLabJSON';
import { GitProviderProfile as GitLabProfile } from '../models/authentication/GitProviderProfile';
import { CustomOAuth2Strategy } from './CustomOAuth2Strategy';
import { GitLabJSON } from '../models/authentication/GitLabJSON';

// A custom passport strategy to easily switch between github and gitlab (hosted by HAW Hamburg) as authentication provider
export class GitLabOAuth2Strategy extends CustomOAuth2Strategy {

    constructor(verify: VerifyFunction, name: "gitlab" | "custom" = "gitlab", gitlabBaseUrl: string = "https://git.haw-hamburg.de/") {
        const gitLabAuthUrl: string = `${gitlabBaseUrl}/oauth/authorize`;
        const gitLabTokenUrl: string = `${gitlabBaseUrl}/oauth/token`;
        const profileUrl: string = `${gitlabBaseUrl}/api/v4/user`;
        const options: StrategyOptions = {
            authorizationURL: gitLabAuthUrl,
            tokenURL: gitLabTokenUrl,
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL,
            scope: 'read_user'
        }
        super(options, verify, name, profileUrl);
    }

    parseProfile(json: GitLabJSON): GitLabProfile {
        let name: string = json.name;
        // Refactor name from "surname, first name" to "first name surname."
        json.name = name.split(", ").map((_val, i, arr) => arr[arr.length - 1 - i]).join(" ");
        return {
            id: json.id,
            userName: json.username,
            email: json.email,
            name: json.name
        };
    };

    userProfile(accessToken: string, done: (err?: Error | null, profile?: any) => void): void {
        var json: any = {};
        this._oauth2.get(this.profileUrl, accessToken, (err, body) => {
            if (err) {
                return done(new InternalOAuthError('Failed to fetch user profile', err));
            }
            else if (typeof body === 'string') {
                try {
                    json = JSON.parse(body);
                } catch (error) {
                    return done(new Error('Failed to parse user profile'));
                }
            }
            else {
                return done(new Error('Failed to parse body'));
            }

            if (isGitLabJSON(json)) {
                done(null, this.parseProfile(json));
            }
            else {
                return done(new Error('id, username, email or name is not defined'));
            }
        });
    }
}