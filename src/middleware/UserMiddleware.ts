import { Request, Response, NextFunction } from 'express';
import { UserRoleType } from '../types/UserRoleType';
import { isNonEmptyRowDataPacketArray } from '../predicates/isNonEmptyRowDataPacketArray';
import { UserController } from '../controllers/UserController';

export class UserMiddleware {

    async valideCourseCreationUserRights(req: Request, res: Response, next: NextFunction) {
        const userController: UserController = new UserController();
        try {
            // TODO: Get user role by auth token?! Otherwise this might not be secure 
            const [userRows, _userFields] = await userController.getUserRoleById(req.body.creatorId);
            if (isNonEmptyRowDataPacketArray(userRows) && userRows[0].role) {
                if (userRows[0].role === UserRoleType.Student) {
                    res.status(403).json({ errors: "Access denied: Unauthorized attempt to create a course!" }).send();
                }
                else if (userRows[0].role === UserRoleType.Lecturer) {
                    next();
                }
                else {
                    res.status(500).json({ errors: "Invalid user role!" }).send();
                }
            }
            else {
                res.status(500).json({ errors: "Could not process property role!" }).send();
            }
        } catch (error) {
            res.status(500).json({ errors: error }).send();
        }
    }
}