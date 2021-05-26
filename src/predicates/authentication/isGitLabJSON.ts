import { GitLabJSON } from "../../models/authentication/GitLabJSON";

export function isGitLabJSON(json: any): json is GitLabJSON {
    return (
        json.hasOwnProperty('id') &&
        json.hasOwnProperty('username') &&
        json.hasOwnProperty('email') &&
        json.hasOwnProperty('name')
    )
}