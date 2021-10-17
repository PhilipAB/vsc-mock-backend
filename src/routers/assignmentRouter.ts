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
        .trim()
        .matches(/https:\/\/([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-z]{2,}([\/][^\s]*)*/i)
        .withMessage('Repository must be a valid https:// url!'),
    body('description').isString()
        .escape().trim(),
    body('courseId').optional().isNumeric({ no_symbols: true })
        .escape().trim(),
    validationErrorHandler.handleGeneralValidationError,
    userMiddleware.authenticateUser,
    assignmentMiddleware.valideAssignmentCreationRights,
    assignmentController.createAssignment);

assignmentRouter.post('/assignment/:aId/course/:cId',
    userMiddleware.authenticateUser,
    courseMiddleware.valideCourseTeacher,
    assignmentController.addExistingAssignmentToCourse)

assignmentRouter.put('/assignment/:aId/course/:cId',
    userMiddleware.authenticateUser,
    courseMiddleware.valideCourseTeacher,
    assignmentController.updateCourseAssignmentRelation)

assignmentRouter.get('/',
    userMiddleware.authenticateUser,
    assignmentController.getAllAssignments);

assignmentRouter.get('/assignment/:id/courses',
    userMiddleware.authenticateUser,
    courseController.getCoursesByAssignmentId);

assignmentRouter.get('/assignment/:id/courses/no-relation',
    userMiddleware.authenticateUser,
    courseController.getCoursesNotInCourseAssignmentRelation);

assignmentRouter.post('/assignment/:id/user',
    body('solved').notEmpty().isNumeric({ no_symbols: true })
        .escape().trim(),
    body('total').notEmpty().isNumeric({ no_symbols: true })
        .escape().trim(),
    validationErrorHandler.handleGeneralValidationError,
    userMiddleware.authenticateUser,
    assignmentController.submitAssignment)

assignmentRouter.post('/assignment/:id/user/update',
    body('solved').notEmpty().isNumeric({ no_symbols: true })
        .escape().trim(),
    body('total').notEmpty().isNumeric({ no_symbols: true })
        .escape().trim(),
    validationErrorHandler.handleGeneralValidationError,
    userMiddleware.authenticateUser,
    assignmentController.updateAssignmentSubmission)