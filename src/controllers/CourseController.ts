import { Request } from 'express';
import { Response } from 'express-serve-static-core';
import * as bcrypt from 'bcrypt';
import { isResultSetHeader } from '../predicates/database/isResultSetHeader';
import { isCourseArray } from '../predicates/database/isCourseArray';
import courseService from '../services/CourseService';
import courseUserRelationService from '../services/CourseUserRelationService';
import { BasicCoursePwd } from '../models/course/BasicCoursePwd';
import { CourseUserRelationRole } from '../models/courseUserRelation/CourseUserRelationRole';
import { CourseRoleType } from '../types/roles/CourseRoleType';
import { isCourseExtendedArray } from '../predicates/database/isCourseExtendedArray';
import { CourseUserRelationStarred } from '../models/courseUserRelation/CourseUserRelationStarred';
import { CourseUserRelationHidden } from '../models/courseUserRelation/CourseUserRelationHidden';
import { BasicCourseUserRelation } from '../models/courseUserRelation/BasicCourseUserRelation';
import { CoursePwd } from '../models/course/CoursePwd';
import { isPasswordArray } from '../predicates/database/isPasswordArray';
import courseAssignmentRelationService from '../services/CourseAssignmentRelationService';
import { isSimpleCourseArray } from '../predicates/database/isSimpleCourse';

class CourseController {

    async createCourse(req: Request, res: Response) {
        const course: BasicCoursePwd = req.body;
        try {
            course.password = await bcrypt.hash(course.password, 10);
        } catch (error) {
            res.status(500).json({ error: "Password could not be encrypted correctly!" }).send();
        }
        try {
            const [result, _fields] = await courseService.create(course);
            if (isResultSetHeader(result)) {
                const courseUserRelation: CourseUserRelationRole = {
                    userId: course.userId,
                    courseId: result.insertId,
                    role: CourseRoleType.CourseAdmin
                }
                await courseUserRelationService.create(courseUserRelation);
                res.status(201).json({ courseId: result.insertId, courseName: course.name }).send();
            }
            else {
                res.status(500).json({ error: "Course user relation data could not be processed!" }).send();
            }
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                res.status(409).json({ error: error }).send();
            } else {
                res.status(500).json({ error: error }).send();
            }
        }
    }

    async getAllCourses(_req: Request, res: Response) {
        try {
            const [courseRows, _courseFields] = await courseService.getAll();
            // If rows array is empty, return the empty array.
            // If rows array items have same structure as course model, return as course model and send course array as response.  
            // Advantage: Complexity O(1)
            if (Array.isArray(courseRows) && courseRows.length === 0 || isCourseArray(courseRows)) {
                res.status(200).send(courseRows);
            }
            else {
                res.status(500).json({ error: "Course data could not be processed!" }).send();
            }
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }
    }

    async getCoursesByUserId(req: Request, res: Response) {
        try {
            const userId: number = req.body.userId;
            const [courseRows, _fields] = await courseUserRelationService.getAllCoursesForUserById(userId);
            if (Array.isArray(courseRows) && courseRows.length === 0 || isCourseExtendedArray(courseRows)) {
                res.status(200).send(courseRows);
            }
            else {
                res.status(500).json({ error: "Course data could not be processed!" }).send();
            }
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }
    }

    async getCoursesByAssignmentId(req: Request, res: Response) {
        try {
            const assignmentId: number = Number(req.params.id);
            const [assignmentRows, _fields] = await courseAssignmentRelationService.getAllCoursesForAssignmentById(assignmentId);
            if (Array.isArray(assignmentRows) && assignmentRows.length === 0 || isSimpleCourseArray(assignmentRows)) {
                res.status(200).send(assignmentRows);
            }
            else {
                res.status(500).json({ error: "Course data could not be processed!" }).send();
            }
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }
    }

    async getCoursesNotInCourseAssignmentRelation(req: Request, res: Response) {
        try {
            const assignmentId: number = Number(req.params.id);
            const [assignmentRows, _fields] = await courseAssignmentRelationService.getCoursesNotInCourseAssignmentRelationById(req.body.userId, assignmentId);
            if (Array.isArray(assignmentRows) && assignmentRows.length === 0 || isSimpleCourseArray(assignmentRows)) {
                res.status(200).send(assignmentRows);
            }
            else {
                res.status(500).json({ error: "Course data could not be processed!" }).send();
            }
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }
    }

    async signUpForCourse(req: Request, res: Response) {
        const course: CoursePwd = req.body;
        try {
            const [coursePwd, _fields] = await courseService.getPasswordById(course.id);
            if (isPasswordArray(coursePwd)) {
                const match = await bcrypt.compare(course.password, coursePwd[0].password);
                if (match) {
                    const courseUserRelation: CourseUserRelationRole = {
                        userId: course.userId,
                        courseId: course.id,
                        role: CourseRoleType.Student
                    }
                    await courseUserRelationService.create(courseUserRelation);
                    res.status(201).send(courseUserRelation);
                } else {
                    res.sendStatus(401);
                }
            } else {
                res.sendStatus(401);
            }
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }
    }

    async findCourseUserRelation(req: Request, res: Response) {
        const courseUserRelation: BasicCourseUserRelation = {
            userId: req.body.userId,
            courseId: Number(req.params.id)
        }
        try {
            const [existingCourse, _fields] = await courseUserRelationService.getCourseUserRelationById(courseUserRelation);
            // "existingCourse" is an empty array, if no such courseUserRelation exists in database.
            res.send(existingCourse);
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }

    }

    async updateHiddenProperty(req: Request, res: Response) {
        const courseUserRelation: CourseUserRelationHidden = {
            userId: req.body.userId,
            hidden: req.body.hidden,
            courseId: Number(req.params.id)
        }
        try {
            await courseUserRelationService.updateHiddenProperty(courseUserRelation);
            res.sendStatus(200);
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }
    }

    async updateStarProperty(req: Request, res: Response) {
        const courseUserRelation: CourseUserRelationStarred = {
            userId: req.body.userId,
            starred: req.body.starred,
            courseId: Number(req.params.id),
        }
        try {
            await courseUserRelationService.updateStarProperty(courseUserRelation);
            res.sendStatus(200);
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }
    }

    async updateRoleProperty(req: Request, res: Response) {
        const courseUserRelation: CourseUserRelationRole = {
            userId: Number(req.params.uId),
            role: req.body.role,
            courseId: Number(req.params.cId),
        }
        try {
            if (courseUserRelation.userId !== req.body.userId) {
                await courseUserRelationService.updateRoleProperty(courseUserRelation);
                res.sendStatus(200);
            } else {
                res.status(400).json({ error: "Unable to update user's own course role!" }).send();
            }
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }
    }

    async updateVisitedProperty(req: Request, res: Response) {
        const courseUserRelation: BasicCourseUserRelation = {
            userId: req.body.userId,
            courseId: Number(req.params.id)
        }
        try {
            await courseUserRelationService.updateVisitedProperty(courseUserRelation);
            res.sendStatus(200);
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }
    }
}

export default new CourseController();