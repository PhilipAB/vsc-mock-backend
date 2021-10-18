import { Request } from 'express';
import { Response } from 'express-serve-static-core';
import { isResultSetHeader } from '../predicates/database/isResultSetHeader';
import { isAssignmentArray, isAssignmentArrayWithVisibility } from '../predicates/database/isAssignmentArray';
import assignmentService from '../services/AssignmentService';
import courseAssignmentRelationService from '../services/CourseAssignmentRelationService';
import assignmentUserRelationService from '../services/AssignmentUserRelationService';
import { BasicAssignment } from '../models/assignment/BasicAssignment';
import { CourseAssignmentRelExtended } from '../models/courseAssignmentRelation/CourseAssignmentRelExtended';
import { AssignmentUserRelation } from 'src/models/assignmentUserRelation/assignmentUserRelation';
class AssignmentController {
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
                    const courseAssignmentRelation: CourseAssignmentRelExtended = {
                        assignmentId: result.insertId,
                        courseId: req.body.courseId,
                        visibleFrom: req.body.visibleFrom ? new Date(req.body.visibleFrom) : null,
                        visibleTill: req.body.visibleTill ? new Date(req.body.visibleTill) : null
                    }
                    await courseAssignmentRelationService.create(courseAssignmentRelation);
                }
                res.status(201).json({ assignmentId: result.insertId, assignmentName: assignment.name }).send();
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

    async updateCourseAssignmentRelation(req: Request, res: Response) {
        const courseAssignmentRelation: CourseAssignmentRelExtended = {
            assignmentId: Number(req.params.aId),
            courseId: Number(req.params.cId),
            visibleFrom: req.body.visibleFrom ? new Date(req.body.visibleFrom) : null,
            visibleTill: req.body.visibleTill ? new Date(req.body.visibleTill) : null
        }
        try {
            await courseAssignmentRelationService.update(courseAssignmentRelation);
            res.sendStatus(200);
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }
    }

    async addExistingAssignmentToCourse(req: Request, res: Response) {
        const courseAssignmentRelation: CourseAssignmentRelExtended = {
            assignmentId: Number(req.params.aId),
            courseId: Number(req.params.cId),
            visibleFrom: req.body.visibleFrom ? new Date(req.body.visibleFrom) : null,
            visibleTill: req.body.visibleTill ? new Date(req.body.visibleTill) : null
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
            if (Array.isArray(assignmentRows) && assignmentRows.length === 0 || isAssignmentArrayWithVisibility(assignmentRows)) {
                res.status(200).send(assignmentRows);
            }
            else {
                res.status(500).json({ error: "Course data could not be processed!" }).send();
            }
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }
    }

    async getVisibleAssignmentsByCourseId(req: Request, res: Response) {
        try {
            const courseId: number = Number(req.params.id);
            const [assignmentRows, _fields] = await courseAssignmentRelationService.getAllAssignmentsForCourseById(courseId);
            if (Array.isArray(assignmentRows) && assignmentRows.length === 0) {
                res.status(200).send(assignmentRows);
            } else if (isAssignmentArrayWithVisibility(assignmentRows)) {
                let isVisible = false;
                const currentUtc: number = new Date().getTime();
                res.status(200).send(
                    assignmentRows.filter(assignment => {
                        const partsValidFrom: number[] | undefined = JSON.stringify(assignment.visible_from, (_key, value) => value ?? undefined)?.split(/[-T: ]/).map(dateTimePart => Number(dateTimePart));
                        if (partsValidFrom) {
                            isVisible = currentUtc > Date.UTC(partsValidFrom[0], partsValidFrom[1] - 1, partsValidFrom[2], partsValidFrom[3], partsValidFrom[4], partsValidFrom[5]);
                        } else {
                            isVisible = true;
                        }
                        const partsValidTill: number[] | undefined = JSON.stringify(assignment.visible_from, (_key, value) => value ?? undefined)?.split(/[-T: ]/).map(dateTimePart => Number(dateTimePart));
                        if (partsValidTill) {
                            return isVisible && currentUtc < Date.UTC(partsValidTill[0], partsValidTill[1] - 1, partsValidTill[2], partsValidTill[3], partsValidTill[4], partsValidTill[5]);
                        } else {
                            return isVisible;
                        }
                    })
                );
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

    async submitAssignment(req: Request, res: Response) {
        const assignmentUserRelation: AssignmentUserRelation = {
            userId: req.body,
            assignmentId: Number(req.params.id),
            solvedTests: req.body.solved,
            totalTests: req.body.total
        }
        try {
            await assignmentUserRelationService.create(assignmentUserRelation);
            res.status(201).send(assignmentUserRelation);
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }
    }

    async updateAssignmentSubmission(req: Request, res: Response) {
        const assignmentUserRelation: AssignmentUserRelation = {
            userId: req.body,
            assignmentId: Number(req.params.id),
            solvedTests: req.body.solved,
            totalTests: req.body.total
        }
        try {
            await assignmentUserRelationService.update(assignmentUserRelation);
            res.status(201).send(assignmentUserRelation);
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }
    }

    async getUsersByAssignmentId(req: Request, res: Response) {
        try {
            const assignmentId: number = Number(req.params.id);
            const [userRows, _fields] = await assignmentUserRelationService.getAllUsersForAssignmentById(assignmentId);
            res.status(200).send(userRows);
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }
    }
}

export default new AssignmentController();