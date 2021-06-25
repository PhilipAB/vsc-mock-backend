import { Request, NextFunction } from 'express';
import { Response } from 'express-serve-static-core';
import courseMiddleware from './CourseMiddleware';
import userMiddleware from './UserMiddleware';
class AssignmentMiddleware {
    // A user is allowed to create an assignment if: 
    // 1. He wants to create an assignment for a course and has CourseAdmin or Teacher rights for this specific course.
    // 2. His UserRoleType is Lecturer and he wants to add an assignment to the assignment collection without specifying a course.
    async valideAssignmentCreationRights(req: Request, res: Response, next: NextFunction) {
        if(req.body.courseId) {
            courseMiddleware.valideCourseTeacher(req, res, next);
        } else {
            userMiddleware.valideCreationUserRights(req, res, next);
        }
    }
}

export default new AssignmentMiddleware();