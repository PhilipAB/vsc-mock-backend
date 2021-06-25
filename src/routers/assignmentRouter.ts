import express, { Router } from "express";
import { body } from "express-validator";
import assignmentMiddleware from "../middleware/auth/AssignmentMiddleware";
import assignmentController from "../controllers/AssignmentController";
import userMiddleware from "../middleware/auth/UserMiddleware";
import validationErrorHandler from "../middleware/errors/ValidationErrorHandler";
import courseMiddleware from "../middleware/auth/CourseMiddleware";
import courseController from "../controllers/CourseController";

export const assignmentRouter: Router = express.Router();

assignmentRouter.use(express.json());

assignmentRouter.post('/',
    body('name').notEmpty().isString()
        .escape().trim(),
    body('repository').notEmpty().isString()
        .escape().trim(),
    body('description').isString()
        .escape().trim(),
    body('courseId').optional().isNumeric({ no_symbols: true })
        .escape().trim(),
    validationErrorHandler.handleGeneralValidationError,
    userMiddleware.authenticateUser,
    assignmentMiddleware.valideAssignmentCreationRights,
    assignmentController.createAssignment);

assignmentRouter.post('/assignment/:aId/course/cId',
    courseMiddleware.valideCourseTeacher,
    assignmentController.addExistingAssignmentToCourse)


assignmentRouter.get('/',
    userMiddleware.authenticateUser,
    assignmentController.getAllAssignments);

assignmentRouter.get('/assignment/:id/courses',
    userMiddleware.authenticateUser,
    courseMiddleware.valideCourseTeacher,
    courseController.getCoursesByAssignmentId);