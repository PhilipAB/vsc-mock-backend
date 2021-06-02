import express, { Request, Router } from "express";
import { Response } from 'express-serve-static-core';
import passport from "passport";
import { GitHubOAuth2Strategy } from '../strategies/GitHubOAuth2Strategy';
import userController from "../controllers/UserController";
import { BasicUser } from "../models/user/BasicUser";
import { GitProviderProfile } from "../models/authentication/GitProviderProfile";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { VerifyCallback } from "passport-oauth2";
import { body } from "express-validator";
import ValidationErrorHandler from "../middleware/errors/ValidationErrorHandler";
import { isPayloadWithUserId } from "../predicates/authentication/isPayloadWithUserId";

export const authenticationRouter: Router = express.Router();

// Since we are not using sessions, we do not need to initialize passport.

let refreshTokens: string[] = [];

passport.use(new GitHubOAuth2Strategy(
    async (_accessToken: string, _refreshToken: string, profile: GitProviderProfile, verified: VerifyCallback) => {
        let user: BasicUser;
        // Important to check, if name is not null! Otherwise we will get an SQL error.  
        if (profile.name) {
            user = { provider_id: profile.id, name: profile.name };
        } else {
            user = { provider_id: profile.id, name: "" };
        }
        const uId: number = await userController.findOrCreateUser(user);
        verified(null, {
            refreshToken: jwt.sign(
                { userId: uId },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: '1d' }
            ),
            accessToken: jwt.sign(
                { userId: uId },
                process.env.JWT_ACCESS_SECRET,
                {
                    expiresIn: '0.5h'
                }
            )
        });
    },
    "custom"
));

authenticationRouter.use(express.json());

authenticationRouter.get("/provider", passport.authenticate("custom", { session: false }));

authenticationRouter.get("/provider/callback",
    passport.authenticate('custom', { session: false }),
    (req: Request, res: Response) => {
        if (req.user) {
            refreshTokens.push(req.user.refreshToken);
            // console.log("Refresh tokens: ", refreshTokens);
            // console.log(req.user.accessToken);
            // console.log(req.user.refreshToken);
            // res.send("Login was sucessful!");
            res.redirect(`http://localhost:37658/authenticate?access=${req.user.accessToken}&refresh=${req.user.refreshToken}`);
        }
        else {
            res.send("Failed to log in!");
        }
    });

authenticationRouter.post("/refresh",
    body('token').notEmpty().withMessage("No (refresh) token found").isString().withMessage("Invalid type")
        .escape().trim(),
    ValidationErrorHandler.handleTokenValidationError,
    (req: Request, res: Response) => {
        const refreshToken: string = req.body.token;
        if (!refreshTokens.includes(refreshToken)) {
            res.status(403).json({ error: "Refresh token could not be verified!" });
        } else {
            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err: VerifyErrors | null, payload: object | undefined): void => {
                if (payload && isPayloadWithUserId(payload)) {
                    const accessToken: string = jwt.sign(
                        { userId: payload.userId },
                        process.env.JWT_ACCESS_SECRET,
                        {
                            expiresIn: '0.5h'
                        }
                    );
                    res.json({ accessToken: accessToken })
                }
                else {
                    res.status(403).send(err);
                }
            })
        }
    });