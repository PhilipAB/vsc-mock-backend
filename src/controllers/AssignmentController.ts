import { Request } from 'express';
import { Response } from 'express-serve-static-core';
import { isResultSetHeader } from '../predicates/database/isResultSetHeader';
import { isAssignmentArray } from '../predicates/database/isAssignmentArray';
import assignmentService from '../services/AssignmentService';
import courseAssignmentRelationService from '../services/CourseAssignmentRelationService';
import { BasicAssignment } from '../models/assignment/BasicAssignment';
import { CourseAssignmentRelation } from '../models/courseAssignmentRelation/CourseAssignmentRelation';
class AssignmentController {

    // ToDo: Add assignments to course (insert courseassignmentrelation)

    async createAssignment(req: Request, res: Response) {
        const assignment: BasicAssignment = {
            name: req.body.name,
            repository: req.body.repository,
            description: req.body.description
        }
        try {
            const [result, _fields] = await assignmentService.create(assignment);
            if (isResultSetHeader(result)) {
                if (req.body.courseId) {
                    const courseAssignmentRelation: CourseAssignmentRelation = {
                        assignmentId: result.insertId,
                        courseId: req.body.courseId,
                    }
                    await courseAssignmentRelationService.create(courseAssignmentRelation);
                }
                res.status(201).json({ courseId: result.insertId, courseName: assignment.name }).send();
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

    async addExistingAssignmentToCourse(req: Request, res: Response) {
        const courseAssignmentRelation: CourseAssignmentRelation = {
            assignmentId: Number(req.params.aId),
            courseId: Number(req.params.cId),
        }
        try {
            const [existingAssignment, _fields] = await assignmentService.findById(courseAssignmentRelation.assignmentId);
            if (isAssignmentArray(existingAssignment)) {
                await courseAssignmentRelationService.create(courseAssignmentRelation);
                res.status(201).send();
            } else {
                res.status(404).json({ error: "Assignment not found!" }).send();
            }
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }
    }

    async getAllAssignments(_req: Request, res: Response) {
        try {
            const [assignmentRows, _courseFields] = await assignmentService.getAll();
            // If rows array is empty, return the empty array.
            // If rows array items have same structure as assignment model, return as assignment model and send assignment array as response.  
            // Advantage: Complexity O(1)
            if (Array.isArray(assignmentRows) && assignmentRows.length === 0 || isAssignmentArray(assignmentRows)) {
                res.status(200).send(assignmentRows);
            }
            else {
                res.status(500).json({ error: "Course data could not be processed!" }).send();
            }
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }
    }

    async getAssignmentsByCourseId(req: Request, res: Response) {
        try {
            const courseId: number = Number(req.params.id);
            const [assignmentRows, _fields] = await courseAssignmentRelationService.getAllAssignmentsForCourseById(courseId);
            if (Array.isArray(assignmentRows) && assignmentRows.length === 0 || isAssignmentArray(assignmentRows)) {
                res.status(200).send(assignmentRows);
            }
            else {
                res.status(500).json({ error: "Course data could not be processed!" }).send();
            }
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }
    }

    async getAssignmentsNotInCourseAssignmentRelation(req: Request, res: Response) {
        try {
            const courseId: number = Number(req.params.id);
            const [assignmentRows, _fields] = await courseAssignmentRelationService.getAssignmentsNotInCourseAssignmentRelationById(courseId);
            if (Array.isArray(assignmentRows) && assignmentRows.length === 0 || isAssignmentArray(assignmentRows)) {
                res.status(200).send(assignmentRows);
            }
            else {
                res.status(500).json({ error: "Course data could not be processed!" }).send();
            }
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }
    }
}

export default new AssignmentController();