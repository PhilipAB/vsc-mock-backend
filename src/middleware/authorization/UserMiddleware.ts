import { Request, Response, NextFunction } from 'express';
import { UserRoleType } from '../../types/UserRoleType';
import { isNonEmptyRowDataPacketArray } from '../../predicates/isNonEmptyRowDataPacketArray';
import userService from '../../services/UserService';

class UserMiddleware {

    async valideCourseCreationUserRights(req: Request, res: Response, next: NextFunction) {
        try {
            // TODO: Get user role by auth token?! Otherwise this might not be secure 
            const [userRows, _userFields] = await userService.getUserRoleById(req.body.creatorId);
            if (isNonEmptyRowDataPacketArray(userRows) && userRows[0].role) {
                if (userRows[0].role === UserRoleType.Student) {
                    res.status(403).json({ error: "Access denied: Unauthorized attempt to create a course!" }).send();
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