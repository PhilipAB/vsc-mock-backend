// Since our access and refresh tokens are always explicitly set within the callback method of our passport strategy,
// we need to override the default (and empty) express type declaration for User.
declare namespace Express { 
    export interface User {
        accessToken: string;
        refreshToken: string;
    }
}