import { Request, NextFunction } from 'express';
import { Response } from 'express-serve-static-core';
import courseUserRelationService from '../../services/CourseUserRelationService';
import { CourseRoleType } from '../../types/roles/CourseRoleType';
import { isNonEmptyRowDataPacketArray } from '../../predicates/database/isNonEmptyRowDataPacketArray';
import { BasicCourseUserRelation } from 'src/models/courseUserRelation/BasicCourseUserRelation';

// Course auth(orization)
class CourseMiddleware {
    async valideCourseAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const cId: string = req.params.cId ?? req.params.id;
            // User id is obtained from auth token -> therefore secure to get role from user id
            const courseUserRelation: BasicCourseUserRelation = {
                courseId: Number(cId),
                userId: req.body.userId
            }
            const [courseRole, _courseFields] = await courseUserRelationService.getCourseRoleById(courseUserRelation);
            if (isNonEmptyRowDataPacketArray(courseRole) && courseRole[0].role) {
                if (courseRole[0].role === CourseRoleType.CourseAdmin) {
                    next();
                }
                else if (courseRole[0].role === CourseRoleType.Teacher || courseRole[0].role === CourseRoleType.Student) {
                    res.status(403).json({ error: "Access denied: Unauthorized!" }).send();
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

    async valideCourseTeacher(req: Request, res: Response, next: NextFunction) {
        try {
            // Course id is either send by route parameters or body.
            const cId: number = req.body.courseId ?? Number(req.params.id); 
            // User id is obtained from auth token -> therefore secure to get role from user id
            const courseUserRelation: BasicCourseUserRelation = {
                courseId: cId,
                userId: req.body.userId
            }
            const [courseRole, _courseFields] = await courseUserRelationService.getCourseRoleById(courseUserRelation);
            if (isNonEmptyRowDataPacketArray(courseRole) && courseRole[0].role) {
                if (courseRole[0].role === CourseRoleType.CourseAdmin || courseRole[0].role === CourseRoleType.Teacher) {
                    next();
                }
                else if (courseRole[0].role === CourseRoleType.Student) {
                    res.status(403).json({ error: "Access denied: Unauthorized!" }).send();
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

export default new CourseMiddleware();