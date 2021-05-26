import { InternalOAuthError, StrategyOptions, VerifyFunction } from 'passport-oauth2';
import { GitProviderProfile as GitHubProfile } from '../models/authentication/GitProviderProfile';
import { CustomOAuth2Strategy } from './CustomOAuth2Strategy';
// import * as dotenv from 'dotenv';
import { GitHubJSON } from '../models/authentication/GitHubJSON';
import { isGitHubJSON } from '../predicates/authentication/isGitHubJSON';
// dotenv.config({ path: './process.env' });

// A custom passport strategy to easily switch to github as authentication provider and to only use the profile properties we need.
export class GitHubOAuth2Strategy extends CustomOAuth2Strategy {

    emailUrl: string;

    constructor(verify: VerifyFunction, name: "github" | "custom" = "github") {
        const gitHubUrl: string = "https://github.com";
        const gitHubApiUrl: string = "https://api.github.com";
        const githubAuthUrl: string = `${gitHubUrl}/login/oauth/authorize`;
        const gitHubTokenUrl: string = `${gitHubUrl}/login/oauth/access_token`;
        const profileUrl: string = `${gitHubApiUrl}/user`;
        const options: StrategyOptions = {
            authorizationURL: githubAuthUrl,
            tokenURL: gitHubTokenUrl,
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL,
            scope: 'user:email'
        }
        super(options, verify, name, profileUrl);
        this.emailUrl = `${profileUrl}/emails`
    }

    parseProfile(json: GitHubJSON): GitHubProfile {
        return {
            id: json.id,
            userName: json.login,
            email: json.email,
            name: json.name
        };
    };

    async userProfile(accessToken: string, done: (err?: Error | null, profile?: any) => void): Promise<void> {
        let json: any = {};
        let emails: { email: string, primary: boolean, verified: boolean, visibility: string }[];

        // fetch user profile data
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

            // if email is not public and therefore not defined -> try to fetch it from GitHub's email API endpoint
            if (!json.email) {
                // fetch primary user profile email
                this._oauth2.get(this.emailUrl, accessToken, (err, body) => {
                    // if attempt to fetch primary user email fails -> return obtained profile data
                    if (err || typeof body !== 'string') {
                        return done(null, this.parseProfile(json));
                    }
                    else {
                        try {
                            emails = JSON.parse(body);
                            if (emails && emails.length > 0) {
                                json.email = emails.filter(email => email.primary === true)[0].email;
                            }
                        } catch (error) {
                            // if attempt to parse primary user email fails -> return obtained profile data
                            return done(null, this.parseProfile(json));
                        }
                    }
                    if (isGitHubJSON(json)) {
                        done(null, this.parseProfile(json));
                    }
                    else {
                        return done(new Error('Id, username, email or name is not defined'));
                    }
                });
            }
        });
    }
}