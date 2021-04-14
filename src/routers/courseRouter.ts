import express, { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { CourseUserRelationController } from "../controllers/CourseUserRelationController";
import { CourseController } from "../controllers/CourseController";
import { UserMiddleware } from "../middleware/UserMiddleware";
import { BasicCoursePwd } from "../models/BasicCoursePwd";
import { CourseUserRelationRole } from "../models/CourseUserRelationRole";
import { CourseRoleType } from "../types/CourseRoleType";
import { isResultSetHeader } from "../predicates/isResultSetHeader";
import { isCourseArray } from "../predicates/isCourseArray";
import * as bcrypt from 'bcrypt';

export const courseRouter: Router = express.Router();
const courseController: CourseController = new CourseController();
const courseUserRelationController: CourseUserRelationController = new CourseUserRelationController();
const userMiddleware: UserMiddleware = new UserMiddleware();

courseRouter.use(express.json());

courseRouter.post('/',
    body('name').notEmpty().isString()
        .escape().trim(),
    body('password').isString().
        isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches('[0-9]').withMessage('Password must contain a number')
        .matches('[A-Z]').withMessage('Password must contain an uppercase letter')
        .escape().trim(),
    body('creatorId').notEmpty().isNumeric()
        .escape().trim(),
    userMiddleware.valideCourseCreationUserRights,
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json(
                { errors: errors.array() }).send();
        }
        else {
            const course: BasicCoursePwd = req.body;
            try {
                course.password = await bcrypt.hash(course.password, 10);
            } catch (error) {
                res.status(500).json({ errors: "Password could not be encrypted correctly!" }).send();
            }
            try {
                const [result, _fields] = await courseController.createCourse(course);
                if (isResultSetHeader(result)) {
                    const courseUserRelation: CourseUserRelationRole = {
                        userId: course.creatorId,
                        courseId: result.insertId,
                        role: CourseRoleType.CourseAdmin
                    }
                    await courseUserRelationController.createCourseUserRelation(courseUserRelation);
                    res.status(201).json({ courseId: result.insertId, courseName: course.name }).send();
                }
                else {
                    res.status(500).json({ errors: "Course user relation data could not be processed!" }).send();
                }
            } catch (error) {
                res.status(500).json({ errors: error }).send();
            }
        }
    });

courseRouter.get('/', async (_req: Request, res: Response) => {
    try {
        const [courseRows, _courseFields] = await courseController.getAllCourses();
        // If rows array is empty, return the empty array.
        // If rows array items have same structure as course model, return as course model and send course array as response.  
        // Advantage: Complexity O(1)
        if (Array.isArray(courseRows) && courseRows.length === 0 || isCourseArray(courseRows)) {
            res.status(200).send(courseRows);
        }
        else {
            res.status(500).json({ errors: "Course data could not be processed!" }).send();
        }
    } catch (error) {
        res.status(500).json({ errors: error }).send();
    }
});