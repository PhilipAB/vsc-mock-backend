import { Request, NextFunction } from 'express';
import { Response } from 'express-serve-static-core';
import { UserRoleType } from '../../types/roles/UserRoleType';
import { isNonEmptyRowDataPacketArray } from '../../predicates/database/isNonEmptyRowDataPacketArray';
import userService from '../../services/UserService';
import jwt, { VerifyErrors } from "jsonwebtoken";
import { isPayloadWithUserId } from '../../predicates/authentication/isPayloadWithUserId';

// User auth(orization) and auth(entication)
class UserMiddleware {

    authenticateUser(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).send();
        }
        else {
            const accessToken = authHeader.split(" ")[1];
            if (!accessToken) {
                res.status(401).send();
            }
            else {
                jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET, (err: VerifyErrors | null, payload: object | undefined): void => {
                    if (payload && isPayloadWithUserId(payload)) {
                        req.body.userId = payload.userId;
                        next();
                    }
                    else {
                        res.status(500).json({ error: err }).send();
                    }
                });
            }
        }
    }

    async valideCreationUserRights(req: Request, res: Response, next: NextFunction) {
        try {
            // User id is obtained from auth token -> therefore secure to get role from user id
            const [userRows, _userFields] = await userService.getUserRoleById(req.body.userId);
            if (isNonEmptyRowDataPacketArray(userRows) && userRows[0].role) {
                if (userRows[0].role === UserRoleType.Student) {
                    res.status(403).json({ error: "Access denied: Unauthorized attempt to create a course or assignment!" }).send();
                }
                else if (userRows[0].role === UserRoleType.Lecturer) {
                    next();
                }
                else {
                    res.status(500).json({ error: "Invalid user role!" }).send();
                }
            }
            else {
                res.status(500).json({ error: "Could not process property role!" }).send();
            }
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }
    }
}

export default new UserMiddleware();