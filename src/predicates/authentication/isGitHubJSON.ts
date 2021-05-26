import { GitHubJSON } from "../../models/authentication/GitHubJSON";

export function isGitHubJSON(json: any): json is GitHubJSON {
    return (
        json.hasOwnProperty('id') &&
        json.hasOwnProperty('login') &&
        json.hasOwnProperty('email') &&
        json.hasOwnProperty('name')
    )
}