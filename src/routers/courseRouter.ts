import express, { Router } from "express";
import { body } from "express-validator";
import courseMiddleware from "../middleware/auth/CourseMiddleware";
import courseController from "../controllers/CourseController";
import userMiddleware from "../middleware/auth/UserMiddleware";
import validationErrorHandler from "../middleware/errors/ValidationErrorHandler";
import userController from "../controllers/UserController";
import assignmentController from "../controllers/AssignmentController";

export const courseRouter: Router = express.Router();

courseRouter.use(express.json());

courseRouter.post('/',
    body('name').notEmpty().isString()
        .escape().trim(),
    body('password').isString().
        isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches('[0-9]').withMessage('Password must contain a number')
        .matches('[A-Z]').withMessage('Password must contain an uppercase letter')
        .escape().trim(),
    body('description').isString()
        .escape().trim(),
    validationErrorHandler.handleGeneralValidationError,
    userMiddleware.authenticateUser,
    userMiddleware.valideCreationUserRights,
    courseController.createCourse);

courseRouter.post('/signUp',
    body('id').notEmpty().isNumeric({ no_symbols: true })
        .escape().trim(),
    body('password').isString()
        .escape().trim(),
    validationErrorHandler.handleGeneralValidationError,
    userMiddleware.authenticateUser,
    courseController.signUpForCourse)

courseRouter.get('/',
    userMiddleware.authenticateUser,
    courseController.getAllCourses);

courseRouter.get('/course/:id',
    userMiddleware.authenticateUser,
    courseController.findCourseUserRelation);

courseRouter.get('/course/:id/users',
    userMiddleware.authenticateUser,
    courseMiddleware.valideCourseTeacher,
    userController.getUsersByCourseId);

courseRouter.get('/course/:id/assignments',
    userMiddleware.authenticateUser,
    courseMiddleware.valideCourseTeacher,
    assignmentController.getAssignmentsByCourseId);

courseRouter.get('/course/:id/assignments/visible',
    userMiddleware.authenticateUser,
    courseMiddleware.valideCourseUser,
    assignmentController.getVisibleAssignmentsByCourseId);

courseRouter.get('/course/:id/assignments/no-relation',
    userMiddleware.authenticateUser,
    courseMiddleware.valideCourseTeacher,
    assignmentController.getAssignmentsNotInCourseAssignmentRelation);

courseRouter.get('/myCourses',
    userMiddleware.authenticateUser,
    courseController.getCoursesByUserId);

courseRouter.put('/name/:id',
    userMiddleware.authenticateUser,
    courseMiddleware.valideCourseAdmin,
    courseController.updateName);

courseRouter.put('/description/:id',
    userMiddleware.authenticateUser,
    courseMiddleware.valideCourseTeacher,
    courseController.updateDescription);

courseRouter.put('/hidden/:id',
    userMiddleware.authenticateUser,
    courseController.updateHiddenProperty);

courseRouter.put('/starred/:id',
    userMiddleware.authenticateUser,
    courseController.updateStarProperty);

courseRouter.put('/visited/:id',
    userMiddleware.authenticateUser,
    courseController.updateVisitedProperty);

courseRouter.put('/role/:cId/:uId',
    userMiddleware.authenticateUser,
    courseMiddleware.valideCourseAdmin,
    courseController.updateRoleProperty);

courseRouter.delete('/course/:cId/assignment/:aId',
    userMiddleware.authenticateUser,
    courseMiddleware.valideCourseTeacher,
    courseController.deleteCourseAssignmentRelation);